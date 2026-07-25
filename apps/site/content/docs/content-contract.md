---
title: 内容协议
description: Skill 和运行时共同依赖的最小稳定契约。
group: 开始
order: 2
type: doc
---

每篇内容是一个带 YAML frontmatter 的 Markdown 文件。

```yaml
---
title: Agent Harness 设计
type: article
status: published
tags:
  - Agent
  - Harness
---
```

## 稳定字段

`title`、`type`、`status`、`description`、`group`、`order`、`date`、`tags` 和 `cover` 是第一阶段的稳定字段。

未知字段会保存在 `data` 中，方便未来扩展而不破坏旧内容。
