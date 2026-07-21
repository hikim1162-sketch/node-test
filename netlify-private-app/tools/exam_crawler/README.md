# Exam Crawler

KICE 수능·모의평가와 시도교육청 전국연합학력평가의 **공식 공개 자료만** 색인하는 Python 3.11+ 파이프라인입니다. 로그인·유료·비공개 자료, CAPTCHA/세션/봇 차단 우회는 지원하지 않습니다.

## 실행

```powershell
cd D:\프로젝트\node-test\netlify-private-app\tools\exam_crawler
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py all --source csat
python main.py all --source seoul --year 2026
python main.py discover --source kice_csat_archive --since 2017
python main.py report
```

명령: `discover`, `download`, `parse`, `normalize`, `deduplicate`, `report`, `all`. 옵션: `--source`, `--year`, `--since`, `--limit`, `--resume`, `--dry-run`.

## 저장 정책

평가원과 교육청 시험 자료는 공개 열람 가능 여부와 재배포 허용 여부가 다릅니다. 기본값은 `restricted_or_unclear`, `storeFullText: false`입니다. 따라서 본문·문항·선지·정답은 normalized 결과에서 비우고 출처, 연도, 시험명, 파일 링크, 해시와 품질 지표만 남깁니다. 명시적 재사용 허가를 확인한 출처만 YAML에서 허용 정책으로 전환해야 합니다.

KICE archive는 내부 분석용 파싱을 허용할 수 있지만 공개 저장층은 항상 라이선스 정책을 통과해야 합니다. 기본 `todayCandidate`는 `false`입니다.

## Adapter

- `kice_adapter`: KICE 공개 페이지 공통 탐색
- `kice_mock_adapter`: 모의평가 공개 자료
- `csat_adapter`: 검증된 최신 수능 정적 공개 URL
- `kice_csat_archive_adapter`: KICE 대학수학능력시험 기출 게시판 전용 목록·상세·첨부·페이지네이션
- `education_office_base`: 게시판형 목록, 연도·월·학년·첨부 공통 추출
- 17개 시도교육청 adapter: 지역 설정만 분리하고 공통 베이스 상속

`kice_csat_archive.list_urls`는 안정적인 공식 게시판 URL을 확인하지 못해 비워 두었습니다. 추측 URL로 요청하지 않기 위한 조치입니다. 검증된 목록 URL을 `{page}`, `{year}` 템플릿과 함께 추가하면 상세 페이지와 PDF/HWP/HWPX 첨부를 탐색합니다.

## 데이터

- raw manifests: `data/raw/manifests/*.jsonl`
- parsed: `data/parsed/items.jsonl`
- normalized: `data/normalized/items.jsonl`
- source/year outputs: `data/parsed/{source}_{year}.jsonl`, `data/normalized/{source}_{year}.jsonl`
- reports: `data/reports/summary.json`, `summary.md`
- sample: `data/normalized/sample.jsonl`

Normalized 모델은 출처, 게시글 번호, attachment role, 문장 배열, 문제 유형, 라이선스, 재사용 정책, 파싱 신뢰도와 ValueTime UI용 `todayCandidate`, `recommendedReason`, `uiPreview`를 제공합니다.

`--resume`은 기존 discovered manifest를 함께 읽고 URL 기준으로 합쳐 이미 발견한 항목의 중복 적재를 방지합니다. `--dry-run`은 결과 파일을 덮어쓰지 않고 탐색과 정책 판단만 확인합니다.

## 새 adapter 추가

1. `BaseAdapter` 또는 교육청인 경우 `EducationOfficeBase`를 상속합니다.
2. 공식 목록 URL, 허용 도메인과 CSS selector를 해당 adapter에서 지정합니다.
3. `config/sources.yaml`에 module/class를 등록하되 공식 URL과 robots 정책을 검증하기 전에는 `enabled: false`로 둡니다.
4. 재사용 허가 근거가 없다면 `restricted_or_unclear`, `store_full_text: false`를 유지합니다.

## 한계와 확장

- 교육청별 실제 게시판 URL은 반드시 사람이 공식 페이지와 robots.txt를 확인한 뒤 활성화해야 합니다.
- 바이너리 HWP는 메타데이터 fallback이며, HWPX/PDF를 우선합니다.
- 스캔 PDF OCR은 자동 실행하지 않습니다.
- KICE 게시판 구조가 바뀌면 selector를 adapter에서 override해야 합니다.
- 전문 이용 허가 전에는 오늘의 수능 지문 본문 데이터로 사용하지 않고 출처 링크 허브와 메타데이터 카탈로그로만 사용합니다.
