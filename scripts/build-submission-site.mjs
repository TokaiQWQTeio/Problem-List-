import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "submission-site");
const output = path.join(root, "dist", "server");
const read = (filename) => fs.readFileSync(filename, "utf8");
const taxonomy = JSON.parse(read(path.join(root, "config", "taxonomy.json")));
const submitters = JSON.parse(read(path.join(root, "config", "submitters.json")));
const assets = {
  "index.html": read(path.join(source, "public", "index.html")),
  "styles.css": read(path.join(source, "public", "styles.css")),
  "app.js": read(path.join(source, "public", "app.js")),
};

let worker = read(path.join(source, "worker-template.js"));
worker = worker
  .replace("__TAXONOMY_JSON__", () => JSON.stringify(taxonomy))
  .replace("__SUBMITTERS_JSON__", () => JSON.stringify(submitters))
  .replace("__ASSETS_JSON__", () => JSON.stringify(assets));

if (!worker.includes('const $$ = (selector, root = document)')) {
  throw new Error("Frontend asset substitution corrupted dollar signs");
}

fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, "index.js"), worker);
console.log("Built dist/server/index.js");
