# Folio migration and upgrade roadmap

This roadmap turns capabilities proven in real consumers into a smaller, more reliable shared publishing contract.

The goal is not to make Folio own every concern of a content site. The goal is to move only stable, reusable publishing behavior into `@uichat-mira/folio`, so consumers can delete duplicate compatibility code without losing control of product-specific content rules, branding, authorship, or deployment policy.

## Baseline

Current legacy package: `@uichat-mira/docs@0.1.1`.

Planned canonical package after Phase 0: `@uichat-mira/folio`.

The current package already owns:

- Markdown discovery and rendering;
- the Vite content manifest;
- route-level static HTML generation;
- canonical, Open Graph, Twitter, and JSON-LD metadata;
- `404.html`, `sitemap.xml`, and `robots.txt`;
- GitHub Pages base-path handling.

Real consumers have exposed the next reusable gaps, especially around content-time metadata, static-output verification, and structured-data composition.

## Design principles

1. **Promote proven behavior, not hypothetical abstraction.** A capability should move into MiraDocs only after a real consumer demonstrates a stable reusable boundary.
2. **One concern, one source of truth.** Once MiraDocs owns a generic publishing behavior, consumers should remove their equivalent fallback or post-processing implementation.
3. **Consumers own product semantics.** MiraDocs must not infer site-specific authorship, taxonomies, historical URL policy, editorial rules, or business-specific content relationships.
4. **Inputs may be consumer-specific; output contracts should be shared.** A consumer may derive publication time from Git history, a CMS, or explicit frontmatter. MiraDocs should only own the common output semantics once those facts are resolved.
5. **Backward-compatible migration first.** New shared contracts should allow current consumers to adopt them incrementally and delete compatibility code only after equivalent output is verified.
6. **Verification is part of the feature.** A release is not complete when an API exists; it is complete when package tests and at least one real consumer prove the intended static output.

## Phase 0 — Folio bootstrap and package cutover

### Objective

Create a new canonical home instead of transferring the legacy repository in place:

```text
GitHub: uichat-mira/folio
npm:    @uichat-mira/folio
```

The existing `dangjingtao/mira-docs` repository remains as the migration source and rollback anchor until Folio is proven. The old GitHub Pages URL is already non-functional and is not a migration target.

### Why a new repository

This change intentionally separates three concerns that have become coupled in the legacy repository:

- the project brand (`MiraDocs`);
- the personal GitHub repository identity (`dangjingtao/mira-docs`);
- the legacy npm package name (`@uichat-mira/docs`).

The new repository establishes one consistent identity for the shared publishing runtime without inheriting the broken GitHub Pages surface or the old Mira-branded repository name.

### Bootstrap

Create `uichat-mira/folio` and seed it with the full Git history from `dangjingtao/mira-docs` so source history remains inspectable.

Before any package publish:

- verify the imported commit history and tags;
- verify package tests and `npm run release:check`;
- replace project naming and repository metadata with Folio;
- remove or disable GitHub Pages behavior that exists only for the obsolete personal-site URL;
- update repository-owned documentation and links to the new canonical repository;
- configure npm Trusted Publishing for `uichat-mira/folio` + `publish.yml`.

The legacy repository should remain writable only for migration fixes until the Folio cutover is accepted, then be archived with a clear migration notice. Do not delete it.

### Package naming and compatibility

Folio's canonical package is:

```text
@uichat-mira/folio
```

The existing `@uichat-mira/docs` package remains published so existing installations do not break.

Do not unpublish the legacy package. After Folio is proven by at least one real consumer, deprecate `@uichat-mira/docs` with a migration message that points to `@uichat-mira/folio`.

### Parity release

The first Folio release should prove the rename and publisher migration without mixing in a new runtime feature.

Publish:

```text
@uichat-mira/folio@0.1.1
```

as a behavior-parity release of the current `@uichat-mira/docs@0.1.1` contract, with only the project/package identity and repository metadata changed as required.

Then migrate one real consumer from:

```text
@uichat-mira/docs@0.1.1
```

to:

```text
@uichat-mira/folio@0.1.1
```

and verify package imports, build output, static output, and runtime behavior before starting Phase 1.

This keeps repository/package migration independent from the content-time feature planned for 0.1.2.

### Exit criteria

Phase 0 is complete when:

- `uichat-mira/folio` is the canonical repository;
- full Git history has been preserved in the new repository;
- `@uichat-mira/folio@0.1.1` has published successfully through GitHub Actions OIDC;
- package metadata and provenance point at `uichat-mira/folio`;
- at least one real consumer has migrated to the Folio package with equivalent behavior;
- the obsolete GitHub Pages surface is no longer treated as a supported deployment target;
- `dangjingtao/mira-docs` is archived with a migration notice;
- `@uichat-mira/docs` remains available but is marked for compatibility-only use.

## Phase 1 — 0.1.2: content-time and SEO metadata contract

### Objective

Make publication and modification time a first-class static publishing contract so consumers no longer need to post-process generated HTML or patch sitemap metadata independently.

### Package scope

Folio should support resolved publication metadata for static routes:

- publication time;
- modification time;
- valid JSON-LD `datePublished`;
- valid JSON-LD `dateModified`;
- sitemap `lastmod` when a reliable time is available.

The exact public API may be route fields or a route metadata object, but it must preserve this boundary:

> Consumers determine the factual time. Folio serializes it consistently into static SEO output.

### Compatibility requirements

- Existing `doc.date` behavior must continue to work for consumers that have not adopted the richer contract.
- A missing modification time must not invent one from build time, filesystem mtime, or the current clock.
- Invalid or unsupported date values must not silently become misleading SEO metadata.
- Static output must remain stable for root-path and GitHub Pages project-path deployments.

### Verification

Add regression coverage for:

- article JSON-LD with publication time only;
- article JSON-LD with publication and modification time;
- sitemap `lastmod`;
- missing dates;
- malformed dates;
- base-path deployments;
- consumer-supplied JSON-LD remaining authoritative when explicitly provided.

### Consumer migration

After 0.1.2 is published, migrate a real consumer and verify generated output before removing consumer-side patches.

For `tomz-io`, the intended end state is:

- keep its Git-history/content-time derivation as a site concern;
- pass resolved times into MiraDocs;
- remove equivalent JSON-LD date post-processing once output parity is proven;
- remove duplicate sitemap date handling when MiraDocs fully owns the shared output.

### Exit criteria

0.1.2 is complete when:

- package tests cover the contract;
- `npm run release:check` passes;
- the official site still builds;
- at least one external consumer verifies equivalent or better JSON-LD and sitemap output;
- no consumer-specific author or taxonomy rule is introduced into the package.

## Phase 2 — 0.2.0: static-output verification

### Objective

Turn Folio from a generator that can emit correct static output into a runtime that can also verify the generic invariants it owns.

### Package scope

Introduce a reusable static-output verifier, exposed as a library contract first. A CLI may be added later only if multiple consumers need it.

The verifier should distinguish **errors** from **warnings** and initially focus on invariants Folio can judge without knowing product semantics.

Candidate error checks:

- malformed or duplicate canonical URLs for generated routes;
- invalid JSON-LD syntax;
- indexable `404.html`;
- generated routes missing from expected static output;
- indexable routes omitted from sitemap without an explicit reason;
- `noindex` routes included in sitemap;
- malformed sitemap or robots output;
- deployment-base inconsistencies in canonical/static asset URLs.

Candidate warnings:

- missing descriptions;
- missing social images;
- weak default structured data where a richer site-supplied schema may be preferable.

The verifier must not treat site-specific editorial preferences as universal errors.

### Consumer migration

Consumers may keep additional site-specific verification, but generic checks should be removed from consumers once the shared verifier covers them.

A consumer remains responsible for checks such as:

- author identity/order;
- Book/Group/Tag rules;
- historical URL ownership;
- product-specific redirects;
- content-time provenance;
- site-specific duplicate-content policy beyond Folio route ownership.

### Exit criteria

0.2.0 is complete when:

- the verifier can run against package fixtures and the official site;
- at least one external consumer can replace a meaningful subset of custom static-output checks;
- failure messages identify the affected route/file and invariant;
- no verification rule depends on a specific consumer name, taxonomy, author model, or hosting vendor.

## Phase 3 — 0.2.x: structured-data composition helpers

### Objective

Reduce repeated schema boilerplate without moving editorial or identity decisions into MiraDocs.

### Candidate helpers

Provide small composable helpers or typed builders for common schema structures such as:

- `Article`;
- `CollectionPage`;
- `ItemList`;
- `BreadcrumbList`;
- resolved `Person` / `Organization` references supplied by the consumer.

### Boundary

Folio may provide schema structure, escaping, URL resolution, and serialization.

Folio must not decide:

- who the author is;
- whether a reviewer is a co-author;
- what a Book or Group means;
- which content belongs to a collection;
- which legacy URL should redirect to which new location.

### Exit criteria

A helper graduates into the public package only when it removes real repeated code from at least two routes or consumers without hiding important semantics.

## Phase 4 — later candidates, evidence required

These capabilities are intentionally deferred until repeated real-world demand proves a stable shared contract:

- redirect-file generation for Cloudflare or other hosts;
- host-specific deployment adapters;
- richer sitemap partitioning;
- feed generation beyond the current consumer implementations;
- additional content-source adapters;
- optional CLI tooling around validation and migration.

Do not add these merely because they are convenient for one site.

## Explicitly out of scope for Folio

The following remain consumer or Skill responsibilities unless a future contract is separately justified:

- product-specific author identity and authorship policy;
- `writtenBy`, `reviewedBy`, or editorial workflow semantics;
- Tomz.io Group/Tag/Book taxonomy;
- Git-history derivation of factual publication/modification time;
- legacy URL decisions tied to one site's history;
- homepage AI-derived content;
- brand-specific layout, styling, navigation copy, or visual design;
- Cloudflare-specific redirect policy that has no second real consumer;
- repository-specific governance or release acceptance rules.

## Release and migration discipline

For every roadmap release after Phase 0:

1. implement the smallest coherent package contract;
2. add package-level regression tests;
3. run:
   ```bash
   npm ci
   npm run release:check
   ```
4. verify the official site;
5. publish the package through the existing trusted publishing flow;
6. upgrade one real consumer;
7. compare generated static output and behavior;
8. only then delete equivalent consumer compatibility code;
9. record remaining consumer-only behavior instead of pushing it into MiraDocs.

A package release must not be treated as complete solely because npm publishing succeeded.

## Version intent

### Phase 0

Bootstrap `uichat-mira/folio`, publish the parity package `@uichat-mira/folio@0.1.1`, migrate one real consumer, then archive the legacy repository. This is an operational prerequisite, not a new runtime feature.

### 0.1.2

Focused backward-compatible SEO/content-time improvement.

### 0.2.0

Static-output verification becomes a supported package capability.

### 0.2.x

Structured-data composition helpers graduate only as proven by real consumers.

A later version should be chosen from implemented contract changes rather than from a precommitted calendar.

## Success condition

This roadmap succeeds when consumers become smaller as Folio becomes more capable.

A healthy upgrade should leave fewer duplicate renderers, SEO post-processors, static-output checks, and compatibility shims in consumer repositories while preserving their ownership of product-specific content semantics.
