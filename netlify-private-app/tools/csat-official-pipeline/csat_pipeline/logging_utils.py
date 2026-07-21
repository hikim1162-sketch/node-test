from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class AuditLogger:
    def __init__(self, directory: Path) -> None:
        directory.mkdir(parents=True, exist_ok=True)
        self.text_path = directory / "pipeline.log"
        self.jsonl_path = directory / "pipeline.jsonl"

    def write(self, event: str, message: str, **details: Any) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        record = {"timestamp": timestamp, "event": event, "message": message, **details}
        with self.jsonl_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
        with self.text_path.open("a", encoding="utf-8") as handle:
            suffix = f" | {json.dumps(details, ensure_ascii=False, default=str)}" if details else ""
            handle.write(f"[{timestamp}] {event}: {message}{suffix}\n")

