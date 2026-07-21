from dataclasses import dataclass
from pathlib import Path
from importlib import import_module
import yaml
from models.raw_document import RawDocument
from models.parsed_item import ParsedItem
from core.http_client import HttpClient
from core.logger import AuditLogger
from core.file_store import read_jsonl,write_jsonl
@dataclass
class RunOptions:sources:list[str];year:int|None;since:int|None;limit:int|None;resume:bool;dry_run:bool
class ExamPipeline:
    def __init__(self,root:Path,options:RunOptions):
        self.root=root;self.o=options;self.cfg=yaml.safe_load((root/"config/sources.yaml").read_text(encoding="utf-8"));self.log=AuditLogger(root/"logs");self.client=HttpClient(self.cfg["settings"],self.log);self.adapters={}
        for key,c in self.cfg["sources"].items():
            if (options.sources and key not in options.sources) or not c.get("enabled",True):continue
            cls=getattr(import_module(c["module"]),c["class"]);self.adapters[key]=cls(c,self.client,self.log,root)
        self.discovered=root/"data/raw/manifests/discovered.jsonl";self.parsed=root/"data/parsed/items.jsonl";self.normalized=root/"data/normalized/items.jsonl"
    def run(self,cmd):
        stages=["discover","download","parse","normalize","deduplicate","report"] if cmd=="all" else [cmd]
        for stage in stages:getattr(self,stage)()
    def discover(self):
        rows=[]
        for key,a in self.adapters.items():
            try:rows.extend(a.discover(self.o.year))
            except Exception as e:self.log.event("errors","discover 실패",source=key,error=str(e))
        if self.o.since:rows=[x for x in rows if not x.year or x.year>=self.o.since]
        if self.o.resume:
            rows.extend(self._raw())
        unique={x.file_url or x.detail_url or x.page_url:x for x in rows};rows=list(unique.values())[:self.o.limit or None]
        if not self.o.dry_run:write_jsonl(self.discovered,rows)
        self.log.event("discover","완료",count=len(rows))
    def _raw(self):return [RawDocument.model_validate(x) for x in read_jsonl(self.discovered)]
    def download(self):
        manifest=[]
        for key,a in self.adapters.items():
            items=[x for x in self._raw() if x.source_sub_type==key or x.id.startswith(key+"-")]
            for raw,path in a.download(items):manifest.append({"raw":raw.model_dump(mode="json"),"local_path":str(path) if path else None})
        if not self.o.dry_run:write_jsonl(self.root/"data/raw/manifests/downloaded.jsonl",manifest)
    def parse(self):
        downloaded=read_jsonl(self.root/"data/raw/manifests/downloaded.jsonl");rows=[]
        for key,a in self.adapters.items():
            pairs=[]
            for x in downloaded:
                raw=RawDocument.model_validate(x["raw"])
                if raw.source_sub_type==key or raw.id.startswith(key+"-"):pairs.append((raw,Path(x["local_path"]) if x.get("local_path") else None))
            rows.extend([{"raw":r.model_dump(mode="json"),"parsed":p.model_dump(mode="json")} for r,p in a.parse(pairs)])
        if not self.o.dry_run:
            write_jsonl(self.parsed,rows)
            self._write_grouped(rows, self.root/"data/parsed", "parsed")
    def normalize(self):
        rows=[]
        for x in read_jsonl(self.parsed):
            raw=RawDocument.model_validate(x["raw"]);parsed=ParsedItem.model_validate(x["parsed"]);key=raw.source_sub_type or raw.id.split("-")[0];a=self.adapters.get(key)
            if a:rows.extend(a.normalize([(raw,parsed)]))
        if not self.o.dry_run:
            write_jsonl(self.normalized,rows)
            self._write_grouped(rows, self.root/"data/normalized", "normalized")
    def deduplicate(self):
        from scripts.deduplicate import deduplicate
        rows = deduplicate(read_jsonl(self.normalized))
        if not self.o.dry_run:
            write_jsonl(self.normalized, rows)
        self.log.event("normalize", "중복 제거", count=len(rows))
    def report(self):
        from scripts.quality_report import create_report
        create_report(self.root,read_jsonl(self.discovered),read_jsonl(self.root/"data/raw/manifests/downloaded.jsonl"),read_jsonl(self.parsed),read_jsonl(self.normalized))

    def _write_grouped(self, rows, folder, kind):
        groups = {}
        for row in rows:
            if hasattr(row, "model_dump"):
                row = row.model_dump(mode="json", by_alias=True)
            raw = row.get("raw", {}) if kind == "parsed" else row
            key = raw.get("source_sub_type") or raw.get("sourceSubType") or "unknown"
            year = raw.get("year") or "unknown"
            groups.setdefault((key, year), []).append(row)
        for (key, year), items in groups.items():
            write_jsonl(folder/f"{key}_{year}.jsonl", items)
