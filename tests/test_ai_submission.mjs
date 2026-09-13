import assert from "node:assert/strict";
import { availableModels, buildFiles, normalizeLuoguProblem, parseAiJson } from "../dist/server/index.js";

const models = availableModels({ AI_OPENAI_API_KEY: "secret", AI_DEEPSEEK_API_KEY: "secret" });
assert(models.some((model) => model.id === "gpt-5.6-terra"));
assert(models.some((model) => model.id === "deepseek-flash"));
assert(!models.some((model) => model.provider === "zhipu"));
assert.deepEqual(availableModels({ AI_OPENAI_API_KEY: "secret", AI_MODELS_JSON: JSON.stringify([{ provider: "openai", id: "gpt-5.6-luna", label: "Luna" }]) }).map((model) => model.id), ["gpt-5.6-luna"]);
assert.deepEqual(availableModels({ AI_OPENAI_API_KEY: "secret", AI_MODELS_JSON: JSON.stringify([{ provider: "evil", id: "bad", label: "Bad" }]) }), []);

const source = normalizeLuoguProblem({ data: { problem: {
  name: "飞行路线", difficulty: 4, limits: { time: [1000] },
  content: { description: "原创题面", formatI: "输入", formatO: "输出" },
  samples: [["1 2\n", "3\n"]],
} } }, "P4568");
assert.equal(source.problem_id, "P4568");
assert.equal(source.title, "飞行路线");
assert.equal(source.input_format, "输入");
assert.equal(source.output_format, "输出");
assert.equal(source.time_limit_seconds, 1);
assert.deepEqual(source.samples, [{ name: "sample1", input: "1 2\n", output: "3\n" }]);
assert.equal(parseAiJson('```json\n{"title":"题目"}\n```').title, "题目");

const exactCode = "int main() {}";
const files = buildFiles({
  folder: "luogu-p4568-test", title: "测试", problemId: "P4568", sourceId: "luogu", sourceName: "洛谷", url: source.url,
  topics: ["shortest_path"], primaryTopic: "shortest_path", originalDifficulty: "", timeLimit: 1,
  difficulty: "中等", status: "已解决", code: exactCode,
  sections: { summary: "题意", input_format: "输入", output_format: "输出", solution: "解法", proof: "证明", pitfalls: "易错点", complexity: "O(1)", test_notes: "" },
  tests: [{ name: "sample1", input: "a", output: "b" }],
}).files;
assert.equal(files.find((file) => file.path.endsWith("solution.cpp")).content, exactCode);
console.log("AI intake checks passed.");
