import { failure, send, success, visibleContents } from "./learning-catalog.js";

export default function handler(req, res) {
  if (req.method !== "GET") return send(res, failure("METHOD_NOT_ALLOWED", "GET 요청만 지원합니다.", 405));
  const content = visibleContents("daily_sentence").find((item) => item.id === req.query.id);
  return send(res, content ? success(content) : failure("NOT_FOUND", "공개된 매일 1문장 콘텐츠를 찾을 수 없습니다.", 404));
}

