from __future__ import annotations

from pathlib import Path

from csat_pipeline.models import DiscoveredResource, ParsedDocument

from .html_parser import parse_html
from .hwpx_parser import parse_hwpx
from .pdf_parser import parse_pdf
from .text_parser import parse_text


def parse_file(resource: DiscoveredResource, path: Path) -> ParsedDocument:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return parse_pdf(resource, path)
    if suffix in {".html", ".htm"}:
        return parse_html(resource, path)
    if suffix == ".hwpx":
        return parse_hwpx(resource, path)
    if suffix == ".hwp":
        return ParsedDocument(resource_id=resource.id, title=resource.title, parser="hwp-unsupported", confidence=0.0, warnings=["바이너리 HWP는 자동 파싱하지 않습니다. HWPX/PDF 변환본을 사용하세요."])
    return parse_text(resource, path)

