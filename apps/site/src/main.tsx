import React from "react";
import ReactDOM from "react-dom/client";
import { MiraDocsApp, type MiraDoc } from "@uichat-mira/docs";
import "@uichat-mira/docs/styles.css";
import docs from "virtual:mira-docs/content";
import config from "../mira-docs.config";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MiraDocsApp
      config={config}
      docs={docs as MiraDoc[]}
      basePath={import.meta.env.BASE_URL}
    />
  </React.StrictMode>,
);
