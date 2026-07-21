from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from csat_pipeline.models import DiscoveredResource, ParsedDocument


def parse_html(resource: DiscoveredResource, path: Path) -> ParsedDocument:
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
    for node in soup.select("script,style,nav,header,footer,form"):
        node.decompose()
    text = re.sub(r"\n{3,}", "\n\n", soup.get_text("\n", strip=True))
    return ParsedDocument(resource_id=resource.id, title=resource.title, text=text, parser="beautifulsoup", confidence=0.72 if text else 0.0)

