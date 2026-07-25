/// <reference types="vite/client" />

declare module "virtual:mira-docs/content" {
  import type { MiraDoc } from "@uichat-mira/docs";
  const docs: MiraDoc[];
  export default docs;
}
