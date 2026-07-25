import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolveGithubPagesBase } from "@mira/docs";
import { miraDocs } from "@mira/docs/vite";
import config from "./mira-docs.config";

const base = resolveGithubPagesBase(process.env.GITHUB_REPOSITORY);

export default defineConfig({
  base,
  plugins: [
    react(),
    miraDocs({
      contentDir: "content",
      config,
      staticRoutes: true,
    }),
  ],
});
