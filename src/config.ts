import type { MiraDocsConfig } from "./types";

export function defineMiraDocsConfig<T extends MiraDocsConfig>(config: T): T {
  return config;
}

export function normalizeBasePath(base = "/"): string {
  if (!base || base === "/") return "/";
  return `/${base.replace(/^\/+|\/+$/g, "")}/`;
}

export function resolveGithubPagesBase(repository?: string): string {
  if (!repository) return "/";
  const [, name = ""] = repository.split("/");
  if (!name || name.endsWith(".github.io")) return "/";
  return normalizeBasePath(name);
}
