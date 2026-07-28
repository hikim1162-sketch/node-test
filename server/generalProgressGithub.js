const USERS = new Set(["kai", "rachel"]);
const FIELDS = ["savedWords", "knownWords", "clearedWordSentences", "masteredSavedWords"];
const OWNER = "hikim1162-sketch";
const REPO = "node-test";
const BRANCH = "progress-data";
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "value-time-progress-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubRequest(path, token, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: { ...githubHeaders(token), ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `github_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function normalizeGeneralProgressRecords(records) {
  return Object.fromEntries(FIELDS.map((field) => {
    const entries = Object.entries(records?.[field] || {}).flatMap(([word, entry]) => {
      const safeWord = String(word || "").trim().slice(0, 100);
      if (!safeWord) return [];
      return [[safeWord, {
        value: Boolean(entry?.value),
        updatedAt: Math.max(1, Math.floor(Number(entry?.updatedAt) || 1)),
      }]];
    }).slice(0, 5000);
    return [field, Object.fromEntries(entries)];
  }));
}

export function mergeGeneralProgressRecords(current, incoming) {
  const merged = normalizeGeneralProgressRecords(current);
  const normalizedIncoming = normalizeGeneralProgressRecords(incoming);
  FIELDS.forEach((field) => {
    Object.entries(normalizedIncoming[field]).forEach(([word, next]) => {
      const previous = merged[field][word];
      if (!previous || Number(next.updatedAt) >= Number(previous.updatedAt)) {
        merged[field][word] = next;
      }
    });
  });
  return merged;
}

async function ensureDataBranch(token) {
  try {
    await githubRequest(`/git/ref/heads/${BRANCH}`, token);
  } catch (error) {
    if (error.status !== 404) throw error;
    const main = await githubRequest("/git/ref/heads/main", token);
    try {
      await githubRequest("/git/refs", token, {
        method: "POST",
        body: JSON.stringify({
          ref: `refs/heads/${BRANCH}`,
          sha: main.object.sha,
        }),
      });
    } catch (createError) {
      if (createError.status !== 422) throw createError;
    }
  }
}

function decodeContent(content) {
  try {
    return JSON.parse(Buffer.from(String(content || "").replace(/\n/g, ""), "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function encodeContent(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8").toString("base64");
}

async function readProgressFile(user, token) {
  try {
    const file = await githubRequest(`/contents/data/general-progress/${user}.json?ref=${BRANCH}`, token);
    return {
      sha: file.sha,
      data: decodeContent(file.content),
    };
  } catch (error) {
    if (error.status === 404) return { sha: null, data: null };
    throw error;
  }
}

async function writeProgressFile(user, records, token, sha = null) {
  const body = {
    message: `[progress-sync] Update ${user} general progress`,
    content: encodeContent({
      version: 1,
      user,
      records,
      updatedAt: new Date().toISOString(),
    }),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  return githubRequest(`/contents/data/general-progress/${user}.json`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function syncGeneralProgressWithGithub({ user, records, token, write = true }) {
  const safeUser = String(user || "").toLowerCase();
  if (!USERS.has(safeUser)) {
    const error = new Error("invalid_user");
    error.status = 400;
    throw error;
  }
  if (!token) {
    const error = new Error("github_not_configured");
    error.status = 503;
    throw error;
  }

  await ensureDataBranch(token);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readProgressFile(safeUser, token);
    const merged = mergeGeneralProgressRecords(current.data?.records, records);
    if (!write) return { user: safeUser, records: merged, updatedAt: current.data?.updatedAt || null };
    try {
      await writeProgressFile(safeUser, merged, token, current.sha);
      return { user: safeUser, records: merged, updatedAt: new Date().toISOString() };
    } catch (error) {
      if (error.status !== 409 || attempt === 2) throw error;
    }
  }
  throw new Error("github_sync_conflict");
}
