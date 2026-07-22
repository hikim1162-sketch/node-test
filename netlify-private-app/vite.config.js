import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import naverDictionary from "./netlify/functions/naver-dictionary.js";

const valueTimeRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-naver-dictionary",
      configureServer(server) {
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
});
