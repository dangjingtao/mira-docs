# MiraDocs

MiraDocs is a Git-native documentation, publishing, and project portal runtime for Vite and React.

It turns structured Markdown in a repository into navigable content, a virtual Vite manifest, and static deployment artifacts while allowing each consumer to keep its own visual identity. Content stays reviewable through Git, site behavior stays configurable, and automation can operate stable contracts instead of editing UI implementation files.

## Current status

- Public npm package: `@uichat-mira/docs@0.1.0`
- GitHub release: `v0.1.0`
- Publishing protected by npm Trusted Publishing and GitHub OIDC
- `uichat-mira-docs` is the first production consumer and compatibility benchmark
- The production consumer installs MiraDocs from npm rather than a Git commit

```bash
npm install @uichat-mira/docs
```

## What MiraDocs provides

- Markdown and YAML Frontmatter content model
- Compatibility fallback for existing loose Frontmatter content
- Documentation, article, project, and page entry types
- Vite content discovery and `virtual:mira-docs/content`
- Generated routes, navigation roots, and heading extraction
- Configurable static HTML generation
- Canonical, Open Graph, Twitter, and JSON-LD metadata
- `404.html`, `sitemap.xml`, and `robots.txt`
- GitHub Pages project-path and root-path support
- A lightweight React runtime that consumers may use or replace

## Boundaries

MiraDocs is not a hosted CMS, a GitHub API wrapper, or a mandatory site theme. It owns the content and static-build contracts; consumer applications own their branding, page composition, and product-specific behavior.

The canonical MiraDocs Skill lives in UIChat Mira. It operates repository content, configuration, branches, pull requests, and publishing workflows through stable GitHub capabilities. The `skill-backup` directory in this repository is a read-only reference copy.

## Package exports

- `@uichat-mira/docs` — content model, configuration helpers, and React runtime
- `@uichat-mira/docs/vite` — Markdown discovery, virtual manifests, and static output
- `@uichat-mira/docs/styles.css` — default lightweight styles

## Development

```bash
npm ci
npm run validate
npm run dev
```

The official self-hosted site lives in `apps/site`. The reusable package lives in `packages/mira-docs`. Static build extension points are documented in [`docs/static-build.md`](docs/static-build.md).

## Repository roles

- **uichat-mira** — canonical MiraDocs Skill host and execution entry
- **mira-docs** — runtime, schemas, package, official site, and release pipeline
- **uichat-mira-docs** — first production consumer and migration benchmark
