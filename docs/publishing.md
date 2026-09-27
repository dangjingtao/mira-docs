# Publishing @uichat-mira/docs

The npm package is published from `packages/mira-docs`. The workspace root and official site remain private.

## Release gate

From the repository root:

```bash
npm ci
npm run release:check
```

`release:check` runs type checking, tests, the official-site build, and an `npm pack --dry-run` audit. The audit verifies the public package name and required `dist` files, and rejects leaked source or test files.

## First release

The first release creates the package entry under the `uichat-mira` npm organization and therefore uses an interactive npm account with publishing 2FA:

```bash
cd packages/mira-docs
npm login
npm publish --access public
```

The package also declares `publishConfig.access=public`, but the explicit flag keeps the first release intent visible.

## Trusted publishing after 0.1.0

After the package exists on npmjs.com, configure its Trusted Publisher with:

- GitHub owner: `dangjingtao`
- Repository: `mira-docs`
- Workflow filename: `publish.yml`
- Allowed action: `npm publish`

The workflow must use a GitHub-hosted runner, Node 22.14 or newer, npm 11.5.1 or newer, and `id-token: write`. Trusted publishing removes long-lived write tokens and automatically adds provenance for a public package from this public repository.

Do not create or store an npm automation token unless trusted publishing cannot be used.

## Repository ownership migration

The current publishing identity is tied to `dangjingtao/mira-docs`. The repository is planned to move to `uichat-mira/mira-docs` before further roadmap releases.

Treat the repository transfer and npm Trusted Publisher change as one cutover:

1. transfer the GitHub repository first;
2. verify repository history, workflows, releases, tags, secrets, and integrations;
3. update `packages/mira-docs/package.json` so its repository URL exactly matches `uichat-mira/mira-docs`;
4. replace the npm Trusted Publisher repository identity with `uichat-mira/mira-docs` + `publish.yml` and allow the direct `npm publish` action used by the workflow;
5. verify the first real post-transfer release publishes through OIDC before declaring migration complete.

Do not point `package.json` at the organization repository before the GitHub transfer has actually completed. Do not remove the old trust relationship before the organization-side publishing configuration is ready.

npm does not fully validate a Trusted Publisher configuration when it is saved; the first real publish is the decisive end-to-end check. Keep the last known-good source tag/commit and published npm version as rollback anchors.
