from __future__ import annotations

import re
from typing import Iterable

from csat_pipeline.models import DiscoveredResource, NormalizedQuestion, ParsedDocument, SentenceUnit
from csat_pipeline.utils import sha256_text


QUESTION_TYPES = [
    (r"주제", "main_idea"), (r"제목", "title"), (r"요지", "gist"),
    (r"빈칸", "blank"), (r"순서", "order"), (r"삽입", "insertion"),
    (r"요약", "summary"), (r"일치하지|불일치", "detail_false"),
    (r"일치", "detail_true"), (r"어휘", "vocabulary"), (r"어법", "grammar"),
    (r"장문", "long_reading"),
]


def clean_text(text: str) -> str:
    lines = []
    for line in text.replace("\x00", " ").splitlines():
        value = re.sub(r"\s+", " ", line).strip()
        if not value or re.fullmatch(r"[-–—\d\s]+", value):
            continue
        if re.search(r"^(대학수학능력시험|영어 영역|확인 사항|쪽)$", value):
            continue
        lines.append(value)
    return "\n".join(lines)


def english_ratio(text: str) -> float:
    letters = re.findall(r"[A-Za-z가-힣]", text)
    return round(sum(char.isascii() for char in letters) / max(1, len(letters)), 4)


def split_sentences(text: str) -> list[str]:
    protected = text
    replacements = {"e.g.": "e§g§", "i.e.": "i§e§", "Mr.": "Mr§", "Dr.": "Dr§", "U.S.": "U§S§"}
    for source, target in replacements.items():
        protected = protected.replace(source, target)
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])", protected)
    return [part.replace("§", ".").strip() for part in parts if part.strip()]


def infer_question_type(text: str) -> str:
    for pattern, value in QUESTION_TYPES:
        if re.search(pattern, text):
            return value
    return "unknown"


def split_question_candidates(text: str) -> Iterable[tuple[int | None, str]]:
    matches = list(re.finditer(r"(?m)(?<!\d)([1-9]|[1-3]\d|4[0-5])\s*[.)]", text))
    if not matches:
        yield None, text
        return
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        yield int(match.group(1)), text[match.end():end].strip()


def normalize_resource(resource: DiscoveredResource, parsed: ParsedDocument) -> list[NormalizedQuestion]:
    text = clean_text(parsed.text) if resource.store_full_text else ""
    candidates = list(split_question_candidates(text)) if text else [(None, "")]
    rows: list[NormalizedQuestion] = []
    for question_no, candidate in candidates:
        ratio = english_ratio(candidate)
        safe_text = candidate if resource.store_full_text and len(candidate) >= 80 and ratio >= 0.35 else ""
        sentence_units = [SentenceUnit(no=index + 1, text=value) for index, value in enumerate(split_sentences(safe_text))]
        row_id = f"{resource.id}-{question_no or 'document'}"
        rows.append(NormalizedQuestion(
            id=row_id, sourceName=resource.source_name, sourceUrl=resource.source_url,
            fileUrl=resource.file_url, collectedAt=resource.discovered_at, year=resource.year,
            examName=resource.exam_name, session=resource.session, questionNo=question_no,
            questionType=infer_question_type(candidate), title=resource.title,
            licenseStatus=resource.license_status,
            storeFullText=bool(safe_text), passageText=safe_text,
            sentenceUnits=sentence_units,
            metadata={"difficulty": None, "tags": [], "pageRange": None, "language": "en", "parser": parsed.parser, "parsingConfidence": parsed.confidence, "policyNote": resource.policy_note, **resource.metadata},
            derived={"passageLength": len(safe_text), "englishRatio": ratio, "textHash": sha256_text(safe_text) if safe_text else ""},
        ))
    return rows
