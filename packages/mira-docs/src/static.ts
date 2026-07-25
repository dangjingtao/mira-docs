import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { marked } from "marked";
import type { MiraDoc, MiraDocsConfig } from "./types";

export type MiraDocsStaticRoute = {
  path: string;
  title: string;
  description: string;
  body: string;
  type?: string;
  image?: string;
  robots?: string;
  jsonLd?: unknown;
  doc?: MiraDoc;
};

export type MiraDocsStaticBuildContext = {
  config: MiraDocsConfig;
  docs: MiraDoc[];
  roots: string[];
  base: string;
  outDir: string;
};

export type MiraDocsStaticImageMetadata = {
  type?: string;
  width?: number;
  height?: number;
};

export type MiraDocsStaticBuildOptions = {
  routes?: (context: MiraDocsStaticBuildContext) => MiraDocsStaticRoute[];
  notFound?: (context: MiraDocsStaticBuildContext) => MiraDocsStaticRoute;
  locale?: string;
  siteName?: string;
  defaultImage?: string;
  image?: MiraDocsStaticImageMetadata;
  twitterCard?: "summary" | "summary_large_image";
  title?: (route: MiraDocsStaticRoute, config: MiraDocsConfig) => string;
  transformTemplate?: (
    template: string,
    context: MiraDocsStaticBuildContext,
  ) => string;
  rootPlaceholder?: string;
  sitemap?: boolean;
  robots?: boolean;
};

function normalizeBase(base: string): string {
  if (!base || base === "/") return "";
  return `/${base.replace(/^\/+|\/+$/g, "")}`;
}

function normalizeRoute(path: string): string {
  const normalized = `/${path}`.replace(/\/{2,}/g, "/");
  return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}

export function miraDocsEscapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

export function miraDocsAbsoluteRouteUrl(
  siteUrl: string,
  base: string,
  path: string,
): string {
  const origin = siteUrl.replace(/\/$/, "");
  const route = normalizeRoute(path);
  return `${origin}${normalizeBase(base)}${route === "/" ? "/" : `${route}/`}`;
}

export function miraDocsAbsoluteAssetUrl(
  siteUrl: string,
  base: string,
  path: string,
): string {
  const origin = siteUrl.replace(/\/$/, "");
  const assetPath = path.replace(/^\/+/, "");
  return `${origin}${normalizeBase(base)}/${assetPath}`;
}

function routeOutputPath(outDir: string, path: string): string {
  const route = normalizeRoute(path);
  if (route === "/") return resolve(outDir, "index.html");
  return resolve(outDir, route.replace(/^\//, ""), "index.html");
}

function dataList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(/[|,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function defaultJsonLd(
  route: MiraDocsStaticRoute,
  context: MiraDocsStaticBuildContext,
  canonical: string,
  image: string | undefined,
): unknown {
  if (!route.doc) {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: context.config.title,
      url: canonical,
    };
  }

  const authors = dataList(route.doc.data.author);
  return {
    "@context": "https://schema.org",
    "@type": route.doc.type === "article" ? "Article" : "TechArticle",
    headline: route.title,
    description: route.description,
    url: canonical,
    image,
    datePublished: route.doc.date,
    author: authors.map((name) => ({ "@type": "Person", name })),
    publisher: { "@type": "Organization", name: context.config.title },
  };
}

function resolveImage(
  route: MiraDocsStaticRoute,
  context: MiraDocsStaticBuildContext,
  options: MiraDocsStaticBuildOptions,
): string | undefined {
  const value = route.image || options.defaultImage || context.config.logo;
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || /^data:image\//i.test(value)) return value;
  if (!context.config.siteUrl) {
    return `${normalizeBase(context.base)}/${value.replace(/^\/+/, "")}`;
  }
  return miraDocsAbsoluteAssetUrl(context.config.siteUrl, context.base, value);
}

export function renderMiraDocsStaticHtml(
  template: string,
  route: MiraDocsStaticRoute,
  context: MiraDocsStaticBuildContext,
  options: MiraDocsStaticBuildOptions = {},
): string {
  const pageTitle =
    options.title?.(route, context.config) ??
    (route.title === context.config.title
      ? route.title
      : `${route.title} · ${context.config.title}`);
  const canonical = context.config.siteUrl
    ? miraDocsAbsoluteRouteUrl(context.config.siteUrl, context.base, route.path)
    : "";
  const image = resolveImage(route, context, options);
  const robots = route.robots || "index,follow";
  const jsonLd =
    route.jsonLd ?? defaultJsonLd(route, context, canonical, image);
  const imageMetadata = options.image ?? {};

  const head = [
    `<meta name="description" content="${miraDocsEscapeHtml(route.description)}">`,
    `<meta name="robots" content="${miraDocsEscapeHtml(robots)}">`,
    canonical
      ? `<link rel="canonical" href="${miraDocsEscapeHtml(canonical)}">`
      : "",
    `<meta property="og:locale" content="${miraDocsEscapeHtml(options.locale || "en_US")}">`,
    `<meta property="og:title" content="${miraDocsEscapeHtml(pageTitle)}">`,
    `<meta property="og:description" content="${miraDocsEscapeHtml(route.description)}">`,
    `<meta property="og:type" content="${miraDocsEscapeHtml(route.type || "website")}">`,
    canonical
      ? `<meta property="og:url" content="${miraDocsEscapeHtml(canonical)}">`
      : "",
    `<meta property="og:site_name" content="${miraDocsEscapeHtml(options.siteName || context.config.title)}">`,
    image
      ? `<meta property="og:image" content="${miraDocsEscapeHtml(image)}"><meta property="og:image:secure_url" content="${miraDocsEscapeHtml(image)}">`
      : "",
    image && imageMetadata.type
      ? `<meta property="og:image:type" content="${miraDocsEscapeHtml(imageMetadata.type)}">`
      : "",
    image && imageMetadata.width
      ? `<meta property="og:image:width" content="${imageMetadata.width}">`
      : "",
    image && imageMetadata.height
      ? `<meta property="og:image:height" content="${imageMetadata.height}">`
      : "",
    `<meta name="twitter:card" content="${options.twitterCard || "summary_large_image"}">`,
    `<meta name="twitter:title" content="${miraDocsEscapeHtml(pageTitle)}">`,
    `<meta name="twitter:description" content="${miraDocsEscapeHtml(route.description)}">`,
    image
      ? `<meta name="twitter:image" content="${miraDocsEscapeHtml(image)}">`
      : "",
    jsonLd
      ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`
      : "",
  ].join("");

  const transformed = options.transformTemplate?.(template, context) ?? template;
  const rootPlaceholder = options.rootPlaceholder || '<div id="root"></div>';

  return transformed
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${miraDocsEscapeHtml(pageTitle)}</title>`)
    .replace(/<meta name="description"[^>]*>\s*/gi, "")
    .replace(/<meta name="robots"[^>]*>\s*/gi, "")
    .replace(/<link rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "")
    .replace("</head>", `${head}</head>`)
    .replace(rootPlaceholder, `<div id="root">${route.body}</div>`);
}

function defaultRoutes(context: MiraDocsStaticBuildContext): MiraDocsStaticRoute[] {
  return [
    {
      path: "/",
      title: context.config.title,
      description: context.config.description,
      body: `<main class="mira-prerender"><h1>${miraDocsEscapeHtml(context.config.title)}</h1><p>${miraDocsEscapeHtml(context.config.description)}</p></main>`,
      type: "website",
    },
    ...context.docs.map((doc) => ({
      path: doc.path,
      title: doc.title,
      description: doc.description || context.config.description,
      body: `<main class="mira-prerender"><p>${miraDocsEscapeHtml(doc.group)}</p><h1>${miraDocsEscapeHtml(doc.title)}</h1><p>${miraDocsEscapeHtml(doc.description)}</p><article>${marked.parse(doc.body) as string}</article></main>`,
      type: doc.type === "article" ? "article" : "website",
      image: doc.cover,
      doc,
    })),
  ];
}

function defaultNotFound(context: MiraDocsStaticBuildContext): MiraDocsStaticRoute {
  return {
    path: "/404",
    title: "Page not found",
    description: "The requested page could not be found.",
    body: `<main class="mira-prerender"><h1>Page not found</h1><p>The requested page could not be found.</p></main>`,
    type: "website",
    robots: "noindex,nofollow",
  };
}

export function writeMiraDocsStaticSite(
  context: MiraDocsStaticBuildContext,
  options: MiraDocsStaticBuildOptions = {},
): { routes: number } {
  const indexPath = resolve(context.outDir, "index.html");
  if (!existsSync(indexPath)) return { routes: 0 };

  const template = readFileSync(indexPath, "utf8");
  const routes = options.routes?.(context) ?? defaultRoutes(context);
  const routeMap = new Map(
    routes.map((route) => [normalizeRoute(route.path), { ...route, path: normalizeRoute(route.path) }]),
  );

  for (const route of routeMap.values()) {
    const target = routeOutputPath(context.outDir, route.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(
      target,
      renderMiraDocsStaticHtml(template, route, context, options),
      "utf8",
    );
  }

  const notFound = options.notFound?.(context) ?? defaultNotFound(context);
  writeFileSync(
    resolve(context.outDir, "404.html"),
    renderMiraDocsStaticHtml(template, notFound, context, options),
    "utf8",
  );

  if (context.config.siteUrl && options.sitemap !== false) {
    const urls = [...routeMap.values()]
      .map((route) =>
        `<url><loc>${miraDocsEscapeHtml(
          miraDocsAbsoluteRouteUrl(
            context.config.siteUrl!,
            context.base,
            route.path,
          ),
        )}</loc></url>`,
      )
      .join("");
    writeFileSync(
      resolve(context.outDir, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
      "utf8",
    );
  }

  if (context.config.siteUrl && options.robots !== false) {
    writeFileSync(
      resolve(context.outDir, "robots.txt"),
      `User-agent: *\nAllow: /\nSitemap: ${miraDocsAbsoluteAssetUrl(
        context.config.siteUrl,
        context.base,
        "sitemap.xml",
      )}\n`,
      "utf8",
    );
  }

  return { routes: routeMap.size };
}
