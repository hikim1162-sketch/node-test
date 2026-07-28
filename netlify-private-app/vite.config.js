import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import naverDictionary from "./netlify/functions/naver-dictionary.js";
import articleExtract from "./netlify/functions/article-extract.js";
import { syncGeneralProgressWithGithub } from "../server/generalProgressGithub.js";

const valueTimeRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
  plugins: [
    react(),
    {
      name: "local-naver-dictionary",
      configureServer(server) {
        server.middlewares.use("/api/general-progress", async (request, response) => {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.setHeader("Cache-Control", "private, no-store");
          if (request.method !== "GET" && request.method !== "PUT") {
            response.statusCode = 405;
            response.end(JSON.stringify({ error: "method_not_allowed" }));
            return;
          }
          try {
            let body = {};
            if (request.method === "PUT") {
              const chunks = [];
              for await (const chunk of request) chunks.push(chunk);
              body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            }
            const requestUrl = new URL(request.originalUrl || request.url || "/", "http://localhost");
            const result = await syncGeneralProgressWithGithub({
              user: body.user || requestUrl.searchParams.get("user"),
              records: request.method === "PUT" ? body.records : undefined,
              token: env.GITHUB_PROGRESS_TOKEN,
              write: request.method === "PUT",
            });
            response.statusCode = 200;
            response.end(JSON.stringify(result));
          } catch (error) {
            response.statusCode = Number(error.status) || 502;
            response.end(JSON.stringify({ error: error.message || "github_sync_failed" }));
          }
        });
        server.middlewares.use("/api/article-extract", async (request, response) => {
          const webRequest = new Request(`http://${request.headers.host || "127.0.0.1"}${request.originalUrl || request.url}`, { method: request.method, headers: request.headers });
          const result = await articleExtract(webRequest);
          response.statusCode = result.status;
          result.headers.forEach((value, name) => response.setHeader(name, value));
          response.end(Buffer.from(await result.arrayBuffer()));
        });
        server.middlewares.use("/api/naver-dictionary", async (request, response) => {
          const webRequest = new Request(`http://${request.headers.host || "127.0.0.1"}${request.originalUrl || request.url}`, {
            method: request.method,
            headers: request.headers,
          });
          const result = await naverDictionary(webRequest);
          response.statusCode = result.status;
          result.headers.forEach((value, name) => response.setHeader(name, value));
          response.end(Buffer.from(await result.arrayBuffer()));
        });
      },
    },
  ],
  server: {
    fs: {
      allow: [valueTimeRoot],
    },
  },
  };
});
