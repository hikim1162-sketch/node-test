import http from "node:http";

const port = Number(process.env.POSCO_PGPT_PROXY_PORT || 43123);
const upstream =
  process.env.POSCO_PGPT_ENDPOINT ||
  "http://aigpt.posco.net/gpgpta01-gpt/gptApi/personalApi";

function sendJson(res, status, value) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/health" || req.url === "/v1/health")) {
    return sendJson(res, 200, { ok: true, upstream });
  }

  if (req.method !== "POST" || req.url?.split("?")[0] !== "/v1/chat/completions") {
    return sendJson(res, 404, { error: { message: "Unsupported endpoint" } });
  }

  const auth = process.env.POSCO_PGPT_AUTH_BASE64;
  if (!auth) {
    return sendJson(res, 500, {
      error: { message: "POSCO_PGPT_AUTH_BASE64 is not configured" },
    });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const upstreamResponse = await fetch(upstream, {
      method: "POST",
      headers: {
        authorization: `Bearer ${auth}`,
        "content-type": "application/json;charset=UTF-8",
        accept: req.headers.accept || "*/*",
      },
      body,
    });

    const headers = {};
    for (const name of ["content-type", "cache-control", "connection"]) {
      const value = upstreamResponse.headers.get(name);
      if (value) headers[name] = value;
    }
    res.writeHead(upstreamResponse.status, headers);

    if (!upstreamResponse.body) return res.end();
    const reader = upstreamResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    sendJson(res, 502, {
      error: { message: `P-GPT proxy error: ${error.message}` },
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`P-GPT Continue proxy listening on http://127.0.0.1:${port}`);
});

