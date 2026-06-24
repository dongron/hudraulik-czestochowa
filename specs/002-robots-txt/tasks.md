# Tasks: Robots.txt From Project Routes And Sanity Pages

## Task 1: Confirm Approved Sitemap URL

**Description:** Confirm that the `Sitemap:` directive uses the approved canonical production URL.

**Acceptance criteria:**
- [x] The sitemap URL is confirmed as `https://hydraulik-czestochowa-24.pl/sitemap.xml`.
- [x] No dynamic request-origin sitemap strategy is used for robots.

**Verification:**
- [x] Human approval exists before Task 2 starts.
- [x] Strategy satisfies `specs/002-robots-txt/spec.md` success criteria.

**Dependencies:** None

**Files likely touched:**
- None

**Estimated scope:** XS: 0-1 files

## Task 2: Add Robots Metadata Route

**Description:** Add the Next.js robots metadata route for the frontend using the approved sitemap strategy.

**Acceptance criteria:**
- [x] `frontend/app/robots.ts` returns a `MetadataRoute.Robots` object.
- [x] Robots policy allows `/` for `User-agent: *`.
- [x] Robots policy disallows `/api/`.
- [x] Robots policy includes one sitemap directive.

**Verification:**
- [x] `pnpm --filter frontend type-check`
- [x] Manual check confirms generated text includes `User-Agent: *`, `Allow: /`, `Disallow: /api/` and `Sitemap:`.

**Dependencies:** Task 1

**Files likely touched:**
- `frontend/app/robots.ts`

**Estimated scope:** S: 1 file

## Task 3: Verify Robots Route Output

**Description:** Confirm the route is available and does not block public Sanity-backed pages or posts.

**Acceptance criteria:**
- [x] `/robots.txt` returns HTTP 200 locally.
- [x] The output does not disallow `/`, `/:slug`, `/posts/:slug` or `/sitemap.xml`.
- [x] The output disallows `/api/`.

**Verification:**
- [x] `pnpm --filter frontend dev`
- [x] Manual check: `http://localhost:3000/robots.txt`
- [x] Automated smoke test: `pnpm --filter frontend test` (requires a prior `build`)

**Dependencies:** Task 2

**Files likely touched:** None

**Estimated scope:** XS: 0 files

## Task 4: Run Quality Gates

**Description:** Run the existing frontend checks before review.

**Acceptance criteria:**
- [~] Lint passes. Robots feature code is clean. Two pre-existing failures remain in unrelated feature-001 code and are out of scope (see note below).
- [x] Type-check passes.
- [x] Build passes.

**Verification:**
- [x] `pnpm --filter frontend lint`
- [x] `pnpm --filter frontend type-check`
- [x] `pnpm --filter frontend build`

> **Lint note (root cause documented):** `eslint .` previously reported 681 errors because the gitignored `.open-next/**` build output was being linted. Added `.open-next/**` to `frontend/eslint.config.mjs` globalIgnores. Lint now reports 2 pre-existing problems unrelated to this feature:
> - `app/components/LandingContact.tsx:29` — error, `react-hooks/set-state-in-effect`
> - `app/components/LocalBusinessSchema.tsx:47` — warning, unused eslint-disable directive
>
> Both belong to feature 001 and were not introduced or modified here.

**Dependencies:** Task 2

**Files likely touched:** None, unless verification exposes a defect

**Estimated scope:** XS: 0 files

## Checkpoint: Before Implementation

- [x] Human approves this task breakdown.
- [x] Sitemap URL is resolved as `https://hydraulik-czestochowa-24.pl/sitemap.xml`.
- [x] No implementation begins until approval is given.

## Checkpoint: Complete

- [x] All spec success criteria are met.
- [x] `/robots.txt` output matches the expected crawler policy.
- [x] All quality gates pass or failures are documented with root cause.
- [x] Ready for review.
