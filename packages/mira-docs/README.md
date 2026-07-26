# @uichat-mira/docs

MiraDocs is a Git-native documentation, publishing, and project portal runtime for Vite and React.

It keeps Markdown, navigation, routing, SEO, and static deployment inside a stable package contract while allowing every consumer to keep its own UI, branding, and product-specific behavior.

## Install

```bash
npm install @uichat-mira/docs
```

The current public release is `0.1.1`. The UIChat Mira documentation site is the first production consumer and installs the package from npm.

## Vite integration

```ts
import { defineConfig } from "vite";
import { miraDocs } from "@uichat-mira/docs/vite";

export default defineConfig({
  plugins: [
    miraDocs({
      contentDir: "content",
      config: {
        title: "My docs",
        description: "Documentation",
        siteUrl: "https://example.com",
      },
      staticRoutes: true,
    }),
  ],
});
```

The plugin discovers Markdown, parses YAML Frontmatter, and exposes content through `virtual:mira-docs/content`. It can also generate route-level HTML, canonical and social metadata, JSON-LD, `404.html`, `sitemap.xml`, and `robots.txt`.

## React runtime

Use the default lightweight runtime:

```tsx
import { MiraDocsApp } from "@uichat-mira/docs";
import "@uichat-mira/docs/styles.css";
```

Or consume the content model and virtual manifest from an existing React application while preserving its current pages and visual system.

## Markdown compatibility rendering

Consumers with custom page shells can reuse MiraDocs' compatibility renderer instead of maintaining a second static Markdown pipeline:

```ts
import { renderMiraMarkdown } from "@uichat-mira/docs";

const html = renderMiraMarkdown(source, {
  removeH1: true,
});
```

It preserves `::: html` blocks, renders `::: tip` blocks, safely escapes code, provides a readable Mermaid fallback, and adds stable anchors to level-two and level-three headings.

## What the package owns

- Content parsing and normalized entry types
- Vite content discovery and hot updates
- Stable route and navigation data
- Markdown and HTML heading extraction
- Reusable Markdown compatibility rendering
- Static publishing and metadata contracts
- GitHub Pages base-path handling

Consumer applications remain responsible for branding, page composition, custom author models, and product-specific interaction.

## Exports

- `@uichat-mira/docs` — content model, React runtime, Markdown rendering, and configuration helpers
- `@uichat-mira/docs/vite` — Markdown discovery, virtual manifests, and static output
- `@uichat-mira/docs/styles.css` — default lightweight styles

## Project status

MiraDocs is in its early public-contract stage. Version `0.1.1` adds the shared Markdown compatibility renderer used by the production pilot site and remains protected by npm Trusted Publishing.
