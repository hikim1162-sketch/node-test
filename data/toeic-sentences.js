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

const coreTemplates = [
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

const expansionTemplates = [
  { category:"현재시제",pattern:"현재시제",meaning:"반복되는 업무나 일반적 사실을 나타냄",build:s=>[`The ${s.department} reviews the ${s.document} every month.`,`${s.departmentKo}은 매달 ${s.documentKo}를 검토합니다.`]},
  { category:"과거시제",pattern:"동사 과거형",meaning:"과거에 끝난 업무를 나타냄",build:s=>[`The ${s.department} submitted the ${s.document} yesterday.`,`${s.departmentKo}은 어제 ${s.documentKo}를 제출했습니다.`]},
  { category:"현재진행",pattern:"be + 동사-ing",meaning:"현재 진행 중인 일을 나타냄",build:s=>[`The ${s.department} is reviewing the ${s.document} now.`,`${s.departmentKo}은 지금 ${s.documentKo}를 검토하고 있습니다.`]},
  { category:"과거진행",pattern:"was/were + 동사-ing",meaning:"과거 특정 시점에 진행 중이던 일을 나타냄",build:s=>[`The ${s.department} was reviewing the ${s.document} at noon.`,`${s.departmentKo}은 정오에 ${s.documentKo}를 검토하고 있었습니다.`]},
  { category:"미래진행",pattern:"will be + 동사-ing",meaning:"미래 특정 시점에 진행 중일 일을 나타냄",build:s=>[`The ${s.department} will be reviewing the ${s.document} tomorrow.`,`${s.departmentKo}은 내일 ${s.documentKo}를 검토하고 있을 것입니다.`]},
  { category:"과거완료",pattern:"had + 과거분사",meaning:"과거의 다른 일보다 먼저 완료된 일을 나타냄",build:s=>[`The ${s.department} had completed the ${s.document} before the meeting.`,`${s.departmentKo}은 회의 전에 ${s.documentKo}를 완료했었습니다.`]},
  { category:"미래완료",pattern:"will have + 과거분사",meaning:"미래 시점까지 완료될 일을 나타냄",build:s=>[`The ${s.department} will have completed the ${s.document} by Friday.`,`${s.departmentKo}은 금요일까지 ${s.documentKo}를 완료할 것입니다.`]},
  { category:"현재완료진행",pattern:"have/has been + 동사-ing",meaning:"과거부터 현재까지 이어지는 행동을 나타냄",build:s=>[`The ${s.department} has been reviewing the ${s.document} since Monday.`,`${s.departmentKo}은 월요일부터 ${s.documentKo}를 검토해 오고 있습니다.`]},
  { category:"능력",pattern:"can + 동사원형",meaning:"능력이나 가능성을 나타냄",build:s=>[`The ${s.department} can revise the ${s.document} today.`,`${s.departmentKo}은 오늘 ${s.documentKo}를 수정할 수 있습니다.`]},
  { category:"과거능력",pattern:"could + 동사원형",meaning:"과거의 능력이나 정중한 가능성을 나타냄",build:s=>[`The ${s.department} could finish the ${s.document} early.`,`${s.departmentKo}은 ${s.documentKo}를 일찍 끝낼 수 있었습니다.`]},
  { category:"가능성",pattern:"may + 동사원형",meaning:"가능성이나 허가를 나타냄",build:s=>[`The ${s.department} may update the ${s.document} later.`,`${s.departmentKo}은 나중에 ${s.documentKo}를 수정할 수도 있습니다.`]},
  { category:"약한 가능성",pattern:"might + 동사원형",meaning:"불확실한 가능성을 나타냄",build:s=>[`The ${s.document} might require another review.`,`${s.documentKo}는 추가 검토가 필요할 수도 있습니다.`]},
  { category:"의무",pattern:"must + 동사원형",meaning:"강한 의무나 확신을 나타냄",build:s=>[`The ${s.department} must submit the ${s.document} today.`,`${s.departmentKo}은 오늘 ${s.documentKo}를 제출해야 합니다.`]},
  { category:"조언",pattern:"should + 동사원형",meaning:"조언이나 약한 의무를 나타냄",build:s=>[`The ${s.department} should check the ${s.document} again.`,`${s.departmentKo}은 ${s.documentKo}를 다시 확인해야 합니다.`]},
  { category:"필요",pattern:"have to + 동사원형",meaning:"외부 상황에 따른 필요나 의무를 나타냄",build:s=>[`The ${s.department} has to revise the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 수정해야 합니다.`]},
  { category:"불필요",pattern:"do not have to + 동사원형",meaning:"할 필요가 없음을 나타냄",build:s=>[`The ${s.department} does not have to print the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 인쇄할 필요가 없습니다.`]},
  { category:"금지",pattern:"must not + 동사원형",meaning:"강한 금지를 나타냄",build:s=>[`The ${s.department} must not release the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 공개해서는 안 됩니다.`]},
  { category:"정중한 요청",pattern:"Would you + 동사원형?",meaning:"상대에게 정중하게 행동을 요청함",build:s=>[`Would you review the ${s.document}?`,`${s.documentKo}를 검토해 주시겠습니까?`]},
  { category:"정중한 요청",pattern:"Could you + 동사원형?",meaning:"가능 여부를 정중하게 요청함",build:s=>[`Could you send the ${s.document} to the ${s.department}?`,`${s.departmentKo}에 ${s.documentKo}를 보내 주시겠습니까?`]},
  { category:"선호",pattern:"would rather + 동사원형",meaning:"두 선택지 중 선호를 나타냄",build:s=>[`The ${s.department} would rather discuss the ${s.document} tomorrow.`,`${s.departmentKo}은 ${s.documentKo}를 내일 논의하는 편을 선호합니다.`]},
  { category:"과거 추측",pattern:"could have + 과거분사",meaning:"과거에 가능했지만 실현되지 않았거나 불확실한 일을 나타냄",build:s=>[`The error could have delayed the ${s.document}.`,`그 오류가 ${s.documentKo}를 지연시켰을 수도 있습니다.`]},
  { category:"과거 추측",pattern:"may/might have + 과거분사",meaning:"과거 사실에 대한 불확실한 추측을 나타냄",build:s=>[`The ${s.department} may have overlooked the error.`,`${s.departmentKo}이 오류를 놓쳤을 수도 있습니다.`]},
  { category:"과거 후회",pattern:"should have + 과거분사",meaning:"과거에 했어야 했던 일을 나타냄",build:s=>[`The ${s.department} should have checked the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 확인했어야 합니다.`]},
  { category:"to부정사",pattern:"want to + 동사원형",meaning:"원하는 행동을 나타냄",build:s=>[`The ${s.department} wants to revise the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 수정하고 싶어 합니다.`]},
  { category:"to부정사",pattern:"plan to + 동사원형",meaning:"계획한 행동을 나타냄",build:s=>[`The ${s.department} plans to present the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 발표할 계획입니다.`]},
  { category:"to부정사",pattern:"decide to + 동사원형",meaning:"결정한 행동을 나타냄",build:s=>[`The ${s.department} decided to update the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 수정하기로 결정했습니다.`]},
  { category:"to부정사",pattern:"need to + 동사원형",meaning:"필요한 행동을 나타냄",build:s=>[`The ${s.department} needs to approve the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 승인해야 합니다.`]},
  { category:"목적격보어",pattern:"ask + 목적어 + to부정사",meaning:"누군가에게 행동을 요청함",build:s=>[`The ${s.contact} asked the ${s.department} to revise the ${s.document}.`,`${s.contactKo}은 ${s.departmentKo}에 ${s.documentKo} 수정을 요청했습니다.`]},
  { category:"목적격보어",pattern:"allow + 목적어 + to부정사",meaning:"누군가가 행동하도록 허용함",build:s=>[`The policy allows the ${s.department} to update the ${s.document}.`,`그 정책은 ${s.departmentKo}이 ${s.documentKo}를 수정하도록 허용합니다.`]},
  { category:"동명사",pattern:"enjoy + 동사-ing",meaning:"즐기는 행동을 동명사로 나타냄",build:s=>[`The ${s.department} enjoys working in the ${s.location}.`,`${s.departmentKo}은 ${s.locationKo}에서 근무하는 것을 즐깁니다.`]},
  { category:"동명사",pattern:"finish + 동사-ing",meaning:"완료한 행동을 동명사로 나타냄",build:s=>[`The ${s.department} finished reviewing the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo} 검토를 마쳤습니다.`]},
  { category:"동명사",pattern:"avoid + 동사-ing",meaning:"피해야 하는 행동을 나타냄",build:s=>[`The ${s.department} avoided delaying the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}를 지연시키는 일을 피했습니다.`]},
  { category:"동명사",pattern:"look forward to + 동사-ing",meaning:"앞으로의 일을 기대함",build:s=>[`The ${s.department} looks forward to presenting the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo} 발표를 기대합니다.`]},
  { category:"분사",pattern:"현재분사 + 명사",meaning:"능동적·진행 중인 특성을 나타냄",build:s=>[`The reviewing team found an error in the ${s.document}.`,`검토 중인 팀이 ${s.documentKo}에서 오류를 발견했습니다.`]},
  { category:"분사",pattern:"과거분사 + 명사",meaning:"수동적·완료된 상태를 나타냄",build:s=>[`The revised ${s.document} is ready for approval.`,`수정된 ${s.documentKo}는 승인 준비가 되었습니다.`]},
  { category:"분사구문",pattern:"동사-ing, 주어 + 동사",meaning:"동시 행동이나 이유를 간결하게 연결함",build:s=>[`Reviewing the ${s.document}, the ${s.department} found an error.`,`${s.documentKo}를 검토하면서 ${s.departmentKo}은 오류를 발견했습니다.`]},
  { category:"명사절",pattern:"that + 완전한 문장",meaning:"문장 전체를 명사처럼 사용함",build:s=>[`The ${s.contact} confirmed that the ${s.document} was ready.`,`${s.contactKo}은 ${s.documentKo}가 준비되었다고 확인했습니다.`]},
  { category:"명사절",pattern:"whether/if + 주어 + 동사",meaning:"~인지 아닌지를 나타내는 명사절",build:s=>[`The ${s.department} checked whether the ${s.document} was complete.`,`${s.departmentKo}은 ${s.documentKo}가 완성되었는지 확인했습니다.`]},
  { category:"명사절",pattern:"의문사 + 주어 + 동사",meaning:"간접의문문을 명사절로 사용함",build:s=>[`The ${s.department} knows when the ${s.document} is due.`,`${s.departmentKo}은 ${s.documentKo}의 마감일이 언제인지 압니다.`]},
  { category:"관계대명사",pattern:"명사 + who + 동사",meaning:"사람을 뒤에서 설명함",build:s=>[`The manager who approved the ${s.document} contacted the ${s.department}.`,`${s.documentKo}를 승인한 관리자가 ${s.departmentKo}에 연락했습니다.`]},
  { category:"관계대명사",pattern:"명사 + which + 동사",meaning:"사물이나 내용을 뒤에서 설명함",build:s=>[`The ${s.document}, which contains new data, is ready.`,`새 자료가 담긴 ${s.documentKo}가 준비되었습니다.`]},
  { category:"관계대명사",pattern:"명사 + whose + 명사",meaning:"소유 관계를 나타내며 앞 명사를 설명함",build:s=>[`The employee whose report was approved joined the ${s.department}.`,`보고서가 승인된 직원이 ${s.departmentKo}에 합류했습니다.`]},
  { category:"관계부사",pattern:"장소 + where + 주어 + 동사",meaning:"장소를 뒤에서 설명함",build:s=>[`The ${s.location} is where the ${s.department} holds meetings.`,`${s.locationKo}는 ${s.departmentKo}이 회의를 여는 곳입니다.`]},
  { category:"관계부사",pattern:"시간 + when + 주어 + 동사",meaning:"시간을 뒤에서 설명함",build:s=>[`Friday is when the ${s.department} submits the ${s.document}.`,`금요일은 ${s.departmentKo}이 ${s.documentKo}를 제출하는 날입니다.`]},
  { category:"시간",pattern:"before + 주어 + 동사",meaning:"한 행동보다 앞선 시점을 나타냄",build:s=>[`Check the ${s.document} before the ${s.department} submits it.`,`${s.departmentKo}이 제출하기 전에 ${s.documentKo}를 확인하세요.`]},
  { category:"시간",pattern:"after + 주어 + 동사",meaning:"한 행동 이후의 시점을 나타냄",build:s=>[`The ${s.department} met after the ${s.document} was approved.`,`${s.documentKo}가 승인된 후 ${s.departmentKo}이 회의했습니다.`]},
  { category:"시간",pattern:"until + 주어 + 동사",meaning:"어떤 시점까지 상태가 지속됨을 나타냄",build:s=>[`The ${s.department} waited until the ${s.document} was ready.`,`${s.departmentKo}은 ${s.documentKo}가 준비될 때까지 기다렸습니다.`]},
  { category:"시간",pattern:"by the time + 주어 + 동사",meaning:"특정 사건이 일어날 때까지의 완료를 나타냄",build:s=>[`The meeting had ended by the time the ${s.contact} arrived.`,`${s.contactKo}이 도착했을 때에는 회의가 이미 끝났습니다.`]},
  { category:"양보",pattern:"although + 주어 + 동사",meaning:"서로 대비되는 사실을 연결함",build:s=>[`Although the ${s.document} was long, the ${s.department} reviewed it.`,`${s.documentKo}가 길었지만 ${s.departmentKo}은 이를 검토했습니다.`]},
  { category:"양보",pattern:"even though + 주어 + 동사",meaning:"예상과 반대되는 강한 양보를 나타냄",build:s=>[`Even though the deadline was tight, the ${s.department} finished the ${s.document}.`,`기한이 촉박했지만 ${s.departmentKo}은 ${s.documentKo}를 끝냈습니다.`]},
  { category:"대조",pattern:"whereas + 주어 + 동사",meaning:"두 사실의 차이를 대조함",build:s=>[`The ${s.department} prefers email, whereas the ${s.contact} prefers calls.`,`${s.departmentKo}은 이메일을 선호하는 반면 ${s.contactKo}은 전화를 선호합니다.`]},
  { category:"목적",pattern:"so that + 주어 + can",meaning:"행동의 목적과 가능한 결과를 나타냄",build:s=>[`The ${s.department} simplified the ${s.document} so that clients can understand it.`,`${s.departmentKo}은 고객이 이해할 수 있도록 ${s.documentKo}를 단순화했습니다.`]},
  { category:"결과",pattern:"so + 형용사 + that",meaning:"정도가 커서 생긴 결과를 나타냄",build:s=>[`The ${s.document} was so clear that everyone approved it.`,`${s.documentKo}가 매우 명확해서 모두가 승인했습니다.`]},
  { category:"결과",pattern:"such + 명사 + that",meaning:"특정 성질의 명사로 인한 결과를 나타냄",build:s=>[`It was such a clear ${s.document} that everyone approved it.`,`매우 명확한 ${s.documentKo}여서 모두가 승인했습니다.`]},
  { category:"조건",pattern:"provided that + 주어 + 동사",meaning:"필수 조건을 전제로 결과를 나타냄",build:s=>[`The ${s.department} can proceed provided that the ${s.document} is approved.`,`${s.documentKo}가 승인된다는 조건으로 ${s.departmentKo}은 진행할 수 있습니다.`]},
  { category:"가정법",pattern:"If + 과거, would + 동사원형",meaning:"현재 사실과 다른 가정을 나타냄",build:s=>[`If the ${s.department} had more time, it would revise the ${s.document}.`,`${s.departmentKo}에 시간이 더 있다면 ${s.documentKo}를 수정할 것입니다.`]},
  { category:"가정법",pattern:"If + had p.p., would have p.p.",meaning:"과거 사실과 다른 가정과 결과를 나타냄",build:s=>[`If the ${s.department} had checked the ${s.document}, it would have found the error.`,`${s.departmentKo}이 ${s.documentKo}를 확인했더라면 오류를 발견했을 것입니다.`]},
  { category:"가정법",pattern:"I wish + 과거시제",meaning:"현재 이루어지지 않은 소망을 나타냄",build:s=>[`The manager wishes the ${s.department} had more time.`,`관리자는 ${s.departmentKo}에 시간이 더 있기를 바랍니다.`]},
  { category:"비교",pattern:"as + 형용사 + as",meaning:"두 대상의 정도가 같음을 나타냄",build:s=>[`The new ${s.document} is as clear as the old one.`,`새 ${s.documentKo}는 이전 것만큼 명확합니다.`]},
  { category:"최상급",pattern:"the + 최상급",meaning:"셋 이상 중 가장 높은 정도를 나타냄",build:s=>[`This is the clearest ${s.document} from the ${s.department}.`,`이것은 ${s.departmentKo}의 가장 명확한 ${s.documentKo}입니다.`]},
  { category:"비례비교",pattern:"the 비교급, the 비교급",meaning:"한 변화에 비례하는 다른 변화를 나타냄",build:s=>[`The earlier the ${s.department} reviews it, the sooner the ${s.document} can be released.`,`${s.departmentKo}이 일찍 검토할수록 ${s.documentKo}를 더 빨리 공개할 수 있습니다.`]},
  { category:"수량",pattern:"too + 형용사 + to부정사",meaning:"너무 ~해서 행동할 수 없음을 나타냄",build:s=>[`The ${s.document} is too long to review today.`,`${s.documentKo}는 너무 길어서 오늘 검토할 수 없습니다.`]},
  { category:"수량",pattern:"형용사 + enough to부정사",meaning:"행동하기에 충분한 정도를 나타냄",build:s=>[`The ${s.document} is clear enough to publish.`,`${s.documentKo}는 공개하기에 충분히 명확합니다.`]},
  { category:"수동태",pattern:"조동사 + be + 과거분사",meaning:"조동사와 함께 처리 가능성·의무를 수동으로 나타냄",build:s=>[`The ${s.document} must be approved by the ${s.department}.`,`${s.documentKo}는 ${s.departmentKo}의 승인을 받아야 합니다.`]},
  { category:"사역",pattern:"have + 목적어 + 과거분사",meaning:"다른 사람에게 어떤 처리를 맡김",build:s=>[`The ${s.department} had the ${s.document} translated.`,`${s.departmentKo}은 ${s.documentKo}를 번역하게 했습니다.`]},
  { category:"사역",pattern:"make + 목적어 + 동사원형",meaning:"누군가에게 행동하게 함",build:s=>[`The error made the ${s.department} revise the ${s.document}.`,`그 오류로 ${s.departmentKo}이 ${s.documentKo}를 수정하게 되었습니다.`]},
  { category:"지각",pattern:"see/hear + 목적어 + 동사원형",meaning:"행동의 전체 과정을 지각함",build:s=>[`The ${s.contact} saw the ${s.department} present the ${s.document}.`,`${s.contactKo}은 ${s.departmentKo}이 ${s.documentKo}를 발표하는 것을 보았습니다.`]},
  { category:"간접화법",pattern:"say that + 문장",meaning:"다른 사람의 말을 간접적으로 전달함",build:s=>[`The ${s.contact} said that the ${s.document} was ready.`,`${s.contactKo}은 ${s.documentKo}가 준비되었다고 말했습니다.`]},
  { category:"간접화법",pattern:"tell + 목적어 + that절",meaning:"특정 대상에게 전달한 내용을 나타냄",build:s=>[`The ${s.contact} told the ${s.department} that the ${s.document} was ready.`,`${s.contactKo}은 ${s.departmentKo}에 ${s.documentKo}가 준비되었다고 알렸습니다.`]},
  { category:"의문문",pattern:"Do/Does + 주어 + 동사원형?",meaning:"현재의 사실이나 습관을 질문함",build:s=>[`Does the ${s.department} review the ${s.document}?`,`${s.departmentKo}이 ${s.documentKo}를 검토합니까?`]},
  { category:"의문문",pattern:"Have/Has + 주어 + 과거분사?",meaning:"완료 여부나 경험을 질문함",build:s=>[`Has the ${s.department} approved the ${s.document}?`,`${s.departmentKo}이 ${s.documentKo}를 승인했습니까?`]},
  { category:"부가의문문",pattern:"문장, 조동사 + not + 대명사?",meaning:"진술한 내용을 상대에게 확인함",build:s=>[`The ${s.document} is ready, isn't it?`,`${s.documentKo}가 준비되었지요?`]},
  { category:"강조",pattern:"It is/was A that B",meaning:"문장의 특정 성분을 강조함",build:s=>[`It was the ${s.department} that revised the ${s.document}.`,`${s.documentKo}를 수정한 것은 바로 ${s.departmentKo}이었습니다.`]},
  { category:"도치",pattern:"Never + 조동사 + 주어 + 동사",meaning:"부정어를 앞에 두어 강하게 강조함",build:s=>[`Never has the ${s.department} missed a deadline.`,`${s.departmentKo}은 한 번도 마감일을 놓친 적이 없습니다.`]},
  { category:"도치",pattern:"Not until + 시점 + 조동사 + 주어",meaning:"특정 시점이 되어서야 일어난 일을 강조함",build:s=>[`Not until Friday did the ${s.department} finish the ${s.document}.`,`${s.departmentKo}은 금요일이 되어서야 ${s.documentKo}를 끝냈습니다.`]},
  { category:"연결",pattern:"either A or B",meaning:"둘 중 하나의 선택을 나타냄",build:s=>[`Either the ${s.department} or the ${s.contact} will approve the ${s.document}.`,`${s.departmentKo} 또는 ${s.contactKo}이 ${s.documentKo}를 승인할 것입니다.`]},
  { category:"연결",pattern:"neither A nor B",meaning:"두 대상 모두 해당하지 않음을 나타냄",build:s=>[`Neither the ${s.department} nor the ${s.contact} approved the ${s.document}.`,`${s.departmentKo}과 ${s.contactKo} 모두 ${s.documentKo}를 승인하지 않았습니다.`]},
  { category:"연결",pattern:"both A and B",meaning:"두 대상을 함께 묶어 나타냄",build:s=>[`Both the ${s.department} and the ${s.contact} reviewed the ${s.document}.`,`${s.departmentKo}과 ${s.contactKo} 모두 ${s.documentKo}를 검토했습니다.`]},
  { category:"전치사",pattern:"despite/in spite of + 명사",meaning:"명사와 반대되는 결과를 나타냄",build:s=>[`Despite the delay, the ${s.department} completed the ${s.document}.`,`지연에도 불구하고 ${s.departmentKo}은 ${s.documentKo}를 완료했습니다.`]},
  { category:"전치사",pattern:"instead of + 명사/동명사",meaning:"대체되는 선택이나 행동을 나타냄",build:s=>[`The ${s.department} emailed the ${s.document} instead of printing it.`,`${s.departmentKo}은 ${s.documentKo}를 인쇄하는 대신 이메일로 보냈습니다.`]},
  { category:"부사절 시작",pattern:"Although + 절, 주절",meaning:"양보 부사절을 먼저 제시한 뒤 예상과 다른 주절을 연결함",build:s=>[`Although the ${s.document} had already been revised twice, the ${s.department} requested further changes before approving it.`,`${s.documentKo}가 이미 두 차례 수정되었지만, ${s.departmentKo}은 이를 승인하기 전에 추가 변경을 요청했습니다.`]},
  { category:"부사절 시작",pattern:"Because + 절, 주절",meaning:"문두의 원인절과 뒤따르는 핵심 결과를 구분함",build:s=>[`Because the data on which the ${s.document} was based had not been independently verified, the ${s.department} postponed its release.`,`${s.documentKo}의 근거가 된 자료가 독립적으로 검증되지 않았기 때문에, ${s.departmentKo}은 공개를 연기했습니다.`]},
  { category:"부사절 시작",pattern:"While + 절, 주절",meaning:"양보 또는 대조의 배경을 먼저 제시하고 주절의 판단을 나타냄",build:s=>[`While the proposed schedule appears reasonable, it may prove difficult to maintain once the ${s.department} begins the next phase.`,`제안된 일정은 합리적으로 보이지만, ${s.departmentKo}이 다음 단계를 시작하면 이를 유지하기 어려울 수 있습니다.`]},
  { category:"부사절 시작",pattern:"Since + 절, 주절",meaning:"이유를 나타내는 since절 뒤에 핵심 판단을 제시함",build:s=>[`Since the assumptions underlying the ${s.document} have changed, the ${s.department} should reconsider its original recommendation.`,`${s.documentKo}의 기초가 된 가정이 바뀌었으므로, ${s.departmentKo}은 기존 권고를 재검토해야 합니다.`]},
  { category:"동명사절 주어",pattern:"동사-ing + 목적어 + 단수동사",meaning:"문두의 동명사구 전체가 문장의 주어 역할을 함",build:s=>[`Evaluating whether the ${s.document} meets the revised standards requires more time than the ${s.department} originally anticipated.`,`${s.documentKo}가 개정 기준을 충족하는지 평가하는 데에는 ${s.departmentKo}이 처음 예상한 것보다 더 많은 시간이 필요합니다.`]},
  { category:"동명사절 주어",pattern:"Whether절을 포함한 동명사구 + 동사",meaning:"동명사구 안의 명사절까지 포함한 긴 주어를 식별함",build:s=>[`Determining whether the ${s.contact} has sufficient authority to approve the ${s.document} remains the ${s.department}'s main concern.`,`${s.contactKo}에게 ${s.documentKo}를 승인할 충분한 권한이 있는지 판단하는 것이 여전히 ${s.departmentKo}의 주요 관심사입니다.`]},
  { category:"현재분사절",pattern:"동사-ing ~, 주어 + 동사",meaning:"주절과 동시에 일어나는 능동적 상황을 분사절로 압축함",build:s=>[`Recognizing that the original estimate was no longer realistic, the ${s.department} proposed a more flexible deadline for the ${s.document}.`,`기존 예상이 더는 현실적이지 않다는 점을 인식하여, ${s.departmentKo}은 ${s.documentKo}에 더 유연한 기한을 제안했습니다.`]},
  { category:"완료분사절",pattern:"Having + 과거분사 ~, 주어 + 동사",meaning:"주절보다 먼저 완료된 행동을 완료분사절로 나타냄",build:s=>[`Having reviewed all the evidence submitted with the ${s.document}, the ${s.department} concluded that further investigation was necessary.`,`${s.documentKo}와 함께 제출된 모든 증거를 검토한 후, ${s.departmentKo}은 추가 조사가 필요하다고 결론 내렸습니다.`]},
  { category:"수동 분사절",pattern:"과거분사 ~, 주어 + 동사",meaning:"수동적 배경이나 조건을 과거분사로 시작해 압축함",build:s=>[`Designed to address concerns raised by the ${s.contact}, the revised ${s.document} provides a more detailed explanation of the proposed changes.`,`${s.contactKo}이 제기한 우려를 해소하도록 작성된 수정 ${s.documentKo}는 제안된 변경 사항을 더 상세히 설명합니다.`]},
  { category:"완료수동 분사절",pattern:"Having been + 과거분사 ~, 주어 + 동사",meaning:"주절보다 먼저 완료된 수동 행동을 나타냄",build:s=>[`Having been approved by the ${s.department}, the ${s.document} can now be distributed to everyone involved in the project.`,`${s.departmentKo}의 승인을 받았으므로, 이제 ${s.documentKo}를 프로젝트 관계자 모두에게 배포할 수 있습니다.`]},
  { category:"부정어 도치",pattern:"Never + have/has + 주어 + 과거분사",meaning:"never를 문두에 두어 조동사와 주어를 도치하고 경험을 강조함",build:s=>[`Never has the ${s.department} faced a challenge as complex as the one described in the ${s.document}.`,`${s.departmentKo}은 ${s.documentKo}에 기술된 문제만큼 복잡한 과제에 직면한 적이 없습니다.`]},
  { category:"부정어 도치",pattern:"Rarely + do/does + 주어 + 동사원형",meaning:"빈도가 매우 낮음을 강조하기 위해 의문문형 도치를 사용함",build:s=>[`Rarely does the ${s.department} approve a ${s.document} without requesting at least one substantial revision.`,`${s.departmentKo}이 최소 한 번의 상당한 수정 요청 없이 ${s.documentKo}를 승인하는 경우는 거의 없습니다.`]},
  { category:"제한어 도치",pattern:"Only after + 절 + 조동사 + 주어",meaning:"특정 사건 이후에야 가능해진 결과를 도치로 강조함",build:s=>[`Only after the ${s.contact} had clarified the disputed figures did the ${s.department} agree to approve the ${s.document}.`,`${s.contactKo}이 논란이 된 수치를 명확히 설명한 뒤에야 ${s.departmentKo}은 ${s.documentKo} 승인에 동의했습니다.`]},
  { category:"상관 도치",pattern:"Not only + 조동사 + 주어, but 주어 also",meaning:"첫 번째 사실을 도치하고 두 번째 사실을 병렬로 강조함",build:s=>[`Not only did the ${s.department} complete the ${s.document} ahead of schedule, but it also identified several risks that had previously been overlooked.`,`${s.departmentKo}은 ${s.documentKo}를 예정보다 일찍 완료했을 뿐만 아니라 이전에 간과된 여러 위험도 찾아냈습니다.`]},
  { category:"과거 가정법",pattern:"Had + 주어 + 과거분사, 주어 + would have p.p.",meaning:"if를 생략한 과거 가정법 도치로 실현되지 않은 조건과 결과를 나타냄",build:s=>[`Had the ${s.department} examined the supporting data more carefully, it would have detected the error in the ${s.document} before publication.`,`${s.departmentKo}이 근거 자료를 더 주의 깊게 검토했더라면, 공개 전에 ${s.documentKo}의 오류를 발견했을 것입니다.`]},
  { category:"현재 가정법",pattern:"Were + 주어 + to부정사, 주어 + would",meaning:"가능성이 낮은 미래 상황을 if 없이 도치하여 가정함",build:s=>[`Were the ${s.department} to reject the ${s.document}, the entire project would have to be reconsidered from the beginning.`,`${s.departmentKo}이 ${s.documentKo}를 거부한다면, 전체 프로젝트를 처음부터 재검토해야 할 것입니다.`]},
  { category:"미래 가정법",pattern:"Should + 주어 + 동사원형, 명령문/주절",meaning:"가능성이 낮은 미래 조건을 정중하고 공식적으로 나타냄",build:s=>[`Should the ${s.contact} request additional evidence, please ask the ${s.department} to update the ${s.document} without delay.`,`${s.contactKo}이 추가 증거를 요청할 경우, ${s.departmentKo}에 지체 없이 ${s.documentKo}를 수정하도록 요청해 주세요.`]},
  { category:"긴 관계절",pattern:"명사 + 관계절 + 주절 동사",meaning:"긴 관계절에 가려진 선행사와 주절 동사를 찾아야 함",build:s=>[`The ${s.document} that the ${s.department} prepared after consulting specialists from several regional offices contains recommendations that may significantly affect future operations.`,`${s.departmentKo}이 여러 지역 사무소의 전문가들과 협의한 뒤 작성한 ${s.documentKo}에는 향후 운영에 큰 영향을 줄 수 있는 권고 사항이 담겨 있습니다.`]},
  { category:"명사절 주어",pattern:"What + 주어 + 동사 + 단수동사",meaning:"what절 전체가 주어이며 뒤의 단수동사가 주절 동사임",build:s=>[`What the ${s.department} needs to determine is whether the benefits described in the ${s.document} justify the additional cost.`,`${s.departmentKo}이 판단해야 할 것은 ${s.documentKo}에 설명된 이점이 추가 비용을 정당화하는지 여부입니다.`]},
  { category:"명사절 목적어",pattern:"주어 + 동사 + whether/what절",meaning:"주절 동사 뒤의 긴 명사절 전체가 목적어 역할을 함",build:s=>[`The ${s.department} must decide whether what the ${s.contact} proposed can be implemented without disrupting current operations.`,`${s.departmentKo}은 ${s.contactKo}이 제안한 내용을 현재 운영에 차질 없이 실행할 수 있는지 결정해야 합니다.`]},
  { category:"삽입구",pattern:"주어, 삽입구, + 동사",meaning:"주어와 동사 사이의 삽입 정보를 걷어 내고 문장 뼈대를 파악함",build:s=>[`The revised ${s.document}, according to several experts consulted by the ${s.department}, is unlikely to produce the results originally expected.`,`${s.departmentKo}이 자문한 여러 전문가에 따르면, 수정된 ${s.documentKo}가 당초 기대한 결과를 낼 가능성은 낮습니다.`]},
  { category:"비교·생략",pattern:"비교급 + than + 생략절",meaning:"than 뒤에서 앞 문장과 중복되는 성분이 생략된 비교절을 이해함",build:s=>[`The ${s.document} proved considerably more difficult to implement than the ${s.department} had initially expected.`,`${s.documentKo}는 ${s.departmentKo}이 처음 예상했던 것보다 실행하기가 상당히 더 어려운 것으로 드러났습니다.`]},
  { category:"혼합형",pattern:"Although절 + 완료분사절 + 관계절",meaning:"양보절·완료분사절·관계절이 결합된 문장에서 주절을 식별함",build:s=>[`Although the deadline was approaching, having identified several assumptions that could not be verified, the ${s.department} decided to postpone the ${s.document}'s release.`,`마감일이 다가오고 있었지만, 검증할 수 없는 여러 가정을 발견한 ${s.departmentKo}은 ${s.documentKo} 공개를 연기하기로 결정했습니다.`]},
  { category:"혼합형",pattern:"Only after 도치 + 관계절 + 명사절",meaning:"도치된 주절과 내부 관계절·명사절을 단계적으로 분리함",build:s=>[`Only after the experts who had reviewed the ${s.document} explained why the figures were unreliable did the ${s.department} reconsider its recommendation.`,`${s.documentKo}를 검토한 전문가들이 해당 수치가 신뢰할 수 없는 이유를 설명한 뒤에야 ${s.departmentKo}은 권고를 재검토했습니다.`]},
];

const templates = [...coreTemplates, ...expansionTemplates];

const SOURCE_URL = "https://www.eu.ets.org/toeic/test-takers/about/listening-reading.html";

// Interleave grammar patterns instead of grouping 50 near-identical sentences
// together. Each page now contains different structures, topics and intents.
export const toeicSentences = scenarios.flatMap((scenario, scenarioIndex) =>
  templates.map((template, templateIndex) => {
    const [en, ko] = template.build(scenario);
    const nextScenario = scenarios[(scenarioIndex + 1) % scenarios.length];
    const [applicationEn, applicationKo] = template.build(nextScenario);
    return {
      id: `toeic-sentence-${String(templateIndex * scenarios.length + scenarioIndex + 1).padStart(4, "0")}`,
      rank: scenarioIndex * templates.length + templateIndex + 1,
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
