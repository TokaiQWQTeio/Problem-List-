const DRAFT_KEY = "algo-index-intake-draft-v1";
const stepNames = ["基本信息", "分类难度", "题解内容", "C++20", "测试数据", "预览提交"];
const state = { step: 0, session: null, taxonomy: null, tests: [{ input: "", output: "" }] };
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

async function initialize() {
  try {
    const response = await fetch("/api/session");
    const data = await response.json();
    if (!data.authenticated) { show("login"); loginMessage(); return; }
    state.session = data;
    state.taxonomy = data.taxonomy;
    $("#username").textContent = `@${data.username}`;
    renderSteps();
    renderTopics();
    loadDraft();
    renderTests();
    bindEvents();
    updateStep();
    registerPageTools();
    show("workspace");
  } catch {
    show("login");
    const message = $("#login-message");
    message.textContent = "暂时无法连接录入服务，请稍后重试。";
    message.classList.remove("hidden");
    message.classList.add("error");
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
  $("#add-test").addEventListener("click", () => { if (state.tests.length < 20) { state.tests.push({ input: "", output: "" }); renderTests(); saveDraft(); } });
  $("#tests").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-test]");
    if (!button || state.tests.length === 1) return;
    readTests(); state.tests.splice(Number(button.dataset.removeTest), 1); renderTests(); saveDraft();
  });
  $("#tests").addEventListener("input", () => { readTests(); saveDraft(); });
  $("#clear-draft").addEventListener("click", () => {
    if (!confirm("清除这台浏览器中保存的录入草稿？")) return;
    localStorage.removeItem(DRAFT_KEY); form.reset(); state.tests = [{ input: "", output: "" }]; renderTests(); syncTopics(); updateCodeSize();
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
    <section class="test-card"><div class="test-head"><h3>TEST ${String(index + 1).padStart(2, "0")}</h3><button type="button" class="text-button" data-remove-test="${index}" ${state.tests.length === 1 ? "disabled" : ""}>移除</button></div>
    <div class="test-grid"><label>输入<textarea data-test-input="${index}" spellcheck="false">${escapeHtml(test.input)}</textarea></label><label>期望输出<textarea data-test-output="${index}" spellcheck="false">${escapeHtml(test.output)}</textarea></label></div></section>`).join("");
}

function readTests() {
  state.tests = $$(".test-card").map((card) => ({ input: $("[data-test-input]", card).value, output: $("[data-test-output]", card).value }));
}

function formData() {
  readTests();
  const data = Object.fromEntries(new FormData(form).entries());
  data.topics = $$("input[name=topics]:checked").map((item) => item.value);
  data.tests = state.tests;
  data.time_limit_seconds = Number(data.time_limit_seconds);
  delete data.confirm;
  return data;
}

function saveDraft() {
  clearTimeout(saveDraft.timer);
  saveDraft.timer = setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify({ fields: formData(), step: state.step })), 250);
}

function loadDraft() {
  let draft;
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return; }
  if (!draft?.fields) return;
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
  state.tests = Array.isArray(draft.fields.tests) && draft.fields.tests.length ? draft.fields.tests.slice(0, 20) : state.tests;
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
  $("#preview").innerHTML = `
    <section class="preview-block"><h3>题目</h3><p>${escapeHtml(data.title || "—")} · ${escapeHtml(data.source_name || "—")} ${escapeHtml(data.problem_id || "")}</p><p>${escapeHtml(data.url || "无来源链接")}</p></section>
    <section class="preview-block"><h3>分类</h3><p>${escapeHtml(data.difficulty_unified || "—")} / ${escapeHtml(data.difficulty_original || "未填写")} · ${escapeHtml(data.status || "—")}</p><p>${escapeHtml(data.topics.map((id) => names.get(id) || id).join("、") || "—")}</p></section>
    <section class="preview-block"><h3>将创建</h3><p>${escapeHtml(path)}</p><p>README.md · problem.json · solution.cpp · ${data.tests.length * 2} 个测试文件</p></section>`;
}

async function submitProblem(event) {
  event.preventDefault();
  if (!validateStep() || !$("#confirm").checked) { $("#confirm").reportValidity(); return; }
  const button = $("#submit");
  const message = $("#submit-message");
  button.disabled = true; button.firstChild.textContent = "正在创建… ";
  message.classList.add("hidden");
  try {
    const response = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": state.session.csrf }, body: JSON.stringify(formData()) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "提交失败");
    localStorage.removeItem(DRAFT_KEY);
    message.innerHTML = `Pull Request #${result.number} 已创建：<a href="${escapeHtml(result.url)}" target="_blank" rel="noopener">前往 GitHub 审核 ↗</a><br>${escapeHtml(result.path)}`;
    message.className = "message success";
    button.classList.add("hidden");
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
    button.disabled = false; button.firstChild.textContent = "创建 Pull Request ";
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
