import assert from "node:assert/strict";

const { buildFiles, readEditorialSections, validateSubmission } = await import("../dist/server/index.js");

const payload = {
  title: "测试题",
  problem_id: "P1",
  english_name: "test-problem",
  source_id: "luogu",
  source_name: "洛谷",
  url: "https://example.com/problem/P1",
  topics: ["graph_theory.shortest_path"],
  primary_topic: "graph_theory.shortest_path",
  difficulty_unified: "中等",
  difficulty_original: "提高",
  status: "已解决",
  time_limit_seconds: 2,
  summary: "摘要",
  input_format: "输入",
  output_format: "输出",
  solution: "解法",
  proof: "证明",
  pitfalls: "易错点",
  complexity: "时间复杂度：`O(n)`",
  test_notes: "边界测试",
  code: "int main() {}\n",
  tests: [{ name: "sample1", input: "1\n", output: "1\n" }],
  change_summary: "修正题解并补充测试",
};

const value = validateSubmission(payload, "edit");
assert.equal(value.folder, "luogu-p1-test-problem");
assert.equal(value.tests[0].name, "sample1");
assert.equal(value.changeSummary, payload.change_summary);

const built = buildFiles(value, "2026-01-02");
assert.equal(built.metadata.created_at, "2026-01-02");
assert.ok(built.files.some((file) => file.path.endsWith("tests/sample1.in")));
assert.ok(built.files.some((file) => file.path.endsWith("tests/sample1.out")));
const readme = built.files.find((file) => file.path.endsWith("README.md")).content;
const sections = readEditorialSections(readme);
assert.equal(sections.summary, "摘要");
assert.equal(sections.test_notes, "边界测试");

assert.throws(() => validateSubmission({ ...payload, change_summary: "" }, "edit"), /修改说明不能为空/);
assert.throws(() => validateSubmission({ ...payload, tests: [] }, "edit"), /测试数据必须为/);
assert.throws(() => validateSubmission({ ...payload, tests: [{ name: "../bad", input: "", output: "" }] }, "edit"), /测试名称无效/);

console.log("Edit submission checks passed.");
