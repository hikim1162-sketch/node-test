from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlsplit

from bs4 import BeautifulSoup

from csat_pipeline.http import RespectfulHttpClient
from csat_pipeline.logging_utils import AuditLogger
from csat_pipeline.models import DiscoveredResource, ParsedDocument
from csat_pipeline.normalizers import normalize_resource
from csat_pipeline.parsers import parse_file
from csat_pipeline.utils import canonical_url, file_format, infer_year, sha256_bytes, stable_id


class SourceAdapter(ABC):
    key = "base"

    def __init__(self, config: dict[str, Any], client: RespectfulHttpClient, logger: AuditLogger) -> None:
        self.config = config
        self.client = client
        self.logger = logger

    def domain_allowed(self, url: str) -> bool:
        host = urlsplit(url).netloc.lower()
        return any(host == domain or host.endswith(f".{domain}") for domain in self.config.get("allowedDomains", []))

    def resource(self, page_url: str, title: str, file_url: str | None = None, **metadata: Any) -> DiscoveredResource:
        target = canonical_url(file_url or page_url)
        return DiscoveredResource(
            id=f"{self.key}-{stable_id(target)}",
            source_name=self.config["sourceName"], source_url=page_url,
            file_url=file_url, title=title.strip() or "제목 없음",
            year=infer_year(f"{title} {page_url} {file_url or ''}"),
            exam_name=metadata.pop("exam_name", title.strip()),
            session=metadata.pop("session", ""), file_format=file_format(file_url or page_url),
            license_status=self.config.get("licenseStatus", "unclear"),
            store_full_text=bool(self.config.get("storeFullText", False)),
            allow_download=bool(self.config.get("allowDownload", False)),
            policy_note=self.config.get("policyNote", ""), metadata=metadata,
        )

    def discover_links(self, seed_url: str, keywords: tuple[str, ...]) -> list[DiscoveredResource]:
        response = self.client.get(seed_url)
        soup = BeautifulSoup(response.text, "html.parser")
        results: list[DiscoveredResource] = []
        for anchor in soup.select("a[href]"):
            href = urljoin(response.url, anchor.get("href", ""))
            title = " ".join(anchor.stripped_strings) or anchor.get("title", "") or href.rsplit("/", 1)[-1]
            container = anchor.find_parent(["tr", "li", "article"]) or anchor.parent
            nearby = container.get_text(" ", strip=True) if container else ""
            direct_context = f"{title} {href}".lower()
            nearby_context = nearby.lower()
            direct_match = any(word.lower() in direct_context for word in keywords)
            file_candidate = any(token in href.lower() for token in ("filedownload", ".pdf", ".hwp", ".hwpx", ".zip"))
            nearby_file_match = file_candidate and any(word.lower() in nearby_context for word in keywords)
            if not self.domain_allowed(href) or not (direct_match or nearby_file_match):
                continue
            results.append(self.resource(response.url, title, href, discovered_from=seed_url))
        if not results:
            results.append(self.resource(response.url, soup.title.get_text(" ", strip=True) if soup.title else seed_url, metadata_only=True))
        return results

    @abstractmethod
    def discover(self) -> list[DiscoveredResource]:
        raise NotImplementedError

    def download(self, resource: DiscoveredResource, raw_dir: Path, dry_run: bool = False) -> Path | None:
        if not resource.file_url or not resource.allow_download or not resource.store_full_text or resource.license_status != "permitted":
            self.logger.write("metadata_only", "전문 저장 정책 불충족으로 다운로드 생략", resource_id=resource.id, url=str(resource.file_url or resource.source_url), license=resource.license_status, reason=resource.policy_note)
            return None
        if dry_run:
            self.logger.write("download_dry_run", "다운로드 예정", resource_id=resource.id, url=str(resource.file_url))
            return None
        response = self.client.get(str(resource.file_url))
        extension = resource.file_format or "bin"
        path = raw_dir / f"{resource.id}.{extension}"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(response.content)
        self.logger.write("downloaded", "공개 파일 다운로드 완료", resource_id=resource.id, path=str(path), sha256=sha256_bytes(response.content))
        return path

    def parse(self, resource: DiscoveredResource, raw_path: Path | None) -> ParsedDocument:
        if raw_path is None:
            return ParsedDocument(resource_id=resource.id, title=resource.title, parser="metadata-only", confidence=1.0, warnings=["저장 정책에 따라 전문을 파싱하지 않음"])
        return parse_file(resource, raw_path)

    def normalize(self, resource: DiscoveredResource, parsed: ParsedDocument):
        return normalize_resource(resource, parsed)
