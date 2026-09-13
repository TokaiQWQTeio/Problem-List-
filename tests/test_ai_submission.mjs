import assert from "node:assert/strict";
import { adminAiRoute, aiCatalogue, availableModels, buildFiles, normalizeLuoguProblem, parseAiJson, resolveAiCredential } from "../dist/server/index.js";

const models = availableModels({ AI_OPENAI_API_KEY: "secret", AI_DEEPSEEK_API_KEY: "secret" });
assert(models.some((model) => model.id === "gpt-5.6-terra"));
assert(models.some((model) => model.id === "deepseek-flash"));
assert(!models.some((model) => model.provider === "zhipu"));
assert.deepEqual(availableModels({ AI_OPENAI_API_KEY: "secret", AI_MODELS_JSON: JSON.stringify([{ provider: "openai", id: "gpt-5.6-luna", label: "Luna" }]) }).map((model) => model.id), ["gpt-5.6-luna"]);
assert.deepEqual(availableModels({ AI_OPENAI_API_KEY: "secret", AI_MODELS_JSON: JSON.stringify([{ provider: "evil", id: "bad", label: "Bad" }]) }), []);
const websiteKey = { provider: "openai", encrypted_key: "encrypted", key_nonce: "nonce", disabled: 0 };
const catalogue = aiCatalogue({}, [websiteKey], [{ provider: "openai", model_id: "gpt-5.6-terra", label: "GPT", enabled: 0 }]);
assert.equal(catalogue.providers.find((item) => item.id === "openai").configured, true);
assert.equal(catalogue.models.find((item) => item.id === "gpt-5.6-terra").enabled, false);
assert.equal(JSON.stringify(catalogue).includes("encrypted"), false);
assert.equal(aiCatalogue({ AI_OPENAI_API_KEY: "environment-secret" }, [{ ...websiteKey, encrypted_key: null, disabled: 1 }]).providers.find((item) => item.id === "openai").configured, false);
assert.equal(aiCatalogue({ AI_OPENAI_API_KEY: "environment-secret" }, [], [], { default_provider: "openai", default_model_id: "gpt-5.6-luna" }).default_model, "openai:gpt-5.6-luna");

const db = {
  saved: null,
  prepare(sql) {
    return {
      bind: (...values) => ({
        first: async () => sql.includes("ai_provider_keys") ? db.saved : null,
        run: async () => { if (sql.includes("INSERT INTO ai_provider_keys")) db.saved = values.length === 2
          ? { provider: values[0], encrypted_key: null, key_nonce: null, disabled: 1 }
          : { provider: values[0], encrypted_key: values[1], key_nonce: values[2], disabled: 0 }; },
      }),
      all: async () => ({ results: [] }),
      first: async () => null,
    };
  },
};
const adminEnv = { DB: db, SESSION_SECRET: "unit-test-master-secret" };
const admin = { username: "TokaiQWQTeio", csrf_token: "csrf" };
const keyUrl = new URL("https://example.com/api/admin/ai/keys/openai");
const forbidden = await adminAiRoute(new Request(keyUrl, { method: "PUT", headers: { "x-csrf-token": "csrf" }, body: JSON.stringify({ key: "example-secret-key" }) }), adminEnv, { username: "collaborator", csrf_token: "csrf" }, keyUrl);
assert.equal(forbidden.status, 403);
const invalidCsrf = await adminAiRoute(new Request(keyUrl, { method: "PUT", body: JSON.stringify({ key: "example-secret-key" }) }), adminEnv, admin, keyUrl);
assert.equal(invalidCsrf.status, 403);
const saved = await adminAiRoute(new Request(keyUrl, { method: "PUT", headers: { "x-csrf-token": "csrf" }, body: JSON.stringify({ key: "example-secret-key" }) }), adminEnv, admin, keyUrl);
assert.equal(saved.status, 200);
assert.equal(JSON.stringify(await saved.json()).includes("example-secret-key"), false);
assert.notEqual(db.saved.encrypted_key, "example-secret-key");
assert.equal(await resolveAiCredential(adminEnv, "openai"), "example-secret-key");
const removed = await adminAiRoute(new Request(keyUrl, { method: "DELETE", headers: { "x-csrf-token": "csrf" } }), adminEnv, admin, keyUrl);
assert.equal(removed.status, 200);
assert.equal(await resolveAiCredential({ ...adminEnv, AI_OPENAI_API_KEY: "environment-secret" }, "openai"), null);

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
