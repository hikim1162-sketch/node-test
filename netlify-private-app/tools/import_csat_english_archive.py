from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader


CIRCLED = {"①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5}
# 일부 구형 정답표는 열 사이 공백이 사라져 일반식으로 세 문항이 합쳐집니다.
# 아래 값은 함께 보관된 공식 홀수형 정답표의 해당 행을 직접 대조한 복구값입니다.
ANSWER_REPAIRS = {
    2021: {39: (4, 3), 40: (3, 2), 42: (4, 3), 43: (3, 2), 44: (5, 2)},
    2022: {38: (5, 2), 41: (2, 2), 45: (2, 2)},
}
QUESTION_RE = re.compile(r"(?m)(?:^|\n)\s*(\d{1,2})\.\s+")
ANSWER_RE = re.compile(r"(?<!\d)(\d(?:\s*\d)?)\s*([①②③④⑤])\s*([23])")


def clean_text(value: str) -> str:
    value = value.replace("\u00a0", " ").replace("\x00", "")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def pdf_text(payload: bytes) -> tuple[list[str], str]:
    reader = PdfReader(io.BytesIO(payload))
    pages = [clean_text(page.extract_text() or "") for page in reader.pages]
    return pages, "\n\n".join(pages)


def choose_problem_file(year_dir: Path) -> tuple[str, bytes]:
    direct = sorted(year_dir.glob("*.pdf"))
    preferred = [p for p in direct if "문제지" in p.name and "짝수" not in p.name]
    if preferred:
        path = preferred[0]
        return path.name, path.read_bytes()

    for archive in sorted(year_dir.glob("*.zip")):
        if "음원" in archive.name or "듣기평가MP3" in archive.name:
            continue
        with zipfile.ZipFile(archive) as bundle:
            candidates = [name for name in bundle.namelist() if name.lower().endswith(".pdf")]
            if not candidates:
                continue
            if candidates:
                # 오래된 ZIP은 한글 파일명이 깨질 수 있으므로 이름 대신 크기를 우선합니다.
                # 문제지는 듣기 대본보다 항상 훨씬 큰 PDF입니다.
                name = max(candidates, key=lambda item: bundle.getinfo(item).file_size)
                return f"{archive.name}!/{name}", bundle.read(name)
    raise FileNotFoundError(f"문제지를 찾지 못했습니다: {year_dir}")


def choose_answer_file(year_dir: Path) -> tuple[str, bytes]:
    candidates = sorted(p for p in year_dir.glob("*.pdf") if "정답" in p.name)
    if not candidates:
        raise FileNotFoundError(f"정답표를 찾지 못했습니다: {year_dir}")
    path = candidates[0]
    return path.name, path.read_bytes()


def parse_answers(text: str) -> dict[int, dict[str, int]]:
    # 정답표의 '1 3', '2 5'처럼 떨어진 두 자리 문항 번호를 합칩니다.
    answers: dict[int, dict[str, int]] = {}
    odd_text = text.split("( 짝수 )")[0]
    for match in ANSWER_RE.finditer(odd_text):
        number = int(re.sub(r"\s+", "", match.group(1)))
        if 1 <= number <= 45:
            answers[number] = {"answer": CIRCLED[match.group(2)], "points": int(match.group(3))}
    return answers


def infer_type(number: int, prompt: str) -> str:
    rules = [
        ("목적", "purpose"), ("심경", "emotion"), ("주장", "claim"),
        ("요지", "main_point"), ("주제", "topic"), ("제목", "title"),
        ("도표", "chart"), ("일치하지 않는", "not_true"), ("일치하는", "true"),
        ("어법", "grammar"), ("낱말", "vocabulary"), ("빈칸", "blank"),
        ("흐름", "irrelevant_sentence"), ("순서", "ordering"),
        ("주어진 문장", "sentence_insertion"), ("요약문", "summary"),
    ]
    for needle, value in rules:
        if needle in prompt:
            return value
    if number >= 43:
        return "long_reading"
    return "reading"


def split_choices(block: str) -> list[str]:
    matches = list(re.finditer(r"[①②③④⑤]", block))
    if len(matches) < 5:
        return []
    # 선택지는 통상 문항 블록의 마지막 5개 원문 번호입니다.
    matches = matches[-5:]
    choices = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(block)
        choices.append(clean_text(block[match.end():end]))
    return choices


def parse_questions(text: str, answers: dict[int, dict[str, int]], year: int) -> list[dict]:
    matches = list(QUESTION_RE.finditer(text))
    questions = []
    seen_numbers: set[int] = set()
    for index, match in enumerate(matches):
        number = int(match.group(1))
        if not 18 <= number <= 45 or number in seen_numbers:
            continue
        seen_numbers.add(number)
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        block = clean_text(text[match.end():end])
        first_line = next((line.strip() for line in block.splitlines() if line.strip()), "")
        choices = split_choices(block)
        answer_data = answers.get(number, {})
        questions.append({
            "id": f"kice-csat-{year}-english-{number:02d}",
            "sourceType": "official_user_import",
            "sourceName": "한국교육과정평가원",
            "examName": f"{year}학년도 대학수학능력시험",
            "year": year,
            "session": "본시험",
            "subject": "영어",
            "questionNo": number,
            "questionType": infer_type(number, first_line),
            "prompt": first_line,
            "rawText": block,
            "choices": choices,
            "answer": answer_data.get("answer"),
            "points": answer_data.get("points"),
            "metadata": {
                "variant": "홀수형 또는 단일형",
                "requiresReview": len(choices) != 5 or number not in answers,
            },
            "derived": {
                "textHash": hashlib.sha256(block.encode("utf-8")).hexdigest(),
                "textLength": len(block),
            },
        })
    return questions


def run(source_root: Path, output: Path) -> dict:
    exams = []
    all_questions = []
    warnings = []
    for year_dir in sorted(path for path in source_root.iterdir() if path.is_dir() and path.name.isdigit()):
        year = int(year_dir.name)
        try:
            problem_name, problem_bytes = choose_problem_file(year_dir)
            answer_name, answer_bytes = choose_answer_file(year_dir)
            pages, problem_text = pdf_text(problem_bytes)
            _, answer_text = pdf_text(answer_bytes)
            answers = parse_answers(answer_text)
            for number, (answer, points) in ANSWER_REPAIRS.get(year, {}).items():
                answers.setdefault(number, {"answer": answer, "points": points})
            questions = parse_questions(problem_text, answers, year)
            exams.append({
                "year": year,
                "problemFile": problem_name,
                "answerFile": answer_name,
                "pageCount": len(pages),
                "answerCount": len(answers),
                "readingQuestionCount": len(questions),
                "problemSha256": hashlib.sha256(problem_bytes).hexdigest(),
                "answerSha256": hashlib.sha256(answer_bytes).hexdigest(),
            })
            all_questions.extend(questions)
            if len(questions) < 28:
                warnings.append(f"{year}: 독해 문항이 {len(questions)}개만 분리되어 검토가 필요합니다.")
        except Exception as exc:
            warnings.append(f"{year}: {exc}")

    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceDirectory": str(source_root),
        "policy": "사용자가 제공한 공식 공개 수능 자료를 가족 전용 학습용으로 로컬 구조화",
        "exams": exams,
        "questions": all_questions,
        "summary": {
            "examCount": len(exams),
            "questionCount": len(all_questions),
            "reviewRequiredCount": sum(1 for item in all_questions if item["metadata"]["requiresReview"]),
            "warnings": warnings,
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="로컬 수능 영어 문제지/정답표 Import")
    parser.add_argument("--source", type=Path, default=Path("imports/영어지문"))
    parser.add_argument("--output", type=Path, default=Path("data/imported/csat-english-2021-2026.json"))
    args = parser.parse_args()
    result = run(args.source, args.output)
    print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
