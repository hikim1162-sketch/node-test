from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pydantic import ValidationError

from sources.registry import ADAPTERS

from .http import RespectfulHttpClient
from .logging_utils import AuditLogger
from .models import DiscoveredResource, ParsedDocument
from .utils import canonical_url, read_json, read_jsonl, sha256_bytes, write_json, write_jsonl


@dataclass
class RunOptions:
    sources: list[str] = field(default_factory=list)
    year: int | None = None
    since: int | None = None
    limit: int | None = None
    resume: bool = False
    dry_run: bool = False


class Pipeline:
    def __init__(self, root: Path, config_path: Path, options: RunOptions) -> None:
        self.root = root
        self.options = options
        self.config = read_json(config_path, {})
        self.raw_dir = root / "data/raw"
        self.parsed_dir = root / "data/parsed"
        self.normalized_dir = root / "data/normalized"
        self.logger = AuditLogger(root / "logs")
        self.client = RespectfulHttpClient(
            self.config.get("userAgent", "ValueTimeOfficialDatasetBot/1.0"),
            float(self.config.get("requestDelaySeconds", 2)),
            int(self.config.get("timeoutSeconds", 25)),
            int(self.config.get("maxRetries", 3)), self.logger,
        )
        selected = options.sources or list(self.config.get("sources", {}))
        self.adapters = {}
        for key in selected:
            source_config = self.config.get("sources", {}).get(key)
            if not source_config or not source_config.get("enabled", True) or key not in ADAPTERS:
                self.logger.write("adapter_skipped", "등록되지 않았거나 비활성화된 adapter", source=key)
                continue
            self.adapters[key] = ADAPTERS[key](source_config, self.client, self.logger)

    @property
    def discovery_path(self) -> Path:
        return self.raw_dir / "discovered.jsonl"

    @property
    def download_manifest_path(self) -> Path:
        return self.raw_dir / "download_manifest.json"

    @property
    def parsed_path(self) -> Path:
        return self.parsed_dir / "documents.jsonl"

    @property
    def normalized_path(self) -> Path:
        return self.normalized_dir / "csat_english.jsonl"

    def run(self, command: str) -> None:
        commands = ["discover", "download", "parse", "normalize", "report"] if command == "all" else [command]
        self.logger.write("run_started", "파이프라인 실행 시작", command=command, options=self.options.__dict__)
        for name in commands:
            getattr(self, name)()
        write_json(self.root / "logs/last_run.json", {"finishedAt": datetime.now(timezone.utc).isoformat(), "command": command, "options": self.options.__dict__})
        self.logger.write("run_finished", "파이프라인 실행 완료", command=command)

    def _filtered(self, rows: list[DiscoveredResource]) -> list[DiscoveredResource]:
        filtered = []
        for row in rows:
            if self.options.year and row.year != self.options.year:
                continue
            if self.options.since and row.year and row.year < self.options.since:
                continue
            filtered.append(row)
        return filtered[:self.options.limit] if self.options.limit else filtered

    def _resources(self) -> list[DiscoveredResource]:
        rows = []
        for value in read_jsonl(self.discovery_path):
            try:
                rows.append(DiscoveredResource.model_validate(value))
            except ValidationError as exc:
                self.logger.write("schema_error", "발견 리소스 스키마 오류", error=str(exc))
        return self._filtered(rows)

    def discover(self) -> None:
        existing = {canonical_url(str(row.file_url or row.source_url)): row for row in self._resources()} if self.options.resume else {}
        found = list(existing.values())
        for key, adapter in self.adapters.items():
            try:
                rows = adapter.discover()
            except Exception as exc:
                self.logger.write("discover_failed", "출처 탐색 실패", source=key, error=str(exc))
                continue
            for row in rows:
                url = canonical_url(str(row.file_url or row.source_url))
                if url in existing:
                    continue
                existing[url] = row
                found.append(row)
                self.logger.write("url_discovered", "공식 공개 URL 발견", source=key, resource_id=row.id, url=url, store_full_text=row.store_full_text)
                if self.options.limit and len(found) >= self.options.limit:
                    break
        rows = self._filtered(found)
        if not self.options.dry_run:
            write_jsonl(self.discovery_path, rows)
        self.logger.write("discover_summary", "탐색 완료", count=len(rows), output=str(self.discovery_path), dry_run=self.options.dry_run)

    def download(self) -> None:
        manifest: dict[str, Any] = read_json(self.download_manifest_path, {}) if self.options.resume else {}
        for resource in self._resources():
            if self.options.resume and resource.id in manifest:
                continue
            adapter = self.adapters.get(resource.id.split("-", 1)[0])
            if not adapter:
                continue
            try:
                path = adapter.download(resource, self.raw_dir / "files", self.options.dry_run)
                manifest[resource.id] = {"path": str(path.relative_to(self.root)) if path else None, "status": "downloaded" if path else "metadata_only", "checkedAt": datetime.now(timezone.utc).isoformat()}
            except Exception as exc:
                manifest[resource.id] = {"path": None, "status": "failed", "error": str(exc)}
                self.logger.write("download_failed", "파일 다운로드 실패", resource_id=resource.id, error=str(exc))
        if not self.options.dry_run:
            write_json(self.download_manifest_path, manifest)

    def parse(self) -> None:
        manifest = read_json(self.download_manifest_path, {})
        parsed_rows: list[ParsedDocument] = []
        existing = {row["resource_id"]: row for row in read_jsonl(self.parsed_path)} if self.options.resume else {}
        for resource in self._resources():
            if resource.id in existing:
                parsed_rows.append(ParsedDocument.model_validate(existing[resource.id]))
                continue
            adapter = self.adapters.get(resource.id.split("-", 1)[0])
            if not adapter:
                continue
            relative = manifest.get(resource.id, {}).get("path")
            raw_path = self.root / relative if relative else None
            try:
                parsed = adapter.parse(resource, raw_path)
                parsed_rows.append(parsed)
                self.logger.write("parse_success", "파싱 완료", resource_id=resource.id, parser=parsed.parser, confidence=parsed.confidence, warnings=parsed.warnings)
            except Exception as exc:
                self.logger.write("parse_failed", "파싱 실패", resource_id=resource.id, error=str(exc))
        if not self.options.dry_run:
            write_jsonl(self.parsed_path, parsed_rows)

    def normalize(self) -> None:
        parsed_map = {row["resource_id"]: ParsedDocument.model_validate(row) for row in read_jsonl(self.parsed_path)}
        normalized, url_seen, text_seen = [], set(), set()
        for resource in self._resources():
            parsed = parsed_map.get(resource.id) or ParsedDocument(resource_id=resource.id, title=resource.title, parser="metadata-only", confidence=1.0)
            adapter = self.adapters.get(resource.id.split("-", 1)[0])
            if not adapter:
                continue
            for row in adapter.normalize(resource, parsed):
                url_key = (canonical_url(str(row.fileUrl or row.sourceUrl)), row.questionNo)
                text_hash = row.derived.get("textHash")
                if url_key in url_seen or (text_hash and text_hash in text_seen):
                    self.logger.write("duplicate_skipped", "중복 항목 제거", resource_id=row.id)
                    continue
                url_seen.add(url_key)
                if text_hash:
                    text_seen.add(text_hash)
                normalized.append(row)
        if not self.options.dry_run:
            write_jsonl(self.normalized_path, normalized)
            write_json(self.normalized_dir / "csat_english.json", [row.model_dump(mode="json") for row in normalized])
        self.logger.write("normalize_summary", "정규화 완료", count=len(normalized), output=str(self.normalized_path))

    def report(self) -> None:
        resources = self._resources()
        normalized = read_jsonl(self.normalized_path)
        manifest = read_json(self.download_manifest_path, {})
        by_source: dict[str, int] = {}
        by_license: dict[str, int] = {}
        for resource in resources:
            by_source[resource.source_name] = by_source.get(resource.source_name, 0) + 1
            by_license[resource.license_status] = by_license.get(resource.license_status, 0) + 1
        summary = {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "discoveredResources": len(resources), "normalizedRecords": len(normalized),
            "fullTextRecords": sum(bool(row.get("storeFullText")) for row in normalized),
            "metadataOnlyRecords": sum(not bool(row.get("storeFullText")) for row in normalized),
            "downloads": {status: sum(item.get("status") == status for item in manifest.values()) for status in ["downloaded", "metadata_only", "failed"]},
            "bySource": by_source, "byLicense": by_license,
        }
        write_json(self.normalized_dir / "summary.json", summary)
        self.logger.write("report_created", "품질·수집 통계 생성", **summary)
