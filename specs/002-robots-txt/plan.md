# Implementation Plan: Robots.txt From Project Routes And Sanity Pages

## Overview

Add a frontend `robots.txt` response that keeps public Sanity-backed site content crawlable, disallows internal API routes and points crawlers to the existing sitemap at `https://hydraulik-czestochowa-24.pl/sitemap.xml`. This plan does not change Sanity schemas, sitemap generation or page rendering.

## Source-Verified Framework Pattern

Next.js 16 supports generating `robots.txt` by adding `app/robots.ts` that returns a `MetadataRoute.Robots` object. The official documentation shows `rules`, `allow`, `disallow` and `sitemap` fields, and notes that `robots.ts` is a special Route Handler cached by default unless it uses request-time APIs or dynamic config.

Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

## Architecture Decisions

- Use `frontend/app/robots.ts` rather than a static `frontend/app/robots.txt` file, because the project already uses Next.js metadata routes for sitemap generation and TypeScript typing catches invalid robots object shape.
- Keep the crawler policy route-based rather than Sanity-document-based: `robots.txt` should not enumerate every Sanity page or post; `sitemap.xml` already provides dynamic page and post discovery.
- Use one global crawler rule: `User-agent: *`, `Allow: /`, `Disallow: /api/`.
- Do not disallow `/:slug` or `/posts/:slug`, because those are the public Sanity-backed content routes.
- Do not change `frontend/app/sitemap.ts` in this feature unless the sitemap host issue is explicitly pulled into scope.
- Use the approved canonical sitemap URL: `https://hydraulik-czestochowa-24.pl/sitemap.xml`.

## Dependency Graph

```text
Robots metadata route in frontend/app/robots.ts
    |
    v
Lint, type-check and build verification
    |
    v
Manual /robots.txt content verification
```

## Task List

### Phase 1: Foundation

## Task 1: Confirm Approved Sitemap URL

**Description:** Confirm that the `Sitemap:` directive will use the approved canonical production URL before writing the robots route.

**Acceptance criteria:**
- [ ] The sitemap URL is confirmed as `https://hydraulik-czestochowa-24.pl/sitemap.xml`.
- [ ] No dynamic request-origin sitemap strategy is used for robots.

**Verification:**
- [ ] Human approval is recorded in this planning session.
- [ ] The selected strategy still satisfies `specs/002-robots-txt/spec.md` success criteria.

**Dependencies:** None

**Files likely touched:**
- None

**Estimated scope:** XS: 0-1 files

## Task 2: Add Robots Metadata Route

**Description:** Create the Next.js robots metadata route with the approved sitemap strategy and the route policy from the spec.

**Acceptance criteria:**
- [ ] `frontend/app/robots.ts` exists and returns a `MetadataRoute.Robots` object.
- [ ] The rule allows `/` for `User-agent: *`.
- [ ] The rule disallows `/api/`.
- [ ] The route includes a sitemap directive using the Task 1 strategy.

**Verification:**
- [ ] TypeScript accepts the route shape via `pnpm --filter frontend type-check`.
- [ ] The rendered robots output contains `User-Agent: *`, `Allow: /`, `Disallow: /api/` and one `Sitemap:` directive.

**Dependencies:** Task 1

**Files likely touched:**
- `frontend/app/robots.ts`

**Estimated scope:** S: 1 file

### Checkpoint: Foundation

- [ ] Task 1 sitemap URL is approved.
- [ ] Task 2 route file is complete.
- [ ] No Sanity schema, sitemap route or page rendering files were changed.
- [ ] Review with human before final verification if the chosen sitemap strategy differs from the spec assumption.

### Phase 2: Verification

## Task 3: Verify Robots Behavior Against Routes

**Description:** Verify that `robots.txt` is exposed by the frontend and matches the public route model discovered in the spec.

**Acceptance criteria:**
- [ ] `/robots.txt` returns HTTP 200 in local dev.
- [ ] `/robots.txt` does not disallow `/`, `/:slug`, `/posts/:slug` or `/sitemap.xml`.
- [ ] `/robots.txt` disallows `/api/`, which covers `/api/draft-mode/enable`.

**Verification:**
- [ ] Run `pnpm --filter frontend dev` and manually check `http://localhost:3000/robots.txt`.
- [ ] Confirm the visible text matches the expected policy in `specs/002-robots-txt/spec.md`.

**Dependencies:** Task 2

**Files likely touched:** None

**Estimated scope:** XS: 0 files

## Task 4: Run Quality Gates

**Description:** Run the existing frontend quality gates so the feature is ready for review.

**Acceptance criteria:**
- [ ] Frontend lint passes.
- [ ] Frontend type-check passes.
- [ ] Frontend production build passes.

**Verification:**
- [ ] `pnpm --filter frontend lint`
- [ ] `pnpm --filter frontend type-check`
- [ ] `pnpm --filter frontend build`

**Dependencies:** Task 2

**Files likely touched:** None, unless verification exposes a defect

**Estimated scope:** XS: 0 files

### Checkpoint: Complete

- [ ] All success criteria from `specs/002-robots-txt/spec.md` are satisfied.
- [ ] `/robots.txt` and `/sitemap.xml` are both reachable in the local verification environment.
- [ ] Implementation touched no more than two source files.
- [ ] Ready for human review.

## Parallelization Opportunities

- Task 1 is already resolved by the approved domain and must remain unchanged unless the domain changes.
- Task 2 must happen before Tasks 3 and 4.
- Tasks 3 and 4 can run independently after Task 2 is complete.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Canonical production domain changes after implementation | Medium | Update the spec first, then update `frontend/app/robots.ts` |
| Dynamic request host causes preview deployments to advertise preview sitemap URLs | Low | Use the fixed canonical URL `https://hydraulik-czestochowa-24.pl/sitemap.xml` |
| Accidentally blocking public Sanity pages or posts | High | Keep disallow list scoped to `/api/` only and verify against discovered routes |
| Existing sitemap URL generation may not include protocol | Medium | Do not modify sitemap in this feature; document as separate follow-up if discovered during verification |
| Build contacts Sanity during verification and fails due missing env or dataset access | Medium | Record environment failure separately from robots route correctness; do not change Sanity config without approval |

## Open Questions

- None. The approved canonical sitemap URL is `https://hydraulik-czestochowa-24.pl/sitemap.xml`.
