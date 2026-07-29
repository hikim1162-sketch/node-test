const ESPRESSO_VERY_URL = "https://www.espressoenglish.net/stop-saying-very-use-these-strong-adjectives-instead/";
const ESPRESSO_VOCAB_URL = "https://www.espressoenglish.net/category/vocabulary/";

const themes = [
  ["Stop Saying Very: 강한 형용사 1","very tired, very hungry, very cold","strong-adjectives","기본 형용사를 더 강한 표현으로 바꾸는 첫 번째 테마입니다.",[["very tired","exhausted","몹시 지친"],["very hungry","starving","몹시 배고픈"],["very cold","freezing","몹시 추운"]],["‘very hungry’와 가장 가까운 표현은?",["starving","boiling","tiny","calm"],"starving"]],
  ["Stop Saying Very: 강한 형용사 2","very hot, very big, very small","strong-adjectives","온도와 크기를 더 생생하게 표현하는 형용사를 익혀 보세요.",[["very hot","boiling","몹시 더운"],["very big","huge","아주 큰"],["very small","tiny","아주 작은"]],["‘very small’의 업그레이드 표현은?",["tiny","huge","furious","freezing"],"tiny"]],
  ["Stop Saying Very: 강한 형용사 3","very good, very bad, very funny","strong-adjectives","평가와 반응을 더 정확하게 표현하는 단어들을 익힙니다.",[["very good","excellent","훌륭한"],["very bad","terrible","형편없는"],["very funny","hilarious","아주 웃긴"]],["‘very good’와 가장 가까운 표현은?",["excellent","terrible","dirty","plain"],"excellent"]],
  ["Stop Saying Very: 강한 형용사 4","very beautiful, very scared, very interesting","strong-adjectives","감정과 인상을 더 풍부하게 표현할 수 있는 형용사입니다.",[["very beautiful","gorgeous","매우 아름다운"],["very scared","terrified","몹시 겁먹은"],["very interesting","fascinating","매우 흥미로운"]],["‘very scared’와 가장 가까운 표현은?",["terrified","delighted","gorgeous","tiny"],"terrified"]],
  ["강한 감정 표현 1","very angry, very happy, very sad","emotion","기본 감정 표현을 더 강하고 정확한 단어로 바꾸어 봅니다.",[["very angry","furious","몹시 화난"],["very happy","delighted","매우 기쁜"],["very sad","miserable","몹시 슬픈"]],["‘very angry’의 더 강한 표현은?",["furious","freezing","tiny","plain"],"furious"]],
  ["강한 상태 표현 1","very dirty, very clean, very noisy","state","상태를 묘사할 때 자주 쓰이는 강한 형용사를 익힙니다.",[["very dirty","filthy","몹시 더러운"],["very clean","spotless","아주 깨끗한"],["very noisy","deafening","귀가 먹먹할 정도로 시끄러운"]],["‘very dirty’와 가장 가까운 표현은?",["filthy","spotless","gentle","brief"],"filthy"]],
  ["강한 정도 표현 1","very fast, very slow, very bright","degree","정도와 속도를 나타내는 형용사를 강화해 봅니다.",[["very fast","rapid","매우 빠른"],["very slow","sluggish","매우 느린"],["very bright","brilliant","매우 밝은"]],["‘very fast’에 가까운 표현은?",["rapid","sluggish","dull","fragile"],"rapid"]],
  ["성격 묘사 1","very kind, very rude, very brave","personality","사람의 성격을 더 구체적으로 묘사하는 표현입니다.",[["very kind","compassionate","인정 많은"],["very rude","impolite","무례한"],["very brave","courageous","용감한"]],["‘very brave’와 가장 가까운 표현은?",["courageous","selfish","noisy","tiny"],"courageous"]],
  ["공부에 자주 나오는 동사 1","look at, think about, say again","verbs","쉬운 동사를 더 학습용·문어체 동사로 바꾸는 테마입니다.",[["look at","observe","관찰하다"],["think about","consider","고려하다"],["say again","repeat","반복하다"]],["‘look at’의 더 학습적인 표현은?",["observe","borrow","escape","refuse"],"observe"]],
  ["공부에 자주 나오는 동사 2","find out, show, make better","verbs","시험 지문과 에세이에서 자주 만나는 동사 업그레이드입니다.",[["find out","discover","발견하다"],["show","demonstrate","보여주다, 입증하다"],["make better","improve","개선하다"]],["‘make better’와 가장 가까운 표현은?",["improve","ignore","reduce","argue"],"improve"]],
  ["자주 쓰는 동사 업그레이드 3","give up, keep going, deal with","verbs","기본 동사구를 더 정확한 단어로 익히는 연습입니다.",[["give up","quit","포기하다"],["keep going","continue","계속하다"],["deal with","handle","다루다, 처리하다"]],["‘deal with’와 가장 가까운 표현은?",["handle","delay","admire","freeze"],"handle"]],
  ["의사소통 동사 1","say sorry, say no, say yes","communication-verbs","일상 표현을 더 정확한 동사 하나로 바꿔 봅니다.",[["say sorry","apologize","사과하다"],["say no","refuse","거절하다"],["say yes","agree","동의하다"]],["‘say sorry’의 더 정확한 동사는?",["apologize","announce","hesitate","compare"],"apologize"]],
  ["생각 관련 동사 1","think deeply, think again, think of","thinking-verbs","사고 과정을 나타내는 동사를 더 정교하게 배웁니다.",[["think deeply","contemplate","숙고하다"],["think again","reconsider","재고하다"],["think of","imagine","상상하다"]],["‘think deeply’와 가장 가까운 표현은?",["contemplate","whisper","jump","borrow"],"contemplate"]],
  ["문어체 명사 1","help, use, idea","nouns","쉬운 명사를 더 격식 있는 명사로 바꾸는 연습입니다.",[["help","assistance","도움, 지원"],["use","usage","사용, 용법"],["idea","concept","개념"]],["‘help’의 문어체 명사로 가장 알맞은 것은?",["assistance","reaction","debate","surface"],"assistance"]],
  ["문어체 명사 2","result, reason, change","nouns","시험 지문에서 자주 보이는 명사 업그레이드입니다.",[["result","outcome","결과"],["reason","cause","원인, 이유"],["change","alteration","변화, 수정"]],["‘result’와 가장 가까운 문어체 명사는?",["outcome","silence","anger","flight"],"outcome"]],
  ["부사 업그레이드 1","very, really, suddenly","adverbs","부사를 더 자연스럽고 정확하게 업그레이드합니다.",[["very","extremely","매우, 극도로"],["really","truly","정말로"],["suddenly","abruptly","갑자기"]],["‘very’의 더 강한 부사는?",["extremely","barely","rarely","briefly"],"extremely"]],
  ["자주 헷갈리는 형용사 1","simple, hard, important","adjectives","기본 형용사를 더 학습용 단어로 바꾸는 훈련입니다.",[["simple","straightforward","이해하기 쉬운"],["hard","difficult","어려운"],["important","significant","중요한"]],["‘important’의 더 학습적인 표현은?",["significant","casual","narrow","fragile"],"significant"]],
  ["자주 헷갈리는 형용사 2","weak, strong, careful","adjectives","성질과 상태를 묘사하는 형용사를 넓혀 봅니다.",[["weak","fragile","약한, 부서지기 쉬운"],["strong","powerful","강한"],["careful","cautious","조심스러운"]],["‘careful’와 가장 가까운 표현은?",["cautious","reckless","filthy","rapid"],"cautious"]],
  ["학업 어휘 1","study, test, answer","academic","공부와 시험 맥락에서 자주 쓰이는 단어를 업그레이드합니다.",[["study","analyze","분석하다"],["test","examination","시험"],["answer","response","응답, 답변"]],["‘test’의 더 격식 있는 명사는?",["examination","movement","silence","arrival"],"examination"]],
  ["학업 어휘 2","show clearly, explain, compare","academic","수능형 독해와 서술에 자주 등장하는 학술 어휘입니다.",[["show clearly","illustrate","분명히 보여주다"],["explain","clarify","명확히 하다"],["compare","contrast","비교하다, 대조하다"]],["‘show clearly’와 가장 가까운 표현은?",["illustrate","hesitate","ignore","escape"],"illustrate"]],
  ["일상 동사 업그레이드 1","get, buy, ask for","daily-verbs","아주 쉬운 기본 동사를 더 격식 있는 단어로 바꿉니다.",[["get","obtain","얻다"],["buy","purchase","구매하다"],["ask for","request","요청하다"]],["‘buy’의 더 격식 있는 동사는?",["purchase","persuade","wander","repeat"],"purchase"]],
  ["일상 동사 업그레이드 2","keep, leave, build","daily-verbs","기초 동사를 더 정확한 의미로 확장합니다.",[["keep","maintain","유지하다"],["leave","depart","떠나다"],["build","construct","건설하다"]],["‘leave’와 가장 가까운 표현은?",["depart","arrive","repair","observe"],"depart"]],
  ["감정 표현 2","very nervous, very surprised, very confused","emotion","감정 상태를 보다 세밀하게 표현하는 단어들입니다.",[["very nervous","anxious","몹시 긴장한, 불안한"],["very surprised","astonished","몹시 놀란"],["very confused","bewildered","매우 혼란스러운"]],["‘very surprised’와 가장 가까운 표현은?",["astonished","bored","steady","gentle"],"astonished"]],
  ["감정 표현 3","very excited, very calm, very lonely","emotion","일상에서 자주 쓰이는 감정 표현을 한 단계 업그레이드합니다.",[["very excited","thrilled","매우 신이 난"],["very calm","peaceful","매우 평온한"],["very lonely","isolated","몹시 외로운, 고립된"]],["‘very excited’의 강한 표현은?",["thrilled","annoyed","filthy","sluggish"],"thrilled"]],
  ["품질·상태 표현 2","very old, very weak, very rich","quality-state","상태와 특성을 조금 더 고급스럽게 표현하는 어휘입니다.",[["very old","ancient","아주 오래된"],["very weak","feeble","매우 약한"],["very rich","wealthy","부유한"]],["‘very old’와 가장 가까운 표현은?",["ancient","modern","brief","shallow"],"ancient"]],
  ["품질·상태 표현 3","very poor, very crowded, very empty","quality-state","상태를 더 구체적으로 묘사하는 형용사를 익힙니다.",[["very poor","destitute","극빈한"],["very crowded","packed","꽉 찬"],["very empty","vacant","비어 있는"]],["‘very crowded’의 더 강한 표현은?",["packed","vacant","modest","cautious"],"packed"]],
  ["생각·판단 동사 2","believe, guess, decide","thinking-verbs","사고와 판단을 표현하는 핵심 동사들입니다.",[["believe","assume","추정하다, 여기다"],["guess","estimate","추정하다"],["decide","determine","결정하다"]],["‘decide’의 더 학습적인 동사는?",["determine","wander","freeze","whisper"],"determine"]],
  ["의사소통 동사 2","tell, call, talk about","communication-verbs","말하기 관련 기본 동사를 더 정확하게 정리합니다.",[["tell","inform","알리다"],["call","contact","연락하다"],["talk about","discuss","논의하다"]],["‘talk about’와 가장 가까운 표현은?",["discuss","construct","depart","melt"],"discuss"]],
  ["수능형 빈출 어휘 1","important, clear, possible","exam-vocab","지문에서 매우 자주 나오는 기본 어휘 업그레이드입니다.",[["important","crucial","결정적인, 매우 중요한"],["clear","obvious","분명한"],["possible","feasible","실행 가능한"]],["‘important’의 더 강한 표현은?",["crucial","minor","gentle","plain"],"crucial"]],
  ["수능형 빈출 어휘 2","common, enough, famous","exam-vocab","시험과 독해에서 자주 쓰이는 표현을 마무리로 정리합니다.",[["common","prevalent","널리 퍼진"],["enough","sufficient","충분한"],["famous","renowned","유명한"]],["‘famous’와 가장 가까운 표현은?",["renowned","ordinary","vacant","anxious"],"renowned"]],
];

export const dailySynonymThemes30 = themes.map((theme, index) => {
  const [title, subtitle, category, description, items, quiz] = theme;
  return {
    day: index + 1,
    id: `day-${String(index + 1).padStart(3, "0")}`,
    title,
    subtitle,
    category,
    level: index < 8 ? "basic" : index < 22 ? "intermediate" : "advanced",
    tags: [category, "수능형 어휘", "오늘의 테마"],
    description,
    items: items.map(([base, target, meaningKo]) => ({ base, target, meaningKo })),
    quiz: { type: "multiple-choice", question: quiz[0], options: quiz[1], answer: quiz[2] },
    source: {
      name: "Espresso English",
      url: index < 4 ? ESPRESSO_VERY_URL : ESPRESSO_VOCAB_URL,
    },
  };
});

export function getTodaySynonymTheme(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
  return dailySynonymThemes30[dayOfYear % dailySynonymThemes30.length];
}
