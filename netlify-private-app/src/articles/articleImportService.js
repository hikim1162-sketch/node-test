export async function extractFromUrl(sourceUrl) {
  const url = String(sourceUrl || "").trim();
  if (!url) throw new Error("뉴스 URL을 입력해 주세요.");
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error("올바른 URL을 입력해 주세요."); }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("http 또는 https URL만 사용할 수 있습니다.");

  const response = await fetch(`/api/article-extract?url=${encodeURIComponent(parsed.href)}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok || !payload.fullText) throw new Error(payload.message || "자동으로 원문을 가져오지 못했습니다.");
  return payload;
}
