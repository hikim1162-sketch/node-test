# Expression Upgrade REST contract

All endpoints use the authenticated user id. During MVP development the adapter may inject `mock-user`.

| Method and path | Input | Success | Validation / errors |
|---|---|---|---|
| `GET /api/daily-set/today` | Optional `date=YYYY-MM-DD` | `{ data: ExpressionSet }` | `400 INVALID_DATE`, `404 SET_NOT_FOUND` |
| `GET /api/sets/:setId` | UUID/CUID `setId` | `{ data: ExpressionSet }` | `404 SET_NOT_FOUND`; hidden expressions are filtered |
| `GET /api/sets/:setId/quiz` | UUID/CUID `setId` | `{ data: Quiz }` without internal answer leakage if desired | `404 QUIZ_NOT_FOUND` |
| `POST /api/quiz-submissions` | `{ quizId, answers: [{ quizItemId, selectedAnswer }] }` | `{ data: { id, score, total: 3, items } }` | `400` unless exactly three unique answers; `404 QUIZ_NOT_FOUND` |
| `POST /api/expressions/:expressionId/save` | No body | `{ data: SavedExpression, alreadySaved: boolean }` | `404 EXPRESSION_NOT_FOUND`; idempotent |
| `GET /api/me/saved-expressions` | Optional cursor | `{ data: SavedExpression[] }` | `401 UNAUTHORIZED` |
| `GET /api/me/review-queue` | Optional `status=pending|completed` | `{ data: ReviewQueueItem[] }` | `400 INVALID_STATUS` |
| `POST /api/me/review-queue/:reviewId/complete` | No body | `{ data: ReviewQueueItem }` | `404 REVIEW_NOT_FOUND`; idempotent |
| `POST /api/logs` | `{ eventName, setId?, expressionId?, quizId?, quizItemId?, metadata? }` | `{ data: { id, createdAt } }` | `400 INVALID_EVENT_NAME` |

Response errors use `{ "error": { "code": "CODE", "message": "Safe user-facing message" } }`.

Adapter route handlers should call the exported service methods from `service.js`, map domain errors to the status codes above, and never accept `userId` from the request body.
