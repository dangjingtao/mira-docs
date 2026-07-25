import type { ReactNode } from "react";

export type MiraEntryType = "doc" | "article" | "project" | "page" | string;

export type MiraHeading = {
  depth: number;
  text: string;
  id: string;
};

export type MiraDoc = {
  id: string;
  path: string;
  sourcePath: string;
  type: MiraEntryType;
  title: string;
  description: string;
  group: string;
  order: number;
  date?: string;
  tags: string[];
  status?: string;
  cover?: string;
  body: string;
  headings: MiraHeading[];
  data: Record<string, unknown>;
};

export type MiraDocsNavigationItem = {
  label: string;
  href: string;
};

export type MiraDocsConfig = {
  title: string;
  description: string;
  logo?: string;
  siteUrl?: string;
  base?: string;
  navigation?: MiraDocsNavigationItem[];
  footer?: string;
  github?: string;
};

export type MiraDocsSlots = {
  home?: ReactNode;
  headerActions?: ReactNode;
  articleFooter?: ReactNode;
};

export type MiraDocsAppProps = {
  config: MiraDocsConfig;
  docs: MiraDoc[];
  basePath?: string;
  slots?: MiraDocsSlots;
};
