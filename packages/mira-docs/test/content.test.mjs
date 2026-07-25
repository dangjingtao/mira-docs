import assert from "node:assert/strict";
import test from "node:test";
import {
  extractHeadings,
  parseFrontmatter,
  parseMiraDoc,
  sourcePathToRoute,
} from "../dist/index.js";

test("source paths become stable routes", () => {
  assert.equal(
    sourcePathToRoute("docs/getting-started.md"),
    "/docs/getting-started",
  );
  assert.equal(sourcePathToRoute("blogs/index.md"), "/blogs");
});

test("frontmatter and custom fields are preserved", () => {
  const doc = parseMiraDoc(
    "projects/mira-docs.md",
    `---
title: MiraDocs
type: project
status: active
owners:
  - tomz
---
## Roadmap
`,
  );

  assert.equal(doc.type, "project");
  assert.equal(doc.status, "active");
  assert.deepEqual(doc.data.owners, ["tomz"]);
  assert.equal(doc.headings[0].id, "roadmap");
});

test("duplicate headings receive deterministic suffixes", () => {
  assert.deepEqual(
    extractHeadings("## Same\n## Same").map((heading) => heading.id),
    ["same", "same-2"],
  );
});

test("plain markdown remains valid content", () => {
  assert.deepEqual(parseFrontmatter("# Hello"), {
    data: {},
    body: "# Hello",
  });
});
