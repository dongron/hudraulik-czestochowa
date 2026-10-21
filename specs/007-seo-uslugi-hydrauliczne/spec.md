# Spec: SEO Fixes And Google Reviews For "Usługi Hydrauliczne Częstochowa"

Status: Spec reviewed 2026-10-13, all open questions resolved. Plan and tasks awaiting approval: [plan.md](./plan.md), [tasks.md](./tasks.md). No code is written until they are approved.

## Decisions (Dominik, 2026-10-13)

| ID | Decision |
|---|---|
| D1 | Target query is **"usługi hydrauliczne Częstochowa"**. The homepage `<title>` `Usługi Hydrauliczne Częstochowa` stays unchanged. "hydraulik częstochowa 24" is not a target. |
| D2 | **"Hydraulik Częstochowa" is the H1** and stays. Today that text is the hero `eyebrow`, rendered as a `<p>` above the real `<h1>` ("Profesjonalne usługi hydrauliczne"). Part 6 makes it the actual `<h1>` without any visual change. |
| D3 | **`/posts` is hidden**: the template post is unpublished and posts are left out of the sitemap. Route code stays. |
| D4 | No jobs on Sundays. Opening hours are out of scope. |
| D5 | **Claude applies the Sanity changes** via the Sanity MCP. Content edits are saved as drafts first (visible in Studio, not on the live site) and published when Dominik approves the part. |
| D6 | The homepage shows Google reviews from **Angelika, Filip and Agnieszka**, replacing the three current testimonials. Names are shown and stored as **first name + first letter of the last name** only. |
| D7 | Work is delivered in **small end-to-end parts**. Each part is reviewed and tested on its own before the next starts. |
| D8 | The production URL is a **hardcoded constant** (`SITE_URL`), not read from Sanity. |
| D9 | The Google Business Profile has been verified for 60+ days, so it qualifies for Business Profile API access. |
| D10 | Google's average rating and review count are **not** shown. |
| D11 | The FAQ section and other homepage content expansion move to the **next phase** (separate spec). |
| D13 | **Automatic review import (Parts 9 and 10) is skipped**, and so is the Business Profile API application (O5). Reviews are added by hand in Studio. |
| D12 | Obvious spelling mistakes in review text may be corrected (e.g. "dokladnie" → "dokładnie", "kultularny" → "kulturalny"). Wording and meaning never change. All three reviews are 5 stars; no dates are stored. |

## Assumptions

1. The canonical production origin is `https://hydraulik-czestochowa-24.pl` (no `www`, https only), as already used in `frontend/app/robots.ts` and the JSON-LD `url`.
2. The homepage `/` is rendered from the Sanity `page` document with slug `home` (`landingPageQuery`). That document stays published; only its duplicate URL `/home` goes away.
3. The only post, "Why Sanity Wins Over Traditional CMSes", is a leftover from the Sanity starter template.
4. Reviews by Angelika, Filip and Agnieszka exist on the business's Google Business Profile (`settings.googleMapsUrl`).
5. Review text and star rating are shown as on Google. Only the name is shortened and obvious spelling mistakes are corrected (D12).
6. There is one Sanity dataset (`production`), so published content changes are live immediately.
7. Deployment stays on Cloudflare via OpenNext. Dominik deploys (or asks Claude to) after approving a part.

## Objective

Make the site eligible to rank for "usługi hydrauliczne Częstochowa" by fixing the technical problems that stop Google from crawling and consolidating it, and by putting the target phrase in the homepage copy.

Replace the placeholder testimonials with real Google reviews managed in Sanity, so the social proof is genuine, verifiable and easy to refresh.

Users: people in Częstochowa searching for a plumber, Google's crawler and Dominik as the content editor.

Audit findings (live site, 2026-10-13):

| # | Finding | Evidence | Part |
|---|---|---|---|
| F1 | Sitemap `<loc>` values have no scheme, so Google rejects them | `<loc>hydraulik-czestochowa-24.pl/uslugi/...</loc>`; `sitemap.ts` builds URLs from the `host` header | 1 |
| F2 | `/home` duplicates `/` (102 words) and is in the sitemap | `GET /home` returns 200 | 1, 2 |
| F3 | Unknown URLs return 200 with an empty page (soft 404) | `GET /nonexistent-page-xyz` returns 200; `[slug]/page.tsx` renders `<PageOnboarding />` instead of `notFound()` | 2 |
| F4 | No `<link rel="canonical">` on any page; `metadataBase` is undefined | Only set when `settings.ogImage.metadataBase` exists in Sanity | 3 |
| F5 | `http://` serves 200 instead of redirecting to https | `curl -I http://hydraulik-czestochowa-24.pl/` returns 200 | 3, O1 |
| F6 | An English template post is indexable on a Polish plumbing site | `/posts/why-sanity-wins-over-traditional-cmses`, 1,760 words | 4 |
| F7 | Hero image is a 1.5 MB PNG; Next image optimisation does not run on Cloudflare | `/_next/image?url=/images/hero-bg.png&w=828` returns `image/png`, 1,507,275 B | 5 |
| F8 | The page's `<h1>` is "Profesjonalne usługi hydrauliczne"; the target phrase is not in the hero copy | Hero markup | 6 |
| F9 | Testimonials look like placeholders | "Marek Kowalski", "Anna Wiśniewska" | 7, 8 |
| F10 | Homepage content is thin compared with ranking pages | 483 words vs 717 to 1,858 on competitors | Next phase (D11) |

## Parts

Every part follows the same flow:

1. Claude writes the failing tests, then the code, then saves any Sanity changes as drafts.
2. Claude runs `pnpm --filter frontend test`, `type-check`, `lint` and `build` (plus `pnpm --filter studio type-check` / `test` when Studio changes) and reports the results.
3. Dominik reviews the diff and the drafts (Studio → Presentation shows drafts on the local frontend), then follows the part's **How to test** steps.
4. On approval: Claude publishes the drafts, commits the part (one commit per part) and Dominik deploys.

Local URLs used below: frontend `pnpm --filter frontend dev` → http://localhost:3000, Studio `pnpm --filter studio dev` → http://localhost:3333, Cloudflare-like preview `pnpm --filter frontend preview` → the URL it prints (usually http://localhost:8787).

---

### Part 1: Sitemap with full https URLs

Goal: Google can read every sitemap entry, and `/home` is no longer listed.

Code:
- `frontend/app/lib/site.ts` (new): `SITE_URL = 'https://hydraulik-czestochowa-24.pl'`
- `frontend/app/sitemap.ts`: build every URL from `SITE_URL` instead of the `host` header; skip the `page` document with slug `home` (the root entry already covers it)
- `frontend/app/robots.ts`: use `SITE_URL` (output unchanged)
- `frontend/app/sitemap.test.ts` (new): every URL is absolute https on the production origin; `home` appears once, as the root, never as `/home`; services appear under `/uslugi/`

Sanity: none.

How to test:
1. `pnpm --filter frontend test` → all tests pass.
2. Start the frontend and open http://localhost:3000/sitemap.xml.
3. The first `<loc>` is `https://hydraulik-czestochowa-24.pl`. Every other `<loc>` starts with `https://hydraulik-czestochowa-24.pl/`.
4. There is no `/home` entry. Every service from the homepage "Nasze usługi" list has an `/uslugi/...` entry.
5. http://localhost:3000/robots.txt still ends with `Sitemap: https://hydraulik-czestochowa-24.pl/sitemap.xml`.
6. After deploy: repeat steps 2 to 4 on https://hydraulik-czestochowa-24.pl/sitemap.xml, then do O2.

---

### Part 2: Correct status codes (`/home` redirect, real 404s)

Goal: duplicates redirect and unknown URLs return 404 instead of an empty page.

Code:
- `frontend/next.config.ts`: permanent redirect `/home` → `/`
- `frontend/app/[slug]/page.tsx`: call `notFound()` when no page matches (replaces the template `<PageOnboarding />` fallback; the component file itself stays)
- `frontend/app/[slug]/page.test.tsx` (new): an unknown slug triggers `notFound()`

Sanity: none.

How to test:
1. `pnpm --filter frontend test` → all tests pass.
2. `curl -sI http://localhost:3000/home` → status `308` and `location: /`.
3. `curl -sI http://localhost:3000/nie-ma-takiej-strony` → status `404`. In the browser the same URL shows the 404 page.
4. Regression: http://localhost:3000/ and http://localhost:3000/uslugi/naprawa-kranu still load normally.
5. After deploy: repeat steps 2 to 4 against https://hydraulik-czestochowa-24.pl.

---

### Part 3: Canonical tags

Goal: every page tells Google its one official https URL, which also consolidates the `http://` duplicates.

Code:
- `frontend/app/layout.tsx`: `metadataBase: new URL(SITE_URL)` (replaces the unused `settings.ogImage.metadataBase` lookup)
- `frontend/app/page.tsx`: `alternates: {canonical: '/'}`
- `frontend/app/uslugi/[slug]/page.tsx`, `frontend/app/posts/[slug]/page.tsx`, `frontend/app/[slug]/page.tsx`: canonical is the page's own path
- Tests: `frontend/app/uslugi/[slug]/page.test.tsx` (new) and `frontend/app/[slug]/page.test.tsx` check the canonical path

Sanity: none.

How to test:
1. `pnpm --filter frontend test` → all tests pass.
2. `curl -s http://localhost:3000/ | grep -o '<link rel="canonical"[^>]*>'` → exactly one tag with `href="https://hydraulik-czestochowa-24.pl"`.
3. Same command for http://localhost:3000/uslugi/naprawa-kranu → `href="https://hydraulik-czestochowa-24.pl/uslugi/naprawa-kranu"`.
4. Open view-source of both pages and confirm there is only one canonical tag each.
5. After deploy: repeat steps 2 and 3 on production, and also for `http://hydraulik-czestochowa-24.pl/` (canonical must still say `https://`).

---

### Part 4: Hide `/posts`

Goal: the English template post disappears from the site and the sitemap; future posts are not listed in the sitemap.

Code:
- `frontend/app/sitemap.ts`: skip `post` entries
- `frontend/app/sitemap.test.ts`: posts are never listed

Sanity:
- Unpublish "Why Sanity Wins Over Traditional CMSes". It stays in Studio as a draft; nothing is deleted. An unpublish cannot be staged as a draft, so Claude does it when the part is approved.

How to test:
1. `pnpm --filter frontend test` → all tests pass.
2. http://localhost:3000/sitemap.xml has no `/posts/` entry.
3. After approval and the unpublish: in Studio the post shows as unpublished (draft only), and http://localhost:3000/posts/why-sanity-wins-over-traditional-cmses → 404.
4. After deploy: repeat steps 2 and 3 on production. The deploy matters, because Cloudflare caches the prerendered post page.

---

### Part 5: Lighter hero image

Goal: the biggest image on the page drops from 1.5 MB to about 32 KB, so the page loads faster on phones.

Code:
- `frontend/public/images/hero-bg.webp` (new), made with `cwebp -q 78 -m 6` from the PNG. The PNG stays in the repo.
- `frontend/app/components/LandingHero.tsx`: `src="/images/hero-bg.webp"`

Sanity: none.

How to test:
1. Before deploying, run PageSpeed Insights (mobile) on https://hydraulik-czestochowa-24.pl and note the LCP value.
2. Run `pnpm --filter frontend preview` and open the URL it prints.
3. DevTools → Network → filter "Img" → reload. The hero request is `hero-bg.webp` and is at most 100 KB.
4. Compare with production side by side, on desktop and in DevTools mobile view. The hero must look the same.
5. After deploy: run PageSpeed Insights again and compare LCP with step 1.

---

### Part 6: "Hydraulik Częstochowa" as H1, target phrase in the intro

Goal: the page has exactly one `<h1>`, "Hydraulik Częstochowa". The intro under the big heading contains "usługi hydrauliczne w Częstochowie". Nothing changes visually except the intro sentence.

Code:
- `frontend/app/components/LandingHero.tsx`: render `eyebrow` as the `<h1>` (same classes as today's `<p>`), and render `heading` as a `<p>` (same classes as today's `<h1>`). If `eyebrow` is empty, `heading` stays the `<h1>`.
- `frontend/app/components/LandingHero.test.tsx`: exactly one `<h1>`; it contains the eyebrow text; fallback when the eyebrow is empty

Sanity (hero `subheading` on the home page):

| Before | After |
|---|---|
| 10 lat doświadczenia. Naprawy, montaże i czyszczenie. Pogotowie hydrauliczne całą dobę, pon–sob. | Usługi hydrauliczne w Częstochowie: 10 lat doświadczenia. Naprawy, montaże i czyszczenie. Pogotowie hydrauliczne całą dobę, pon–sob. |

How to test:
1. `pnpm --filter frontend test` → all tests pass.
2. Open http://localhost:3000. The hero looks the same as production (the intro is still the published one).
3. DevTools console: `[...document.querySelectorAll('h1')].map((h) => h.textContent)` → `['Hydraulik Częstochowa']`.
4. Open Studio (http://localhost:3333) → Presentation → home page. The draft intro starts with "Usługi hydrauliczne w Częstochowie" and the rest of the hero is unchanged.
5. After publish and deploy: production shows the new intro, and step 3 gives the same result.

---

### Part 7: Google review documents in Sanity

Goal: the three chosen Google reviews exist in Sanity in a dedicated document type that refuses full surnames. Nothing changes on the website yet.

Code (Studio):
- `studio/src/lib/reviewerName.ts` (new): `isShortReviewerName()` (used by validation) and `formatReviewerName()` (used later by the import)
- `studio/src/lib/reviewerName.test.ts` (new): every row of the name format table below, plus rejection of full names
- `studio/src/schemaTypes/documents/googleReview.ts` (new): `authorName` (validated with `isShortReviewerName`), `rating` (1 to 5), `text` (verbatim), `reviewDate`, `googleReviewId` (read-only, empty for manually entered reviews)
- `studio/src/schemaTypes/index.ts`: register `googleReview`
- `studio/package.json`: add `vitest` as a dev dependency (same version as the frontend) and a `test` script

Sanity:
- Claude reads the three reviews (Angelika, Filip, Agnieszka) from the Google Business Profile in the browser: text, stars and date. If Google blocks automated reading, Dominik pastes them instead.
- Create three `googleReview` drafts with shortened names and verbatim text.
- On approval: publish them and deploy the Studio (`pnpm deploy:studio`) so the hosted Studio shows the new type.

Name format rules:

| Google display name | Stored and shown as |
|---|---|
| `Angelika Kowalska` | `Angelika K.` |
| `Filip` (single word) | `Filip` |
| `Anna Maria Nowak` (middle name) | `Anna N.` |
| `Agnieszka Nowak-Kowalska` (double surname) | `Agnieszka N.` |
| `łukasz żak` (lowercase, diacritics) | `Łukasz Ż.` |
| `  Filip   Wójcik ` (extra spaces) | `Filip W.` |

Studio validation accepts only `Name` or `Name X.` and shows: "Podaj tylko imię i pierwszą literę nazwiska, np. Angelika K."

How to test:
1. `pnpm --filter studio test` and `pnpm --filter studio type-check` → pass.
2. Open http://localhost:3333 → "Google Review" list → three drafts: Angelika ?., Filip ?., Agnieszka ?.
3. Open the Google profile next to Studio. For each review, text and stars are identical.
4. In one draft, change the name to "Angelika Kowalska": the field shows the validation error and Publish is disabled. Undo the change.
5. The live homepage is unchanged.

---

### Part 8: Homepage shows the Google reviews

Goal: the "Co mówią nasi klienci" section shows the three Google reviews, with a note saying where they come from and a link to all reviews on Google. The switch happens with no broken state on the live site.

Approach (expand, then contract): add a new field next to the old one instead of converting it in place. The live site keeps showing the old testimonials until the new frontend is deployed, and the content can be published safely before that.

Code:
- `studio/src/schemaTypes/objects/testimonialsSection.ts`: new `reviews` field (ordered array of references to `googleReview`), new `sourceNote` and `sourceLinkLabel` fields; the old `testimonials` field becomes optional and is hidden in Studio (its data is kept)
- `frontend/sanity/lib/queries.ts`: project `"reviews": reviews[]->{_id, authorName, text, rating}`, `sourceNote` and `sourceLinkLabel`; regenerate `sanity.types.ts`
- `frontend/app/components/LandingTestimonials.tsx`: render `reviews` (skipping references that resolve to nothing); fall back to the old `testimonials` only when `reviews` is empty; render `sourceNote` with a link (`sourceLinkLabel`) to `settings.googleMapsUrl`, opening in a new tab
- `frontend/app/page.tsx`: pass `settings` to `LandingTestimonials`
- `frontend/app/components/LandingTestimonials.test.tsx` (new): renders the referenced reviews in order; skips null references; falls back when `reviews` is empty; renders the source link

Sanity (home page → testimonials section):
- `reviews`: Angelika, Filip, Agnieszka (in that order)
- `sourceNote`: "Opinie klientów z naszej wizytówki Google."
- `sourceLinkLabel`: "Zobacz wszystkie opinie w Google"

How to test:
1. `pnpm --filter frontend test`, `pnpm --filter studio type-check` → pass.
2. Open Studio (http://localhost:3333) → Presentation → home page, scroll to "Co mówią nasi klienci". Exactly three cards: Angelika, Filip, Agnieszka. Names are shortened, and text and stars match Google.
3. The note "Opinie klientów z naszej wizytówki Google." is shown. "Zobacz wszystkie opinie w Google" opens the Google profile in a new tab.
4. Open http://localhost:3000/#opinie (published content only): still the old testimonials, with no errors. Production looks like this between publishing and deploying.
5. After publish and deploy: production shows steps 2 and 3, and view-source no longer contains "Marek Kowalski", "Anna Wiśniewska" or "Tomasz".

---

### Part 9: Review import, dry run (SKIPPED, D13)

Goal: a script reads all reviews from the Google Business Profile API and shows what it would write. It cannot write anything yet.

Code (Studio):
- `studio/scripts/googleReviews.ts` (new, pure): `toGoogleReviewDoc()` maps a Business Profile review to a `googleReview` document. It uses `formatReviewerName()`, maps `starRating` `ONE`..`FIVE` to 1..5, skips anonymous reviewers and reviews without text, keeps only the original text when Google adds a translation and sets `_id: googleReview-<reviewId>`. `planImport()` compares Google reviews with existing documents and returns create, update and link lists (link = a manually entered review with identical text gets its `googleReviewId`, so the homepage references from Part 8 stay valid)
- `studio/scripts/googleReviews.test.ts` (new): mapping, skipping, translation handling, ID format, plan outcomes, and that no output contains a full surname
- `studio/scripts/import-google-reviews.ts` (new): refreshes the OAuth token, calls `GET https://mybusiness.googleapis.com/v4/accounts/{account}/locations/{location}/reviews?orderBy=updateTime desc&pageSize=50`, follows `nextPageToken`, prints the plan as a table. Dry run only.
- Credentials come from `studio/.env.local` (gitignored): `GBP_ACCOUNT_ID`, `GBP_LOCATION_ID`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`

Sanity: none.

How to test:
1. `pnpm --filter studio test` → pass.
2. Fill `studio/.env.local`, then from `studio/` run `pnpm exec sanity exec scripts/import-google-reviews.ts --with-user-token -- --dry-run`.
3. The printed review count equals the count shown on the Google profile. Every name is shortened.
4. Angelika, Filip and Agnieszka show as "link", the rest as "create".
5. Studio is unchanged.

---

### Part 10: Review import, writing to Sanity (SKIPPED, D13)

Goal: one command pulls the latest Google reviews into Sanity. It never changes which reviews the homepage shows and never deletes anything.

Code:
- `studio/scripts/import-google-reviews.ts`: without `--dry-run`, apply the plan in one Sanity transaction: create new reviews, update changed text or ratings, link the manual ones. Reviews deleted on Google are only listed in the output, for manual handling.
- Tests extended for write mode (Sanity client stubbed)

Sanity: the first real run, which Claude does after Dominik's OK.

How to test:
1. `pnpm --filter studio test` → pass.
2. Run the dry run again and check the plan.
3. Run without `--dry-run`. Studio shows all reviews, and Angelika, Filip and Agnieszka are not duplicated.
4. The homepage still shows the same three reviews.
5. Run again: the output says 0 created, 0 updated.

---

### Part 11 (optional, ask first): Remove the old testimonials field

Goal: clean up after Part 8 once the new reviews have run on production without problems.

Code: remove the `testimonials` field from the schema, the query and the fallback branch in `LandingTestimonials`; update tests and types.

Sanity: unset the old `testimonials` data on the home page. This deletes content, so it needs Dominik's explicit OK.

How to test: the homepage still shows the three Google reviews; Studio no longer shows the old field; tests pass.

---

### Outside the repo (Dominik)

| ID | Task | When |
|---|---|---|
| O1 | Cloudflare: enable "Always Use HTTPS" | Any time |
| O2 | Google Search Console: submit `/sitemap.xml`, request indexing of `/` and the service pages | After Part 1 is deployed (again after Part 4) |
| O3 | Directory listings with identical name, address and phone: Oferteo, Panorama Firm, pkt.pl, Fixly | Any time |
| O4 | Ask every customer for a Google review | Ongoing |
| O5 | Apply for Business Profile API basic access (form option "Application for Basic API Access", from an owner/manager email); create an OAuth client and a refresh token with scope `business.manage` | Skipped (D13) |

## Review Source Options

| Option | Can store in Sanity? | Name shortening allowed? | Reviews available | Access | Verdict |
|---|---|---|---|---|---|
| Places API (New), Place Details `reviews` | No: "You must not pre-fetch, cache, or store Places API content beyond the allowed exceptions" (only place IDs) | Conflicts: must credit the author with avatar, name and profile link, plus the Google Maps logo | A few reviews chosen by Google, not the full list | API key + billing (Enterprise + Atmosphere SKU) | Rejected |
| Business Profile API, `accounts.locations.reviews.list` | Yes: the owner reads reviews of their own verified location | Yes: we publish them ourselves | All reviews, paginated (max 50 per page), `updateTime desc` | Approved access application; profile verified and active 60+ days; a website representing the business; OAuth scope `business.manage` | Parts 9 and 10 |
| Manual copy from the Google profile | Yes | Yes | Whatever is copied | None | Part 7 |

## Out of Scope

- Changing the homepage `<title>`.
- Opening hours and Sunday availability.
- FAQ section and other homepage content expansion (next phase, D11).
- Google's average rating and review count (D10).
- Targeting "24h" or "hydraulik częstochowa 24".
- `Review` or `AggregateRating` structured data for these reviews. Google does not show stars for a business's reviews of itself (self-serving reviews on `LocalBusiness`).
- Scheduled or automatic review sync. Part 10 is a script run by hand.
- Structured data on service pages, Cloudflare Images binding, new pages or a blog.
- Deleting any file, including `public/images/hero-bg.png`.

## Tech Stack

- pnpm workspace; frontend in `frontend/`, Studio in `studio/`
- Next.js 16.2 App Router, React 19.2, TypeScript 5.9
- Sanity 5 with `next-sanity` 12; `sanity exec` + `getCliClient()` from `sanity/cli` for the import script (uses the CLI login, so no Sanity write token is stored)
- Vitest 4 + jsdom + Testing Library (frontend now; Studio from Part 7)
- Cloudflare Workers via `@opennextjs/cloudflare`
- Google Business Profile API v4 over plain `fetch` (no new runtime dependency)

## Commands

Run from the repository root.

```bash
pnpm --filter frontend test
pnpm --filter frontend type-check
pnpm --filter frontend lint
pnpm --filter frontend build
pnpm --filter frontend dev
pnpm --filter frontend preview
pnpm --filter frontend sanity:typegen   # after any schema change
pnpm --filter studio dev
pnpm --filter studio type-check
pnpm --filter studio test               # from Part 7
pnpm deploy:studio                      # Part 7, on approval
pnpm exec prettier --write <changed-files>
```

## Project Structure

```text
frontend/
├── next.config.ts                       → Part 2
├── public/images/hero-bg.webp           → Part 5 (PNG stays)
├── sanity/lib/queries.ts                → Part 8
├── sanity.types.ts                      → regenerated
└── app/
    ├── lib/site.ts                      → Part 1 (new)
    ├── layout.tsx                       → Part 3
    ├── page.tsx                         → Parts 3, 8
    ├── sitemap.ts (+ .test.ts)          → Parts 1, 4
    ├── robots.ts                        → Part 1
    ├── [slug]/page.tsx (+ .test.tsx)    → Parts 2, 3
    ├── uslugi/[slug]/page.tsx (+ test)  → Part 3
    ├── posts/[slug]/page.tsx            → Part 3
    └── components/
        ├── LandingHero.tsx (+ test)     → Parts 5, 6
        └── LandingTestimonials.tsx (+ test) → Parts 8, 11

studio/
├── package.json                         → Part 7 (vitest)
├── scripts/                             → Parts 9, 10 (new)
└── src/
    ├── lib/reviewerName.ts (+ test)     → Part 7 (new)
    └── schemaTypes/
        ├── documents/googleReview.ts    → Part 7 (new)
        ├── objects/testimonialsSection.ts → Parts 8, 11
        └── index.ts                     → Part 7
```

## Code Style

Follow the existing style: single quotes, no semicolons, 2-space indent, `{named}` imports without spaces, `@/` alias in the frontend, `defineType`/`defineField` in Studio schemas, comments only where the reason is not obvious. Format with the project's Prettier config.

```ts
for (const p of allPostsAndPages.data) {
  // The "home" page document is rendered at the site root, which is already listed.
  if (p._type === 'page' && p.slug === 'home') continue
  // ...
  url = `${SITE_URL}/uslugi/${p.slug}`
}
```

## Testing Strategy

- Test first: each part's tests are written before its code and must fail for the expected reason. For Parts 1 to 3 this was already confirmed in a reverted trial run (6 of 6 failed as expected).
- Unit tests are colocated `*.test.ts(x)` files, as in the existing suite. Route tests stub `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` via `vi.hoisted` and mock `@/sanity/lib/live`.
- No test calls Google or Sanity over the network.
- Each part's "How to test" is the manual and end-to-end check for Dominik.
- The existing suite must stay green after every part.

## Boundaries

- Always: tests before code; run test, type-check, lint and build before handing a part over; format changed files with Prettier; regenerate types after schema changes; one part at a time.
- Always: Sanity content changes go in as drafts and are published only after the part is approved.
- Always: keep `/` rendering the Sanity `home` page document; show review text and rating exactly as on Google; link visitors to all reviews on Google.
- Ask first: deleting any content (Part 11), running the import against production without `--dry-run`, deploying the frontend, adding dependencies beyond those named in a part, changing `wrangler.jsonc`.
- Never: store or show a full surname, reviewer photo or reviewer profile URL; change the wording or meaning of a review (spelling fixes only, D12); publish invented or paid-for reviews; add `Review`/`AggregateRating` JSON-LD for these reviews.
- Never: commit OAuth credentials, refresh tokens or Sanity tokens.
- Never: delete files, unpublish the `home` page document or change the homepage `<title>`.

## Risks

| Risk | Mitigation |
|---|---|
| Content and frontend changes reach production at different times | Part 8 adds a new field next to the old one; the old frontend ignores it and the new one falls back to it |
| Cloudflare keeps serving a cached page after a Sanity-only change | Check after the next deploy (noted in Parts 4 and 6) |
| Google blocks Claude from reading the reviews in the browser | Dominik pastes the three reviews (Part 7) |
| Business Profile API access is rejected or slow | Parts 1 to 8 do not depend on it |
| Showing only chosen positive reviews could look misleading under Polish consumer rules on reviews (Omnibus, since 2023) | The source note says where the reviews come from and links to all of them on Google |

## Success Criteria

1. `/sitemap.xml`: every `<loc>` starts with `https://hydraulik-czestochowa-24.pl`; no `/home` or `/posts/` entries; every published service is present.
2. `GET /home` → 308 to `/`. `GET /any-unknown-slug` → 404.
3. `/`, every `/uslugi/:slug` and every `/:slug` page has exactly one canonical tag pointing to its own https URL.
4. `/posts/why-sanity-wins-over-traditional-cmses` → 404.
5. The hero image transfer on `/` is at most 100 KB.
6. The homepage has exactly one `<h1>`: "Hydraulik Częstochowa". The hero intro starts with "Usługi hydrauliczne w Częstochowie".
7. The homepage shows exactly three reviews (Angelika, Filip, Agnieszka) in "First L." form, with text and rating identical to Google, plus the source note and link.
8. No `googleReview` in the dataset has more than a first name and one initial; Studio refuses to publish one.
9. All tests, type-checks, lint and build pass after every part.
10. Parts 9 and 10: the dry run lists all profile reviews; a real run creates no duplicates; a second run changes nothing; the homepage selection is unchanged.

Outcome metric (tracked, not a release gate): Search Console impressions and average position for "usługi hydrauliczne częstochowa", reviewed 4 and 8 weeks after Part 3 is deployed.

## Relationship To Other Specs

- `001-plumber-landing-page`: testimonials move from inline objects to references to `googleReview` documents (Parts 8 and 11); the hero `eyebrow` becomes the `<h1>` (Part 6).
- `002-robots-txt`: lists `/home` and `/posts/:slug` as crawlable. This spec supersedes that: `/home` redirects and posts are hidden. Robots policy itself is unchanged.

## References

- Places API policies (storage, attribution): https://developers.google.com/maps/documentation/places/web-service/policies
- Place Details (New) pricing tier for `reviews`: https://developers.google.com/maps/documentation/places/web-service/place-details
- Business Profile API prerequisites and access request: https://developers.google.com/my-business/content/prereqs
- `accounts.locations.reviews.list`: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list

## Open Questions

None. All resolved on 2026-10-13 (D8 to D11).
