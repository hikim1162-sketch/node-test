from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader

from csat_pipeline.models import DiscoveredResource, ParsedDocument


def parse_pdf(resource: DiscoveredResource, path: Path) -> ParsedDocument:
    reader = PdfReader(str(path))
    pages, warnings = [], []
    for index, page in enumerate(reader.pages):
        try:
            pages.append(page.extract_text() or "")
        except Exception as exc:
            pages.append("")
            warnings.append(f"page {index + 1}: {exc}")
    text = "\n\n".join(pages)
    density = sum(bool(page.strip()) for page in pages) / max(1, len(pages))
    if density < 0.5:
        warnings.append("텍스트 레이어가 부족합니다. OCR은 자동 실행하지 않습니다.")
    return ParsedDocument(resource_id=resource.id, title=resource.title, text=text, pages=pages, parser="pypdf", confidence=round(density, 3), warnings=warnings)

