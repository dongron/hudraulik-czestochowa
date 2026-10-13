# TODO: SEO Fixes And Google Reviews

Small, end-to-end parts. Strategy and decisions in [plan.md](./plan.md) · requirements and **How to test** per part in [spec.md](./spec.md).
Each task lists **Files**, **Done when** (acceptance) and **Verify** (command or check). Sizes: XS 1 file, S 1 to 2, M 3 to 5.

**Gate** (end of every part, results reported to Dominik):

```bash
pnpm --filter frontend test
pnpm --filter frontend type-check
pnpm --filter frontend lint
pnpm --filter frontend build
pnpm --filter studio type-check        # when studio/ changed
pnpm --filter studio test              # from Part 7
pnpm exec prettier --write <changed-files>
```

**Part flow:** tasks → Gate → Dominik reviews diff + drafts and runs the spec's "How to test" → on approval: publish drafts, commit (one per part), Dominik deploys.

---

## Part 0: Setup

- [x] **T0.1** Create branch `007-seo-uslugi-hydrauliczne` from `main`
  - **Done when:** `git branch --show-current` prints the branch; working tree clean.
- [x] **T0.2** Record the Gate baseline on `main` (pass/fail and error counts for test, type-check, lint, build)
  - **Done when:** baseline noted in the Part 1 report, so later failures can be attributed.

---

## Part 1: Sitemap with full https URLs

Depends on: none.

- [x] **T1.1** Write failing `frontend/app/sitemap.test.ts` (XS)
  - Cases: every URL is absolute https on `https://hydraulik-czestochowa-24.pl`; the `home` page document appears once, as the root, never as `/home`; services appear under `/uslugi/`.
  - **Done when:** all cases fail because URLs have no scheme.
  - **Verify:** `pnpm --filter frontend exec vitest run app/sitemap.test.ts`
- [x] **T1.2** Add `frontend/app/lib/site.ts` (`SITE_URL`); `frontend/app/sitemap.ts` builds URLs from it, skips the `home` page document and no longer reads `next/headers` (S)
  - **Done when:** T1.1 passes.
- [x] **T1.3** `frontend/app/robots.ts` uses `SITE_URL` (XS)
  - **Done when:** `/robots.txt` output is unchanged.
  - **Verify:** `curl -s http://localhost:3000/robots.txt`
- [x] **T1.4** Gate

> **Checkpoint 1:** spec Part 1 "How to test" → approve → commit `fix(seo): absolute sitemap URLs and drop /home` → deploy → O2.

---

## Part 2: Correct status codes

Depends on: none.

- [x] **T2.1** Write failing `frontend/app/[slug]/page.test.tsx`: an unknown slug triggers `notFound()` (XS)
  - Stub `NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET` with `vi.hoisted`; mock `@/sanity/lib/live` and `next/navigation`.
  - **Done when:** the test fails because the page resolves with the onboarding markup.
- [x] **T2.2** `frontend/app/[slug]/page.tsx`: `return notFound()` when no page matches; remove the `PageOnboarding` import (the component file stays) (XS)
  - **Done when:** T2.1 passes.
- [x] **T2.3** `frontend/next.config.ts`: `redirects()` with `{source: '/home', destination: '/', permanent: true}` (XS)
  - **Done when:** `curl -sI http://localhost:3000/home` shows `308` and `location: /`.
- [x] **T2.4** Gate

> **Checkpoint 2:** spec Part 2 "How to test" → approve → commit `fix(seo): redirect /home and return 404 for unknown pages` → deploy.

---

## Part 3: Canonical tags

Depends on: Part 1 (`SITE_URL`).

- [x] **T3.1** Write failing canonical tests (S)
  - New `frontend/app/uslugi/[slug]/page.test.tsx`: `generateMetadata` returns `alternates.canonical` `/uslugi/<slug>`.
  - Extend `frontend/app/[slug]/page.test.tsx`: canonical `/<slug>`.
  - **Done when:** both fail with `undefined`.
- [x] **T3.2** `frontend/app/layout.tsx`: `metadataBase: new URL(SITE_URL)`, replacing the `settings.ogImage.metadataBase` lookup; `frontend/app/page.tsx`: `export const metadata` with `alternates: {canonical: '/'}` (S)
  - **Done when:** `curl -s http://localhost:3000/ | grep -o '<link rel="canonical"[^>]*>'` prints exactly one tag with `https://hydraulik-czestochowa-24.pl`.
- [x] **T3.3** Canonical in `generateMetadata` of `uslugi/[slug]`, `posts/[slug]` and `[slug]` pages (M)
  - **Done when:** T3.1 passes; a service page shows exactly one canonical with its own https URL.
- [x] **T3.4** Gate

> **Checkpoint 3:** spec Part 3 "How to test" → approve → commit `fix(seo): add canonical URLs` → deploy.

---

## Part 4: Hide `/posts`

Depends on: Part 1.

- [x] **T4.1** Extend `frontend/app/sitemap.test.ts`: posts are never listed (XS)
  - **Done when:** fails while posts are still emitted.
- [x] **T4.2** `frontend/app/sitemap.ts`: skip `post` entries (XS)
  - **Done when:** T4.1 passes.
- [x] **T4.3** Gate
- [x] **T4.4** On approval, Sanity: unpublish "Why Sanity Wins Over Traditional CMSes" via the Sanity MCP (it remains as a draft)
  - **Done when:** `http://localhost:3000/posts/why-sanity-wins-over-traditional-cmses` returns 404 and Studio shows the post as unpublished.

> **Checkpoint 4:** spec Part 4 "How to test" → commit `fix(seo): hide posts from sitemap` → deploy → O2 again (resubmit sitemap).

---

## Part 5: Lighter hero image

Depends on: none. Before starting, Dominik notes the current PageSpeed Insights mobile LCP.

- [x] **T5.1** Create `frontend/public/images/hero-bg.webp` with `cwebp -q 78 -m 6` from `hero-bg.png`; keep the PNG (XS)
  - **Done when:** WebP is at most 100 KB and 1584×672.
  - **Verify:** `ls -l frontend/public/images/hero-bg.webp && sips -g pixelWidth -g pixelHeight frontend/public/images/hero-bg.webp`
- [x] **T5.2** `frontend/app/components/LandingHero.tsx`: `src="/images/hero-bg.webp"` (XS)
  - **Done when:** existing `LandingHero.test.tsx` passes; in `pnpm --filter frontend preview` the hero request is `hero-bg.webp`.
- [x] **T5.3** Gate

> **Checkpoint 5:** spec Part 5 "How to test" → approve → commit `perf(frontend): serve hero image as WebP` → deploy → compare LCP.

---

## Part 6: "Hydraulik Częstochowa" as H1, keyword in the intro

Depends on: Part 5 (same component).

- [x] **T6.1** Extend `frontend/app/components/LandingHero.test.tsx` (XS)
  - Cases: exactly one `<h1>` and it contains the `eyebrow` text; `heading` is still rendered, not as `<h1>`; with an empty `eyebrow`, `heading` is the `<h1>`.
  - **Done when:** the cases fail against the current markup.
- [x] **T6.2** `frontend/app/components/LandingHero.tsx`: render `eyebrow` as `<h1>` with the current `<p>` classes and `heading` as `<p>` with the current `<h1>` classes; fallback when `eyebrow` is empty (XS)
  - **Done when:** T6.1 passes; the hero looks the same at mobile and desktop widths.
- [x] **T6.3** Sanity draft: home page hero `subheading` → "Usługi hydrauliczne w Częstochowie: 10 lat doświadczenia. Naprawy, montaże i czyszczenie. Pogotowie hydrauliczne całą dobę, pon–sob."
  - **Done when:** Studio → Presentation shows the new intro; the published page is unchanged.
- [x] **T6.4** Gate

> **Checkpoint 6:** spec Part 6 "How to test" → approve → publish the draft → commit `feat(frontend): make eyebrow the page H1` → deploy.

---

## Part 7: Google review documents in Sanity

Depends on: none.

- [x] **T7.1** Studio test setup and failing tests (S)
  - `studio/package.json`: add `vitest` (same version as the frontend) to devDependencies and `"test": "vitest run"`.
  - New `studio/src/lib/reviewerName.test.ts`: every row of the spec's name format table for `formatReviewerName`; `isShortReviewerName` accepts `Angelika K.` and `Filip`, rejects `Angelika Kowalska`, `Angelika K`, `angelika k.` and empty strings.
  - **Done when:** `pnpm --filter studio test` runs and fails because the module does not exist.
- [x] **T7.2** Implement `studio/src/lib/reviewerName.ts` (XS)
  - **Done when:** T7.1 passes.
- [x] **T7.3** New `studio/src/schemaTypes/documents/googleReview.ts`, registered in `studio/src/schemaTypes/index.ts` (S)
  - Fields: `authorName` (required, validated with `isShortReviewerName`, message "Podaj tylko imię i pierwszą literę nazwiska, np. Angelika K."), `rating` (required, integer 1 to 5), `text` (required), `reviewDate` (date), `googleReviewId` (read-only, optional). Preview: name + stars.
  - **Done when:** `pnpm --filter studio type-check` passes; local Studio lists "Google Review" and blocks publishing "Angelika Kowalska".
- [x] **T7.4** Read the reviews from Angelika, Filip and Agnieszka on the Google Business Profile in the browser (text, stars, date)
  - **Done when:** the three reviews are captured verbatim; if Google blocks reading, Dominik pastes them.
- [x] **T7.5** Sanity drafts: three `googleReview` documents with shortened names via the Sanity MCP
  - **Done when:** the three drafts are visible in local Studio and match Google.
- [x] **T7.6** Gate

> **Checkpoint 7:** spec Part 7 "How to test" → approve → publish the three reviews → `pnpm deploy:studio` → commit `feat(reviews): add Google review documents`.

---

## Part 8: Homepage shows the Google reviews

Depends on: Part 7 published.

- [x] **T8.1** `studio/src/schemaTypes/objects/testimonialsSection.ts`: add `reviews` (array of references to `googleReview`), `sourceNote` and `sourceLinkLabel`; make the old `testimonials` optional and hidden; run `pnpm --filter frontend sanity:typegen` (M, includes generated files)
  - **Done when:** studio type-check passes; local Studio shows the new fields on the home page and hides the old one.
- [x] **T8.2** Write failing `frontend/app/components/LandingTestimonials.test.tsx` (XS)
  - Cases: renders referenced reviews in order; skips references that resolve to null; falls back to old `testimonials` when `reviews` is empty; renders `sourceNote` with a link labelled `sourceLinkLabel` to `settings.googleMapsUrl`, `target="_blank"`, `rel="noopener noreferrer"`; no link when `googleMapsUrl` is missing.
  - **Done when:** the cases fail against the current component.
- [x] **T8.3** `frontend/sanity/lib/queries.ts` projects `"reviews": reviews[]->{_id, authorName, text, rating}`, `sourceNote`, `sourceLinkLabel`; `LandingTestimonials.tsx` renders them; `frontend/app/page.tsx` passes `settings`; regenerate types (M)
  - **Done when:** T8.2 passes; http://localhost:3000/#opinie still shows the old testimonials (published content has no `reviews` yet).
- [x] **T8.4** Sanity draft on the home page testimonials section: `reviews` = Angelika, Filip, Agnieszka (in that order); `sourceNote` "Opinie klientów z naszej wizytówki Google."; `sourceLinkLabel` "Zobacz wszystkie opinie w Google"
  - **Done when:** Studio → Presentation shows the three reviews and the note.
- [x] **T8.5** Gate

> **Checkpoint 8:** spec Part 8 "How to test" → approve → publish the draft → `pnpm deploy:studio` → commit `feat(reviews): show Google reviews on the homepage` → deploy frontend.

---

## Part 9: Review import, dry run

Depends on: Part 7. **Blocked until O5** (API access approved, OAuth refresh token created).

- [ ] **T9.1** Write failing `studio/scripts/googleReviews.test.ts` (S)
  - `toGoogleReviewDoc`: `starRating` `ONE`..`FIVE` → 1..5; anonymous reviewer → skipped; no `comment` → skipped; Google translation → original text only; `_id` is `googleReview-<reviewId>`; `authorName` is shortened.
  - `planImport(googleReviews, existingDocs)`: new review → create; changed text or rating → update; hand-entered doc with identical text and no `googleReviewId` → link; unchanged → nothing; reviews missing on Google → reported, never deleted.
  - **Done when:** all cases fail because the module does not exist.
- [ ] **T9.2** Implement `studio/scripts/googleReviews.ts` (pure, no network) (XS)
  - **Done when:** T9.1 passes.
- [ ] **T9.3** `studio/scripts/import-google-reviews.ts` (dry run only) and env names in `studio/.env.example` (S)
  - Checks the five env vars and names any that are missing; refreshes the OAuth token; calls `reviews.list` with `orderBy=updateTime desc`, `pageSize=50` and follows `nextPageToken`; loads existing `googleReview` docs with `getCliClient()`; prints the plan as a table. Exits without writing, even without `--dry-run`.
  - **Done when:** with missing env vars it prints a clear error; Gate passes.
- [ ] **T9.4** Gate

> **Checkpoint 9:** Dominik fills `studio/.env.local` and runs spec Part 9 "How to test" → approve → commit `feat(reviews): Google reviews import (dry run)`.

---

## Part 10: Review import, writing to Sanity

Depends on: Part 9.

- [ ] **T10.1** Extend `studio/scripts/googleReviews.test.ts` with a mutation builder test (XS)
  - Creates use `createOrReplace` with the deterministic `_id`; links and updates use `patch` + `set`; no `delete` mutation is ever produced.
  - **Done when:** fails because the builder does not exist.
- [ ] **T10.2** Implement the mutation builder and write mode in `import-google-reviews.ts` (one transaction; summary of created, updated, linked, missing on Google) (S)
  - **Done when:** T10.1 passes; `--dry-run` output is unchanged.
- [ ] **T10.3** Gate
- [ ] **T10.4** With Dominik's OK: dry run, then real run against production; then a second real run
  - **Done when:** Studio has every profile review once (Angelika, Filip and Agnieszka linked, not duplicated); the second run reports 0 created, 0 updated; homepage unchanged.

> **Checkpoint 10:** spec Part 10 "How to test" → commit `feat(reviews): write imported Google reviews to Sanity`.

---

## Part 11 (optional, ask first): Remove the old testimonials field

Depends on: Part 8 running cleanly on production.

- [ ] **T11.1** Update `LandingTestimonials.test.tsx`: remove the fallback case; keep the others (XS)
- [ ] **T11.2** Remove `testimonials` from `testimonialsSection.ts`, the query and the component fallback; regenerate types (M)
  - **Done when:** Gate passes; homepage still shows the three reviews.
- [ ] **T11.3** With Dominik's explicit OK: unset the old `testimonials` data on the home page via the Sanity MCP
  - **Done when:** Studio shows no old testimonials; homepage unchanged.

> **Checkpoint 11:** spec Part 11 "How to test" → commit `refactor(reviews): remove inline testimonials` → `pnpm deploy:studio` → deploy frontend.

---

## Outside the repo (Dominik)

- [ ] **O1** Cloudflare: enable "Always Use HTTPS" (any time)
- [ ] **O2** Search Console: submit `https://hydraulik-czestochowa-24.pl/sitemap.xml`, request indexing of `/` and service pages (after Checkpoint 1, again after Checkpoint 4)
- [ ] **O3** Directory listings with identical name, address and phone: Oferteo, Panorama Firm, pkt.pl, Fixly (any time)
- [ ] **O4** Ask every customer for a Google review (ongoing)
- [ ] **O5** Business Profile API: apply for basic access; when approved, create an OAuth client and refresh token with scope `business.manage` (before Part 9)
