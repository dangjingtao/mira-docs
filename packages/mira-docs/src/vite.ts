import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { marked } from "marked";
import type { Plugin } from "vite";
import { compareMiraDocs, parseMiraDoc } from "./content";
import type { MiraDoc, MiraDocsConfig } from "./types";

const VIRTUAL_ID = "virtual:mira-docs/content";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export type MiraDocsPluginOptions = {
  contentDir?: string;
  config: MiraDocsConfig;
  staticRoutes?: boolean;
  exclude?: (sourcePath: string) => boolean;
  route?: (sourcePath: string, doc: MiraDoc) => string;
};

type MiraDocsContentManifest = {
  docs: MiraDoc[];
  roots: string[];
};

function markdownFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith(".md") ? [path] : [];
  });
}

function normalizeRoute(path: string): string {
  const normalized = `/${path}`.replace(/\/{2,}/g, "/");
  return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}

function readManifest(
  contentDir: string,
  options: MiraDocsPluginOptions,
): MiraDocsContentManifest {
  const docs = markdownFiles(contentDir)
    .map((file) => {
      const sourcePath = relative(contentDir, file).replace(/\\/g, "/");
      if (options.exclude?.(sourcePath)) return undefined;

      const doc = parseMiraDoc(sourcePath, readFileSync(file, "utf8"));
      const path = options.route?.(sourcePath, doc) ?? doc.path;
      return { ...doc, path: normalizeRoute(path) };
    })
    .filter((doc): doc is MiraDoc => Boolean(doc))
    .sort(compareMiraDocs);

  const roots = [
    ...new Set(
      docs
        .map((doc) => doc.sourcePath.split("/")[0])
        .filter((root) => Boolean(root) && root.endsWith(".md") === false),
    ),
  ];

  return { docs, roots };
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );
}

function absoluteUrl(
  siteUrl: string | undefined,
  base: string,
  path: string,
): string {
  const origin = (siteUrl ?? "").replace(/\/$/, "");
  const root = base === "/" ? "" : base.replace(/\/$/, "");
  return `${origin}${root}${path === "/" ? "/" : `${path}/`}`;
}

function injectPage(
  template: string,
  doc: MiraDoc | undefined,
  config: MiraDocsConfig,
  base: string,
): string {
  const title = doc ? `${doc.title} · ${config.title}` : config.title;
  const description = doc?.description || config.description;
  const body = doc
    ? `<main class="mira-prerender"><p>${escapeHtml(doc.group)}</p><h1>${escapeHtml(doc.title)}</h1><p>${escapeHtml(doc.description)}</p><article>${marked.parse(doc.body) as string}</article></main>`
    : `<main class="mira-prerender"><h1>${escapeHtml(config.title)}</h1><p>${escapeHtml(config.description)}</p></main>`;
  const url = absoluteUrl(config.siteUrl, base, doc?.path ?? "/");
  const head = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    url ? `<link rel="canonical" href="${escapeHtml(url)}">` : "",
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="${doc?.type === "article" ? "article" : "website"}">`,
    url ? `<meta property="og:url" content="${escapeHtml(url)}">` : "",
  ].join("");

  return template
    .replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtml(title)}</title>`,
    )
    .replace(/<meta name="description"[^>]*>/i, "")
    .replace("</head>", `${head}</head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${body}</div>`,
    );
}

function outputPath(distDir: string, route: string): string {
  if (route === "/") return resolve(distDir, "index.html");
  return resolve(
    distDir,
    route.replace(/^\//, ""),
    "index.html",
  );
}

export function miraDocs(options: MiraDocsPluginOptions): Plugin {
  const root = process.cwd();
  const contentDir = resolve(root, options.contentDir ?? "content");
  let base = "/";
  let outDir = resolve(root, "dist");

  return {
    name: "mira-docs",
    enforce: "pre",

    configResolved(config) {
      base = config.base;
      outDir = resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      server.watcher.add(contentDir);
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return;
      const manifest = readManifest(contentDir, options);
      return [
        `const docs = ${JSON.stringify(manifest.docs)};`,
        `export const roots = ${JSON.stringify(manifest.roots)};`,
        "export default docs;",
      ].join("\n");
    },

    handleHotUpdate({ file, server }) {
      if (!file.startsWith(contentDir)) return;
      const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
      if (module) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: "full-reload" });
      return [];
    },

    writeBundle() {
      if (options.staticRoutes === false) return;

      const indexPath = resolve(outDir, "index.html");
      if (!existsSync(indexPath)) return;

      const template = readFileSync(indexPath, "utf8");
      const { docs } = readManifest(contentDir, options);
      const home = injectPage(template, undefined, options.config, base);
      writeFileSync(indexPath, home);

      for (const doc of docs) {
        const target = outputPath(outDir, doc.path);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(
          target,
          injectPage(template, doc, options.config, base),
        );
      }

      writeFileSync(resolve(outDir, "404.html"), home);

      if (options.config.siteUrl) {
        const urls = ["/", ...docs.map((doc) => doc.path)]
          .map(
            (path) =>
              `<url><loc>${escapeHtml(
                absoluteUrl(options.config.siteUrl, base, path),
              )}</loc></url>`,
          )
          .join("");

        writeFileSync(
          resolve(outDir, "sitemap.xml"),
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
        );
      }
    },
  };
}

export const miraDocsVirtualModule = VIRTUAL_ID;
