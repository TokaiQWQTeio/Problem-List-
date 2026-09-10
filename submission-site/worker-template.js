const TAXONOMY = __TAXONOMY_JSON__;
const SUBMITTERS = __SUBMITTERS_JSON__;
const ASSETS = __ASSETS_JSON__;

const COOKIE_NAME = "algo_intake_session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const OAUTH_STATE_SECONDS = 10 * 60;
const DIFFICULTIES = ["入门", "简单", "中等", "困难", "极难"];
const STATUSES = ["待做", "尝试中", "已解决", "需复习"];
const encoder = new TextEncoder();

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

function asset(name, type) {
  return new Response(ASSETS[name], {
    headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "public, max-age=300" },
  });
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function randomToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

async function sha256(value) {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

async function encryptionKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encrypt(value, secret) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, await encryptionKey(secret), encoder.encode(value));
  return { encrypted: base64url(new Uint8Array(ciphertext)), nonce: base64url(nonce) };
}

function fromBase64url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function decrypt(value, nonce, secret) {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64url(nonce) },
    await encryptionKey(secret),
    fromBase64url(value),
  );
  return new TextDecoder().decode(plaintext);
}

function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function sessionCookie(value, maxAge = SESSION_SECONDS) {
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function oauthRedirectUri(request) {
  return `${new URL(request.url).origin}/auth/callback`;
}

function isAllowed(username) {
  return SUBMITTERS.allowed_github_users.some((name) => name.toLowerCase() === username.toLowerCase());
}

async function github(path, token, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "user-agent": "algo-index-intake",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { message: text }; }
  if (!response.ok) {
    const error = new Error(body?.message || `GitHub API 返回 ${response.status}`);
    error.status = response.status;
    error.details = body;
    throw error;
  }
  return body;
}

async function currentSession(request, env) {
  const raw = getCookie(request, COOKIE_NAME);
  if (!raw) return null;
  const hash = await sha256(raw);
  const row = await env.DB.prepare(
    "SELECT username, github_user_id, encrypted_access_token, token_nonce, csrf_token, expires_at FROM sessions WHERE session_hash = ?",
  ).bind(hash).first();
  if (!row || Number(row.expires_at) <= Date.now()) {
    if (row) await env.DB.prepare("DELETE FROM sessions WHERE session_hash = ?").bind(hash).run();
    return null;
  }
  return { ...row, raw, token: await decrypt(row.encrypted_access_token, row.token_nonce, env.SESSION_SECRET) };
}

async function beginOAuth(request, env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.SESSION_SECRET) {
    return json({ error: "站点管理员尚未完成 GitHub OAuth 配置。" }, 503);
  }
  const state = randomToken();
  await env.DB.prepare("DELETE FROM oauth_states WHERE expires_at <= ?").bind(Date.now()).run();
  await env.DB.prepare("INSERT INTO oauth_states (state_hash, expires_at, created_at) VALUES (?, ?, ?)")
    .bind(await sha256(state), Date.now() + OAUTH_STATE_SECONDS * 1000, new Date().toISOString()).run();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: oauthRedirectUri(request),
    scope: "public_repo read:user",
    state,
  });
  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
}

async function finishOAuth(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return Response.redirect(`${url.origin}/?login=failed`, 302);
  const stateHash = await sha256(state);
  const saved = await env.DB.prepare("SELECT expires_at FROM oauth_states WHERE state_hash = ?").bind(stateHash).first();
  await env.DB.prepare("DELETE FROM oauth_states WHERE state_hash = ?").bind(stateHash).run();
  if (!saved || Number(saved.expires_at) <= Date.now()) return Response.redirect(`${url.origin}/?login=expired`, 302);

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", "user-agent": "algo-index-intake" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: oauthRedirectUri(request),
    }),
  });
  const tokenBody = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenBody.access_token) return Response.redirect(`${url.origin}/?login=failed`, 302);
  const user = await github("/user", tokenBody.access_token);
  if (!isAllowed(user.login)) return Response.redirect(`${url.origin}/?login=denied&user=${encodeURIComponent(user.login)}`, 302);

  const { owner, name } = SUBMITTERS.repository;
  const repository = await github(`/repos/${owner}/${name}`, tokenBody.access_token);
  if (!repository.permissions?.push) {
    return Response.redirect(`${url.origin}/?login=permission`, 302);
  }

  const rawSession = randomToken();
  const csrf = randomToken(24);
  const encrypted = await encrypt(tokenBody.access_token, env.SESSION_SECRET);
  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(Date.now()).run();
  await env.DB.prepare(
    "INSERT INTO sessions (session_hash, username, github_user_id, encrypted_access_token, token_nonce, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(await sha256(rawSession), user.login, String(user.id), encrypted.encrypted, encrypted.nonce, csrf, expiresAt, new Date().toISOString()).run();
  return new Response(null, { status: 302, headers: { location: `${url.origin}/`, "set-cookie": sessionCookie(rawSession) } });
}

function cleanLine(value, field, max = 160) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field}不能为空`);
  if (text.length > max || /[\r\n\0]/.test(text)) throw new Error(`${field}格式不正确`);
  return text;
}

function slugify(value, field) {
  const result = cleanLine(value, field).toLowerCase().replaceAll("_", "-")
    .replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!result) throw new Error(`${field}必须包含 ASCII 字母或数字`);
  return result;
}

function markdownCell(value) {
  return String(value || "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function validateSubmission(body) {
  if (!body || typeof body !== "object") throw new Error("提交内容格式不正确");
  const title = cleanLine(body.title, "题目名称", 200);
  const problemId = cleanLine(body.problem_id, "平台题号", 100);
  const englishName = slugify(body.english_name, "英文短名");
  const sourceId = slugify(body.source_id, "来源标识");
  const sourceName = cleanLine(body.source_name, "来源名称", 80);
  const url = String(body.url || "").trim();
  if (url && (!/^https:\/\//i.test(url) || url.length > 1000)) throw new Error("题目链接必须是 HTTPS 地址");
  const topicIds = new Set(TAXONOMY.categories.flatMap((category) => category.topics.map((topic) => topic.id)));
  const topics = Array.isArray(body.topics) ? [...new Set(body.topics.map(String))] : [];
  if (!topics.length || topics.length > 12 || topics.some((topic) => !topicIds.has(topic))) throw new Error("请选择 1–12 个有效知识点");
  const primaryTopic = String(body.primary_topic || "");
  if (!topics.includes(primaryTopic)) throw new Error("主要知识点必须包含在全部知识点中");
  if (!DIFFICULTIES.includes(body.difficulty_unified)) throw new Error("统一难度无效");
  if (!STATUSES.includes(body.status)) throw new Error("状态无效");
  const originalDifficulty = String(body.difficulty_original || "").trim();
  if (originalDifficulty.length > 100) throw new Error("平台原始难度过长");
  const timeLimit = Number(body.time_limit_seconds);
  if (!Number.isFinite(timeLimit) || timeLimit <= 0 || timeLimit > 120) throw new Error("运行超时必须在 0–120 秒之间");
  const sections = {};
  for (const [key, label] of Object.entries({ summary: "题目摘要", input_format: "输入格式", output_format: "输出格式", solution: "解题思路", proof: "正确性证明", pitfalls: "易错点与复盘", complexity: "复杂度" })) {
    sections[key] = String(body[key] || "").trim();
    if (!sections[key]) throw new Error(`${label}不能为空`);
    if (encoder.encode(sections[key]).byteLength > 100_000) throw new Error(`${label}内容过长`);
  }
  const code = String(body.code || "");
  if (!code.trim()) throw new Error("C++20 代码不能为空");
  if (encoder.encode(code).byteLength > 200_000) throw new Error("C++ 代码不能超过 200KB");
  if (!Array.isArray(body.tests) || body.tests.length < 1 || body.tests.length > 20) throw new Error("测试数据必须为 1–20 组");
  const tests = body.tests.map((test, index) => {
    const input = String(test?.input ?? "");
    const output = String(test?.output ?? "");
    if (encoder.encode(input).byteLength > 1_000_000 || encoder.encode(output).byteLength > 1_000_000) throw new Error(`第 ${index + 1} 组测试超过 1MB`);
    return { input, output };
  });
  const folder = `${sourceId}-${slugify(problemId, "平台题号")}-${englishName}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder) || folder.length > 180) throw new Error("生成的目录名无效或过长");
  return { title, problemId, englishName, sourceId, sourceName, url, topics, primaryTopic, originalDifficulty, timeLimit, sections, code, tests, folder, difficulty: body.difficulty_unified, status: body.status };
}

function buildFiles(value) {
  const topicMap = new Map(TAXONOMY.categories.flatMap((category) => category.topics.map((topic) => [topic.id, topic.name])));
  const metadata = {
    schema_version: 1,
    slug: value.folder,
    title: value.title,
    problem_id: value.problemId,
    url: value.url,
    source: { id: value.sourceId, name: value.sourceName },
    difficulty: { unified: value.difficulty, original: value.originalDifficulty },
    primary_topic: value.primaryTopic,
    topics: value.topics,
    status: value.status,
    cpp_standard: "C++20",
    time_limit_seconds: value.timeLimit,
    created_at: new Date().toISOString().slice(0, 10),
  };
  const link = value.url ? `[打开题目](${value.url})` : "—";
  const rows = [
    ["来源", value.sourceName], ["题号", value.problemId], ["题目链接", link],
    ["主要知识点", topicMap.get(value.primaryTopic)], ["全部知识点", value.topics.map((id) => topicMap.get(id)).join("、")],
    ["统一难度", value.difficulty], ["平台原始难度", value.originalDifficulty || "—"], ["状态", value.status],
    ["语言标准", "C++20"], ["运行超时", `${value.timeLimit} 秒`],
  ];
  const table = ["<!-- METADATA:START -->", "", "| 属性 | 内容 |", "|---|---|", ...rows.map(([key, item]) => `| ${key} | ${markdownCell(item)} |`), "", "<!-- METADATA:END -->"].join("\n");
  const readme = `# ${value.title}\n\n${table}\n\n## 题目描述\n\n${value.sections.summary}\n\n## 输入格式\n\n${value.sections.input_format}\n\n## 输出格式\n\n${value.sections.output_format}\n\n## 解题思路\n\n${value.sections.solution}\n\n## 正确性证明\n\n${value.sections.proof}\n\n## 易错点与复盘\n\n${value.sections.pitfalls}\n\n## 复杂度\n\n${value.sections.complexity}\n\n## 测试说明\n\n共提交 ${value.tests.length} 组输入输出测试。\n`;
  const files = [
    { path: `problems/${value.folder}/problem.json`, content: `${JSON.stringify(metadata, null, 2)}\n` },
    { path: `problems/${value.folder}/README.md`, content: readme },
    { path: `problems/${value.folder}/solution.cpp`, content: value.code.endsWith("\n") ? value.code : `${value.code}\n` },
  ];
  value.tests.forEach((test, index) => {
    const name = `test${String(index + 1).padStart(2, "0")}`;
    files.push({ path: `problems/${value.folder}/tests/${name}.in`, content: test.input });
    files.push({ path: `problems/${value.folder}/tests/${name}.out`, content: test.output });
  });
  return { metadata, files };
}

async function createSubmission(request, env, session) {
  if (request.headers.get("x-csrf-token") !== session.csrf_token) return json({ error: "安全令牌已失效，请刷新页面后重试。" }, 403);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 10_000_000) return json({ error: "整个请求不能超过 10MB。" }, 413);
  let value;
  try {
    const rawBody = await request.text();
    if (encoder.encode(rawBody).byteLength > 10_000_000) return json({ error: "整个请求不能超过 10MB。" }, 413);
    value = validateSubmission(JSON.parse(rawBody));
  } catch (error) { return json({ error: error instanceof SyntaxError ? "提交内容不是有效 JSON。" : error.message }, 400); }
  const { owner, name, default_branch: defaultBranch, reviewer } = SUBMITTERS.repository;
  try {
    const repository = await github(`/repos/${owner}/${name}`, session.token);
    if (!repository.permissions?.push) return json({ error: "你的仓库写入权限已被移除。" }, 403);
    try {
      await github(`/repos/${owner}/${name}/contents/problems/${value.folder}`, session.token);
      return json({ error: `题目目录 problems/${value.folder} 已存在。` }, 409);
    } catch (error) { if (error.status !== 404) throw error; }
    const ref = await github(`/repos/${owner}/${name}/git/ref/heads/${encodeURIComponent(defaultBranch)}`, session.token);
    const baseCommit = await github(`/repos/${owner}/${name}/git/commits/${ref.object.sha}`, session.token);
    const { files } = buildFiles(value);
    const treeItems = [];
    for (const file of files) {
      const blob = await github(`/repos/${owner}/${name}/git/blobs`, session.token, { method: "POST", body: JSON.stringify({ content: file.content, encoding: "utf-8" }) });
      treeItems.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await github(`/repos/${owner}/${name}/git/trees`, session.token, { method: "POST", body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: treeItems }) });
    const commit = await github(`/repos/${owner}/${name}/git/commits`, session.token, {
      method: "POST",
      body: JSON.stringify({ message: `添加题目：${value.title}`, tree: tree.sha, parents: [ref.object.sha] }),
    });
    const branch = `submission/${value.folder}-${Date.now().toString(36)}`;
    await github(`/repos/${owner}/${name}/git/refs`, session.token, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }) });
    const topicMap = new Map(TAXONOMY.categories.flatMap((category) => category.topics.map((topic) => [topic.id, topic.name])));
    const prBody = [
      "## 题目信息", "", `- 题目：${value.title}`, `- 来源 / 题号：${value.sourceName} / ${value.problemId}`,
      `- 统一难度：${value.difficulty}`, `- 平台原始难度：${value.originalDifficulty || "未填写"}`,
      `- 主要知识点：${topicMap.get(value.primaryTopic)}`, `- 全部知识点：${value.topics.map((id) => topicMap.get(id)).join("、")}`,
      `- 目录：\`problems/${value.folder}\``, `- 提交者：@${session.username}`, "", "## 审核清单", "",
      "- [ ] 题目信息与来源链接正确", "- [ ] 解法与正确性证明完整", "- [ ] C++20 代码通过编译和测试", "- [ ] 分类、难度与状态合适", "- [ ] 自动生成的索引已更新", "",
      "> 此 PR 由 ALGO INDEX 题目录入台创建；不会自动合并。",
    ].join("\n");
    const pull = await github(`/repos/${owner}/${name}/pulls`, session.token, {
      method: "POST",
      body: JSON.stringify({ title: `添加题目：${value.title}`, head: branch, base: defaultBranch, body: prBody, maintainer_can_modify: true }),
    });
    if (reviewer && reviewer.toLowerCase() !== session.username.toLowerCase()) {
      try {
        await github(`/repos/${owner}/${name}/pulls/${pull.number}/requested_reviewers`, session.token, { method: "POST", body: JSON.stringify({ reviewers: [reviewer] }) });
      } catch { /* PR exists even if reviewer assignment is unavailable. */ }
    }
    return json({ ok: true, number: pull.number, url: pull.html_url, path: `problems/${value.folder}` }, 201);
  } catch (error) {
    return json({ error: error.status === 422 ? "GitHub 拒绝了本次提交，可能存在同名分支或重复内容。" : `创建 Pull Request 失败：${error.message}` }, error.status && error.status < 500 ? error.status : 502);
  }
}

async function router(request, env) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/") return asset("index.html", "text/html");
  if (request.method === "GET" && url.pathname === "/styles.css") return asset("styles.css", "text/css");
  if (request.method === "GET" && url.pathname === "/app.js") return asset("app.js", "text/javascript");
  if (request.method === "GET" && url.pathname === "/auth/github") return beginOAuth(request, env);
  if (request.method === "GET" && url.pathname === "/auth/callback") return finishOAuth(request, env);
  if (request.method === "POST" && url.pathname === "/auth/logout") {
    const raw = getCookie(request, COOKIE_NAME);
    if (raw) await env.DB.prepare("DELETE FROM sessions WHERE session_hash = ?").bind(await sha256(raw)).run();
    return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
  }
  if (request.method === "GET" && url.pathname === "/api/session") {
    const session = await currentSession(request, env);
    return json(session ? { authenticated: true, username: session.username, csrf: session.csrf_token, taxonomy: TAXONOMY, repository: SUBMITTERS.repository } : { authenticated: false });
  }
  if (request.method === "POST" && url.pathname === "/api/submissions") {
    const session = await currentSession(request, env);
    if (!session) return json({ error: "请先使用获准的 GitHub 账号登录。" }, 401);
    return createSubmission(request, env, session);
  }
  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    try { return await router(request, env); }
    catch (error) { return json({ error: `服务暂时不可用：${error.message}` }, 500); }
  },
};
