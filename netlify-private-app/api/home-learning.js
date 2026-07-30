import { send, success, todayOrLatest } from "./learning-catalog.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, data: null, error: { code: "METHOD_NOT_ALLOWED", message: "GET 요청만 지원합니다.", details: null } });
  }
  send(res, success({
    dailySentence: todayOrLatest("daily_sentence"),
    tedLearning: todayOrLatest("ted_learning"),
  }));
}

