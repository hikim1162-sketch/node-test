from __future__ import annotations

import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree

from csat_pipeline.models import DiscoveredResource, ParsedDocument


def parse_hwpx(resource: DiscoveredResource, path: Path) -> ParsedDocument:
    chunks: list[str] = []
    warnings: list[str] = []
    try:
        with zipfile.ZipFile(path) as archive:
            names = sorted(name for name in archive.namelist() if name.startswith("Contents/section") and name.endswith(".xml"))
            for name in names:
                root = ElementTree.fromstring(archive.read(name))
                text = " ".join(value.strip() for value in root.itertext() if value.strip())
                chunks.append(re.sub(r"\s+", " ", text))
    except Exception as exc:
        warnings.append(str(exc))
    text = "\n\n".join(chunks)
    return ParsedDocument(resource_id=resource.id, title=resource.title, text=text, parser="hwpx-xml", confidence=0.75 if text else 0.0, warnings=warnings)

