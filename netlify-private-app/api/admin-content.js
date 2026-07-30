import { failure, send, success } from "./learning-catalog.js";
import { seedLearningContents } from "../src/learning/contentStorage.js";

export default function handler(req, res) {
  const current = seedLearningContents.find((item) => item.id === req.query.id);
  if (!current) return send(res, failure("NOT_FOUND", "콘텐츠를 찾을 수 없습니다.", 404));
  if (req.method === "PUT") return send(res, success({ ...current, ...req.body, id: current.id }));
  if (req.method === "DELETE") return send(res, success({ id: current.id, deleted: true }));
  return send(res, failure("METHOD_NOT_ALLOWED", "PUT 또는 DELETE 요청만 지원합니다.", 405));
}

