# 공식 수능 영어 자료 데이터 파이프라인

공식 기관이 로그인 없이 공개한 수능·모의평가·전국연합학력평가 영어 자료를 발견하고, 허용 범위에 따라 내려받아 파싱한 뒤 ValueTime의 `오늘의 수능 지문`에서 사용할 수 있는 JSON/JSONL로 정규화하는 독립 도구입니다.

## 가장 중요한 운영 원칙

- 공식 기관 도메인과 설정에 등록된 공개 URL만 요청합니다.
- `robots.txt`가 요청을 허용하지 않거나 확인에 실패하면 해당 요청을 중단합니다.
- 로그인, 세션, 봇 차단, 인증 또는 접근 제한을 우회하지 않습니다.
- 요청 간 기본 2초 간격과 지수형 재시도를 적용합니다.
- 저작권 또는 재사용 범위가 불명확하면 **전문을 내려받거나 저장하지 않습니다.**
- 제한 자료는 제목, 시험 정보, 공식 URL, 파일 URL, 수집 시각, 정책 사유만 저장합니다.
- 전문 저장은 `licenseStatus: permitted`, `storeFullText: true`, `allowDownload: true`가 모두 충족될 때만 가능합니다.
- 설정을 바꾸기 전 해당 자료의 명시적 재사용 허가 근거를 별도로 보관해야 합니다.

평가원과 서울시교육청 공개 페이지는 무단 복제·배포·전자출판 금지를 안내하므로 기본 설정이 `restricted / metadata-only`입니다. EBSi는 재사용 범위를 별도로 확인하기 전까지 `unclear / metadata-only`입니다.

## 폴더 구조

```text
csat-official-pipeline/
  config/sources.json
  sources/
    base.py
    kice.py
    sen.py
    ebsi.py
    registry.py
  csat_pipeline/
    models.py
    http.py
    logging_utils.py
    pipeline.py
    utils.py
    parsers/
    normalizers/
  data/
    raw/
    parsed/
    normalized/
  logs/
  main.py
  requirements.txt
```

## 설치 및 실행

Windows PowerShell 예시:

```powershell
cd D:\프로젝트\node-test\netlify-private-app\tools\csat-official-pipeline
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py discover --dry-run --limit 20
python main.py all --resume
```

단계별 실행:

```powershell
python main.py discover
python main.py download --resume
python main.py parse --resume
python main.py normalize
python main.py report
```

필터 예시:

```powershell
python main.py discover --source kice --since 2015 --limit 100 --resume
python main.py all --source sen --year 2026 --dry-run
```

## 처리 흐름

### A. discovery

각 adapter가 공식 공개 목록 페이지를 읽고 시험명·연도·파일 링크 후보를 수집합니다. URL을 정규화하여 중복을 제거하고 `data/raw/discovered.jsonl`에 저장합니다.

### B. download

정책의 세 가지 허용 조건을 모두 만족한 파일만 `data/raw/files/`에 저장합니다. 현재 기본 adapter는 저작권 제한 때문에 모두 메타데이터 전용이며, 생략 사유가 로그와 `download_manifest.json`에 기록됩니다.

### C. parsing

- HTML: BeautifulSoup 기반 본문 추출
- PDF: pypdf 텍스트 레이어 추출
- TXT: UTF-8 텍스트 추출
- HWPX: ZIP 내부 section XML 추출
- HWP: 자동 변환하지 않고 지원 불가 사유 기록

스캔 PDF의 OCR은 개인정보·오탐·부하 문제 때문에 자동 실행하지 않습니다.

### D. normalization

문항 번호 후보 분리, 문제 유형 추정, 영어 비율 계산, 문장 분리, URL·본문 해시 중복 제거를 수행합니다. 결과는 다음 파일로 생성됩니다.

- `data/normalized/csat_english.jsonl`
- `data/normalized/csat_english.json`
- `data/normalized/summary.json`

## 정규화 스키마

주요 필드:

```json
{
  "id": "kice-...-31",
  "sourceType": "official_public",
  "sourceName": "한국교육과정평가원",
  "sourceUrl": "https://...",
  "fileUrl": "https://...pdf",
  "collectedAt": "2026-07-21T00:00:00Z",
  "year": 2027,
  "examName": "2027학년도 6월 모의평가",
  "session": "6월 모의평가",
  "subject": "영어",
  "section": "reading",
  "questionNo": 31,
  "questionType": "blank",
  "licenseStatus": "restricted",
  "storeFullText": false,
  "passageText": "",
  "sentenceUnits": [],
  "choices": [],
  "answer": null,
  "metadata": {
    "parsingConfidence": 1.0,
    "policyNote": "전문 저장 제한 사유"
  },
  "derived": {
    "passageLength": 0,
    "englishRatio": 0.0,
    "textHash": ""
  }
}
```

`storeFullText: false`인 항목은 웹앱에서 전문을 렌더링하지 말고 공식 원문 링크와 출처 정보만 표시해야 합니다.

## 품질 처리

- 약어(`e.g.`, `i.e.`, `Mr.`, `Dr.`, `U.S.`)를 보호하는 기본 문장 분리
- 영어 비율 0.35 미만 또는 80자 미만 후보의 전문 제외
- 머리말·꼬리말·쪽 번호 형태의 기본 노이즈 제거
- URL + 문항 번호 중복 제거
- 정규화 본문 SHA-256 중복 제거
- parser confidence 및 warning 저장
- 유형을 확신할 수 없으면 `unknown`

near-duplicate 의미 유사도는 의존성과 오탐을 줄이기 위해 MVP에 포함하지 않았습니다. 추후 허가된 전문 데이터가 충분할 때 MinHash/SimHash 단계로 추가할 수 있습니다.

## 새 adapter 추가

1. `sources/base.py`의 `SourceAdapter`를 상속합니다.
2. `discover()`를 구현합니다.
3. `sources/registry.py`에 클래스를 등록합니다.
4. `config/sources.json`에 공식 도메인, seed URL, 라이선스 정책을 추가합니다.
5. 해당 사이트의 robots.txt와 이용약관, 개별 자료 저작권 고지를 사람이 먼저 확인합니다.

공통 `download()`, `parse()`, `normalize()`는 그대로 사용할 수 있고 출처별 예외가 있을 때만 재정의합니다.

## 로그와 감사

- `logs/pipeline.log`: 사람이 읽는 실행 로그
- `logs/pipeline.jsonl`: 기계 처리용 이벤트 로그
- `logs/last_run.json`: 마지막 완료 시각과 옵션

발견 URL, 다운로드 또는 생략, 파싱 성공·실패, 정책상 메타데이터 전용 처리, 중복 제거와 예외 사유가 기록됩니다.

## 실패 시 점검

- `robots_denied`: 요청하지 않는 것이 정상입니다. 우회하지 마세요.
- `metadata_only`: 저작권 정책에 따른 정상 동작입니다.
- 동적 페이지에서 링크가 없을 때: 공식 공개 API나 정적 목록 URL이 있는지 사람이 확인한 뒤 adapter를 확장하세요.
- 스캔 PDF: 자동 OCR 대신 허가된 텍스트 버전 또는 공식 HTML을 우선 사용하세요.
- HWP: 공식 HWPX/PDF 대체 파일을 사용하세요.

## 웹앱 연결

`csat_english.json`에서 `storeFullText: true`인 항목만 내부 지문 학습 후보로 사용할 수 있습니다. `storeFullText: false`는 출처 색인과 원문 이동용으로만 사용합니다. 오늘의 지문 선택기는 연도, 회차, 문제 유형, 기관, 파싱 신뢰도와 본문 해시를 기준으로 필터링할 수 있습니다.

핵심 표현 후보 추출과 난이도 추정은 원문 저장이 적법한 레코드에 한해 후속 파생 단계로 추가하는 것을 권장합니다.
