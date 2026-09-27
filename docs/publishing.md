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

## Folio package cutover

The current package identity is `@uichat-mira/docs`, published from `dangjingtao/mira-docs`.

The planned canonical identity is:

```text
GitHub: uichat-mira/folio
npm:    @uichat-mira/folio
```

Treat this as a new-repository and new-package bootstrap rather than an in-place repository transfer.

### Migration sequence

1. create `uichat-mira/folio` and preserve the full source history from the legacy repository;
2. update the new repository's project/package identity and metadata to Folio;
3. configure npm Trusted Publishing for `uichat-mira/folio` + `publish.yml`;
4. run `npm ci` and `npm run release:check`;
5. publish `@uichat-mira/folio@0.1.1` as a behavior-parity release;
6. migrate at least one real consumer from `@uichat-mira/docs@0.1.1` to `@uichat-mira/folio@0.1.1`;
7. only after parity is verified, archive `dangjingtao/mira-docs` and deprecate the legacy npm package with a migration message.

Do not unpublish `@uichat-mira/docs`. Existing consumers must continue to resolve it while migration proceeds.

The first Folio publish is the decisive end-to-end validation of the new Trusted Publisher identity. A saved npm configuration alone is not sufficient evidence that OIDC publishing works.

The obsolete `dangjingtao.github.io/mira-docs/` Pages surface is not part of the migration target.
