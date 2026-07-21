from __future__ import annotations

from pathlib import Path

from csat_pipeline.models import DiscoveredResource, ParsedDocument


def parse_text(resource: DiscoveredResource, path: Path) -> ParsedDocument:
    text = path.read_text(encoding="utf-8", errors="ignore")
    return ParsedDocument(resource_id=resource.id, title=resource.title, text=text, parser="plain-text", confidence=0.9 if text.strip() else 0.0)

