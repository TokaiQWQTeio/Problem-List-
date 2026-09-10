const state = {
  data: null,
  topic: "",
  search: "",
  difficulty: "",
  source: "",
  status: "",
};

const elements = {
  categoryNav: document.querySelector("#categoryNav"),
  topicCount: document.querySelector("#topicCount"),
  stats: document.querySelector("#stats"),
  search: document.querySelector("#searchInput"),
  difficulty: document.querySelector("#difficultyFilter"),
  source: document.querySelector("#sourceFilter"),
  status: document.querySelector("#statusFilter"),
  reset: document.querySelector("#resetFilters"),
  summary: document.querySelector("#resultSummary"),
  grid: document.querySelector("#problemGrid"),
  empty: document.querySelector("#emptyState"),
  emptyTitle: document.querySelector("#emptyTitle"),
  emptyText: document.querySelector("#emptyText"),
  generated: document.querySelector("#generatedOn"),
  sidebar: document.querySelector(".sidebar"),
  mobileTopics: document.querySelector("#mobileTopics"),
  dialog: document.querySelector("#problemDialog"),
};

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function topicMap() {
  return new Map(state.data.categories.flatMap((category) =>
    category.topics.map((topic) => [topic.id, { ...topic, category: category.name }])
  ));
}

function categoryForTopic(topicId) {
  return state.data.categories.find((category) =>
    category.topics.some((topic) => topic.id === topicId)
  );
}

function populateSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function renderStats() {
  const problems = state.data.problems;
  const solved = problems.filter((problem) => problem.status === "已解决").length;
  const topicTotal = state.data.categories.reduce((sum, category) => sum + category.topics.length, 0);
  elements.stats.innerHTML = [
    [problems.length, "题目总数"],
    [solved, "已解决"],
    [topicTotal, "知识点"],
  ].map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
  elements.topicCount.textContent = `${topicTotal}`;
}

function categoryCount(category) {
  return state.data.problems.filter((problem) =>
    problem.topics.some((topic) => category.topics.some((item) => item.id === topic))
  ).length;
}

function renderCategories() {
  const all = document.createElement("button");
  all.className = `category-button${state.topic === "" ? " active" : ""}`;
  all.dataset.topic = "";
  all.innerHTML = `<span>全部题目</span><span class="category-count">${state.data.problems.length}</span>`;
  elements.categoryNav.replaceChildren(all);
  state.data.categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `category-button${state.topic === category.id ? " active" : ""}`;
    button.dataset.topic = category.id;
    button.innerHTML = `<span>${escapeHtml(category.name)}</span><span class="category-count">${categoryCount(category)}</span>`;
    elements.categoryNav.append(button);
  });
}

function statusClass(status) {
  return { "已解决": "solved", "需复习": "review", "尝试中": "trying" }[status] || "";
}

function filteredProblems() {
  const topics = topicMap();
  const query = state.search.trim().toLocaleLowerCase("zh-CN");
  return state.data.problems.filter((problem) => {
    const category = state.topic
      ? state.data.categories.find((item) => item.id === state.topic)
      : null;
    const matchesTopic = !category || problem.topics.some((topic) =>
      category.topics.some((item) => item.id === topic)
    );
    const haystack = [
      problem.title,
      problem.problem_id,
      problem.source.name,
      ...problem.topics.map((topic) => topics.get(topic)?.name || topic),
    ].join(" ").toLocaleLowerCase("zh-CN");
    return matchesTopic
      && (!query || haystack.includes(query))
      && (!state.difficulty || problem.difficulty.unified === state.difficulty)
      && (!state.source || problem.source.name === state.source)
      && (!state.status || problem.status === state.status);
  });
}

function renderProblems() {
  const problems = filteredProblems();
  const topics = topicMap();
  const selectedCategory = state.topic
    ? state.data.categories.find((category) => category.id === state.topic)?.name
    : "全部知识点";
  elements.summary.textContent = `${selectedCategory} · ${problems.length} 道题`;
  elements.grid.replaceChildren();
  problems.forEach((problem) => {
    const card = document.createElement("article");
    card.className = "problem-card";
    card.innerHTML = `
      <div class="card-top">
        <span>${escapeHtml(problem.source.name)} · ${escapeHtml(problem.difficulty.unified)}</span>
        <span class="status ${statusClass(problem.status)}">${escapeHtml(problem.status)}</span>
      </div>
      <h2>${escapeHtml(problem.title)}</h2>
      <div class="problem-id">${escapeHtml(problem.problem_id)} · ${escapeHtml(problem.difficulty.original || "未标原始难度")}</div>
      <div class="topic-tags">${problem.topics.slice(0, 4).map((topic) => `<span class="tag">${escapeHtml(topics.get(topic)?.name || topic)}</span>`).join("")}</div>
      <button class="card-action" type="button" data-problem="${escapeHtml(problem.directory)}"><span>查看题解与代码</span><span aria-hidden="true">→</span></button>
    `;
    elements.grid.append(card);
  });
  const isBankEmpty = state.data.problems.length === 0;
  elements.empty.hidden = problems.length !== 0;
  if (!isBankEmpty && problems.length === 0) {
    elements.emptyTitle.textContent = "没有匹配的题目";
    elements.emptyText.textContent = "尝试缩短关键词，或清除部分筛选条件。";
  } else {
    elements.emptyTitle.textContent = "题库还是空的";
    elements.emptyText.innerHTML = "运行 <code>python problem_bank.py add</code> 添加第一道题，网站数据会随索引自动更新。";
  }
}

function render() {
  renderCategories();
  renderProblems();
}

function showPanel(name) {
  document.querySelectorAll(".detail-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === name);
  });
  document.querySelector("#notesPanel").hidden = name !== "notes";
  document.querySelector("#codePanel").hidden = name !== "code";
}

function openProblem(directory) {
  const problem = state.data.problems.find((item) => item.directory === directory);
  if (!problem) return;
  const topics = topicMap();
  document.querySelector("#dialogKicker").textContent = `${problem.source.name} / ${problem.problem_id}`;
  document.querySelector("#dialogTitle").textContent = problem.title;
  const meta = [
    problem.difficulty.unified,
    problem.difficulty.original || "未标原始难度",
    problem.status,
    ...problem.topics.map((topic) => topics.get(topic)?.name || topic),
  ].map((value) => `<span class="meta-pill">${escapeHtml(value)}</span>`);
  const externalUrl = safeExternalUrl(problem.url);
  if (externalUrl) meta.push(`<a href="${escapeHtml(externalUrl)}" target="_blank" rel="noreferrer">打开原题 ↗</a>`);
  const editUrl = `https://problem-list-intake.acmtokaiteio.chatgpt.site/?edit=${encodeURIComponent(problem.directory)}`;
  meta.push(`<a href="${escapeHtml(editUrl)}" target="_blank" rel="noreferrer">修改题目 ↗</a>`);
  document.querySelector("#dialogMeta").innerHTML = meta.join("");
  document.querySelector("#notesPanel").innerHTML = problem.notes
    ? `<div class="notes-content">${renderMarkdown(problem.notes)}</div>`
    : `<p class="notes-placeholder">这道题还没有填写题解笔记。</p>`;
  document.querySelector("#solutionCode").textContent = problem.solution || "// 暂无代码";
  showPanel("notes");
  elements.dialog.showModal();
}

function bindEvents() {
  elements.categoryNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    state.topic = button.dataset.topic;
    elements.sidebar.classList.remove("open");
    render();
  });
  elements.search.addEventListener("input", (event) => { state.search = event.target.value; renderProblems(); });
  [[elements.difficulty, "difficulty"], [elements.source, "source"], [elements.status, "status"]].forEach(([element, key]) => {
    element.addEventListener("change", (event) => { state[key] = event.target.value; renderProblems(); });
  });
  elements.reset.addEventListener("click", () => {
    state.topic = state.search = state.difficulty = state.source = state.status = "";
    elements.search.value = elements.difficulty.value = elements.source.value = elements.status.value = "";
    render();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
      event.preventDefault();
      elements.search.focus();
    }
    if (event.key === "Escape") elements.sidebar.classList.remove("open");
  });
  elements.grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-problem]");
    if (button) openProblem(button.dataset.problem);
  });
  elements.mobileTopics.addEventListener("click", () => elements.sidebar.classList.toggle("open"));
  document.querySelector("#closeDialog").addEventListener("click", () => elements.dialog.close());
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) elements.dialog.close();
  });
  document.querySelectorAll(".detail-tab").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.panel));
  });
  document.querySelector("#copyCode").addEventListener("click", async (event) => {
    await navigator.clipboard.writeText(document.querySelector("#solutionCode").textContent);
    event.target.textContent = "已复制";
    setTimeout(() => { event.target.textContent = "复制代码"; }, 1200);
  });
}

function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const categories = state.data.categories.map((category) => category.id);
  const sources = [...new Set(state.data.problems.map((problem) => problem.source.name))];
  const tool = {
    name: "filter_problem_bank",
    title: "筛选编程题库",
    description: "按关键词、算法分类、统一难度、来源或学习状态筛选当前可见的题目。",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "题名、题号、来源或知识点关键词" },
        topic: { type: "string", description: "一级算法分类 ID；空字符串表示全部" },
        difficulty: { type: "string", description: "统一难度；空字符串表示全部" },
        source: { type: "string", description: "来源名称；空字符串表示全部" },
        status: { type: "string", description: "学习状态；空字符串表示全部" },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("输入必须是对象");
      const allowed = new Set(["search", "topic", "difficulty", "source", "status"]);
      if (Object.keys(input).some((key) => !allowed.has(key))) throw new Error("包含未知筛选字段");
      for (const [key, value] of Object.entries(input)) {
        if (typeof value !== "string") throw new Error(`${key} 必须是字符串`);
      }
      if (input.topic && !categories.includes(input.topic)) throw new Error("未知算法分类");
      if (input.difficulty && !state.data.difficulties.includes(input.difficulty)) throw new Error("未知难度");
      if (input.source && !sources.includes(input.source)) throw new Error("未知来源");
      if (input.status && !state.data.statuses.includes(input.status)) throw new Error("未知状态");
      ["search", "topic", "difficulty", "source", "status"].forEach((key) => {
        if (key in input) state[key] = input[key];
      });
      elements.search.value = state.search;
      elements.difficulty.value = state.difficulty;
      elements.source.value = state.source;
      elements.status.value = state.status;
      render();
      return { count: filteredProblems().length, filters: {
        search: state.search, topic: state.topic, difficulty: state.difficulty,
        source: state.source, status: state.status,
      } };
    },
  };
  try {
    Promise.resolve(context.registerTool(tool)).catch((error) => console.error("WebMCP registration failed", error));
  } catch (error) {
    console.error("WebMCP registration failed", error);
  }
}

async function init() {
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    elements.generated.textContent = `更新于 ${state.data.generated_on}`;
    populateSelect(elements.difficulty, state.data.difficulties);
    populateSelect(elements.status, state.data.statuses);
    populateSelect(elements.source, [...new Set(state.data.problems.map((problem) => problem.source.name))].sort());
    renderStats();
    render();
    bindEvents();
    registerWebMCP();
  } catch (error) {
    elements.summary.textContent = "题库数据读取失败";
    elements.empty.hidden = false;
    elements.emptyTitle.textContent = "无法读取题库数据";
    elements.emptyText.textContent = "请先运行 python problem_bank.py index，并通过静态文件服务器打开网站。";
    console.error(error);
  }
}

init();
