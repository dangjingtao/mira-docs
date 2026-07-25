import { parse as parseYaml } from "yaml";
import type { MiraDoc, MiraHeading } from "./types";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function slugify(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(FRONTMATTER);
  if (!match) return { data: {}, body: raw };
  const parsed = parseYaml(match[1]);
  return {
    data:
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {},
    body: match[2],
  };
}

export function extractHeadings(body: string): MiraHeading[] {
  const seen = new Map<string, number>();
  const headings: MiraHeading[] = [];
  for (const match of body.matchAll(/^(#{2,4})\s+(.+)$/gm)) {
    const text = match[2].replace(/[*_`]/g, "").trim();
    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({
      depth: match[1].length,
      text,
      id: count === 0 ? base : `${base}-${count + 1}`,
    });
  }
  return headings;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(/[|,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function text(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}

export function sourcePathToRoute(sourcePath: string): string {
  const normalized = sourcePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const withoutExt = normalized.replace(/\.md$/i, "");
  const withoutIndex = withoutExt.replace(/\/index$/i, "");
  return `/${withoutIndex}`.replace(/\/{2,}/g, "/") || "/";
}

export function parseMiraDoc(sourcePath: string, raw: string): MiraDoc {
  const { data, body } = parseFrontmatter(raw);
  const path = text(data.path) || sourcePathToRoute(sourcePath);
  const root = sourcePath.split(/[\\/]/)[0];
  const inferredType =
    root === "blogs" ? "article" : root === "projects" ? "project" : "doc";

  return {
    id: text(data.id) || slugify(path) || "home",
    path: path.startsWith("/") ? path : `/${path}`,
    sourcePath: sourcePath.replace(/\\/g, "/"),
    type: text(data.type, inferredType),
    title: text(data.title, path),
    description: text(data.description),
    group: text(
      data.group,
      inferredType === "article"
        ? "博客"
        : inferredType === "project"
          ? "项目"
          : "文档",
    ),
    order: Number(data.order ?? 99),
    date: data.date ? text(data.date) : undefined,
    tags: list(data.tags),
    status: data.status ? text(data.status) : undefined,
    cover: data.cover ? text(data.cover) : undefined,
    body,
    headings: extractHeadings(body),
    data,
  };
}

export function compareMiraDocs(a: MiraDoc, b: MiraDoc): number {
  if (a.type === "article" && b.type === "article") {
    return (
      String(b.date ?? "").localeCompare(String(a.date ?? "")) ||
      a.order - b.order
    );
  }
  return a.order - b.order || a.path.localeCompare(b.path);
}
