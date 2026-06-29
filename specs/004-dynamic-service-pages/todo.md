# Todo: Dynamic Service Pages (Spec 004)

## Phase 1: Schema Foundation

- [x] **T1** Schema — service document + servicesSection trim
  - [x] Create `studio/src/schemaTypes/documents/service.ts` (all fields from spec 3.1)
  - [x] Strip `services[]` from `servicesSection.ts`, keep heading + subheading
  - [x] Register `service` in `studio/src/schemaTypes/index.ts`
- [x] **T2** Deploy schema + regenerate types
  - [x] Deploy schema via Sanity CLI (`sanity schema deploy` — MCP `deploy_schema` refuses local-Studio projects)
  - [x] Run `npm run sanity:typegen --workspace=frontend`
  - [x] Verify `Service` type in `sanity.types.ts`

> **CHECKPOINT 1** — Schema foundation verified

## Phase 2: Data Layer

- [x] **T3** GROQ queries (`frontend/sanity/lib/queries.ts`)
  - [x] Update `landingPageQuery` servicesSection projection (fetch service docs)
  - [x] Add `serviceSlugs` query
  - [x] Add `serviceQuery` query
  - [x] Update `sitemapData` to include service documents
  - [x] Re-run typegen, verify type-check passes

> **CHECKPOINT 2** — Data layer complete, type-check green

## Phase 3: Frontend (T4, T5, T6 can run in parallel)

- [x] **T4** LandingServices component + test
  - [x] Update `LandingServices.tsx` — cards become `<Link>` to `/uslugi/<slug>`
  - [x] Add analytics attributes on card links (`navigation_click`, registered GA4 event)
  - [x] Write `LandingServices.test.tsx`
- [x] **T5** Service page route
  - [x] Create `frontend/app/uslugi/[slug]/page.tsx` (generateStaticParams, generateMetadata, render)
  - [x] Render: H1, hero image, heroIntro, priceFrom badge, body, FAQ, phone CTA
  - [x] 404 for unknown slugs
- [x] **T6** Sitemap update
  - [x] Add `service` case to `frontend/app/sitemap.ts` (priority 0.7)

> **CHECKPOINT 3** — All code changes complete

## Phase 4: Content + Verification

- [x] **T7** Content seeding via Sanity MCP
  - [x] Create + publish "Naprawa kranu" with full content (spec section 9)
  - [x] Create + publish remaining 16 services with card-level fields
- [x] **T8** Final verification gate
  - [x] `npm run type-check` passes
  - [x] `npm run lint` passes
  - [x] `npm run test --workspace=frontend` passes (26 tests, incl. new LandingServices.test.tsx)
  - [x] `npm run format` clean
  - [x] Manual: `/` shows clickable service cards grouped by category (17 links, 3 headers)
  - [x] Manual: `/uslugi/naprawa-kranu` renders full content with CTA (HTTP 200)
  - [x] Manual: `/uslugi/bad-slug` returns 404
  - [x] Manual: `sitemap.xml` lists service URLs (17 entries)
