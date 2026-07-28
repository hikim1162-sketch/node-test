import { syncGeneralProgressWithGithub } from "../server/generalProgressGithub.js";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  if (request.method !== "GET" && request.method !== "PUT") {
    response.setHeader("Allow", "GET, PUT");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const user = String(request.query?.user || request.body?.user || "").toLowerCase();
  try {
    const result = await syncGeneralProgressWithGithub({
      user,
      records: request.method === "PUT" ? request.body?.records : undefined,
      token: process.env.GITHUB_PROGRESS_TOKEN,
      write: request.method === "PUT",
    });
    return response.status(200).json(result);
  } catch (error) {
    console.error("[general-progress]", error);
    return response.status(Number(error.status) || 502).json({
      error: error.message || "github_sync_failed",
    });
  }
}
