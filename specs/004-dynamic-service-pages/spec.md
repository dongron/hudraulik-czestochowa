# SPEC: Dynamic Service Pages — Each "Usługi" Card Links to Its Own Page

**Status:** Draft — awaiting approval
**Date:** 2026-06-26
**Scope:** `studio/` (new Sanity document type) + `frontend/` (new route, query + component changes) + seed content.
**Builds on:** 001 (landing page), 003 (site-wide header/footer from root layout).

---

## 1. Objective

Today the "Usługi" section ([`#uslugi`](frontend/app/components/LandingServices.tsx)) renders a fixed list of **inline** `serviceItem` objects (name, category, description) stored inside the single `servicesSection` page-builder block. The cards are static text — not clickable.

**Goal:** promote each service to a standalone, content-managed **page** that visitors can open from its card. The "Usługi" section lists services **dynamically** from Sanity (add a service in the Studio → it appears on the home page automatically, grouped by category), and each card links to a dedicated SEO-friendly service page at `/uslugi/<slug>`. Ship fully written example content for **"Naprawa kranu"**.

**Why:** individual service pages are the standard local-SEO play — each ranks for its own query ("naprawa kranu Częstochowa"), carries its own price/FAQ/CTA, and gives the phone-call conversion more surfaces. Editors stop hand-maintaining an inline array and instead manage one document per service.

**Target users:**

- **Visitors** searching for a specific job (e.g. "naprawa kranu") who land on a focused page with price range, scope, FAQ and a one-tap phone CTA.
- **The editor** (plumber/owner) who adds or edits a service as a single document in Sanity, without touching the page-builder.

**Non-goals:** redesigning the section's visual layout; adding service images/galleries beyond an optional hero image; booking/scheduling; per-service pricing calculators; multi-language; changing categories beyond the existing three.

---

## 2. Decisions (confirmed with user)

1. **Data model = new `service` document type.** Each service is its own document (slug + structured page content). The inline `services[]` array is removed from `servicesSection`.
2. **URL = `/uslugi/<slug>`** via a new route `frontend/app/uslugi/[slug]/page.tsx`. No collision with `/[slug]` (pages) or `/posts/[slug]` (posts); distinct from the home-page hash anchor `#uslugi`.
3. **Service page content = structured SEO fields:** heading (= name), hero intro, rich-text body, "od …" price, FAQ, and a phone/contact CTA reusing `settings.phone`. Optional hero image.
4. **Listing = auto-list all `service` documents, grouped by category** (Naprawy / Montaże / Czyszczenie), exactly like the current grouped layout. Deterministic order via an optional `displayOrder` number, falling back to alphabetical by name.
5. **Example content** fully written for **"Naprawa kranu"** (`naprawa-kranu`, category `naprawy`). The remaining 16 services from 001's seed list are created as documents with card-level fields + a short body so the section stays populated; fleshing them out is follow-up content work (not blocking).

---

## 3. Data Model

### 3.1 New document: `service`

**Schema:** `studio/src/schemaTypes/objects/../documents/service.ts` _(new document type)_
**Registered in:** `studio/src/schemaTypes/index.ts` (documents group)

| Field             | Type                      | Required | Description                                                                                                         |
| ----------------- | ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                  | ✅       | Service name; used as card title and page H1. e.g. "Naprawa kranu".                                                 |
| `slug`            | `slug`                    | ✅       | `source: name`, maxLength 96. e.g. `naprawa-kranu`.                                                                 |
| `category`        | `string` (enum)           | ✅       | One of `naprawy` \| `montaze` \| `czyszczenie` (radio), matching the existing labels.                               |
| `cardDescription` | `string`                  | —        | Short blurb shown on the card in the Usługi section (replaces old `serviceItem.description`).                       |
| `displayOrder`    | `number`                  | —        | Optional manual sort within a category; lower = earlier. Fallback: name asc.                                        |
| `heroIntro`       | `text`                    | —        | Intro paragraph under the H1 on the service page.                                                                   |
| `image`           | `image` (`hotspot: true`) | —        | Optional hero image for the service page.                                                                           |
| `imageAlt`        | `string`                  | —        | Alt text for `image` (accessibility).                                                                               |
| `priceFrom`       | `string`                  | —        | Polish-formatted "from" price, e.g. `od 120 zł` (string, not number — keeps "od"/"zł").                             |
| `body`            | `blockContent`            | —        | Main rich text (headings, lists, links, optional images) — reuses the existing `blockContent` object used by posts. |
| `faq`             | `array of faqItem`        | —        | Frequently asked questions for the service.                                                                         |
| `seoTitle`        | `string`                  | —        | Optional `<title>` override; fallback `\`${name} – Usługi Hydrauliczne Częstochowa\``.                              |
| `seoDescription`  | `string`                  | —        | Optional meta description; fallback to `cardDescription` / `heroIntro`.                                             |

**`faqItem` (inline object within `service.faq`)**

| Field      | Type     | Required | Description                          |
| ---------- | -------- | -------- | ------------------------------------ |
| `question` | `string` | ✅       | Question text (Polish).              |
| `answer`   | `text`   | ✅       | Answer text (Polish, 1–3 sentences). |

**Studio preview:** title = `name`, subtitle = category label.

### 3.2 Changed object: `servicesSection`

**Schema:** `studio/src/schemaTypes/objects/servicesSection.ts`

- **Remove** the inline `services` array (and its `serviceItem` member). The section no longer stores services.
- **Keep** `heading` and `subheading`.
- The list of services is resolved at query time from `service` documents (see §4). Optionally add a read-only note field in the schema explaining "services are managed as Service documents and listed automatically." (nice-to-have, not required).

> The existing home-page document still has the old inline `services` data in the Content Lake; it becomes dead data once the query stops reading it (harmless). No destructive migration of the page document is required.

### 3.3 Entity relationships

```
page (slug: "home")
  └── pageBuilder[]
        └── servicesSection (heading, subheading)
                │  (no inline items)
                ▼  resolved at query time
        service (document) × N        ← NEW, auto-listed, grouped by category
          ├── name, slug, category, cardDescription, displayOrder
          ├── heroIntro, image, imageAlt, priceFrom
          ├── body (blockContent)
          ├── faq[] → faqItem (question, answer)
          └── seoTitle?, seoDescription?

settings (singleton) → phone, address …   ← reused by the service-page CTA
```

---

## 4. GROQ / Query Changes

**File:** `frontend/sanity/lib/queries.ts`

1. **Update `landingPageQuery`** — replace the `servicesSection` projection so it pulls service documents instead of inline items:

   ```groq
   _type == "servicesSection" => {
     _key,
     _type,
     heading,
     subheading,
     "services": *[_type == "service" && defined(slug.current)]{
       _id,
       name,
       "slug": slug.current,
       category,
       cardDescription,
       displayOrder,
     } | order(coalesce(displayOrder, 9999) asc, name asc),
   },
   ```

2. **Add `serviceSlugs`** (for `generateStaticParams`):

   ```groq
   *[_type == "service" && defined(slug.current)]{ "slug": slug.current }
   ```

3. **Add `serviceQuery`** (single service by slug):

   ```groq
   *[_type == "service" && slug.current == $slug][0]{
     _id, name, "slug": slug.current, category, heroIntro,
     "image": image{ asset->, hotspot, crop }, imageAlt,
     priceFrom,
     body[]{ ..., markDefs[]{ ..., ${linkReference} } },
     faq[]{ _key, question, answer },
     seoTitle, seoDescription,
   }
   ```

4. **Update `sitemapData`** to include service documents, and **`sitemap.ts`** to emit `/uslugi/<slug>` URLs (priority ~0.7, `changeFrequency: 'monthly'`). Keep existing page/post handling.

All result types come from regenerated `frontend/sanity.types.ts` (`LandingPageQueryResult`, `ServiceQueryResult`, `ServiceSlugsResult`). No `any`.

---

## 5. Functional Requirements

- **FR-1** A `service` document type exists with the fields in §3.1 and is registered in the Studio schema and `pageBuilder` is **not** affected (service is a standalone document, not a block).
- **FR-2** The `servicesSection` inline `services` array is removed; the section schema keeps only `heading` + `subheading`.
- **FR-3** The home-page Usługi section lists **all** `service` documents, grouped by category in the existing order (Naprawy → Montaże → Czyszczenie), ordered within a group by `displayOrder` then name. Empty groups are omitted (existing behavior preserved).
- **FR-4** Each card is a link to `/uslugi/<slug>`. The card shows `name` and, if present, `cardDescription`. Hover/focus affordance is preserved/added; the whole card is the click target and is keyboard-focusable.
- **FR-5** A new route `frontend/app/uslugi/[slug]/page.tsx` renders a single service: H1 = `name`, optional hero image, `heroIntro`, `priceFrom` badge ("od …"), `body` via the existing `PortableText` component, an FAQ list, and a phone CTA using `settings.phone` (reusing the existing CTA/analytics pattern).
- **FR-6** The service route implements `generateStaticParams` (from `serviceSlugs`) and `generateMetadata` (title/description from `seoTitle`/`seoDescription` with documented fallbacks). Unknown slug → `notFound()` (404).
- **FR-7** The service page inherits the site-wide `SiteHeader`/`SiteFooter` from the root layout (no per-page chrome) and fetches `settings` for the CTA, consistent with 003.
- **FR-8** `sitemap.xml` includes every service at `/uslugi/<slug>`.
- **FR-9** Analytics attributes (`data-ga-event`, `data-ga-section`, `data-ga-location`) are applied to the service-card links and the service-page phone CTA, consistent with existing tracked links.
- **FR-10** Example content for **"Naprawa kranu"** is created and published (see §9), plus the other 16 services as documents with at least `name`, `slug`, `category`, `cardDescription`.
- **FR-11** `frontend/sanity.types.ts` is regenerated after the schema change; no hand-written types and no `any`.

---

## 6. Acceptance Criteria

- **AC-1** In the Studio, "Service" appears as a creatable document type with all §3.1 fields; the Usługi page-builder block no longer shows an inline services array.
- **AC-2** Home page `#uslugi` renders every published `service` document, grouped by category, ordered by `displayOrder` then name. Creating a new `service` in the Studio makes it appear on `/` without code changes.
- **AC-3** Clicking (or Enter on) a service card navigates to `/uslugi/<slug>` and renders that service's page.
- **AC-4** `/uslugi/naprawa-kranu` shows the full example content: H1 "Naprawa kranu", intro, "od 120 zł" badge, body copy, FAQ entries, and a working `tel:` CTA from `settings.phone`.
- **AC-5** `/uslugi/<nonexistent>` returns the 404 page.
- **AC-6** The service page shows the same `SiteHeader`/`SiteFooter` as the rest of the site; exactly one `<main>` in the DOM.
- **AC-7** `sitemap.xml` lists `/uslugi/naprawa-kranu` (and the other services).
- **AC-8** `npm run type-check` (all workspaces) and `npm run lint` (frontend) pass.
- **AC-9** The frontend Vitest suite passes, including a new `LandingServices.test.tsx` asserting each card is an `<a>` with `href="/uslugi/<slug>"` and that services group by category.
- **AC-10** No `any` types introduced; service data is typed from `sanity.types.ts`.

---

## 7. Affected Project Structure

```text
studio/src/schemaTypes/
├── documents/
│   └── service.ts                NEW: service document (+ inline faqItem)
├── objects/
│   └── servicesSection.ts        UPDATE: remove inline services[]; keep heading/subheading
└── index.ts                      UPDATE: import + register `service` in documents group

frontend/
├── app/
│   ├── uslugi/[slug]/page.tsx    NEW: service page (generateStaticParams, generateMetadata, render)
│   ├── components/
│   │   ├── LandingServices.tsx   UPDATE: cards become links to /uslugi/<slug>; use cardDescription
│   │   ├── LandingServices.test.tsx   NEW: assert card links + grouping
│   │   └── ServiceFaq.tsx        NEW (optional): FAQ list for the service page
│   └── sitemap.ts                UPDATE: emit /uslugi/<slug> URLs
├── sanity/lib/queries.ts         UPDATE: landingPageQuery (services subquery), serviceSlugs, serviceQuery, sitemapData
└── sanity.types.ts               REGENERATED via `npm run sanity:typegen`
```

No changes to `settings`, the root layout, or `SiteHeader`/`SiteFooter` (reused as-is).

---

## 8. Code Style

- TypeScript, React 19 **Server Components** for the service page and `LandingServices` (no `'use client'` — links + portable text need no client state).
- `const` arrow components; `type` over `interface`; single quotes; trailing commas; 2-space indent (Prettier `@sanity/prettier-config`).
- No `any`. Service shapes derive from `sanity.types.ts` via `Extract`/generated query result types, matching the existing `LandingServices`/`LandingTestimonials` pattern.
- Tailwind v4 utilities; class ordering via `prettier-plugin-tailwindcss`. Match existing section spacing/typography so the redesign stays out of scope.
- All UI copy in **Polish**; keep the existing category labels (`Naprawy`, `Montaże`, `Czyszczenie`).
- Use `next/link` for card navigation; use the existing `PortableText` component for `body`; reuse the existing phone-CTA markup/analytics from the landing components.

---

## 9. Example Content — "Naprawa kranu" (seed)

```yaml
name: Naprawa kranu
slug: naprawa-kranu
category: naprawy
displayOrder: 1
cardDescription: Cieknący lub kapiący kran? Naprawiamy baterie kuchenne, łazienkowe i prysznicowe szybko i bez bałaganu.
priceFrom: od 120 zł
heroIntro: >-
  Kapiący kran to nie tylko irytujący dźwięk, ale i realne straty wody i
  pieniędzy na rachunkach. Naprawiamy baterie umywalkowe, zlewozmywakowe,
  wannowe i prysznicowe wszystkich typów — sprawnie, czysto i z gwarancją.
body: |
  ## Kiedy warto wezwać hydraulika do kranu
  - kran kapie lub cieknie nawet po dokręceniu,
  - z baterii leci woda przy podstawie lub spod blatu,
  - mała wydajność wody lub nierówny strumień,
  - twardo chodząca, głośna lub luźna głowica,
  - rdza, kamień lub przeciek na połączeniach.

  ## Co obejmuje naprawa
  Wymianę uszczelek, o-ringów i głowic ceramicznych, czyszczenie lub wymianę
  perlatora, usuwanie kamienia, uszczelnienie połączeń, a w razie potrzeby
  wymianę całej baterii na nową. Pracujemy na baterii kuchennej, łazienkowej,
  wannowej i prysznicowej.

  ## Jak pracujemy
  Przyjeżdżamy z kompletem najczęściej potrzebnych części, podajemy wycenę
  przed rozpoczęciem pracy i sprzątamy po sobie. Większość napraw kończymy
  podczas jednej wizyty.

  Obsługujemy Częstochowę i okolice. Przy awariach reagujemy tego samego dnia.
faq:
  - question: Ile kosztuje naprawa kranu?
    answer: >-
      Naprawa zaczyna się od 120 zł. Ostateczna cena zależy od rodzaju usterki
      i baterii; dokładną wycenę podajemy po oględzinach, zawsze przed
      rozpoczęciem pracy.
  - question: Czy muszę kupić części przed wizytą?
    answer: >-
      Nie. Mamy ze sobą najczęściej potrzebne uszczelki, głowice i o-ringi.
      Jeśli trzeba wymienić całą baterię, doradzimy model i możemy ją dostarczyć.
  - question: Jak szybko możecie przyjechać?
    answer: >-
      Przy awariach reagujemy tego samego dnia, często w ciągu godziny na
      terenie Częstochowy i okolic.
  - question: Czy dajecie gwarancję na naprawę?
    answer: Tak, na wykonaną usługę i wymienione części udzielamy gwarancji.
seoTitle: Naprawa kranu Częstochowa – szybko, czysto, z gwarancją
seoDescription: >-
  Naprawa cieknących i kapiących kranów w Częstochowie. Baterie kuchenne,
  łazienkowe i prysznicowe. Wycena przed pracą, ten sam dzień. Zadzwoń.
```

The remaining services are seeded from 001's list (Naprawa rur wodociągowych, Remont łazienki, …, Czyszczenie kanalizacji) as `service` documents with `name`, `slug`, `category`, and a one-line `cardDescription`; their `body`/`faq` are filled later.

Seeding is done via the Sanity MCP (`create_documents` / `publish_documents`) against the `production` dataset after the schema is deployed.

---

## 10. Commands

Run from repo root (`/Users/dominik/projects/hydraulik`):

```bash
npm run sanity:typegen --workspace=frontend   # extract schema + regenerate sanity.types.ts (after schema change)
npm run type-check                            # tsc --noEmit across workspaces
npm run lint                                  # eslint (frontend)
npm run test --workspace=frontend             # vitest run
npm run format                                # prettier --write .
npm run dev                                   # run-p dev:next + dev:studio (manual verification)
```

Schema deploy + content seeding use the Sanity MCP tools (`deploy_schema`, `create_documents`, `publish_documents`).

---

## 11. Testing Strategy

- **Type/lint gate (primary):** `npm run type-check` + `npm run lint` must pass; types regenerated from the new schema.
- **Unit (Vitest + RTL, matching existing tests):**
  - `LandingServices.test.tsx` (new): renders given mock services → each card is an `<a href="/uslugi/<slug>">`, cards are grouped by category, empty categories omitted, `cardDescription` renders when present.
  - Keep existing `LandingContact`, `SiteHeader`, `SiteFooter`, analytics tests green (no regressions from query/type changes).
- **Manual verification (dev server):**
  1. `/` → Usługi cards are clickable; a newly added Studio service appears.
  2. `/uslugi/naprawa-kranu` → full content, price badge, FAQ, working `tel:` CTA, shared header/footer.
  3. `/uslugi/<bad-slug>` → 404.
  4. `sitemap.xml` contains the service URLs.
- New route-level integration tests are out of scope unless a regression surfaces; the static route + typed queries are covered by type-check + the component test.

---

## 12. Boundaries

**Always:**

- Drive all service content from Sanity; no hardcoded service copy in components.
- Type service data from regenerated `sanity.types.ts`; no `any`.
- Keep service page + `LandingServices` as Server Components.
- Preserve existing analytics attributes and the settings-gated phone CTA pattern.
- Run type-check + lint + Vitest before declaring done.

**Ask first:**

- Visual redesign of the Usługi section or the service-page template beyond what these requirements need.
- Adding service categories, images/galleries beyond the single optional hero image, or pricing logic.
- Changing the URL scheme (e.g. moving off `/uslugi/<slug>`).
- Backfilling full body/FAQ copy for the other 16 services (content task — confirm scope/tone first).

**Never:**

- Break or remove the home-page header/footer behavior from 003.
- Hardcode the phone number (always from `settings.phone`).
- Introduce `'use client'` on the service page or `LandingServices` without a concrete interactive need.
- Delete the home-page document or perform destructive Content Lake migrations to drop legacy inline data.

---

## 13. Open Questions

_None blocking._ Backfilling full copy for the remaining 16 services is acknowledged as follow-up content work (Decision 5 / Boundaries "Ask first").
