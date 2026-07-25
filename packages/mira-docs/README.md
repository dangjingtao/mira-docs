# @mira/docs

The reusable MiraDocs runtime.

## Exports

- `@mira/docs` — content model, React runtime, and configuration helpers.
- `@mira/docs/vite` — Markdown discovery, virtual content manifests, and configurable static-site output.
- `@mira/docs/styles.css` — the default lightweight theme.

The Vite export supports site-owned static route callbacks while MiraDocs handles
HTML output, canonical and social metadata, JSON-LD injection, `404.html`,
`sitemap.xml`, and `robots.txt`. See `docs/static-build.md` in the repository.

This package is still pre-release. The public contract will remain narrow until
the existing UIChat Mira documentation site has migrated successfully.
