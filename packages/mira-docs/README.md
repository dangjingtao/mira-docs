# @uichat-mira/docs

MiraDocs is a Git-native documentation, publishing, and project portal runtime for Vite and React.

## Install

```bash
npm install @uichat-mira/docs
```

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

The plugin exposes Markdown content through `virtual:mira-docs/content` and can generate route-level HTML, canonical and social metadata, JSON-LD, `404.html`, `sitemap.xml`, and `robots.txt`.

## React runtime

```tsx
import { MiraDocsApp } from "@uichat-mira/docs";
import "@uichat-mira/docs/styles.css";
```

## Exports

- `@uichat-mira/docs` — content model, React runtime, and configuration helpers.
- `@uichat-mira/docs/vite` — Markdown discovery, virtual manifests, and static output.
- `@uichat-mira/docs/styles.css` — the default lightweight theme.

MiraDocs is in its early public-contract stage. The existing UIChat Mira documentation site is the first production consumer and compatibility benchmark.
