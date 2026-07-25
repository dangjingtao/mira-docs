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
