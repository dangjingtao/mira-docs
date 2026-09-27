# MiraDocs upgrade roadmap

This roadmap turns capabilities proven in real consumers into a smaller, more reliable shared publishing contract.

The goal is not to make MiraDocs own every concern of a content site. The goal is to move only stable, reusable publishing behavior into `@uichat-mira/docs`, so consumers can delete duplicate compatibility code without losing control of product-specific content rules, branding, authorship, or deployment policy.

## Baseline

Current public package: `@uichat-mira/docs@0.1.1`.

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

## Phase 1 — 0.1.2: content-time and SEO metadata contract

### Objective

Make publication and modification time a first-class static publishing contract so consumers no longer need to post-process generated HTML or patch sitemap metadata independently.

### Package scope

MiraDocs should support resolved publication metadata for static routes:

- publication time;
- modification time;
- valid JSON-LD `datePublished`;
- valid JSON-LD `dateModified`;
- sitemap `lastmod` when a reliable time is available.

The exact public API may be route fields or a route metadata object, but it must preserve this boundary:

> Consumers determine the factual time. MiraDocs serializes it consistently into static SEO output.

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

Turn MiraDocs from a generator that can emit correct static output into a runtime that can also verify the generic invariants it owns.

### Package scope

Introduce a reusable static-output verifier, exposed as a library contract first. A CLI may be added later only if multiple consumers need it.

The verifier should distinguish **errors** from **warnings** and initially focus on invariants MiraDocs can judge without knowing product semantics.

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
- site-specific duplicate-content policy beyond MiraDocs route ownership.

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

MiraDocs may provide schema structure, escaping, URL resolution, and serialization.

MiraDocs must not decide:

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

## Explicitly out of scope for MiraDocs

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

For every roadmap release:

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

### 0.1.2

Focused backward-compatible SEO/content-time improvement.

### 0.2.0

Static-output verification becomes a supported package capability.

### 0.2.x

Structured-data composition helpers graduate only as proven by real consumers.

A later version should be chosen from implemented contract changes rather than from a precommitted calendar.

## Success condition

This roadmap succeeds when consumers become smaller as MiraDocs becomes more capable.

A healthy upgrade should leave fewer duplicate renderers, SEO post-processors, static-output checks, and compatibility shims in consumer repositories while preserving their ownership of product-specific content semantics.
