# Plan: Dynamic Service Pages (Spec 004)

## Context

The home page "Uslugi" section currently renders a hardcoded inline array of services stored inside the `servicesSection` page-builder block. Services are static text, not clickable. This change promotes each service to a standalone Sanity document with its own SEO-friendly page at `/uslugi/<slug>`, making services editable independently and giving each one a dedicated landing page for local SEO.

Spec: `specs/004-dynamic-service-pages/spec.md`

## Dependency Graph

```
T1: Schema changes (service doc + trim servicesSection + register)
 ↓
T2: Deploy schema + regenerate types
 ├──→ T3: GROQ queries
 │     ├──→ T4: LandingServices component + test
 │     ├──→ T5: Service page route (/uslugi/[slug])
 │     └──→ T6: Sitemap update
 └──→ T7: Content seeding (parallel with T3-T6)
           ↓
         T8: Final verification gate
```

---

## Tasks

### T1: Schema — service document + servicesSection trim

**Files:**

- `studio/src/schemaTypes/documents/service.ts` — NEW
- `studio/src/schemaTypes/objects/servicesSection.ts` — UPDATE
- `studio/src/schemaTypes/index.ts` — UPDATE

**Work:**

1. Create `service.ts` document type with all fields from spec section 3.1:
   - name (string, required), slug (slug, source: name), category (string enum with radio layout), cardDescription (string), displayOrder (number), heroIntro (text), image (image with hotspot), imageAlt (string), priceFrom (string), body (blockContent), faq (array of inline faqItem: question + answer), seoTitle (string), seoDescription (string)
   - Preview: title = name, subtitle = category label
   - Icon: reuse WrenchIcon from servicesSection or pick another from @sanity/icons
2. Strip `services` array from `servicesSection.ts` — keep only `heading` + `subheading`. Remove validation requiring min 1 service. Keep the preview (adjust subtitle since no services count).
3. Import and register `service` in `index.ts` documents group.

**Acceptance:** Studio loads, "Service" is creatable, servicesSection block only shows heading/subheading fields.

**Reuse:** Existing `blockContent` type for body field. Existing category values from current servicesSection (`naprawy`, `montaze`, `czyszczenie`).

---

### T2: Deploy schema + regenerate types

**Commands:**

```bash
# Deploy schema to Sanity (via Sanity MCP deploy_schema tool)
npm run sanity:typegen --workspace=frontend
```

**Acceptance:** `sanity.types.ts` contains `Service` type with all fields; `ServicesSection` type no longer has `services` array. `npm run type-check` may fail at this point (expected — queries/components still reference old shape).

---

### CHECKPOINT 1 — Schema foundation verified

---

### T3: GROQ queries

**File:** `frontend/sanity/lib/queries.ts`

**Work:**

1. Update `landingPageQuery` servicesSection projection — replace inline `services[]` with a subquery fetching `*[_type == "service"]` documents, ordered by `coalesce(displayOrder, 9999) asc, name asc`. Project: `_id, name, "slug": slug.current, category, cardDescription, displayOrder`.
2. Add `serviceSlugs` query — `*[_type == "service" && defined(slug.current)]{ "slug": slug.current }` (for generateStaticParams).
3. Add `serviceQuery` — single service by `$slug` param, projecting all page-level fields (name, slug, category, heroIntro, image with asset/hotspot/crop, imageAlt, priceFrom, body with markDefs/linkReference, faq, seoTitle, seoDescription).
4. Update `sitemapData` — add `_type == "service"` to the filter so service documents are included in the sitemap query results.

**Acceptance:** `npm run type-check` passes (after typegen). Query result types (`LandingPageQueryResult`, `ServiceQueryResult`, `ServiceSlugsResult`) are generated.

**Reuse:** Existing `linkReference` fragment for body markDefs (same pattern as `postQuery`).

---

### CHECKPOINT 2 — Data layer complete, type-check green

---

### T4: LandingServices component + test

**Files:**

- `frontend/app/components/LandingServices.tsx` — UPDATE
- `frontend/app/components/LandingServices.test.tsx` — NEW

**Work:**

1. Update type extraction — the `ServicesBlock` type now has `services` as an array of service documents (with `slug` string, `cardDescription` instead of `description`).
2. Wrap each service `<li>` in a `<Link href={`/uslugi/${service.slug}`}>` (import from `next/link`). The entire card is the click target.
3. Replace `service.description` with `service.cardDescription`.
4. Replace `service._key` key with `service._id` (documents have \_id, not \_key).
5. Add analytics attributes: `data-ga-event="click"`, `data-ga-section="uslugi"`, `data-ga-location={service.slug}` on the link.
6. Ensure keyboard focus styling (already has hover styles, add `focus-visible:` ring).
7. Write `LandingServices.test.tsx`:
   - Mock services data (3 services across 2 categories)
   - Assert each card renders as `<a>` with `href="/uslugi/<slug>"`
   - Assert grouping by category (correct headers rendered)
   - Assert empty category is omitted
   - Assert `cardDescription` renders when present

**Acceptance:** `npm run test --workspace=frontend` passes including the new test. No `'use client'` directive.

**Reuse:** Existing `CATEGORY_LABELS` and `CATEGORY_ORDER` constants. Existing test patterns from `SiteHeader.test.tsx` and `LandingContact.test.tsx`.

---

### T5: Service page route

**Files:**

- `frontend/app/uslugi/[slug]/page.tsx` — NEW
- `frontend/app/components/ServiceFaq.tsx` — NEW (optional, could inline)

**Work:**

1. Create route with:
   - `generateStaticParams()` using `serviceSlugs` query (same pattern as `posts/[slug]/page.tsx`)
   - `generateMetadata()` — title from `seoTitle` fallback `${name} – Uslugi Hydrauliczne Czestochowa`, description from `seoDescription` fallback `cardDescription`/`heroIntro`
   - Page component fetching `serviceQuery` + `settingsQuery`
   - `notFound()` if no service found
2. Render: H1 (name), optional hero image (reuse `SanityImage` component), heroIntro paragraph, priceFrom badge, body via existing `PortableText` component, FAQ section, phone CTA from `settings.phone`
3. Phone CTA: reuse the `tel:` link pattern with analytics attributes (`data-ga-event="click"`, `data-ga-section="service-cta"`, `data-ga-location={slug}`)
4. FAQ component: simple `<dl>` or disclosure list rendering `faq[]` items

**Acceptance:** `/uslugi/naprawa-kranu` renders full content (after seeding). `/uslugi/nonexistent` returns 404. Page has SiteHeader/SiteFooter from root layout. No `'use client'`. `npm run type-check` passes.

**Reuse:** `SanityImage` component for hero image. `PortableText` component for body. `sanityFetch` from `@/sanity/lib/live`. Post route pattern for generateStaticParams/generateMetadata. Settings phone CTA pattern from `LandingContact` / `SiteHeader`.

---

### T6: Sitemap update

**Files:**

- `frontend/app/sitemap.ts` — UPDATE

**Work:**

1. Add a `case 'service':` to the switch in sitemap generation
2. URL: `${domain}/uslugi/${p.slug}`, priority: 0.7, changeFrequency: 'monthly'

**Acceptance:** After seeding, `sitemap.xml` includes `/uslugi/naprawa-kranu` and other service URLs.

---

### CHECKPOINT 3 — All code changes complete

---

### T7: Content seeding

**Method:** Sanity MCP tools (`create_documents`, `publish_documents`)

**Work:**

1. Create and publish "Naprawa kranu" with full content from spec section 9 (name, slug, category, displayOrder, cardDescription, priceFrom, heroIntro, body, faq, seoTitle, seoDescription).
2. Create and publish the remaining 16 services from the 001 seed list with card-level fields only (name, slug, category, cardDescription). Body/FAQ left empty for follow-up content work.

**Acceptance:** All 17 service documents visible in Sanity Studio. Home page Uslugi section shows all services grouped correctly.

---

### T8: Final verification gate

**Commands:**

```bash
npm run type-check          # tsc --noEmit across workspaces
npm run lint                # eslint (frontend)
npm run test --workspace=frontend   # vitest
npm run format              # prettier
```

**Manual checks (dev server):**

1. `/` — Uslugi cards are clickable links, grouped by category
2. `/uslugi/naprawa-kranu` — full content, price badge, FAQ, tel: CTA, shared header/footer
3. `/uslugi/bad-slug` — 404 page
4. `sitemap.xml` — contains service URLs

**Acceptance:** All AC-1 through AC-10 from spec section 6 pass.

---

## Key patterns to reuse

| Pattern                                 | Source file                                      | Reuse in                              |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| Type extraction from query result       | `LandingServices.tsx:3-6`                        | Updated LandingServices, service page |
| generateStaticParams + generateMetadata | `posts/[slug]/page.tsx:22-58`                    | `uslugi/[slug]/page.tsx`              |
| sanityFetch pattern                     | `posts/[slug]/page.tsx:62`                       | service page                          |
| PortableText rendering                  | `posts/[slug]/page.tsx:99-102`                   | service page body                     |
| SanityImage with hotspot/crop           | `posts/[slug]/page.tsx:86-95`                    | service page hero                     |
| Phone CTA + analytics attrs             | `SiteHeader.tsx`                                 | service page CTA                      |
| Test setup (vitest + RTL)               | `SiteHeader.test.tsx`, `LandingContact.test.tsx` | LandingServices test                  |
| linkReference fragment in GROQ          | `queries.ts:16-20`                               | serviceQuery body projection          |
