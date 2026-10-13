# Implementation Plan: SEO Fixes And Google Reviews

**Spec:** [spec.md](./spec.md) · **Tasks:** [tasks.md](./tasks.md)
**Scope:** `frontend/` and `studio/`, plus Sanity content via the Sanity MCP. One new dev dependency (`vitest` in `studio/`, Part 7). No new runtime dependencies.
**Branch:** `007-seo-uslugi-hydrauliczne` (from `main`)
**Date:** 2026-10-13

---

## Overview

Eleven small parts, each a complete slice that can be reviewed, tested and deployed on its own. Parts 1 to 6 fix technical SEO and the hero markup. Parts 7 and 8 replace the placeholder testimonials with three real Google reviews entered by hand. Parts 9 and 10 add a command that pulls all Google reviews into Sanity, once Business Profile API access is approved. Part 11 is an optional cleanup.

## Strategy

Order follows **value first, then dependency, with the riskiest slices isolated**:

1. **Parts 1 to 3 (crawl and index fixes)** come first. They remove the problems that stop Google from using the sitemap and consolidating URLs, and they have no content changes, so they are the cheapest to review.
2. **Part 4 (hide posts)** reuses the sitemap work from Part 1 and adds the first Sanity change, which is a reversible unpublish.
3. **Parts 5 and 6 (hero)** touch the same component, so they run back to back. Neither changes the look of the page.
4. **Parts 7 and 8 (reviews)** use an expand-then-contract migration: new documents and a new field sit next to the old testimonials, so the live site is never broken between publishing content and deploying code.
5. **Parts 9 and 10 (import)** are blocked on Google approving API access (O5). Nothing before them depends on them.
6. **Part 11** removes the old testimonials only after Part 8 has run cleanly on production, with explicit approval.

Every part leaves `main`-quality code: tests, type-check, lint and build pass, and the site works whether or not the part's Sanity drafts are published yet.

## Architecture Decisions

| ID | Decision | Rationale |
|---|---|---|
| AD1 | `SITE_URL` constant in `frontend/app/lib/site.ts` | D8. One source for sitemap, robots and `metadataBase`; never derived from the request `host` (the cause of F1) |
| AD2 | Status codes via Next primitives: `redirects()` in `next.config.ts` (permanent, 308) and `notFound()` in the `[slug]` route | Supported by OpenNext on Cloudflare; no middleware needed |
| AD3 | `metadataBase` in the root layout, relative `alternates.canonical` per route | Next composes absolute canonical URLs from `metadataBase` (see `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`). Canonical is set per page, never in the layout, so pages don't inherit the homepage canonical |
| AD4 | Posts hidden by unpublishing the content plus a sitemap filter; route code stays | Reversible, smallest change; a future blog only needs the filter removed |
| AD5 | Hero served as a pre-converted static WebP | OpenNext without a Cloudflare Images binding serves the original file, so the file itself must be small |
| AD6 | H1 change is markup only (`eyebrow` rendered as `<h1>`, `heading` as `<p>`, same classes) | D2. No schema or content change and no visual change |
| AD7 | Reviews are separate `googleReview` documents; the testimonials section references them | Separates the pool of reviews (filled by hand now, by the import later) from the selection shown on the homepage, so imports never change what is shown |
| AD8 | Name rules live once, in `studio/src/lib/reviewerName.ts` | Used by both Studio validation (Part 7) and the import (Part 9); tested with Vitest added to Studio |
| AD9 | Import runs with `sanity exec --with-user-token`, calls Business Profile API v4 with plain `fetch`, uses deterministic `_id: googleReview-<reviewId>` and never deletes | Uses the CLI login instead of a stored write token; safe to re-run; deletions stay manual |
| AD10 | Sanity content edits are made by Claude through the Sanity MCP as drafts and published when the part is approved; only one part at a time edits a given document | D5. Drafts are visible in Studio → Presentation (preview origin `http://localhost:3000`) but not on the live site |
| AD11 | One branch, one commit per part, conventional messages as in the existing history (`fix(seo): ...`, `feat(reviews): ...`); commits and deploys only when Dominik says so | Small, reviewable history; matches the user's git rules |

## Dependency Graph

```
Part 1  SITE_URL + sitemap ──┬──▶ Part 3  canonicals (uses SITE_URL)
                             └──▶ Part 4  hide posts (sitemap filter)
Part 2  /home 308 + 404          (independent)
Part 5  hero WebP ──────────▶ Part 6  H1 markup (same component, run in order)

Part 7  reviewerName + googleReview type + 3 review docs
   │
   ├──▶ Part 8  testimonials reference reviews (expand) ──▶ Part 11  remove old field (contract, optional)
   │
   └──▶ Part 9  import dry run ──▶ Part 10  import writes
              ▲
              O5  Business Profile API access (Dominik)
```

## Parts And Checkpoints

| Phase | Part | Slice | Size | Sanity change | Blocked by |
|---|---|---|---|---|---|
| Crawl and index | 1 | Sitemap with full https URLs | S | none | none |
| | 2 | `/home` 308, real 404s | S | none | none |
| | 3 | Canonical tags | M | none | Part 1 |
| | 4 | Hide `/posts` | S | unpublish template post | Part 1 |
| Hero | 5 | Hero WebP | XS | none | none |
| | 6 | "Hydraulik Częstochowa" as H1, keyword in intro | S | intro text (draft) | Part 5 |
| Reviews | 7 | Google review documents | M | 3 review drafts, Studio deploy | none |
| | 8 | Homepage shows the reviews | M | testimonials selection (draft), Studio deploy | Part 7 published |
| Import | 9 | Import dry run | M | none | Part 7, O5 |
| | 10 | Import writes | S | first import run | Part 9 |
| Cleanup | 11 | Remove old testimonials field (optional) | S | unset old data (explicit OK) | Part 8 stable on production |

**Checkpoint after every part:** Claude reports gate results; Dominik reviews the diff and drafts and runs the part's "How to test" from the spec; on approval Claude publishes drafts and commits; Dominik deploys.

**Phase checkpoints:**
- After Part 4: production sitemap is valid, `/home` and `/posts` are gone, canonicals are present. Dominik submits the sitemap in Search Console (O2).
- After Part 6: homepage has one `<h1>` and a lighter hero; PageSpeed LCP compared with the value recorded before Part 5.
- After Part 8: homepage shows the three real reviews; old testimonials no longer visible.
- After Part 10: one command keeps Sanity in sync with Google reviews.

## Parallelization

Not needed: parts are reviewed one at a time by design (D7). If speed matters later, Parts 2 and 5 could be done alongside others because they share no files, but Parts 1, 3 and 4 share `sitemap.ts` and the `[slug]` route, and Parts 5 and 6 share `LandingHero.tsx`.

## Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Lint or type-check already fails on `main` for unrelated reasons, hiding new problems | Med | T0.2 records the baseline before Part 1; gates compare against it |
| A Sanity draft from one part is still unpublished when the next part edits the same document | Med | AD10: a part's drafts are published (or discarded) before the next part starts |
| Content published before the new frontend is deployed | High | Expand-then-contract in Part 8; old frontend ignores the new field |
| Cloudflare keeps serving cached pages after a Sanity-only change | Low | Production checks happen after the part's deploy |
| Google blocks automated reading of the reviews | Low | Dominik pastes the three reviews instead (T7.4) |
| Business Profile API access rejected or delayed | Med | Parts 1 to 8 don't depend on it; Parts 9 and 10 wait |
| Import duplicates the hand-entered reviews | Med | `planImport` links reviews with identical text to the existing documents (T9.1, T9.2); second run must report 0 changes |
| Full surnames leak into Sanity | High | Studio validation (T7.3) plus import formatter (T9.2), both tested; no field stores the original display name |
| `pnpm --filter frontend build` needs network access to Sanity | Low | Run gates on a connected machine; failures from network are reported as such, not as code failures |

## Open Questions

None.
