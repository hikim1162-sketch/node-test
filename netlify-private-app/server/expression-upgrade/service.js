export const CANONICAL_EVENTS = new Set([
  "home_view", "daily_set_view", "learning_start", "expression_card_view",
  "expression_card_complete", "quiz_start", "quiz_answer", "quiz_complete",
  "result_view", "expression_save", "saved_list_view", "review_queue_view",
  "review_start", "review_complete",
]);

export function validatePublishedSet(set) {
  if (set.status !== "published") throw new Error("SET_NOT_PUBLISHED");
  if (set.items?.length !== 5) throw new Error("SET_REQUIRES_EXACTLY_5_ITEMS");
  if (set.quiz?.items?.length !== 3) throw new Error("QUIZ_REQUIRES_EXACTLY_3_ITEMS");
  for (const item of set.items) {
    const expression = item.expression;
    if (!expression || expression.status !== "active") throw new Error("INACTIVE_EXPRESSION");
    if (![1, 2, 3].includes(expression.difficultyLevel)) throw new Error("INVALID_DIFFICULTY");
    if (!expression.shortDescription || expression.shortDescription.length > 60) throw new Error("INVALID_SHORT_DESCRIPTION");
    if (!expression.usageNote || expression.usageNote.length > 80) throw new Error("INVALID_USAGE_NOTE");
    if (expression.examples?.length !== 1) throw new Error("EXACTLY_ONE_EXAMPLE_REQUIRED");
  }
  return set;
}

export async function getTodaySet(db, date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const set = await db.expressionSet.findFirst({
    where: { status: "published", setDate: { gte: start, lt: end } },
    include: {
      items: { orderBy: { sortOrder: "asc" }, include: { expression: { include: { examples: true } } } },
      quiz: { include: { items: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  if (!set) return null;
  return validatePublishedSet(set);
}

export async function saveExpression(db, userId, expressionId) {
  return db.$transaction(async (tx) => {
    const expression = await tx.expression.findFirst({ where: { id: expressionId, status: "active" } });
    if (!expression) throw new Error("EXPRESSION_NOT_FOUND");
    const saved = await tx.savedExpression.upsert({
      where: { userId_expressionId: { userId, expressionId } },
      create: { userId, expressionId },
      update: {},
    });
    await createReviewQueueItem(tx, { userId, expressionId, sourceType: "saved", sourceRefId: saved.id });
    return saved;
  });
}

export async function createReviewQueueItem(db, input) {
  const existing = await db.reviewQueueItem.findFirst({
    where: {
      userId: input.userId,
      expressionId: input.expressionId,
      sourceType: input.sourceType,
      status: "pending",
    },
  });
  if (existing) return existing;
  return db.reviewQueueItem.create({ data: { ...input, status: "pending" } });
}

export async function submitQuiz(db, userId, quizId, answers) {
  return db.$transaction(async (tx) => {
    const quiz = await tx.quiz.findUnique({ where: { id: quizId }, include: { items: true } });
    if (!quiz) throw new Error("QUIZ_NOT_FOUND");
    if (quiz.items.length !== 3 || answers.length !== 3) throw new Error("QUIZ_REQUIRES_EXACTLY_3_ANSWERS");
    const answerMap = new Map(answers.map((answer) => [answer.quizItemId, answer.selectedAnswer]));
    const scored = quiz.items.map((item) => {
      const selectedAnswer = answerMap.get(item.id);
      if (typeof selectedAnswer !== "string") throw new Error("MISSING_QUIZ_ANSWER");
      return { item, selectedAnswer, isCorrect: selectedAnswer === item.correctAnswer };
    });
    const submission = await tx.quizSubmission.create({
      data: {
        userId,
        quizId,
        score: scored.filter((answer) => answer.isCorrect).length,
        items: {
          create: scored.map(({ item, selectedAnswer, isCorrect }) => ({
            quizItemId: item.id,
            selectedAnswer,
            isCorrect,
          })),
        },
      },
      include: { items: true },
    });
    for (const answer of scored.filter((item) => !item.isCorrect)) {
      await createReviewQueueItem(tx, {
        userId,
        expressionId: answer.item.expressionId,
        sourceType: "quiz_wrong",
        sourceRefId: answer.item.id,
      });
    }
    return submission;
  });
}

export async function completeReview(db, userId, reviewId) {
  const review = await db.reviewQueueItem.findFirst({ where: { id: reviewId, userId } });
  if (!review) throw new Error("REVIEW_NOT_FOUND");
  if (review.status === "completed") return review;
  return db.reviewQueueItem.update({
    where: { id: reviewId },
    data: { status: "completed", completedAt: new Date() },
  });
}

export async function createLearningLog(db, userId, body) {
  if (!CANONICAL_EVENTS.has(body.eventName)) throw new Error("INVALID_EVENT_NAME");
  return db.learningLog.create({
    data: {
      userId,
      eventName: body.eventName,
      setId: body.setId || null,
      expressionId: body.expressionId || null,
      quizId: body.quizId || null,
      quizItemId: body.quizItemId || null,
      metadataJson: body.metadata || undefined,
    },
  });
}
