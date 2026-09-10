const TAXONOMY = {"categories":[{"id":"fundamentals","name":"基础算法","topics":[{"id":"fundamentals.simulation","name":"模拟"},{"id":"fundamentals.enumeration","name":"枚举"},{"id":"fundamentals.sorting","name":"排序"},{"id":"fundamentals.binary_search","name":"二分"},{"id":"fundamentals.two_pointers","name":"双指针"},{"id":"fundamentals.prefix_sum","name":"前缀和与差分"},{"id":"fundamentals.divide_conquer","name":"分治"},{"id":"fundamentals.bitwise","name":"位运算"},{"id":"fundamentals.coordinate_compression","name":"离散化"}]},{"id":"data_structures","name":"数据结构","topics":[{"id":"data_structures.stack","name":"栈"},{"id":"data_structures.queue","name":"队列与双端队列"},{"id":"data_structures.linked_list","name":"链表"},{"id":"data_structures.heap","name":"堆与优先队列"},{"id":"data_structures.hash","name":"哈希表"},{"id":"data_structures.disjoint_set","name":"并查集"},{"id":"data_structures.fenwick_tree","name":"树状数组"},{"id":"data_structures.segment_tree","name":"线段树"},{"id":"data_structures.sparse_table","name":"ST 表"},{"id":"data_structures.balanced_tree","name":"平衡树"},{"id":"data_structures.trie","name":"Trie"},{"id":"data_structures.persistent","name":"可持久化数据结构"}]},{"id":"search","name":"搜索","topics":[{"id":"search.dfs","name":"深度优先搜索"},{"id":"search.bfs","name":"广度优先搜索"},{"id":"search.backtracking","name":"回溯"},{"id":"search.pruning","name":"剪枝"},{"id":"search.bidirectional","name":"双向搜索"},{"id":"search.iterative_deepening","name":"迭代加深"},{"id":"search.heuristic","name":"启发式搜索"}]},{"id":"dynamic_programming","name":"动态规划","topics":[{"id":"dynamic_programming.linear","name":"线性 DP"},{"id":"dynamic_programming.knapsack","name":"背包 DP"},{"id":"dynamic_programming.interval","name":"区间 DP"},{"id":"dynamic_programming.tree","name":"树形 DP"},{"id":"dynamic_programming.digit","name":"数位 DP"},{"id":"dynamic_programming.state_compression","name":"状压 DP"},{"id":"dynamic_programming.probability","name":"概率与期望 DP"},{"id":"dynamic_programming.optimization","name":"DP 优化"}]},{"id":"greedy","name":"贪心","topics":[{"id":"greedy.basic","name":"基础贪心"},{"id":"greedy.interval","name":"区间贪心"},{"id":"greedy.scheduling","name":"调度问题"}]},{"id":"graph_theory","name":"图论","topics":[{"id":"graph_theory.traversal","name":"图遍历"},{"id":"graph_theory.topological_sort","name":"拓扑排序"},{"id":"graph_theory.shortest_path","name":"最短路"},{"id":"graph_theory.minimum_spanning_tree","name":"最小生成树"},{"id":"graph_theory.connectivity","name":"连通性"},{"id":"graph_theory.bipartite","name":"二分图"},{"id":"graph_theory.matching","name":"图匹配"},{"id":"graph_theory.network_flow","name":"网络流"},{"id":"graph_theory.euler","name":"欧拉路径"},{"id":"graph_theory.lca","name":"最近公共祖先"},{"id":"graph_theory.tree","name":"树上问题"}]},{"id":"mathematics","name":"数学","topics":[{"id":"mathematics.number_theory","name":"数论"},{"id":"mathematics.combinatorics","name":"组合数学"},{"id":"mathematics.linear_algebra","name":"线性代数"},{"id":"mathematics.probability","name":"概率统计"},{"id":"mathematics.game_theory","name":"博弈论"},{"id":"mathematics.numerical","name":"数值算法"},{"id":"mathematics.polynomial","name":"多项式"}]},{"id":"strings","name":"字符串","topics":[{"id":"strings.matching","name":"字符串匹配"},{"id":"strings.hash","name":"字符串哈希"},{"id":"strings.aho_corasick","name":"AC 自动机"},{"id":"strings.suffix","name":"后缀结构"},{"id":"strings.palindrome","name":"回文算法"}]},{"id":"computational_geometry","name":"计算几何","topics":[{"id":"computational_geometry.basic","name":"点线面基础"},{"id":"computational_geometry.convex_hull","name":"凸包"},{"id":"computational_geometry.sweep_line","name":"扫描线"},{"id":"computational_geometry.rotating_calipers","name":"旋转卡壳"}]},{"id":"constructive","name":"构造","topics":[{"id":"constructive.basic","name":"构造算法"}]},{"id":"randomized","name":"随机化","topics":[{"id":"randomized.basic","name":"随机化算法"}]},{"id":"interactive","name":"交互题","topics":[{"id":"interactive.basic","name":"交互算法"}]},{"id":"other","name":"其他","topics":[{"id":"other.uncategorized","name":"待分类"}]}]};
const SUBMITTERS = {"allowed_github_users":["TokaiQWQTeio"],"repository":{"owner":"TokaiQWQTeio","name":"Problem-List-","default_branch":"main","reviewer":"TokaiQWQTeio"}};
const ASSETS = {"index.html":"<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <meta name=\"description\" content=\"ALGO INDEX 题目录入台，通过 GitHub 登录并创建题目 Pull Request。\">\n  <title>题目录入台 · ALGO INDEX</title>\n  <link rel=\"stylesheet\" href=\"/styles.css\">\n</head>\n<body>\n  <div class=\"noise\"></div>\n  <header class=\"topbar\">\n    <a class=\"brand\" href=\"https://tokaiqwqteio.github.io/Problem-List-/\"><span>ALGO</span> INDEX</a>\n    <a class=\"browse-link\" href=\"https://tokaiqwqteio.github.io/Problem-List-/\">浏览题库 ↗</a>\n  </header>\n\n  <main>\n    <section id=\"loading\" class=\"panel centered\"><div class=\"spinner\"></div><p>正在确认登录状态…</p></section>\n\n    <section id=\"login\" class=\"hero hidden\">\n      <p class=\"eyebrow\">PROBLEM INTAKE CONSOLE</p>\n      <h1>把一道好题，<br><em>稳稳放进题库。</em></h1>\n      <p class=\"lead\">使用获准的 GitHub 账号登录。提交后系统会创建 Pull Request，经人工审核后才会进入题库。</p>\n      <a class=\"primary-button github\" href=\"/auth/github\">使用 GitHub 登录 <span>→</span></a>\n      <p id=\"login-message\" class=\"message hidden\"></p>\n      <div class=\"trust-row\"><span>7 天登录会话</span><span>不会执行代码</span><span>人工审核合并</span></div>\n    </section>\n\n    <section id=\"workspace\" class=\"workspace hidden\">\n      <div class=\"workspace-head\">\n        <div><p class=\"eyebrow\">NEW PROBLEM</p><h1>提交新题</h1></div>\n        <div class=\"user-box\"><span id=\"username\"></span><button id=\"logout\" class=\"text-button\">退出</button></div>\n      </div>\n\n      <nav id=\"steps\" class=\"steps\" aria-label=\"录入步骤\"></nav>\n      <form id=\"problem-form\" novalidate>\n        <section class=\"form-step\" data-step=\"0\">\n          <div class=\"section-title\"><span>01</span><div><h2>基本信息</h2><p>确定题目的身份与原始出处。</p></div></div>\n          <div class=\"grid two\">\n            <label>题目名称<input name=\"title\" maxlength=\"200\" required placeholder=\"例如：两数之和\"></label>\n            <label>平台题号<input name=\"problem_id\" maxlength=\"100\" required placeholder=\"例如：1A / P1000\"></label>\n            <label>英文短名<input name=\"english_name\" maxlength=\"80\" pattern=\"[A-Za-z0-9_-]+\" required placeholder=\"例如：two-sum\"><small>用于目录名，仅限字母、数字、连字符和下划线。</small></label>\n            <label>题目链接<input name=\"url\" type=\"url\" maxlength=\"1000\" placeholder=\"https://...\"></label>\n            <label>来源名称<input name=\"source_name\" maxlength=\"80\" required placeholder=\"例如：Codeforces\"></label>\n            <label>来源英文标识<input name=\"source_id\" maxlength=\"40\" pattern=\"[A-Za-z0-9_-]+\" required placeholder=\"例如：codeforces\"></label>\n          </div>\n        </section>\n\n        <section class=\"form-step hidden\" data-step=\"1\">\n          <div class=\"section-title\"><span>02</span><div><h2>分类与进度</h2><p>先按算法知识点，再记录难度、状态与运行限制。</p></div></div>\n          <div class=\"grid two\">\n            <label>统一难度<select name=\"difficulty_unified\" required><option>入门</option><option>简单</option><option selected>中等</option><option>困难</option><option>极难</option></select></label>\n            <label>平台原始难度<input name=\"difficulty_original\" maxlength=\"100\" placeholder=\"例如：1200 / Easy\"></label>\n            <label>状态<select name=\"status\" required><option selected>待做</option><option>尝试中</option><option>已解决</option><option>需复习</option></select></label>\n            <label>运行超时（秒）<input name=\"time_limit_seconds\" type=\"number\" min=\"0.01\" max=\"120\" step=\"0.01\" value=\"2\" required></label>\n          </div>\n          <fieldset><legend>知识点（可多选）</legend><div id=\"topics\" class=\"topic-groups\"></div></fieldset>\n          <label>主要知识点<select id=\"primary-topic\" name=\"primary_topic\" required><option value=\"\">请先选择知识点</option></select></label>\n        </section>\n\n        <section class=\"form-step hidden\" data-step=\"2\">\n          <div class=\"section-title\"><span>03</span><div><h2>题解内容</h2><p>保存原创摘要、分析与复盘；不复制完整题面。</p></div></div>\n          <div class=\"stack\">\n            <label>原创题目摘要<textarea name=\"summary\" required rows=\"5\" placeholder=\"用自己的话概括问题、目标与关键约束。\"></textarea></label>\n            <label>输入格式<textarea name=\"input_format\" required rows=\"4\"></textarea></label>\n            <label>输出格式<textarea name=\"output_format\" required rows=\"4\"></textarea></label>\n            <label>解题思路<textarea name=\"solution\" required rows=\"8\"></textarea></label>\n            <label>正确性证明<textarea name=\"proof\" required rows=\"7\"></textarea></label>\n            <label>易错点与复盘<textarea name=\"pitfalls\" required rows=\"5\"></textarea></label>\n            <label>复杂度<textarea name=\"complexity\" required rows=\"3\" placeholder=\"时间复杂度：O(...)&#10;空间复杂度：O(...)\"></textarea></label>\n          </div>\n        </section>\n\n        <section class=\"form-step hidden\" data-step=\"3\">\n          <div class=\"section-title\"><span>04</span><div><h2>C++20 代码</h2><p>最多 200KB。这里只保存文本，服务器不会编译或运行。</p></div></div>\n          <label><span class=\"sr-only\">C++20 代码</span><textarea id=\"code\" class=\"code\" name=\"code\" required spellcheck=\"false\" rows=\"24\">#include &lt;bits/stdc++.h&gt;\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    return 0;\n}\n</textarea></label>\n          <p id=\"code-size\" class=\"counter\"></p>\n        </section>\n\n        <section class=\"form-step hidden\" data-step=\"4\">\n          <div class=\"section-title\"><span>05</span><div><h2>测试数据</h2><p>添加 1–20 组输入输出，每个文件不超过 1MB。</p></div></div>\n          <div id=\"tests\" class=\"tests\"></div>\n          <button id=\"add-test\" type=\"button\" class=\"secondary-button\">＋ 添加一组测试</button>\n        </section>\n\n        <section class=\"form-step hidden\" data-step=\"5\">\n          <div class=\"section-title\"><span>06</span><div><h2>预览并提交</h2><p>确认后会创建独立分支和 Pull Request，不会自动合并。</p></div></div>\n          <div id=\"preview\" class=\"preview\"></div>\n          <label class=\"confirmation\"><input id=\"confirm\" type=\"checkbox\" required> 我确认内容为自己整理的摘要与解法，来源链接正确，并同意通过 Pull Request 接受审核。</label>\n          <button id=\"submit\" type=\"submit\" class=\"primary-button\">创建 Pull Request <span>→</span></button>\n          <div id=\"submit-message\" class=\"message hidden\"></div>\n        </section>\n\n        <div class=\"form-nav\"><button id=\"previous\" type=\"button\" class=\"secondary-button hidden\">← 上一步</button><div class=\"autosave\">草稿已保存在此浏览器 <button id=\"clear-draft\" type=\"button\" class=\"text-button\">清除草稿</button></div><button id=\"next\" type=\"button\" class=\"primary-button\">下一步 →</button></div>\n      </form>\n    </section>\n  </main>\n  <footer>ALGO INDEX · 题目录入台 · C++20</footer>\n  <script type=\"module\" src=\"/app.js?build=20260911-1\"></script>\n</body>\n</html>\n","styles.css":":root{--bg:#090b0d;--panel:#111418;--panel2:#171b20;--line:#2a3037;--text:#f1f4f7;--muted:#929ba5;--accent:#b7ff43;--danger:#ff6f6f;--ok:#73e6a0;--mono:\"SFMono-Regular\",Consolas,\"Liberation Mono\",monospace;--sans:Inter,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif}*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;min-height:100vh;background:radial-gradient(circle at 80% -10%,#1d2719 0,transparent 36%),var(--bg);color:var(--text);font-family:var(--sans)}.noise{position:fixed;inset:0;pointer-events:none;opacity:.04;background-image:url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")}.topbar{height:68px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);position:relative;z-index:1}.brand{font:800 17px var(--mono);letter-spacing:.1em;color:var(--text);text-decoration:none}.brand span{color:var(--accent)}.browse-link,.text-button{font:13px var(--mono);color:var(--muted);background:none;border:0;text-decoration:none;cursor:pointer}.browse-link:hover,.text-button:hover{color:var(--accent)}main{width:min(1100px,calc(100% - 32px));margin:0 auto;position:relative;z-index:1}.hero{min-height:calc(100vh - 130px);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;max-width:830px;padding:80px 0}.eyebrow{font:12px var(--mono);letter-spacing:.18em;color:var(--accent);margin:0 0 18px}.hero h1,.workspace-head h1{font-size:clamp(44px,8vw,88px);letter-spacing:-.06em;line-height:.94;margin:0}.hero h1 em{font-style:normal;color:var(--accent)}.lead{font-size:18px;line-height:1.75;max-width:650px;color:var(--muted);margin:32px 0}.primary-button,.secondary-button{appearance:none;border:0;border-radius:2px;padding:14px 18px;font:700 14px var(--mono);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:24px;justify-content:center}.primary-button{background:var(--accent);color:#0b0e08}.primary-button:hover{background:#cbff78}.primary-button:disabled{opacity:.45;cursor:not-allowed}.secondary-button{background:transparent;color:var(--text);border:1px solid var(--line)}.secondary-button:hover{border-color:var(--accent)}.trust-row{display:flex;gap:28px;flex-wrap:wrap;margin-top:36px;color:var(--muted);font:12px var(--mono)}.trust-row span:before{content:\"✓ \";color:var(--accent)}.panel{background:var(--panel);border:1px solid var(--line);padding:40px}.centered{margin:120px auto;max-width:440px;text-align:center}.spinner{width:24px;height:24px;border:2px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:auto}@keyframes spin{to{transform:rotate(360deg)}}.hidden{display:none!important}.workspace{padding:62px 0 90px}.workspace-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:54px}.workspace-head h1{font-size:clamp(44px,7vw,72px)}.user-box{display:flex;gap:14px;align-items:center;font:13px var(--mono)}.user-box span:before{content:\"● \";color:var(--ok)}.steps{display:grid;grid-template-columns:repeat(6,1fr);border:1px solid var(--line);margin-bottom:24px}.step{padding:14px 10px;border:0;border-right:1px solid var(--line);background:var(--panel);color:var(--muted);font:11px var(--mono);cursor:pointer;text-align:left}.step:last-child{border-right:0}.step strong{display:block;color:inherit;font-size:14px;margin-bottom:4px}.step.active{background:var(--accent);color:#111}.step.done{color:var(--accent)}form{background:var(--panel);border:1px solid var(--line)}.form-step{padding:clamp(24px,5vw,56px);min-height:520px}.section-title{display:flex;gap:18px;align-items:flex-start;padding-bottom:34px;border-bottom:1px solid var(--line);margin-bottom:34px}.section-title>span{font:12px var(--mono);color:var(--accent);margin-top:7px}.section-title h2{font-size:30px;margin:0 0 8px}.section-title p{margin:0;color:var(--muted)}.grid{display:grid;gap:24px}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.stack{display:grid;gap:24px}label,legend{display:grid;gap:9px;font:600 13px var(--mono);color:#cbd1d7}small,.counter{font:11px var(--mono);color:var(--muted);line-height:1.5}input,select,textarea{width:100%;background:#0d1013;border:1px solid var(--line);border-radius:2px;color:var(--text);padding:13px 14px;font:15px var(--sans);outline:none}input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 2px #b7ff4320}textarea{resize:vertical;line-height:1.65}.code{font:14px/1.6 var(--mono);tab-size:4;white-space:pre}fieldset{border:0;padding:0;margin:32px 0}.topic-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:14px}.topic-group{border:1px solid var(--line);padding:15px}.topic-group h3{font:12px var(--mono);color:var(--accent);margin:0 0 12px}.topic-checks{display:flex;flex-wrap:wrap;gap:8px}.topic-check{display:flex;align-items:center;gap:7px;background:#0d1013;border:1px solid var(--line);padding:7px 9px;font:12px var(--sans);cursor:pointer}.topic-check:has(input:checked){border-color:var(--accent);color:var(--accent)}.topic-check input{width:auto;margin:0;accent-color:var(--accent)}.tests{display:grid;gap:18px;margin-bottom:20px}.test-card{border:1px solid var(--line);padding:18px}.test-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.test-head h3{font:13px var(--mono);margin:0;color:var(--accent)}.test-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.test-grid textarea{font:13px/1.55 var(--mono);min-height:150px}.preview{display:grid;gap:18px;margin-bottom:28px}.preview-block{background:#0d1013;border:1px solid var(--line);padding:18px}.preview-block h3{font:12px var(--mono);color:var(--accent);margin:0 0 12px}.preview-block p{margin:5px 0;color:#cbd1d7;white-space:pre-wrap;overflow-wrap:anywhere}.confirmation{display:flex;grid-template-columns:auto 1fr;align-items:flex-start;line-height:1.6;margin:26px 0}.confirmation input{width:auto;margin-top:4px;accent-color:var(--accent)}.form-nav{border-top:1px solid var(--line);padding:18px clamp(24px,5vw,56px);display:flex;justify-content:space-between;align-items:center;gap:16px}.autosave{font:11px var(--mono);color:var(--muted)}.message{border:1px solid var(--line);padding:14px;margin-top:20px;font:13px/1.6 var(--mono)}.message.error{border-color:var(--danger);color:var(--danger)}.message.success{border-color:var(--ok);color:var(--ok)}footer{border-top:1px solid var(--line);padding:24px;text-align:center;color:var(--muted);font:11px var(--mono)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:760px){.grid.two,.topic-groups,.test-grid{grid-template-columns:1fr}.steps{grid-template-columns:repeat(3,1fr)}.step:nth-child(3){border-right:0}.workspace-head{align-items:flex-start;gap:20px;flex-direction:column}.form-nav{flex-wrap:wrap}.autosave{order:3;width:100%;text-align:center}.hero{padding:55px 0}.trust-row{gap:12px 20px}}\n","app.js":"const DRAFT_KEY = \"algo-index-intake-draft-v1\";\nconst stepNames = [\"基本信息\", \"分类难度\", \"题解内容\", \"C++20\", \"测试数据\", \"预览提交\"];\nconst state = { step: 0, session: null, taxonomy: null, tests: [{ input: \"\", output: \"\" }] };\nconst $ = (selector, root = document) => root.querySelector(selector);\nconst $$ = (selector, root = document) => [...root.querySelectorAll(selector)];\nconst form = $(\"#problem-form\");\n\nfunction show(id) {\n  [\"loading\", \"login\", \"workspace\"].forEach((name) => $(`#${name}`).classList.toggle(\"hidden\", name !== id));\n}\n\nfunction loginMessage() {\n  const code = new URLSearchParams(location.search).get(\"login\");\n  const messages = {\n    failed: \"GitHub 登录失败，请重新尝试。\",\n    expired: \"登录请求已过期，请重新发起。\",\n    denied: `GitHub 账号 ${new URLSearchParams(location.search).get(\"user\") || \"\"} 不在提交者白名单中。`,\n    permission: \"该账号没有题库仓库的 Write 权限。\",\n  };\n  if (messages[code]) {\n    const element = $(\"#login-message\");\n    element.textContent = messages[code];\n    element.classList.remove(\"hidden\");\n    element.classList.add(\"error\");\n  }\n}\n\nasync function initialize() {\n  try {\n    const response = await fetch(\"/api/session\");\n    const data = await response.json();\n    if (!data.authenticated) { show(\"login\"); loginMessage(); return; }\n    state.session = data;\n    state.taxonomy = data.taxonomy;\n    $(\"#username\").textContent = `@${data.username}`;\n    renderSteps();\n    renderTopics();\n    loadDraft();\n    renderTests();\n    bindEvents();\n    updateStep();\n    registerPageTools();\n    show(\"workspace\");\n  } catch {\n    show(\"login\");\n    const message = $(\"#login-message\");\n    message.textContent = \"暂时无法连接录入服务，请稍后重试。\";\n    message.classList.remove(\"hidden\");\n    message.classList.add(\"error\");\n  }\n}\n\nfunction renderSteps() {\n  $(\"#steps\").innerHTML = stepNames.map((name, index) => `<button type=\"button\" class=\"step\" data-target=\"${index}\"><strong>0${index + 1}</strong>${name}</button>`).join(\"\");\n}\n\nfunction renderTopics() {\n  $(\"#topics\").innerHTML = state.taxonomy.categories.map((category) => `\n    <section class=\"topic-group\"><h3>${escapeHtml(category.name)}</h3><div class=\"topic-checks\">\n      ${category.topics.map((topic) => `<label class=\"topic-check\"><input type=\"checkbox\" name=\"topics\" value=\"${escapeHtml(topic.id)}\"><span>${escapeHtml(topic.name)}</span></label>`).join(\"\")}\n    </div></section>`).join(\"\");\n}\n\nfunction bindEvents() {\n  $(\"#next\").addEventListener(\"click\", () => { if (validateStep()) { state.step += 1; updateStep(); } });\n  $(\"#previous\").addEventListener(\"click\", () => { state.step -= 1; updateStep(); });\n  $(\"#steps\").addEventListener(\"click\", (event) => {\n    const button = event.target.closest(\"[data-target]\");\n    if (!button) return;\n    const target = Number(button.dataset.target);\n    if (target <= state.step || validateStep()) { state.step = target; updateStep(); }\n  });\n  form.addEventListener(\"input\", () => { syncTopics(); updateCodeSize(); saveDraft(); });\n  form.addEventListener(\"change\", () => { syncTopics(); saveDraft(); });\n  form.addEventListener(\"submit\", submitProblem);\n  $(\"#add-test\").addEventListener(\"click\", () => { if (state.tests.length < 20) { state.tests.push({ input: \"\", output: \"\" }); renderTests(); saveDraft(); } });\n  $(\"#tests\").addEventListener(\"click\", (event) => {\n    const button = event.target.closest(\"[data-remove-test]\");\n    if (!button || state.tests.length === 1) return;\n    readTests(); state.tests.splice(Number(button.dataset.removeTest), 1); renderTests(); saveDraft();\n  });\n  $(\"#tests\").addEventListener(\"input\", () => { readTests(); saveDraft(); });\n  $(\"#clear-draft\").addEventListener(\"click\", () => {\n    if (!confirm(\"清除这台浏览器中保存的录入草稿？\")) return;\n    localStorage.removeItem(DRAFT_KEY); form.reset(); state.tests = [{ input: \"\", output: \"\" }]; renderTests(); syncTopics(); updateCodeSize();\n  });\n  $(\"#logout\").addEventListener(\"click\", async () => { await fetch(\"/auth/logout\", { method: \"POST\" }); location.reload(); });\n}\n\nfunction updateStep() {\n  state.step = Math.max(0, Math.min(stepNames.length - 1, state.step));\n  $$(\".form-step\").forEach((element, index) => element.classList.toggle(\"hidden\", index !== state.step));\n  $$(\".step\").forEach((element, index) => {\n    element.classList.toggle(\"active\", index === state.step);\n    element.classList.toggle(\"done\", index < state.step);\n  });\n  $(\"#previous\").classList.toggle(\"hidden\", state.step === 0);\n  $(\"#next\").classList.toggle(\"hidden\", state.step === stepNames.length - 1);\n  if (state.step === stepNames.length - 1) renderPreview();\n  window.scrollTo({ top: 0, behavior: \"smooth\" });\n}\n\nfunction validateStep() {\n  const section = $(`.form-step[data-step=\"${state.step}\"]`);\n  for (const field of $$('input:not([type=\"checkbox\"]), select, textarea', section)) {\n    if (!field.checkValidity()) { field.reportValidity(); field.focus(); return false; }\n  }\n  if (state.step === 1) {\n    const selected = $$(\"input[name=topics]:checked\");\n    if (!selected.length) { alert(\"请至少选择一个知识点。\"); return false; }\n    if (!$(\"#primary-topic\").value) { alert(\"请选择主要知识点。\"); return false; }\n  }\n  if (state.step === 3 && new TextEncoder().encode($(\"#code\").value).length > 200_000) { alert(\"C++ 代码不能超过 200KB。\"); return false; }\n  if (state.step === 4) {\n    readTests();\n    if (!state.tests.length) { alert(\"请至少添加一组测试。\"); return false; }\n    if (state.tests.some((test) => new TextEncoder().encode(test.input).length > 1_000_000 || new TextEncoder().encode(test.output).length > 1_000_000)) { alert(\"每个输入或输出文件不能超过 1MB。\"); return false; }\n  }\n  return true;\n}\n\nfunction syncTopics() {\n  const selected = $$(\"input[name=topics]:checked\").map((item) => item.value);\n  const select = $(\"#primary-topic\");\n  const current = select.value;\n  const names = new Map(state.taxonomy.categories.flatMap((category) => category.topics.map((topic) => [topic.id, topic.name])));\n  select.innerHTML = `<option value=\"\">请选择</option>${selected.map((id) => `<option value=\"${escapeHtml(id)}\">${escapeHtml(names.get(id))}</option>`).join(\"\")}`;\n  select.value = selected.includes(current) ? current : (selected[0] || \"\");\n}\n\nfunction renderTests() {\n  $(\"#tests\").innerHTML = state.tests.map((test, index) => `\n    <section class=\"test-card\"><div class=\"test-head\"><h3>TEST ${String(index + 1).padStart(2, \"0\")}</h3><button type=\"button\" class=\"text-button\" data-remove-test=\"${index}\" ${state.tests.length === 1 ? \"disabled\" : \"\"}>移除</button></div>\n    <div class=\"test-grid\"><label>输入<textarea data-test-input=\"${index}\" spellcheck=\"false\">${escapeHtml(test.input)}</textarea></label><label>期望输出<textarea data-test-output=\"${index}\" spellcheck=\"false\">${escapeHtml(test.output)}</textarea></label></div></section>`).join(\"\");\n}\n\nfunction readTests() {\n  state.tests = $$(\".test-card\").map((card) => ({ input: $(\"[data-test-input]\", card).value, output: $(\"[data-test-output]\", card).value }));\n}\n\nfunction formData() {\n  readTests();\n  const data = Object.fromEntries(new FormData(form).entries());\n  data.topics = $$(\"input[name=topics]:checked\").map((item) => item.value);\n  data.tests = state.tests;\n  data.time_limit_seconds = Number(data.time_limit_seconds);\n  delete data.confirm;\n  return data;\n}\n\nfunction saveDraft() {\n  clearTimeout(saveDraft.timer);\n  saveDraft.timer = setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify({ fields: formData(), step: state.step })), 250);\n}\n\nfunction loadDraft() {\n  let draft;\n  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return; }\n  if (!draft?.fields) return;\n  for (const [name, value] of Object.entries(draft.fields)) {\n    if ([\"topics\", \"tests\"].includes(name)) continue;\n    const field = form.elements.namedItem(name);\n    if (field && typeof value !== \"object\") field.value = value;\n  }\n  for (const id of draft.fields.topics || []) {\n    const checkbox = $$('input[name=\"topics\"]').find((item) => item.value === id);\n    if (checkbox) checkbox.checked = true;\n  }\n  syncTopics();\n  if (draft.fields.primary_topic) $(\"#primary-topic\").value = draft.fields.primary_topic;\n  state.tests = Array.isArray(draft.fields.tests) && draft.fields.tests.length ? draft.fields.tests.slice(0, 20) : state.tests;\n  state.step = Math.max(0, Math.min(5, Number(draft.step) || 0));\n  updateCodeSize();\n}\n\nfunction updateCodeSize() {\n  const size = new TextEncoder().encode($(\"#code\").value).length;\n  $(\"#code-size\").textContent = `${(size / 1024).toFixed(1)} KB / 200 KB`;\n}\n\nfunction renderPreview() {\n  const data = formData();\n  const names = new Map(state.taxonomy.categories.flatMap((category) => category.topics.map((topic) => [topic.id, topic.name])));\n  const path = `problems/${slug(data.source_id)}-${slug(data.problem_id)}-${slug(data.english_name)}`;\n  $(\"#preview\").innerHTML = `\n    <section class=\"preview-block\"><h3>题目</h3><p>${escapeHtml(data.title || \"—\")} · ${escapeHtml(data.source_name || \"—\")} ${escapeHtml(data.problem_id || \"\")}</p><p>${escapeHtml(data.url || \"无来源链接\")}</p></section>\n    <section class=\"preview-block\"><h3>分类</h3><p>${escapeHtml(data.difficulty_unified || \"—\")} / ${escapeHtml(data.difficulty_original || \"未填写\")} · ${escapeHtml(data.status || \"—\")}</p><p>${escapeHtml(data.topics.map((id) => names.get(id) || id).join(\"、\") || \"—\")}</p></section>\n    <section class=\"preview-block\"><h3>将创建</h3><p>${escapeHtml(path)}</p><p>README.md · problem.json · solution.cpp · ${data.tests.length * 2} 个测试文件</p></section>`;\n}\n\nasync function submitProblem(event) {\n  event.preventDefault();\n  if (!validateStep() || !$(\"#confirm\").checked) { $(\"#confirm\").reportValidity(); return; }\n  const button = $(\"#submit\");\n  const message = $(\"#submit-message\");\n  button.disabled = true; button.firstChild.textContent = \"正在创建… \";\n  message.classList.add(\"hidden\");\n  try {\n    const response = await fetch(\"/api/submissions\", { method: \"POST\", headers: { \"content-type\": \"application/json\", \"x-csrf-token\": state.session.csrf }, body: JSON.stringify(formData()) });\n    const result = await response.json();\n    if (!response.ok) throw new Error(result.error || \"提交失败\");\n    localStorage.removeItem(DRAFT_KEY);\n    message.innerHTML = `Pull Request #${result.number} 已创建：<a href=\"${escapeHtml(result.url)}\" target=\"_blank\" rel=\"noopener\">前往 GitHub 审核 ↗</a><br>${escapeHtml(result.path)}`;\n    message.className = \"message success\";\n    button.classList.add(\"hidden\");\n  } catch (error) {\n    message.textContent = error.message;\n    message.className = \"message error\";\n    button.disabled = false; button.firstChild.textContent = \"创建 Pull Request \";\n  }\n}\n\nfunction slug(value) {\n  return String(value || \"\").trim().toLowerCase().replaceAll(\"_\", \"-\").replace(/[^a-z0-9-]+/g, \"-\").replace(/-+/g, \"-\").replace(/^-|-$/g, \"\");\n}\n\nfunction escapeHtml(value) {\n  return String(value ?? \"\").replace(/[&<>'\"]/g, (character) => ({ \"&\": \"&amp;\", \"<\": \"&lt;\", \">\": \"&gt;\", \"'\": \"&#39;\", '\"': \"&quot;\" })[character]);\n}\n\nfunction registerPageTools() {\n  const context = document.modelContext;\n  if (!context?.registerTool) return;\n  const stepIds = [\"basic\", \"classification\", \"editorial\", \"code\", \"tests\", \"review\"];\n  void Promise.resolve(context.registerTool({\n    name: \"open_problem_entry_step\",\n    title: \"打开题目录入步骤\",\n    description: \"在已登录的题目录入台中打开指定表单步骤；只改变当前页面，不会提交或创建 Pull Request。\",\n    inputSchema: {\n      type: \"object\",\n      properties: { step: { type: \"string\", enum: stepIds } },\n      required: [\"step\"],\n      additionalProperties: false,\n    },\n    annotations: { readOnlyHint: false, untrustedContentHint: false },\n    execute(input) {\n      const target = stepIds.indexOf(input?.step);\n      if (target < 0) throw new Error(\"未知的录入步骤\");\n      state.step = target;\n      updateStep();\n      return { step: input.step, title: stepNames[target] };\n    },\n  })).catch(() => {});\n}\n\ninitialize();\n"};

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
    headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "no-cache" },
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
