import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(
  npmCommand,
  ["pack", "--dry-run", "--json", "--ignore-scripts"],
  { cwd: packageRoot, encoding: "utf8" },
);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const reports = JSON.parse(result.stdout);
const report = reports.at(-1);
assert.equal(report.name, "@uichat-mira/docs");
assert.equal(report.version, "0.1.0");

const files = new Set(report.files.map((file) => file.path));
const required = [
  "package.json",
  "README.md",
  "LICENSE",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/vite.js",
  "dist/vite.d.ts",
  "dist/styles.css",
];

for (const path of required) {
  assert.ok(files.has(path), `npm package is missing ${path}`);
}

for (const path of files) {
  assert.ok(!path.startsWith("src/"), `source file leaked into package: ${path}`);
  assert.ok(!path.startsWith("test/"), `test file leaked into package: ${path}`);
}

console.log(
  `npm pack verified: ${report.filename}, ${report.entryCount} files, ${report.unpackedSize} bytes unpacked`,
);
