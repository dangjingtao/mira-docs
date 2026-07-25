# Architecture

MiraDocs separates three concerns:

1. **Runtime** — parses and renders content.
2. **Product repository** — stores Markdown, configuration, and project data.
3. **Mira Skill** — interprets user intent and uses GitHub tools to operate the stable contract.

The runtime must not contain product-specific author identities or workflow rules. Those belong to the consuming site or the Mira Skill.

## Dogfood rule

The official site in this repository uses `@uichat-mira/docs`. The existing UIChat Mira documentation site consumes the same package contract as the first production migration target.
