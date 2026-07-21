from abc import ABC, abstractmethod
from pathlib import Path
from urllib.parse import urlsplit

from core.hashing import sha256_bytes, stable_id
from core.license_policy import decide
from core.metadata_extractor import year as infer_year
from core.parser_router import parse_document
from models.raw_document import RawDocument


class BaseAdapter(ABC):
    key = "base"

    def __init__(self, config, client, logger, root):
        self.config = config
        self.client = client
        self.log = logger
        self.root = root

    def source_name(self):
        return self.config.get("source_name", self.key)

    def domain_allowed(self, url):
        host = urlsplit(url).netloc.lower()
        return any(host == d or host.endswith("." + d) for d in self.config.get("allowed_domains", []))

    @abstractmethod
    def discover(self, year=None):
        raise NotImplementedError

    def download(self, items):
        output = []
        for item in items:
            policy = decide(self.key, self.config, item.metadata.get("copyright_notice_detected", False))
            if not (item.file_url and self.config.get("allow_download") and policy["allowInternalParsing"]):
                self.log.event("download", "메타데이터 전용", id=item.id, reason=policy["reason"])
                output.append((item, None))
                continue
            try:
                response = self.client.get(item.file_url)
                extension = Path(urlsplit(item.file_url).path).suffix or ".bin"
                folder = self.root / "data/raw" / extension.lstrip(".") / self.key / str(item.year or "unknown")
                folder.mkdir(parents=True, exist_ok=True)
                path = folder / f"{item.id}{extension}"
                path.write_bytes(response.content)
                item.metadata.update({"sha256": sha256_bytes(response.content), "file_size": len(response.content)})
                output.append((item, path))
            except Exception as error:
                self.log.event("errors", "다운로드 실패", id=item.id, error=str(error))
                output.append((item, None))
        return output

    def parse(self, downloaded_items):
        return [(raw, parse_document(raw, path)) for raw, path in downloaded_items]

    def normalize(self, parsed_items):
        from core.normalizer import normalize

        return [normalize(self.key, self.config, raw, parsed) for raw, parsed in parsed_items]

    def make(self, page_url, title, file_url=None, **meta):
        policy = decide(self.key, self.config, meta.get("copyright_notice_detected", False))
        item_year = meta.pop("year", None) or infer_year(title + " " + page_url)
        exam_name = meta.pop("exam_name", "대학수학능력시험" if "수능" in title else title)
        return RawDocument(
            id=f"{self.key}-{stable_id(file_url or page_url)}",
            source_name=self.source_name(),
            source_category=meta.pop("source_category", "official_exam"),
            source_sub_type=meta.pop("source_sub_type", self.key),
            collection_name=meta.pop("collection_name", ""),
            board_name=meta.pop("board_name", ""),
            page_url=page_url,
            detail_url=meta.pop("detail_url", ""),
            post_id=meta.pop("post_id", ""),
            title=title,
            year=item_year,
            exam_name=exam_name,
            session=meta.pop("session", ""),
            region=self.config.get("region"),
            published_at=meta.pop("published_at", None),
            registered_at=meta.pop("registered_at", None),
            file_url=file_url,
            file_type=(Path(urlsplit(file_url).path).suffix.lstrip(".") if file_url else "html") or "html",
            license_status=policy["licenseStatus"],
            store_full_text=policy["storeFullText"],
            allow_download=bool(self.config.get("allow_download")),
            metadata={**meta, "reuse_policy": policy},
        )
