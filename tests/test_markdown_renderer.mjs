import assert from "node:assert/strict";

await import("../dist/markdown.js");

const rendered = globalThis.renderMarkdown(`## 题目描述

正文含有 \`行内代码\` 和 **重点**。

- 第一项
- 第二项

| 名称 | 数量 |
|---|---:|
| 测试 | 1 |

<script>alert("unsafe")</script>`);

assert.match(rendered, /<h2>题目描述<\/h2>/);
assert.match(rendered, /<code>行内代码<\/code>/);
assert.match(rendered, /<strong>重点<\/strong>/);
assert.match(rendered, /<ul><li>第一项<\/li><li>第二项<\/li><\/ul>/);
assert.match(rendered, /<table>/);
assert.doesNotMatch(rendered, /<script>/);
assert.match(rendered, /&lt;script&gt;/);

console.log("Markdown renderer checks passed.");
