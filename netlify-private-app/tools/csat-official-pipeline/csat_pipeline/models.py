from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field, HttpUrl


class DiscoveredResource(BaseModel):
    id: str
    source_type: Literal["official_public"] = "official_public"
    source_name: str
    source_url: HttpUrl
    file_url: HttpUrl | None = None
    discovered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    title: str
    year: int | None = None
    exam_name: str = ""
    session: str = ""
    subject: str = "영어"
    file_format: str = "html"
    license_status: Literal["permitted", "restricted", "unclear"] = "unclear"
    store_full_text: bool = False
    allow_download: bool = False
    policy_note: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class ParsedDocument(BaseModel):
    resource_id: str
    title: str
    text: str = ""
    pages: list[str] = Field(default_factory=list)
    parser: str
    parser_version: str = "1"
    confidence: float = 0.0
    warnings: list[str] = Field(default_factory=list)


class SentenceUnit(BaseModel):
    no: int
    text: str
    translation: str = ""
    note: str = ""


class NormalizedQuestion(BaseModel):
    id: str
    sourceType: Literal["official_public"] = "official_public"
    sourceName: str
    sourceUrl: HttpUrl
    fileUrl: HttpUrl | None = None
    collectedAt: datetime
    year: int | None = None
    examName: str
    session: str
    subject: str = "영어"
    section: str = "reading"
    questionNo: int | None = None
    questionType: str = "unknown"
    title: str
    licenseStatus: str
    storeFullText: bool
    passage: list[dict[str, Any]] = Field(default_factory=list)
    passageText: str = ""
    sentenceUnits: list[SentenceUnit] = Field(default_factory=list)
    choices: list[str] = Field(default_factory=list)
    answer: int | None = None
    explanation: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    derived: dict[str, Any] = Field(default_factory=dict)

