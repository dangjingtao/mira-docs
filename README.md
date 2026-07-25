# MiraDocs

MiraDocs is a Git-native documentation, publishing, and project portal runtime.

It turns Markdown in a repository into a public site, keeps GitHub Pages as a
first-class deployment target, and exposes a stable content contract that the
Mira Skill can operate without editing UI implementation files.

## Current scope

- Vite + React runtime
- Markdown and frontmatter content model
- Generated routes and navigation
- Configurable static HTML generation for GitHub Pages
- Canonical, Open Graph, Twitter, and JSON-LD metadata
- `404.html`, `sitemap.xml`, and `robots.txt`
- Documentation, blog, and project entry types
- Official site built with MiraDocs itself
- Backup location for the UIChat Mira skill contract

## Development

```bash
npm install
npm run validate
npm run dev
```

The official site is built from `apps/site`. The reusable package lives at
`packages/mira-docs`.

The static build extension contract is documented in
[`docs/static-build.md`](docs/static-build.md).

## Repository roles

- **UIChat Mira** is the canonical host of the MiraDocs Skill.
- **This repository** contains the runtime, schemas, starter contract, official
  site, and a read-only backup of the skill instructions.
- **uichat-mira-docs** is the first production consumer and migration benchmark.
