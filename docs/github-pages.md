# GitHub Pages deployment

The official site is deployed by `.github/workflows/pages.yml`.

The Vite base path is derived from `GITHUB_REPOSITORY`:

- project repository: `/<repository-name>/`
- `<owner>.github.io`: `/`
- local development: `/`

During production builds, the MiraDocs Vite plugin also emits route-level `index.html` files, `404.html`, and `sitemap.xml`.
