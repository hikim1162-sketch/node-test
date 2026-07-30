import { failure, send, success } from "./learning-catalog.js";
import { seedLearningContents } from "../src/learning/contentStorage.js";

export default function handler(req, res) {
  if (req.method === "GET") return send(res, success(seedLearningContents));
  if (req.method === "POST") {
    const content = req.body;
    if (!content?.type || !content?.title || !content?.publishDate) {
      return send(res, failure("VALIDATION_ERROR", "타입, 제목, 노출일은 필수입니다.", 422));
    }
    return send(res, success({ ...content, id: content.id || `content-${Date.now()}` }, 201));
  }
  return send(res, failure("METHOD_NOT_ALLOWED", "GET 또는 POST 요청만 지원합니다.", 405));
}

