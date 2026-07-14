// TOEIC Listening & Reading이 다루는 일상적인 업무 상황을 바탕으로 만든
// 자체 학습 문장입니다. 실제 ETS 기출문장을 복제하지 않습니다.
const departments = [
  ["sales team", "영업팀"], ["marketing department", "마케팅 부서"],
  ["human resources team", "인사팀"], ["accounting department", "회계 부서"],
  ["customer service team", "고객 서비스팀"], ["purchasing department", "구매 부서"],
  ["operations team", "운영팀"], ["research division", "연구 부서"],
  ["administrative staff", "행정 직원들"], ["project committee", "프로젝트 위원회"],
];

const documents = [
  ["quarterly report", "분기 보고서"], ["updated schedule", "수정된 일정표"],
  ["customer survey", "고객 설문조사"], ["budget proposal", "예산 제안서"],
  ["training materials", "교육 자료"],
];

const deadlines = [
  ["by Friday", "금요일까지"], ["before noon", "정오 전에"],
  ["by the end of the day", "오늘 업무 종료 전까지"], ["no later than next Monday", "늦어도 다음 월요일까지"],
  ["before the monthly meeting", "월례 회의 전에"],
];

const locations = [
  ["main conference room", "대회의실"], ["online employee portal", "사내 온라인 포털"],
  ["training center", "교육 센터"], ["reception desk", "안내 데스크"],
  ["regional office", "지역 사무소"],
];

const contacts = [
  ["department manager", "부서 관리자"], ["project coordinator", "프로젝트 담당자"],
  ["client representative", "고객사 담당자"], ["office administrator", "사무 관리자"],
  ["technical supervisor", "기술 책임자"],
];

const finalConsonantCode = text => {
  const code = text.charCodeAt(text.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 ? code % 28 : 0;
};
const topic = text => `${text}${finalConsonantCode(text) ? "은" : "는"}`;
const subject = text => `${text}${finalConsonantCode(text) ? "이" : "가"}`;
const direction = text => {
  const finalCode = finalConsonantCode(text);
  return `${text}${!finalCode || finalCode === 8 ? "로" : "으로"}`;
};

const scenarios = departments.flatMap(([department, departmentKo], departmentIndex) =>
  documents.map(([document, documentKo], documentIndex) => {
    const index = departmentIndex * documents.length + documentIndex;
    const [deadline, deadlineKo] = deadlines[index % deadlines.length];
    const [location, locationKo] = locations[(departmentIndex + documentIndex) % locations.length];
    const [contact, contactKo] = contacts[(departmentIndex * 2 + documentIndex) % contacts.length];
    return { department, departmentKo, document, documentKo, deadline, deadlineKo, location, locationKo, contact, contactKo };
  })
);

const templates = [
  {
    category: "일정·제출", pattern: "will + 동사원형", meaning: "앞으로 할 업무나 결정을 나타냄",
    build: s => [`The ${s.department} will submit the ${s.document} ${s.deadline}.`, `${topic(s.departmentKo)} ${s.documentKo}를 ${s.deadlineKo} 제출할 예정입니다.`],
  },
  {
    category: "요청·안내", pattern: "Please + 동사원형", meaning: "정중하게 업무를 요청함",
    build: s => [`Please ask the ${s.department} to review the ${s.document} before contacting the ${s.contact}.`, `${s.contactKo}에게 연락하기 전에 ${s.departmentKo}에 ${s.documentKo} 검토를 요청해 주세요.`],
  },
  {
    category: "완료·경험", pattern: "have/has + 과거분사", meaning: "현재와 관련된 완료 상태를 나타냄",
    build: s => [`The ${s.department} has completed the ${s.document} ahead of schedule.`, `${topic(s.departmentKo)} ${s.documentKo}를 예정보다 일찍 완료했습니다.`],
  },
  {
    category: "수동태", pattern: "be + 과거분사", meaning: "업무의 대상이나 처리 결과를 강조함",
    build: s => [`The ${s.document} prepared by the ${s.department} will be discussed in the ${s.location}.`, `${subject(s.departmentKo)} 작성한 ${topic(s.documentKo)} ${s.locationKo}에서 논의될 예정입니다.`],
  },
  {
    category: "조건", pattern: "If + 현재시제, will + 동사", meaning: "가능한 조건과 그 결과를 나타냄",
    build: s => [`If the ${s.document} is approved, the ${s.department} will begin the next phase.`, `${subject(s.documentKo)} 승인되면 ${topic(s.departmentKo)} 다음 단계를 시작할 것입니다.`],
  },
  {
    category: "관계대명사", pattern: "명사 + that + 동사", meaning: "앞의 명사를 뒤에서 구체적으로 설명함",
    build: s => [`The ${s.document} that the ${s.department} prepared contains several recommendations.`, `${subject(s.departmentKo)} 작성한 ${s.documentKo}에는 몇 가지 권고 사항이 포함되어 있습니다.`],
  },
  {
    category: "원인", pattern: "because of + 명사", meaning: "업무 일정이나 결과의 원인을 설명함",
    build: s => [`The ${s.department}'s review of the ${s.document} was delayed because of a system update.`, `시스템 업데이트 때문에 ${s.departmentKo}의 ${s.documentKo} 검토가 지연되었습니다.`],
  },
  {
    category: "시간", pattern: "as soon as + 주어 + 동사", meaning: "어떤 일이 끝난 직후의 행동을 나타냄",
    build: s => [`The ${s.contact} will call the ${s.department} as soon as the ${s.document} is ready.`, `${subject(s.documentKo)} 준비되는 즉시 ${subject(s.contactKo)} ${s.departmentKo}에 전화할 것입니다.`],
  },
  {
    category: "예정", pattern: "be scheduled to + 동사", meaning: "공식적으로 예정된 일정을 나타냄",
    build: s => [`The ${s.department} is scheduled to present the ${s.document} in the ${s.location}.`, `${topic(s.departmentKo)} ${s.locationKo}에서 ${s.documentKo}를 발표할 예정입니다.`],
  },
  {
    category: "목적", pattern: "in order to + 동사원형", meaning: "행동의 목적을 설명함",
    build: s => [`The ${s.department} revised the ${s.document} in order to improve its accuracy.`, `${topic(s.departmentKo)} 정확성을 높이기 위해 ${s.documentKo}를 수정했습니다.`],
  },
  {
    category: "병렬", pattern: "not only A but also B", meaning: "두 가지 장점이나 사실을 함께 강조함",
    build: s => [`The ${s.document} is not only detailed but also easy for the ${s.department} to use.`, `${topic(s.documentKo)} 상세할 뿐만 아니라 ${subject(s.departmentKo)} 사용하기도 쉽습니다.`],
  },
  {
    category: "비교", pattern: "비교급 + than", meaning: "두 대상의 정도를 비교함",
    build: s => [`The revised ${s.document} is clearer than the version previously used by the ${s.department}.`, `수정된 ${topic(s.documentKo)} ${subject(s.departmentKo)} 이전에 사용하던 버전보다 더 명확합니다.`],
  },
  {
    category: "조건", pattern: "unless + 주어 + 동사", meaning: "~하지 않는 한이라는 예외 조건을 나타냄",
    build: s => [`The ${s.department} cannot release the ${s.document} unless the ${s.contact} approves it.`, `${subject(s.contactKo)} 승인하지 않는 한 ${topic(s.departmentKo)} ${s.documentKo}를 공개할 수 없습니다.`],
  },
  {
    category: "동시 동작", pattern: "while + 주어 + 동사", meaning: "두 업무가 동시에 진행됨을 나타냄",
    build: s => [`The ${s.department} checked the ${s.document} while waiting in the ${s.location}.`, `${topic(s.departmentKo)} ${s.locationKo}에서 기다리는 동안 ${s.documentKo}를 확인했습니다.`],
  },
  {
    category: "근거", pattern: "According to + 명사", meaning: "정보의 출처나 근거를 제시함",
    build: s => [`According to the ${s.document}, the ${s.department} met its monthly target.`, `${s.documentKo}에 따르면 ${topic(s.departmentKo)} 월간 목표를 달성했습니다.`],
  },
  {
    category: "결과", pattern: "therefore", meaning: "앞선 내용의 결과를 연결함",
    build: s => [`The ${s.document} contained an error; therefore, the ${s.department} issued a correction.`, `${s.documentKo}에 오류가 있었으므로 ${topic(s.departmentKo)} 수정본을 발행했습니다.`],
  },
  {
    category: "담당 업무", pattern: "be responsible for + 명사/동명사", meaning: "담당하는 업무를 나타냄",
    build: s => [`The ${s.department} is responsible for updating the ${s.document}.`, `${topic(s.departmentKo)} ${s.documentKo}를 업데이트할 책임이 있습니다.`],
  },
  {
    category: "기한", pattern: "no later than + 시점", meaning: "늦어도 특정 시점까지라는 마감 기한을 나타냄",
    build: s => [`Members of the ${s.department} should send comments on the ${s.document} no later than Friday.`, `${s.departmentKo} 구성원들은 늦어도 금요일까지 ${s.documentKo}에 대한 의견을 보내야 합니다.`],
  },
  {
    category: "사유", pattern: "due to + 명사", meaning: "공식적인 문맥에서 이유를 설명함",
    build: s => [`The ${s.department}'s presentation of the ${s.document} was moved to the ${s.location} due to high attendance.`, `참석자가 많아 ${s.departmentKo}의 ${s.documentKo} 발표 장소가 ${direction(s.locationKo)} 변경되었습니다.`],
  },
  {
    category: "제안", pattern: "recommend that + 주어 + 동사원형", meaning: "특정 주체가 행동하도록 권하거나 제안함",
    build: s => [`The ${s.contact} recommends that the ${s.department} review the ${s.document} before the meeting.`, `${topic(s.contactKo)} ${subject(s.departmentKo)} 회의 전에 ${s.documentKo}를 검토할 것을 권합니다.`],
  },
];

const SOURCE_URL = "https://www.eu.ets.org/toeic/test-takers/about/listening-reading.html";

export const toeicSentences = templates.flatMap((template, templateIndex) =>
  scenarios.map((scenario, scenarioIndex) => {
    const [en, ko] = template.build(scenario);
    const nextScenario = scenarios[(scenarioIndex + 1) % scenarios.length];
    const [applicationEn, applicationKo] = template.build(nextScenario);
    return {
      id: `toeic-sentence-${String(templateIndex * scenarios.length + scenarioIndex + 1).padStart(4, "0")}`,
      rank: templateIndex * scenarios.length + scenarioIndex + 1,
      en,
      ko,
      pattern: template.pattern,
      meaning: template.meaning,
      category: template.category,
      applications: [[applicationEn, applicationKo]],
      source: "ETS TOEIC workplace communication framework 기반 자체 제작",
      sourceUrl: SOURCE_URL,
    };
  })
);
