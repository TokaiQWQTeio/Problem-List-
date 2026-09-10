const NEW_DRAFT_KEY = "algo-index-intake-draft-v1";
const stepNames = ["基本信息", "分类难度", "题解内容", "C++20", "测试数据", "预览提交"];
const editDirectory = new URLSearchParams(location.search).get("edit") || "";
const state = {
  step: 0,
  session: null,
  taxonomy: null,
  mode: editDirectory ? "edit" : "create",
  editDirectory,
  baseSha: "",
  original: null,
  tests: [{ name: "test01", input: "", output: "" }],
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const form = $("#problem-form");

function show(id) {
  ["loading", "login", "workspace"].forEach((name) => $(`#${name}`).classList.toggle("hidden", name !== id));
}

function loginMessage() {
  const code = new URLSearchParams(location.search).get("login");
  const messages = {
    failed: "GitHub 登录失败，请重新尝试。",
    expired: "登录请求已过期，请重新发起。",
    denied: `GitHub 账号 ${new URLSearchParams(location.search).get("user") || ""} 不在提交者白名单中。`,
    permission: "该账号没有题库仓库的 Write 权限。",
  };
  if (messages[code]) {
    const element = $("#login-message");
    element.textContent = messages[code];
    element.classList.remove("hidden");
    element.classList.add("error");
  }
}

function draftKey() {
  return state.mode === "edit" ? `algo-index-edit-draft-v1:${state.editDirectory}` : NEW_DRAFT_KEY;
}

async function initialize() {
  try {
    if (state.editDirectory) $("#github-login").href = `/auth/github?return_to=${encodeURIComponent(`/?edit=${state.editDirectory}`)}`;
    const response = await fetch("/api/session");
    const data = await response.json();
    if (!data.authenticated) { show("login"); loginMessage(); return; }
    state.session = data;
    state.taxonomy = data.taxonomy;
    $("#username").textContent = `@${data.username}`;
    renderSteps();
    renderTopics();
    if (state.mode === "edit") await loadProblemForEdit();
    loadDraft();
    renderTests();
    bindEvents();
    updateStep();
    registerPageTools();
    show("workspace");
  } catch (error) {
    if (state.session) {
      show("loading");
      $("#loading p").textContent = error.message || "无法载入题目信息，请稍后重试。";
    } else {
      show("login");
      const message = $("#login-message");
      message.textContent = "暂时无法连接录入服务，请稍后重试。";
      message.classList.remove("hidden");
      message.classList.add("error");
    }
  }
}

function renderSteps() {
  $("#steps").innerHTML = stepNames.map((name, index) => `<button type="button" class="step" data-target="${index}"><strong>0${index + 1}</strong>${name}</button>`).join("");
}

function renderTopics() {
  $("#topics").innerHTML = state.taxonomy.categories.map((category) => `
    <section class="topic-group"><h3>${escapeHtml(category.name)}</h3><div class="topic-checks">
      ${category.topics.map((topic) => `<label class="topic-check"><input type="checkbox" name="topics" value="${escapeHtml(topic.id)}"><span>${escapeHtml(topic.name)}</span></label>`).join("")}
    </div></section>`).join("");
}

async function loadProblemForEdit() {
  const response = await fetch(`/api/problems/${encodeURIComponent(state.editDirectory)}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "无法载入题目信息。");
  state.baseSha = result.base_sha;
  state.original = result.problem;
  populateForm(result.problem);
  $("#workspace-eyebrow").textContent = "EDIT PROBLEM";
  $("#workspace-title").textContent = "修改题目";
  document.title = `修改 ${result.problem.problem_id} · ALGO INDEX`;
  $("#change-summary-row").classList.remove("hidden");
  form.elements.namedItem("change_summary").required = true;
  $("#confirmation-text").textContent = "我已核对本次修改，同意通过 Pull Request 接受审核；系统不会自动合并。";
  $("#submit-label").textContent = "创建修改 Pull Request";
}

function populateForm(problem) {
  form.reset();
  for (const [name, value] of Object.entries(problem || {})) {
    if (["topics", "tests"].includes(name)) continue;
    const field = form.elements.namedItem(name);
    if (field && typeof value !== "object") field.value = value ?? "";
  }
  $$("input[name=topics]").forEach((checkbox) => { checkbox.checked = (problem.topics || []).includes(checkbox.value); });
  syncTopics();
  $("#primary-topic").value = problem.primary_topic || "";
  state.tests = (problem.tests || []).map((test, index) => ({
    name: test.name || `test${String(index + 1).padStart(2, "0")}`,
    input: test.input || "",
    output: test.output || "",
  }));
  if (!state.tests.length) state.tests = [{ name: "test01", input: "", output: "" }];
}

function bindEvents() {
  $("#next").addEventListener("click", () => { if (validateStep()) { state.step += 1; updateStep(); } });
  $("#previous").addEventListener("click", () => { state.step -= 1; updateStep(); });
  $("#steps").addEventListener("click", (event) => {
    const button = event.target.closest("[data-target]");
    if (!button) return;
    const target = Number(button.dataset.target);
    if (target <= state.step || validateStep()) { state.step = target; updateStep(); }
  });
  form.addEventListener("input", () => { syncTopics(); updateCodeSize(); saveDraft(); });
  form.addEventListener("change", () => { syncTopics(); saveDraft(); });
  form.addEventListener("submit", submitProblem);
  $("#add-test").addEventListener("click", () => { if (state.tests.length < 20) { state.tests.push({ name: nextTestName(), input: "", output: "" }); renderTests(); saveDraft(); } });
  $("#tests").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-test]");
    if (!button || state.tests.length === 1) return;
    readTests(); state.tests.splice(Number(button.dataset.removeTest), 1); renderTests(); saveDraft();
  });
  $("#tests").addEventListener("input", () => { readTests(); saveDraft(); });
  $("#clear-draft").addEventListener("click", () => {
    if (!confirm("清除这台浏览器中保存的草稿？")) return;
    localStorage.removeItem(draftKey());
    if (state.mode === "edit") populateForm(state.original);
    else { form.reset(); state.tests = [{ name: "test01", input: "", output: "" }]; }
    renderTests(); syncTopics(); updateCodeSize();
  });
  $("#logout").addEventListener("click", async () => { await fetch("/auth/logout", { method: "POST" }); location.reload(); });
}

function updateStep() {
  state.step = Math.max(0, Math.min(stepNames.length - 1, state.step));
  $$(".form-step").forEach((element, index) => element.classList.toggle("hidden", index !== state.step));
  $$(".step").forEach((element, index) => {
    element.classList.toggle("active", index === state.step);
    element.classList.toggle("done", index < state.step);
  });
  $("#previous").classList.toggle("hidden", state.step === 0);
  $("#next").classList.toggle("hidden", state.step === stepNames.length - 1);
  if (state.step === stepNames.length - 1) renderPreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateStep() {
  const section = $(`.form-step[data-step="${state.step}"]`);
  for (const field of $$('input:not([type="checkbox"]), select, textarea', section)) {
    if (!field.checkValidity()) { field.reportValidity(); field.focus(); return false; }
  }
  if (state.step === 1) {
    const selected = $$("input[name=topics]:checked");
    if (!selected.length) { alert("请至少选择一个知识点。"); return false; }
    if (!$("#primary-topic").value) { alert("请选择主要知识点。"); return false; }
  }
  if (state.step === 3 && new TextEncoder().encode($("#code").value).length > 200_000) { alert("C++ 代码不能超过 200KB。"); return false; }
  if (state.step === 4) {
    readTests();
    if (!state.tests.length) { alert("请至少添加一组测试。"); return false; }
    if (state.tests.some((test) => new TextEncoder().encode(test.input).length > 1_000_000 || new TextEncoder().encode(test.output).length > 1_000_000)) { alert("每个输入或输出文件不能超过 1MB。"); return false; }
  }
  return true;
}

function syncTopics() {
  const selected = $$("input[name=topics]:checked").map((item) => item.value);
  const select = $("#primary-topic");
  const current = select.value;
  const names = new Map(state.taxonomy.categories.flatMap((category) => category.topics.map((topic) => [topic.id, topic.name])));
  select.innerHTML = `<option value="">请选择</option>${selected.map((id) => `<option value="${escapeHtml(id)}">${escapeHtml(names.get(id))}</option>`).join("")}`;
  select.value = selected.includes(current) ? current : (selected[0] || "");
}

function renderTests() {
  $("#tests").innerHTML = state.tests.map((test, index) => `
    <section class="test-card"><div class="test-head"><h3>${escapeHtml(test.name || `test${String(index + 1).padStart(2, "0")}`)}</h3><button type="button" class="text-button" data-remove-test="${index}" ${state.tests.length === 1 ? "disabled" : ""}>移除</button></div>
    <div class="test-grid"><label>输入<textarea data-test-input="${index}" spellcheck="false">${escapeHtml(test.input)}</textarea></label><label>期望输出<textarea data-test-output="${index}" spellcheck="false">${escapeHtml(test.output)}</textarea></label></div></section>`).join("");
}

function readTests() {
  state.tests = $$(".test-card").map((card, index) => ({ name: state.tests[index]?.name || nextTestName(), input: $("[data-test-input]", card).value, output: $("[data-test-output]", card).value }));
}

function nextTestName() {
  const used = new Set(state.tests.map((test) => test.name));
  for (let index = 1; index <= 99; index += 1) {
    const name = `test${String(index).padStart(2, "0")}`;
    if (!used.has(name)) return name;
  }
  return `test${Date.now()}`;
}

function formData() {
  readTests();
  const data = Object.fromEntries(new FormData(form).entries());
  data.topics = $$("input[name=topics]:checked").map((item) => item.value);
  data.tests = state.tests;
  data.time_limit_seconds = Number(data.time_limit_seconds);
  data.mode = state.mode;
  if (state.mode === "edit") {
    data.original_folder = state.editDirectory;
    data.base_sha = state.baseSha;
  }
  delete data.confirm;
  return data;
}

function saveDraft() {
  clearTimeout(saveDraft.timer);
  saveDraft.timer = setTimeout(() => localStorage.setItem(draftKey(), JSON.stringify({ fields: formData(), step: state.step })), 250);
}

function loadDraft() {
  let draft;
  try { draft = JSON.parse(localStorage.getItem(draftKey())); } catch { return; }
  if (!draft?.fields) return;
  if (state.mode === "edit" && draft.fields.base_sha !== state.baseSha) {
    localStorage.removeItem(draftKey());
    return;
  }
  for (const [name, value] of Object.entries(draft.fields)) {
    if (["topics", "tests"].includes(name)) continue;
    const field = form.elements.namedItem(name);
    if (field && typeof value !== "object") field.value = value;
  }
  for (const id of draft.fields.topics || []) {
    const checkbox = $$('input[name="topics"]').find((item) => item.value === id);
    if (checkbox) checkbox.checked = true;
  }
  syncTopics();
  if (draft.fields.primary_topic) $("#primary-topic").value = draft.fields.primary_topic;
  state.tests = Array.isArray(draft.fields.tests) && draft.fields.tests.length
    ? draft.fields.tests.slice(0, 20).map((test, index) => ({ name: test.name || `test${String(index + 1).padStart(2, "0")}`, input: test.input || "", output: test.output || "" }))
    : state.tests;
  state.step = Math.max(0, Math.min(5, Number(draft.step) || 0));
  updateCodeSize();
}

function updateCodeSize() {
  const size = new TextEncoder().encode($("#code").value).length;
  $("#code-size").textContent = `${(size / 1024).toFixed(1)} KB / 200 KB`;
}

function renderPreview() {
  const data = formData();
  const names = new Map(state.taxonomy.categories.flatMap((category) => category.topics.map((topic) => [topic.id, topic.name])));
  const path = `problems/${slug(data.source_id)}-${slug(data.problem_id)}-${slug(data.english_name)}`;
  if (state.mode === "edit") {
    renderEditPreview(data, path, names);
    return;
  }
  $("#preview").innerHTML = `
    <section class="preview-block"><h3>题目</h3><p>${escapeHtml(data.title || "—")} · ${escapeHtml(data.source_name || "—")} ${escapeHtml(data.problem_id || "")}</p><p>${escapeHtml(data.url || "无来源链接")}</p></section>
    <section class="preview-block"><h3>分类</h3><p>${escapeHtml(data.difficulty_unified || "—")} / ${escapeHtml(data.difficulty_original || "未填写")} · ${escapeHtml(data.status || "—")}</p><p>${escapeHtml(data.topics.map((id) => names.get(id) || id).join("、") || "—")}</p></section>
    <section class="preview-block"><h3>将创建</h3><p>${escapeHtml(path)}</p><p>README.md · problem.json · solution.cpp · ${data.tests.length * 2} 个测试文件</p></section>`;
}

function renderEditPreview(data, path, names) {
  const original = state.original;
  const fields = [
    ["题目名称", "title"], ["平台题号", "problem_id"], ["英文短名", "english_name"],
    ["题目链接", "url"], ["来源名称", "source_name"], ["来源标识", "source_id"],
    ["统一难度", "difficulty_unified"], ["平台原始难度", "difficulty_original"],
    ["状态", "status"], ["运行超时", "time_limit_seconds"], ["主要知识点", "primary_topic"],
  ];
  const metadataChanges = fields.flatMap(([label, key]) => {
    const before = key === "primary_topic" ? (names.get(original[key]) || original[key]) : original[key];
    const after = key === "primary_topic" ? (names.get(data[key]) || data[key]) : data[key];
    return String(before ?? "") === String(after ?? "") ? [] : [[label, before, after]];
  });
  const oldTopics = (original.topics || []).map((id) => names.get(id) || id).join("、");
  const newTopics = (data.topics || []).map((id) => names.get(id) || id).join("、");
  if (oldTopics !== newTopics) metadataChanges.push(["全部知识点", oldTopics, newTopics]);

  const contentFields = [
    ["题目摘要", "summary"], ["输入格式", "input_format"], ["输出格式", "output_format"],
    ["解题思路", "solution"], ["正确性证明", "proof"], ["易错点与复盘", "pitfalls"],
    ["复杂度", "complexity"], ["测试说明", "test_notes"], ["C++20 代码", "code"],
  ];
  const contentChanges = contentFields
    .filter(([, key]) => String(original[key] ?? "") !== String(data[key] ?? ""))
    .map(([label, key]) => `<details class="diff-file"><summary>${escapeHtml(label)}</summary>${renderLineDiff(original[key], data[key])}</details>`)
    .join("");

  const oldTests = new Map((original.tests || []).map((test) => [test.name, test]));
  const newTests = new Map((data.tests || []).map((test) => [test.name, test]));
  const testChanges = [];
  for (const [name, test] of newTests) {
    const old = oldTests.get(name);
    if (!old) testChanges.push(`<li class="diff-add">＋ 新增 ${escapeHtml(name)}.in / .out</li>`);
    else if (old.input !== test.input || old.output !== test.output) testChanges.push(`<li class="diff-change">≈ 修改 ${escapeHtml(name)}.in / .out</li>`);
  }
  for (const name of oldTests.keys()) {
    if (!newTests.has(name)) testChanges.push(`<li class="diff-remove">− 删除 ${escapeHtml(name)}.in / .out</li>`);
  }

  const pathChanged = `problems/${state.editDirectory}` !== path;
  const changed = metadataChanges.length || contentChanges || testChanges.length || pathChanged;
  $("#preview").innerHTML = `
    <section class="preview-block"><h3>修改目标</h3><p>${escapeHtml(original.title)} · ${escapeHtml(original.source_name)} ${escapeHtml(original.problem_id)}</p><p>${escapeHtml(`problems/${state.editDirectory}`)}</p></section>
    ${pathChanged ? `<section class="preview-block path-warning"><h3>目录迁移</h3><p class="diff-remove">− problems/${escapeHtml(state.editDirectory)}</p><p class="diff-add">＋ ${escapeHtml(path)}</p></section>` : ""}
    <section class="preview-block"><h3>元数据变化</h3>${metadataChanges.length ? `<div class="field-diff">${metadataChanges.map(([label, before, after]) => `<div><strong>${escapeHtml(label)}</strong><span class="diff-remove">${escapeHtml(before || "（空）")}</span><span aria-hidden="true">→</span><span class="diff-add">${escapeHtml(after || "（空）")}</span></div>`).join("")}</div>` : "<p>没有变化</p>"}</section>
    ${contentChanges ? `<section class="preview-block"><h3>题解与代码变化</h3>${contentChanges}</section>` : ""}
    ${testChanges.length ? `<section class="preview-block"><h3>测试数据变化</h3><ul class="test-diff">${testChanges.join("")}</ul></section>` : ""}
    ${changed ? "" : '<section class="preview-block no-change"><h3>尚未修改</h3><p>当前内容与仓库版本完全相同。</p></section>'}`;
}

function renderLineDiff(beforeValue, afterValue) {
  const before = String(beforeValue ?? "").replace(/\r\n?/g, "\n").split("\n");
  const after = String(afterValue ?? "").replace(/\r\n?/g, "\n").split("\n");
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix
    && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix += 1;
  const contextStart = Math.max(0, prefix - 2);
  const beforeEnd = Math.min(before.length, before.length - suffix + 2);
  const afterEnd = Math.min(after.length, after.length - suffix + 2);
  const rows = [];
  if (contextStart > 0) rows.push(["…", `${contextStart} 行未变化`, "diff-context"]);
  before.slice(contextStart, beforeEnd).forEach((line, index) => {
    const absolute = contextStart + index;
    rows.push(absolute < prefix || absolute >= before.length - suffix ? [" ", line, "diff-context"] : ["−", line, "diff-remove"]);
  });
  after.slice(prefix, afterEnd).forEach((line, index) => {
    const absolute = prefix + index;
    if (absolute < after.length - suffix) rows.push(["+", line, "diff-add"]);
  });
  if (suffix > 2) rows.push(["…", `${suffix - 2} 行未变化`, "diff-context"]);
  const limited = rows.slice(0, 240);
  if (rows.length > limited.length) limited.push(["…", `另有 ${rows.length - limited.length} 行变化，请在 Pull Request 中查看完整差异`, "diff-context"]);
  return `<pre class="line-diff">${limited.map(([mark, line, className]) => `<span class="${className}"><b>${mark}</b>${escapeHtml(line)}</span>`).join("\n")}</pre>`;
}

async function submitProblem(event) {
  event.preventDefault();
  if (!validateStep() || !$("#confirm").checked) { $("#confirm").reportValidity(); return; }
  const button = $("#submit");
  const message = $("#submit-message");
  button.disabled = true; button.firstChild.textContent = "正在创建… ";
  message.classList.add("hidden");
  try {
    const endpoint = state.mode === "edit" ? "/api/edits" : "/api/submissions";
    const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": state.session.csrf }, body: JSON.stringify(formData()) });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.error || "提交失败");
      error.url = result.url || "";
      throw error;
    }
    localStorage.removeItem(draftKey());
    message.innerHTML = `Pull Request #${result.number} 已创建：<a href="${escapeHtml(result.url)}" target="_blank" rel="noopener">前往 GitHub 审核 ↗</a><br>${escapeHtml(result.path)}`;
    message.className = "message success";
    button.classList.add("hidden");
  } catch (error) {
    if (error.url) message.innerHTML = `${escapeHtml(error.message)} <a href="${escapeHtml(error.url)}" target="_blank" rel="noopener">查看现有 Pull Request ↗</a>`;
    else message.textContent = error.message;
    message.className = "message error";
    button.disabled = false; $("#submit-label").textContent = state.mode === "edit" ? "创建修改 Pull Request" : "创建 Pull Request";
  }
}

function slug(value) {
  return String(value || "").trim().toLowerCase().replaceAll("_", "-").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function registerPageTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const stepIds = ["basic", "classification", "editorial", "code", "tests", "review"];
  void Promise.resolve(context.registerTool({
    name: "open_problem_entry_step",
    title: "打开题目录入步骤",
    description: "在已登录的题目录入台中打开指定表单步骤；只改变当前页面，不会提交或创建 Pull Request。",
    inputSchema: {
      type: "object",
      properties: { step: { type: "string", enum: stepIds } },
      required: ["step"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const target = stepIds.indexOf(input?.step);
      if (target < 0) throw new Error("未知的录入步骤");
      state.step = target;
      updateStep();
      return { step: input.step, title: stepNames[target] };
    },
  })).catch(() => {});
}

initialize();
