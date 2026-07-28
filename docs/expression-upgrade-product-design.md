# 표현 업그레이드 제품 설계서

## 0. 문서 목적과 제품 원칙

`표현 업그레이드`는 쉬운 영어를 무조건 어려운 영어로 바꾸는 기능이 아니다. 사용자가 이미 아는 표현을 출발점으로 삼아, **같은 의도를 더 자연스럽고 정확하며 상황에 맞게 표현하는 선택 능력**을 훈련하는 기능이다.

출시 전략은 다음 한 문장으로 고정한다.

> 일반모드에서 하루 5개 학습의 완주율·이해도·추천 품질을 먼저 검증하고, 검증된 표현과 학습 로그를 문맥·혼동어·시험형 문제로 재가공하여 HYUK의 수능모드로 확장한다.

---

## 1. 전체 제품 전략

### 1.1 핵심 목적

- 쉬운 표현과 업그레이드 표현의 의미·강도·격식·사용 상황 차이를 익힌다.
- 단어 암기가 아니라 “이 상황에서는 어떤 표현이 더 적절한가”를 판단하게 한다.
- 학습 결과를 저장·복습·퀴즈로 연결해 실제 기억으로 전환한다.

### 1.2 단순 유의어 기능이 되면 안 되는 이유

유의어는 의미가 비슷할 뿐 상호 교환 가능한 단어가 아니다. `combine → integrate / merge / unify`는 목적어와 상황에 따라 자연스러움이 달라진다. 따라서 네이버 유사어 등 외부 데이터는 후보 수집에만 사용하고, 서비스 노출 전 다음 판단을 거쳐야 한다.

- 의미가 실제로 더 정확하거나 자연스러운가
- 원표현과 치환 가능한 문맥이 명확한가
- 강도·격식·긍정/부정 뉘앙스를 설명할 수 있는가
- 짧은 예문으로 차이를 증명할 수 있는가
- 학습자가 바로 사용할 가치가 있는가

### 1.3 일반모드를 먼저 검증하는 이유

일반모드는 학습 진입 장벽이 낮아 추천 품질과 UX를 빠르게 검증하기 좋다. 여기서 다음을 확인하지 않고 수능형 문제부터 만들면, 어려운 보기만 늘고 학습 효과는 불명확해진다.

- 5개 분량이 실제로 부담 없는가
- before/after 비교가 즉시 이해되는가
- 설명이 짧아도 오용을 막을 수 있는가
- 어떤 카테고리의 저장률과 복습률이 높은가
- 학습자가 “더 어려운 단어”가 아니라 “더 적절한 표현”으로 받아들이는가

### 1.4 일반모드와 수능모드의 관계

| 공통 기반 | 일반모드 | 수능모드 |
|---|---|---|
| 동일 expression ID와 의미 관계 | 생활·업무에서 자연스러운 표현 선택 | 지문 문맥에서 정확한 어휘 선택 |
| 동일한 5개 세트 엔진 | before/after 카드 중심 | 혼동어 비교와 보기형 문제 중심 |
| 동일한 저장·복습 로그 | 사용 가능성·친숙도 강화 | 오답 패턴·문맥 판단 강화 |
| 난이도·모드별 예문 | 짧고 직접적인 예문 | 추론이 필요한 수능형 예문 |

HYUK용 수능모드에서는 일반모드의 인기보다 **오답률, 혼동 빈도, 문맥 의존성**을 더 중요한 선별 기준으로 사용한다.

---

## 2. 전체 시스템 구조

| 레이어 | 입력 | 처리와 출력 | 자동화 | 사람 검수 포인트 |
|---|---|---|---|---|
| 1. 단어장 입력 | 일반/수능 단어, 저장 표현 | base expression 정규화 | 중복·품사 정리 | 학습 가치 없는 항목 제외 |
| 2. 후보 수집 | base word/expression | 사전·유사어·내부 콘텐츠 후보군 | API 수집, 형태 통합 | 출처와 라이선스 확인 |
| 3. 필터링·정제 | 후보 5~30개 | 품사 일치, 중복 제거, 빈도·난이도 필터 | 규칙 및 점수화 | 1:1 치환 위험 검토 |
| 4. 관계 라벨링 | 정제 후보 | intensity, precision, formality, context, confusable | 초안 자동 분류 | 의미 관계 최종 승인 |
| 5. 학습 카드 생성 | 승인 expression pair | 설명·usage note·예문·퀴즈 생성 | 템플릿 및 AI 초안 | 예문 자연스러움과 오용 검수 |
| 6. 5개 세트 구성 | 승인 카드 | 카테고리·난이도 균형 세트 | 규칙 기반 편성 | 한 세트 내 중복 감각 제거 |
| 7. 일반모드 노출 | general-enabled 세트 | 카드 → 퀴즈 → 저장 → 복습 | 개인화 순서 | 지표로 저품질 카드 중단 |
| 8. 수능모드 전환 | 검증 카드+학습 로그 | 문맥 예문·혼동 보기·오답 유도 문제 | 난이도별 문제 변환 | 정답 유일성 필수 검수 |

### 품질 게이트

콘텐츠 상태는 `candidate → drafted → reviewed → general_live → csat_beta → csat_live → retired`로 관리한다. 자동 생성 결과가 바로 사용자에게 노출되어서는 안 된다. 특히 수능형 문항은 “정답이 하나뿐인가”와 “오답이 터무니없이 쉽지 않은가”를 사람이 확인한다.

---

## 3. 일반모드 설계

### 3.1 목표와 기본 흐름

`홈 진입 → 오늘의 5개 → 카드 5장 → 3문제 퀴즈 → 결과/저장 → 다음 날 복습`

하루 학습 목표 시간은 3~5분이다. 한 세트는 반드시 5개이며, 완료 후에만 다음 5개를 선택적으로 연다.

### 3.2 화면 구성

#### 홈

- `오늘의 표현 업그레이드 0/5`
- 예상 시간 `약 3분`
- 오늘 테마 예: `VERY 탈출`, `업무에서 더 자연스럽게`
- CTA: `오늘의 5개 시작`
- 최근 저장 표현과 복습 대기 수

#### 학습 카드

- BEFORE: `very tired`
- AFTER: `exhausted` + 스피커
- 한 줄 차이: `단순히 피곤한 정도보다 훨씬 강합니다.`
- usage note: `격식·일상 모두 가능. 가벼운 피곤함에는 쓰지 않음.`
- 일반 예문 1개와 해석
- `저장`, `이해했어요`, `다음` 버튼
- 진행 표시 `2 / 5`

모바일에서는 한 카드가 한 화면 안에 핵심적으로 보이게 하며, 설명은 기본 2줄 이하로 제한한다.

#### 퀴즈

- 더 자연스러운 표현 고르기
- 문장 빈칸에 맞는 표현 고르기
- before/after 짝 맞추기
- 비슷한 표현 중 상황에 맞는 것 고르기

긴 입력과 철자 타이핑은 MVP에서 제외한다. 오답이면 정답·짧은 차이 설명을 보여주고 사용자가 `다시 풀기`를 눌러야 재도전한다.

#### 저장·복습

- 저장은 학습 완료와 분리한다.
- 저장한 표현은 제거하지 않고 `암기함` 상태를 별도로 둔다.
- 복습 주기: 최초 1일 → 3일 → 7일 → 14일.
- 연속 오답 표현은 다음 세트보다 먼저 1~2개 재출제한다.

### 3.3 UX 원칙

1. 한 화면에는 하나의 판단만 요구한다.
2. before/after는 색과 위치를 항상 동일하게 유지한다.
3. 주요 CTA는 엄지 영역에 두고 최소 높이 44px을 확보한다.
4. 정답 직후 화면이 자동으로 넘어가지 않는다.
5. “고급 표현” 대신 “이 상황에 더 적절한 표현”이라는 언어를 사용한다.

### 3.4 일반모드 검증 지표

| 지표 | 초기 목표 | 판단 |
|---|---:|---|
| 5개 세트 시작 대비 완주율 | 70% 이상 | 분량·스크롤 적정성 |
| 카드 평균 체류 | 8~25초 | 너무 쉽거나 설명이 긴지 |
| 저장률 | 15~35% | 실제 사용 가치 |
| 세트 직후 퀴즈 정답률 | 65~85% | 난이도·설명 품질 |
| 7일 복습 재방문율 | 25% 이상 | 기억 기능 가치 |
| 표현별 `추천이 어색해요` 비율 | 5% 미만 | 콘텐츠 품질 |
| 오답 후 재도전 성공률 | 60% 이상 | 피드백 효과 |

---

## 4. 수능모드 설계

### 4.1 목표

- 지문 안에서 의미가 맞는 어휘를 선택한다.
- 유의어와 혼동어의 차이를 근거로 설명한다.
- 문맥상 부적절한 어휘를 빠르게 제거한다.
- 반복 오답을 개인별 혼동 묶음으로 전환한다.

### 4.2 일반모드와 달라지는 점

| 일반모드 | 수능모드 |
|---|---|
| 자연스러운 치환 경험 | 치환 가능/불가능 문맥 판단 |
| 쉬운 한 줄 설명 | 의미 범위·논리 방향·결합어 차이 |
| 생활 예문 | 독해 지문형 20~35단어 예문 |
| 표현 자체 기억 | 보기 간 차이와 정답 근거 기억 |
| 긍정적 성공 경험 중심 | 오답 유도와 교정 중심 |

### 4.3 HYUK 중심 학습 흐름

`오늘의 혼동 5개 → 차이 카드 → 문맥 선택 5문제 → 오답 2차 문제 → 다음 날 재출제`

- 5개 세트는 유지한다.
- 첫 세트는 기본 의미 차이, 다음 세트는 문맥 적용으로 난이도를 올린다.
- 오답은 자동 이동하지 않고 `정답/오답 → 근거 → 다시 풀기/다음 문제` 순서를 지킨다.
- 동일 혼동어는 문장만 바꾸어 최소 두 번 맞혀야 해결 처리한다.
- 최근 오답률이 높은 표현 2개 + 신규 3개로 개인화할 수 있다.

### 4.4 구성 요소

- 표현 학습 카드: 의미 범위, 대표 결합어, 수능형 예문
- 혼동 어휘 비교: `adapt vs adopt`, `imply vs infer`
- 문맥 선택형: 논리·주체·목적어에 맞는 단어 선택
- 오답 유도형: 형태는 비슷하지만 의미 방향이 다른 보기
- 반복 복습: 1일·3일·7일 간격과 오답 즉시 재학습

---

## 5. 일반모드에서 수능모드로 확장하는 전략

### 5.1 일반모드에서 축적할 데이터

- expression별 조회·완주·저장·암기함 비율
- 최초/복습 정답률과 응답 시간
- 오답으로 함께 선택된 distractor
- `쉽다/적당하다/어렵다`, `추천이 어색하다` 피드백
- 예문별 이해도

### 5.2 재가공 원칙

- 일반모드 저장률이 높고 정답률도 높은 표현: 수능모드 기본 카드 후보
- 저장률은 높지만 정답률이 낮은 표현: 의미 차이 카드와 혼동 문제 후보
- 특정 오답 보기에 선택이 집중된 표현: confusable pair로 승격
- 일반모드에서 설명 없이는 오용되는 표현: 수능모드에서만 제한적으로 사용

### 5.3 콘텐츠 적합성

- 일반모드 우선: `very tired → exhausted`, 요청·사과·회의 표현
- 공통: 강도, 격식, 정확성 차이가 명확한 표현
- 수능모드 우선: `imply/infer`, `economic/economical`, 문맥 의존 동사
- 추천 제외: 문맥 없이 우열을 말할 수 없는 다의어, 전문 영역 한정어, 지나치게 희귀한 표현

---

## 6. 데이터/DB 설계

### 6.1 expressions

```text
id
source_expression
source_base_word
target_expression
part_of_speech
category
relation_type              # intensity|precision|formality|context|confusable
difficulty_general         # 1~5
difficulty_csat            # 1~5
short_description
usage_note
example_general
example_general_ko
example_csat
example_csat_ko
confusable_expression_ids  # JSON 또는 관계 테이블
collocations
recommended_score          # 0~100
candidate_source
review_status
reviewed_by
is_general_enabled
is_csat_enabled
version
created_at
updated_at
```

### 6.2 expression_sets / expression_set_items

```text
expression_sets:
  id, mode, theme, category, difficulty, version, status, published_at

expression_set_items:
  set_id, expression_id, display_order, card_variant, quiz_weight
```

세트 항목은 정확히 5개를 기본으로 하되, 오답 개인화 세트는 `신규 3 + 복습 2` 구성을 허용한다.

### 6.3 learning_logs

```text
id
user_id
mode
expression_id
set_id
viewed_at
completed_at
saved
mastered
answer_result
selected_choice_id
response_ms
repeat_count
mastery_score
feedback_quality
device_type
```

이벤트 원본과 집계 테이블을 분리한다. `expression_metrics_daily`에 노출·완주·저장·정답·불만 비율을 일별 집계하면 500개 이상에서도 운영 판단이 쉽다.

### 6.4 추천 후보와 검수 분리

`expression_candidates`에는 외부 유사어 후보와 자동 점수를 저장하고, 승인된 것만 `expressions`로 승격한다. 이 분리가 있어야 외부 유사어 품질이 사용자 화면에 직접 영향을 주지 않는다.

---

## 7. 운영·콘텐츠 정책

- 원표현당 기본 추천은 **1개**, 상황이 분명히 다른 경우에만 대안 2개까지 허용한다.
- 카드 기본 노출은 target 1개, `다른 상황에서는`을 펼쳤을 때만 대안을 보여준다.
- short description은 모바일 기준 35자 안팎, 최대 2줄로 제한한다.
- 예문은 모드별 기본 1개다. 추가 예문은 펼침 영역에 최대 2개까지 둔다.
- 자동화: 후보 수집, 중복 제거, 품사·빈도·길이 검사, 설명/예문 초안, 세트 균형 검사.
- 필수 수동 검수: 최종 추천 관계, 치환 가능 범위, 예문 자연스러움, 수능 문항 정답 유일성.
- 추천 불가: 욕설·차별 가능 표현, 지나친 고어, 전문 분야 한정어, 품사 불일치, 설명 없이 오용 가능성이 큰 다의어.
- 최종 노출을 적게 유지하는 이유는 선택 피로를 줄이고 “무엇을 기억해야 하는지”를 분명하게 하기 위해서다.
- 콘텐츠 수정 시 version을 올리고, 기존 학습 로그의 expression ID는 유지한다.

---

## 8. 500개 이상 확장 가능한 카테고리

| 카테고리 | 목표 수 | 필요성 | 우선 모드 |
|---|---:|---|---|
| very + adjective | 60 | before/after가 가장 명확한 입문 | 일반 |
| 기본 형용사 업그레이드 | 60 | 평가를 더 정확하게 표현 | 공통 |
| 감정 표현 | 50 | 강도와 뉘앙스 학습 | 일반 |
| 상태 표현 | 50 | 일상·독해 모두 빈도가 높음 | 공통 |
| 평가 표현 | 50 | good/bad 중심 어휘 확장 | 공통 |
| 동사 업그레이드 | 70 | 목적어·결합어 판단 훈련 | 공통 |
| 문장형 업그레이드 | 60 | 실제 말하기·업무 활용 | 일반 |
| 비즈니스 표현 | 40 | KAI/Rachel 실용성 | 일반 |
| 독해형/수능형 어휘 | 70 | 학술 문맥과 논리 판단 | 수능 |
| 혼동 어휘 묶음 | 60 | HYUK 오답 교정 핵심 | 수능 |

총 570개이며, 5개 단위로 114세트를 구성할 수 있다.

---

## 9. 샘플 콘텐츠

### 9.1 일반모드 세트 1 — VERY 탈출

| Before | Upgrade | 핵심 차이 | 예문 |
|---|---|---|---|
| very tired | exhausted | 에너지가 거의 남지 않은 강한 피로 | I was exhausted after the overnight flight. |
| very hungry | starving | 매우 배고픈 구어적 강조 | I'm starving. Let's get something to eat. |
| very cold | freezing | 몸으로 느끼는 강한 추위 | It's freezing outside, so wear a coat. |
| very funny | hilarious | 크게 웃을 만큼 아주 재미있는 | The final scene was absolutely hilarious. |
| very angry | furious | 통제하기 어려울 만큼 강한 분노 | She was furious about the repeated mistake. |

### 9.2 일반모드 세트 2 — 더 정확한 형용사

| Before | Upgrade | 핵심 차이 | 예문 |
|---|---|---|---|
| very important | essential | 없으면 목적 달성이 어려운 필수성 | Clear communication is essential for teamwork. |
| very good | excellent | 품질이나 성과가 매우 뛰어남 | You did an excellent job on the presentation. |
| very careful | meticulous | 작은 세부사항까지 꼼꼼함 | He keeps meticulous records of every expense. |
| very difficult | challenging | 어렵지만 도전할 가치가 있다는 뉘앙스 | The assignment was challenging but rewarding. |
| very clear | explicit | 말이나 지시가 모호하지 않고 명시적임 | The manager gave explicit instructions. |

### 9.3 일반모드 세트 3 — 상황에 더 자연스럽게

| Basic | Upgrade | 사용 상황 | 예문 |
|---|---|---|---|
| I think… | From my perspective,… | 의견임을 부드럽게 밝힐 때 | From my perspective, we need more time. |
| I don't know. | I'm not sure. | 단정적인 무지를 부드럽게 표현 | I'm not sure, but I can check for you. |
| Wait. | Give me a moment. | 상대에게 정중히 시간을 요청 | Give me a moment to review the file. |
| Help me. | Could you give me a hand? | 일상에서 자연스럽게 도움 요청 | Could you give me a hand with these boxes? |
| Sorry I'm late. | I apologize for being late. | 공식적 상황의 사과 | I apologize for being late to the meeting. |

### 9.4 수능모드 세트 1 — 혼동어 핵심

| 묶음 | 차이 | 수능형 판단 예시 |
|---|---|---|
| affect / effect | affect는 주로 동사, effect는 주로 명사 | The policy may **affect** small businesses. |
| adapt / adopt | adapt는 맞게 변화, adopt는 선택·채택 | Schools must **adapt** to technological change. |
| imply / infer | imply는 암시하는 사람, infer는 추론하는 독자 | Readers may **infer** his concern from the tone. |
| sensible / sensitive | sensible은 합리적, sensitive는 민감 | It is **sensible** to verify the evidence first. |
| complement / compliment | complement는 보완, compliment는 칭찬 | The two approaches **complement** each other. |

### 9.5 수능모드 세트 2 — 문맥에 맞는 정밀 동사

| 쉬운 표현 | 정밀 표현 | 제한 조건 | 수능형 예문 |
|---|---|---|---|
| show | demonstrate | 근거나 결과로 분명히 보일 때 | The findings **demonstrate** the value of early intervention. |
| cause | trigger | 사건이 즉각적인 반응을 촉발할 때 | The announcement **triggered** widespread concern. |
| reduce | mitigate | 피해·위험·심각성을 완화할 때 | Green spaces can **mitigate** the effects of urban heat. |
| combine | integrate | 요소를 기능적인 전체로 통합할 때 | The program **integrates** theory with practical experience. |
| important | crucial | 결과에 결정적인 중요성을 가질 때 | Trust is **crucial** to effective cooperation. |

### 9.6 수능모드 세트 3 — 형태가 비슷한 고난도 어휘

| 묶음 | 구별 포인트 | 수능형 예문 |
|---|---|---|
| preserve / conserve | 원형 보존 / 자원 절약·보호 | Museums **preserve** artifacts for future generations. |
| arbitrary / random | 근거 없이 자의적 / 무작위 | The boundary was **arbitrary**, reflecting political convenience. |
| comprehensive / comprehensible | 포괄적 / 이해 가능한 | The report provides a **comprehensive** account of the event. |
| respective / respectful | 각각의 / 존중하는 | The participants returned to their **respective** groups. |
| precede / proceed | 앞서다 / 계속 진행하다 | A brief introduction will **precede** the main discussion. |

수능형 실제 문제에서는 보기의 품사와 길이를 맞추고, 정답만 문맥의 주체·목적어·논리 방향과 일치하도록 설계한다.

---

## 10. 최종 권고안

### 실행 순서

1. 공통 expression 스키마와 콘텐츠 상태 정의
2. 일반모드 MVP 30개(6세트) 수동 검수 제작
3. 모바일 카드·3문제 퀴즈·저장·복습 구현
4. 2~4주간 KAI/Rachel 사용 데이터 수집
5. 저품질 표현 제거 및 100개까지 확대
6. 일반모드 검증 표현 중 수능 적합 30개 재가공
7. HYUK 대상 수능 베타 6세트 운영
8. 오답 로그 기반 혼동 묶음과 난이도 개인화

### MVP 범위

- 일반모드만 노출
- 3개 카테고리, 30개 표현
- 하루 5개
- 카드, 객관식/문장 선택 퀴즈, 저장, 간격 복습
- 수동 검수 콘텐츠만 사용
- 기본 지표와 `추천이 어색해요` 피드백 수집

### 수능모드 베타 진입 조건

- 일반모드 누적 학습 세트 100회 이상
- 5개 완주율 70% 이상
- 콘텐츠 어색함 신고 5% 미만
- 7일 복습 데이터 확보
- 수능 전환 후보 30개에 대해 정답 유일성 검수 완료
- HYUK이 모바일에서 5개 세트를 5분 이내 완주 가능

### HYUK에게 중요한 요소

- 신규 3개와 최근 오답 2개의 짧은 세트
- 자동 이동 없는 명확한 정답/오답 흐름
- 비슷한 보기 사이의 차이를 한 줄 근거로 설명
- 같은 혼동어를 다른 문맥으로 반복
- 점수보다 “어떤 차이를 구별하게 됐는가”를 진도로 표시

### 가장 중요한 설계 원칙 5가지

1. 유사어 후보와 사용자에게 보여줄 추천을 반드시 분리한다.
2. 어려운 단어가 아니라 상황에 더 적절한 표현을 추천한다.
3. 일반모드에서 5개 학습 흐름과 콘텐츠 품질을 먼저 검증한다.
4. 일반·수능모드는 expression ID와 로그를 공유하되 예문과 문제 방식을 분리한다.
5. 수능모드에서는 그럴듯한 오답과 반복되는 혼동 교정을 최우선으로 한다.

## 왜 이 구조가 두 목표를 동시에 만족시키는가

일반모드는 짧고 쉬운 5개 카드로 추천의 실제 가치와 모바일 학습 습관을 낮은 위험으로 검증한다. 동시에 처음부터 공통 expression ID, 관계 라벨, 모드별 예문과 학습 로그를 사용하므로 검증된 콘텐츠를 버리지 않고 수능형 문맥·혼동어 문제로 강화할 수 있다. 즉, 일반모드는 별도 기능이 아니라 **HYUK에게 맞는 수능 학습 엔진의 품질을 먼저 증명하는 실험장**이 된다.
