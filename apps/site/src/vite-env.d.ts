/// <reference types="vite/client" />

declare module "virtual:mira-docs/content" {
  import type { MiraDoc } from "@mira/docs";
  const docs: MiraDoc[];
  export default docs;
}
