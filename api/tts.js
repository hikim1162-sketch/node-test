const MAX_TEXT_LENGTH = 180;

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const text = String(request.query?.text || "").trim();
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return response.status(400).json({ error: "invalid_text" });
  }

  const upstreamUrl = new URL("https://translate.googleapis.com/translate_tts");
  upstreamUrl.searchParams.set("client", "gtx");
  upstreamUrl.searchParams.set("ie", "UTF-8");
  upstreamUrl.searchParams.set("tl", "en");
  upstreamUrl.searchParams.set("q", text);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
      },
    });
    if (!upstream.ok) {
      return response.status(502).json({
        error: "tts_upstream_failed",
        status: upstream.status,
      });
    }

    const audio = Buffer.from(await upstream.arrayBuffer());
    response.setHeader("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
    response.setHeader("Content-Length", String(audio.length));
    response.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    return response.status(200).send(audio);
  } catch (error) {
    console.error("[api/tts] request failed", error);
    return response.status(502).json({ error: "tts_request_failed" });
  }
}
