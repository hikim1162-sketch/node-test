import json
from pathlib import Path
def read_jsonl(path):
    return [json.loads(x) for x in Path(path).read_text(encoding="utf-8").splitlines() if x.strip()] if Path(path).exists() else []
def write_jsonl(path,rows):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    with path.open("w",encoding="utf-8") as f:
        for row in rows:f.write(json.dumps(row.model_dump(mode="json",by_alias=True) if hasattr(row,"model_dump") else row,ensure_ascii=False,default=str)+"\n")
def write_json(path,value):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2,default=str),encoding="utf-8")
