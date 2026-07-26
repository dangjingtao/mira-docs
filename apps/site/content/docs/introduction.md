---
title: MiraDocs 是什么
description: 一个由 Git 管理、可被 Skill 操作、能发布为公开站点的内容与静态构建运行时。
group: 开始
order: 1
type: doc
---

MiraDocs 是一个面向 Vite 与 React 的 **Git-native 文档、发布与项目门户运行时**。

它把仓库中的结构化 Markdown 转换成统一内容模型、导航与路由数据，以及可部署的静态页面产物。内容仍由 Git 管理和审阅，站点仍可以保留自己的视觉与交互，自动化则通过稳定协议工作，而不是直接修改页面实现。

## 当前状态

MiraDocs 已经完成第一阶段生产闭环：

- `@uichat-mira/docs@0.1.0` 已公开发布到 npm；
- `v0.1.0` 已作为 GitHub Release 发布；
- 后续版本使用 npm Trusted Publishing 与 GitHub OIDC；
- UIChat Mira 文档站是第一个生产消费者；
- 生产消费者已经从 Git commit 预览依赖切换到 npm 正式包。

```bash
npm install @uichat-mira/docs
```

## 它负责什么

MiraDocs 提供：

- Markdown 与 YAML Frontmatter 内容模型；
- `doc`、`article`、`project`、`page` 等统一条目；
- Vite 内容发现与 `virtual:mira-docs/content`；
- 路由、导航根节点和标题目录提取；
- 静态 HTML、canonical、Open Graph、Twitter 与 JSON-LD；
- `404.html`、`sitemap.xml` 与 `robots.txt`；
- GitHub Pages 项目路径和根路径部署支持；
- 可直接使用、也可被替换的轻量 React 运行时。

## 它不负责什么

MiraDocs 不是托管 CMS，不重新封装 GitHub API，也不强迫消费者使用同一套主题。它负责内容协议和静态构建契约；品牌、页面组合、作者模型与产品交互仍由具体站点决定。

## 为什么从 Git 开始

Git 已经提供版本、审阅、回滚、分支和协作。MiraDocs 不重新发明这些能力，而是补齐内容模型、构建产物和发布边界，让文档站能够像软件项目一样演进。

## Skill 如何参与

正式的 MiraDocs Skill 安装在 UIChat Mira。它通过 GitHub 能力管理内容、配置、分支、PR 与发布流程，只操作稳定协议，不直接修改 React 页面实现。MiraDocs 仓库中的 `skill-backup` 只是只读参考副本。
