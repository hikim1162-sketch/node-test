const makeMiddlePassage = ({ id, number, topic, type, paragraphs, translations, vocab, question, choices, answer, explanation, evidence }) => ({
  id, number, topic, type, difficulty: "중등", minutes: 4, limit: "04:00",
  source: "ValueTime 중등 영어", sourceDetail: "중학교 수준 학습용 자체 구성", tags: ["중등 영어", type, "기본 독해"],
  paragraphs, translations,
  notes: paragraphs.map((_, index) => index === 0 ? "주어와 동사를 먼저 찾고 문장의 기본 뜻을 확인하세요." : "앞 문장과 이어지는 연결어와 대명사를 확인하세요."),
  vocab: vocab.map(([word, meaning, usage]) => ({ word, meaning, usage })),
  expressions: vocab.slice(0, 3).map(([word, meaning, usage], index) => ({ id: `${id}-expression-${index}`, text: usage, meaning, example: usage, note: "짧은 예문과 함께 익히는 중등 필수 표현입니다." })),
  question, choices, answer, explanation, evidence,
  traps: choices.filter((_, index) => index !== answer).map((choice, index) => `${index + 1}번 '${choice}'는 글의 중심 내용과 맞지 않습니다.`),
  questions: [
    { id: `${id}-main`, type, question, choices, answer, explanation, evidence },
    { id: `${id}-detail`, type: "내용 이해", question: "윗글의 내용과 일치하는 것은?", choices: [evidence, "글에 나오지 않은 어려운 주장", "중심 내용과 반대되는 설명", "주제와 관계없는 내용"], answer: 0, explanation: "지문에 직접 제시된 문장을 찾으면 답할 수 있습니다.", evidence },
  ],
});

export const middleEnglishPassages = [
  makeMiddlePassage({
    id: "middle-reading-01", number: "MIDDLE DAY 01", topic: "A Small Reading Habit", type: "주제",
    paragraphs: ["Min reads an English story for ten minutes every night. At first, some words are new to him, but he keeps reading.", "After a few weeks, Min can understand longer sentences. His small daily habit helps him feel more confident."],
    translations: ["민수는 매일 밤 10분 동안 영어 이야기를 읽습니다. 처음에는 모르는 단어가 있지만 계속 읽습니다.", "몇 주 뒤 민수는 더 긴 문장을 이해할 수 있습니다. 매일의 작은 습관은 민수가 자신감을 느끼도록 돕습니다."],
    vocab: [["habit", "습관", "a daily habit"], ["understand", "이해하다", "understand a sentence"], ["confident", "자신감 있는", "feel confident"], ["keep", "계속하다", "keep reading"]],
    question: "이 글의 주제로 가장 알맞은 것은?", choices: ["매일 조금씩 읽는 습관의 효과", "밤에 일찍 자는 방법", "긴 이야기를 쓰는 방법", "새 책을 사는 이유"], answer: 0,
    explanation: "민수가 매일 짧게 읽으며 영어 이해력과 자신감을 높이는 내용입니다.", evidence: "His small daily habit helps him feel more confident.",
  }),
  makeMiddlePassage({
    id: "middle-kindness-02", number: "MIDDLE DAY 02", topic: "Helping a New Student", type: "내용 이해",
    paragraphs: ["A new student named Emma joined Joon's class. She looked worried because she did not know anyone.", "Joon showed Emma the library and ate lunch with her. Emma smiled and thanked him for his kindness."],
    translations: ["Emma라는 새 학생이 준이의 반에 왔습니다. 아는 사람이 없어 걱정스러워 보였습니다.", "준은 Emma에게 도서관을 보여 주고 함께 점심을 먹었습니다. Emma는 웃으며 친절에 감사했습니다."],
    vocab: [["join", "함께하다, 들어오다", "join a class"], ["worried", "걱정하는", "look worried"], ["show", "보여 주다", "show the library"], ["kindness", "친절", "thank him for his kindness"]],
    question: "준이 Emma를 위해 한 일은?", choices: ["도서관을 보여 주고 함께 점심을 먹었다", "영어 시험을 대신 보았다", "새 책을 사 주었다", "집까지 운전해 주었다"], answer: 0,
    explanation: "두 번째 문장에 준이 도서관을 안내하고 함께 점심을 먹었다고 나옵니다.", evidence: "Joon showed Emma the library and ate lunch with her.",
  }),
  makeMiddlePassage({
    id: "middle-environment-03", number: "MIDDLE DAY 03", topic: "Bring Your Own Bottle", type: "요지",
    paragraphs: ["Many students buy water in plastic bottles. The bottles are useful, but they create a lot of trash.", "We can bring our own bottles to school. This simple choice can reduce waste and keep our school cleaner."],
    translations: ["많은 학생이 플라스틱 병에 든 물을 삽니다. 병은 편리하지만 많은 쓰레기를 만듭니다.", "우리는 개인 물병을 학교에 가져올 수 있습니다. 이 간단한 선택은 쓰레기를 줄이고 학교를 더 깨끗하게 유지할 수 있습니다."],
    vocab: [["plastic", "플라스틱", "a plastic bottle"], ["trash", "쓰레기", "create trash"], ["reduce", "줄이다", "reduce waste"], ["clean", "깨끗한", "keep the school cleaner"]],
    question: "글쓴이가 제안하는 것은?", choices: ["개인 물병을 학교에 가져오기", "물을 마시지 않기", "플라스틱 병을 더 많이 사기", "학교 밖에 쓰레기를 두기"], answer: 0,
    explanation: "개인 물병을 사용해 쓰레기를 줄이자는 글입니다.", evidence: "We can bring our own bottles to school.",
  }),
];
