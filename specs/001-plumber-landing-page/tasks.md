# Tasks: Plumber Landing Page

**Input**: Design documents from `specs/001-plumber-landing-page/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/groq-queries.md ✅, quickstart.md ✅  
**Tests**: Not requested — no test tasks included.  
**Branch**: `001-plumber-landing-page`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US#]**: User story this task belongs to
- All file paths are relative to workspace root `/Users/dominik/projects/hydraulik/`

---

## Phase 1: Setup

**Purpose**: Verify the starter kit runs correctly before any new code is written.

- [X] T001 Verify dev environment: run `pnpm run dev` from project root, confirm frontend on :3000 and Studio on :3333 both start without errors

**Checkpoint**: Starter kit is green — safe to modify files.

---

## Phase 2: Foundational (Sanity Schema + Typegen + Query)

**Purpose**: Create all Sanity schema objects, extend settings, regenerate types, and add the landing page GROQ query. **No component can use typed Sanity data until this phase is complete.**

**⚠️ CRITICAL**: This phase blocks all user story phases. Complete fully before moving to Phase 3.

- [X] T002 [P] Create heroSection Sanity schema in `studio/src/schemaTypes/objects/heroSection.ts` — fields: eyebrow (string, optional), heading (string, required), subheading (string, optional), ctaLabel (string, required)
- [X] T003 [P] Create servicesSection Sanity schema in `studio/src/schemaTypes/objects/servicesSection.ts` — fields: heading (string, required), subheading (string, optional), services array with inline serviceItem objects (name: string required, category: string enum `naprawy|montaze|czyszczenie` required, description: string optional)
- [X] T004 [P] Create testimonialsSection Sanity schema in `studio/src/schemaTypes/objects/testimonialsSection.ts` — fields: heading (string, required), subheading (string, optional), yearsExperience (number, required), testimonials array with inline testimonialItem objects (authorName: string required, text: string required, rating: number required)
- [X] T005 [P] Create aboutSection Sanity schema in `studio/src/schemaTypes/objects/aboutSection.ts` — fields: heading (string, required), body (blockContentTextOnly, required), photo (image with hotspot: true, optional), photoAlt (string, optional)
- [X] T006 [P] Create contactSection Sanity schema in `studio/src/schemaTypes/objects/contactSection.ts` — fields: heading (string, required), subheading (string, optional), formEnabled (boolean, default: true)
- [X] T007 [P] Extend settings singleton in `studio/src/schemaTypes/singletons/settings.tsx` — add fields: phone (string, required), address (object with street/city/postalCode strings, required), googleMapsUrl (url, required), emergencyAvailable (boolean, required)
- [X] T008 Register all 5 new schema objects (heroSection, servicesSection, testimonialsSection, aboutSection, contactSection) in `studio/src/schemaTypes/index.ts`
- [X] T009 Register all 5 new block types in the `pageBuilder` array in `studio/src/schemaTypes/documents/page.ts` alongside existing callToAction and infoSection types
- [X] T010 Run `pnpm run sanity:typegen` inside `frontend/` to regenerate `frontend/sanity.types.ts` with all new types
- [X] T011 Add `landingPageQuery` constant to `frontend/sanity/lib/queries.ts` per the GROQ contract in `contracts/groq-queries.md` (fetches `page` where `slug.current == "home"` with all pageBuilder blocks projected)
- [X] T012 Replace `frontend/app/page.tsx` with a landing page shell: fetch `landingPageQuery` + `settingsQuery` as RSC, pass results to a block-switch renderer that stubs unimplemented block types

**Checkpoint**: Studio schema is deployed, types are generated, page.tsx fetches data — ready for component phases.

---

## Phase 3: User Story 1 — Visitor Calls the Plumber (Priority: P1) 🎯 MVP

**Goal**: Sticky navigation with the company phone number + hero section with company name and primary "Zadzwoń teraz" CTA are visible on the page. A visitor can land, see the phone number prominently, and tap to call within 10 seconds.

**Independent Test**: Navigate to `http://localhost:3000`. The sticky nav shows "Usługi Hydrauliczne" and a tappable "Zadzwoń" button. The hero section shows the company name, a headline about plumbing in Częstochowa, and a "Zadzwoń teraz" `tel:+48518893308` link. The footer shows the phone number and address. Tapping the phone link on mobile opens the dialler.

- [X] T013 [P] [US1] Create `frontend/app/components/landing/LandingNav.tsx` — sticky RSC nav (`sticky top-0 z-50`): left side company name text, right side anchor links to `#uslugi`, `#o-nas`, `#kontakt`, and a "Zadzwoń" button as `<a href="tel:+48518893308">` styled as primary CTA; accepts `phone: string` prop from settings
- [X] T014 [P] [US1] Create `frontend/app/components/landing/LandingHero.tsx` — RSC hero section: company name as `<h1>`, headline and subheading, primary "Zadzwoń teraz" `<a href="tel:+48518893308">` button, mobile-first layout with full-viewport height; accepts `HeroSectionBlock` + `phone: string` props
- [X] T015 [P] [US1] Create `frontend/app/components/landing/LandingFooter.tsx` — RSC footer: phone as `<a href="tel:+48518893308">` link, full address (Tadeusza Gajcego 4, 42-216 Częstochowa), Google Maps `<a href="https://share.google/iTFr7fdAX5pKqkf48" target="_blank" rel="noopener noreferrer">` link; accepts `settings` prop
- [X] T016 [US1] Wire LandingNav, LandingHero, LandingFooter into `frontend/app/page.tsx` — render nav above the block-switch area and footer below; pass `settings.phone` and the `heroSection` block as typed props
- [X] T017 [US1] Seed Sanity Studio with US1 content: create settings document (phone: "+48518893308", address, googleMapsUrl, emergencyAvailable: true); create "home" page document with a heroSection block (heading: "Hydraulik Częstochowa — szybko i solidnie", ctaLabel: "Zadzwoń teraz")

**Checkpoint**: US1 independently testable — phone number is visible and tappable in the hero and nav without any further work.

---

## Phase 4: User Story 2 — Emergency Contact After Hours (Priority: P1)

**Goal**: A visitor sees a clear emergency availability badge in the hero section without scrolling. The page meta description communicates emergency availability for search results.

**Independent Test**: Open `http://localhost:3000`. Without scrolling, a badge or banner communicating "Pogotowie hydrauliczne — noce i weekendy" (or similar) is visible inside or immediately below the hero. The browser tab title and search snippet contain "awaria" or "24/7" language.

- [X] T018 [US2] Add emergency badge to `frontend/app/components/landing/LandingHero.tsx` (depends on T014) — render a visually distinct badge (e.g., "🔧 Pogotowie hydrauliczne – noce i weekendy") conditionally when `emergencyAvailable === true` prop is passed; badge must be visible above the fold without scrolling on both mobile and desktop
- [X] T019 [US2] Add `generateMetadata` export to `frontend/app/page.tsx` — Polish title: "Hydraulik Częstochowa | Usługi Hydrauliczne – Pogotowie 24/7", Polish description mentioning emergency availability and Częstochowa, OpenGraph title + description, canonical URL

**Checkpoint**: US2 independently testable — emergency badge visible above fold; `<meta name="description">` contains emergency keywords.

---

## Phase 5: User Story 3 — Service Discovery (Priority: P2)

**Goal**: All 17 services are visible in a scannable section grouped under labeled H3 subsections (Naprawy / Montaże / Czyszczenie), reachable within two scroll actions from the top of the page.

**Independent Test**: Scroll down from the hero. Within two scroll actions, a "Nasze usługi" section is visible with three H3 headings: "Naprawy" (8 items), "Montaże" (7 items), "Czyszczenie" (2 items). All 17 service names are rendered as plain HTML text (not images). A call CTA is visible near the services section.

- [X] T020 [P] [US3] Create `frontend/app/components/landing/LandingServices.tsx` — RSC services section with `id="uslugi"`: render section heading as `<h2>`, group services by `category` field, render each group's label (Naprawy / Montaże / Czyszczenie) as `<h3>`, render each service name as plain HTML text in a responsive grid; accepts `ServicesSectionBlock` prop; include a "Zadzwoń teraz" `<a href="tel:+48518893308">` CTA at the section bottom
- [X] T021 [US3] Register LandingServices in the block-switch in `frontend/app/page.tsx` for `_type === 'servicesSection'` blocks (depends on T020, T016)
- [X] T022 [US3] Seed Sanity Studio: add a servicesSection block to the "home" page with all 17 services (8 naprawy, 7 montaze, 2 czyszczenie) per the seed data in `data-model.md`; set section heading to "Nasze usługi"

**Checkpoint**: US3 independently testable — all 17 services visible as HTML text, grouped under H3 headings, within two scroll actions.

---

## Phase 6: User Story 4 — Trust and Location Verification (Priority: P3)

**Goal**: About section with company description and photo placeholder, testimonials with 10-years badge, and contact section with address and map link are all visible. A visitor can verify the local Częstochowa address and open Google Maps.

**Independent Test**: Scroll to the bottom of the page. Find: (a) an "O nas" section with 2-3 sentences mentioning 10 years of experience and a photo placeholder; (b) a testimonials section with 3 Polish reviews and a "10 lat doświadczenia" badge; (c) a contact section with the address "Tadeusza Gajcego 4, 42-216 Częstochowa" and a Google Maps link opening in a new tab.

- [X] T023 [P] [US4] Create `frontend/app/components/landing/LandingTestimonials.tsx` — RSC testimonials section: render `<h2>` heading, "10 lat doświadczenia" trust badge using `yearsExperience` prop, render each testimonial as a card with `authorName`, `text`, star `rating` (render as ★ characters); accepts `TestimonialsSectionBlock` prop
- [X] T024 [P] [US4] Create `frontend/app/components/landing/LandingAbout.tsx` — RSC about section with `id="o-nas"`: render `<h2>` heading, `body` via `@portabletext/react`, photo slot using `next/image` with `loading="lazy"` (below-fold image; do NOT use `priority`; show a grey placeholder div when `photo` is null); accepts `AboutSectionBlock` prop
- [X] T025 [P] [US4] Create `frontend/app/components/landing/LandingContact.tsx` — `'use client'` component with `id="kontakt"`: render `<h2>` heading, display address and Google Maps `<a>` link, contact form with fields (name, phone, message); manage `useState<'idle' | 'loading' | 'success' | 'error'>` — on submit mock-resolve to `'success'` after a 800ms delay; render success state ("Dziękujemy! Oddzwonimy wkrótce.") and error state UI ("Coś poszło nie tak. Spróbuj ponownie." — triggered by reading `window.location.search` for `?showError=1`, safe in `'use client'` without requiring `useSearchParams()`); accepts `ContactSectionBlock` + `settings` props
- [X] T026 [US4] Register LandingTestimonials, LandingAbout, LandingContact in the block-switch in `frontend/app/page.tsx` for their respective `_type` values (depends on T023, T024, T025, T016); wrap `<LandingContact>` in `<Suspense fallback={null}>` to preserve static generation (Constitution IV)
- [X] T027 [US4] Seed Sanity Studio: add testimonialsSection block (3 mock testimonials per data-model.md: Marek Kowalski, Anna Wiśniewska, Tomasz Nowak; yearsExperience: 10), aboutSection block (Polish company description referencing 10 years + Częstochowa), and contactSection block (heading: "Skontaktuj się z nami", subheading: "Wycenimy Twoją pracę bezpłatnie") to the "home" page

**Checkpoint**: US4 independently testable — address visible, Google Maps link opens correctly, testimonials displayed, contact form shows success on submit.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: SEO structured data, section IDs for nav anchors, accessibility, build validation.

- [X] T028 [P] Create `frontend/app/components/LocalBusinessSchema.tsx` — RSC component that renders a `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({...}) }} />` tag with `@type: "Plumber"` LocalBusiness schema using settings data (name, phone, address, url); accepts `settings` prop
- [X] T029 Inject `<LocalBusinessSchema settings={settings} />` inside `<head>` in `frontend/app/layout.tsx` (depends on T028); pass settings fetched server-side
- [X] T030 [P] Verify all landing section components have the correct anchor `id` attributes — LandingServices: `id="uslugi"`, LandingAbout: `id="o-nas"`, LandingContact: `id="kontakt"` — matching the nav links in LandingNav
- [X] T031 [P] Mobile-first responsive pass: review all landing components on 375px viewport — ensure sticky nav doesn't overflow, hero CTA is full-width, services grid stacks to single column, contact form inputs are touch-friendly
- [X] T032 Run `pnpm --filter frontend build` from project root and resolve any TypeScript or build errors

**Checkpoint**: Build passes, LocalBusiness JSON-LD present in HTML source, all nav anchor links scroll to correct sections.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **Phase 3 (US1)**: Depends on Phase 2 — start here for MVP
- **Phase 4 (US2)**: Depends on Phase 2 and T014 (LandingHero.tsx — T018 modifies it)
- **Phase 5 (US3)**: Depends on Phase 2 — independent of Phase 3 and 4
- **Phase 6 (US4)**: Depends on Phase 2 — independent of Phase 3, 4, and 5
- **Phase 7 (Polish)**: Depends on all US phases

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no story dependencies
- **US2 (P1)**: Can start after Phase 2 — shares LandingHero with US1 (T018 extends T014)
- **US3 (P2)**: Can start after Phase 2 — fully independent of US1 and US2
- **US4 (P3)**: Can start after Phase 2 — fully independent of US1, US2, US3

### Within Each User Story

- Component tasks marked [P] can run in parallel within the same phase
- Seed tasks (T017, T022, T027) must run after schema is deployed (Phase 2) and the page can render the block
- Polish phase depends on all components existing

---

## Parallel Opportunities

### Phase 2: Foundational

```
# Run all schema creation tasks together (all different files):
T002  Create heroSection.ts
T003  Create servicesSection.ts
T004  Create testimonialsSection.ts
T005  Create aboutSection.ts
T006  Create contactSection.ts
T007  Extend settings.tsx

# Then together:
T008  Register in index.ts
T009  Register in page.ts

# Then:
T010  Run typegen
T011  Add landingPageQuery
```

### Phase 3: US1

```
# Run component creation tasks together (all different files):
T013  Create LandingNav.tsx
T014  Create LandingHero.tsx
T015  Create LandingFooter.tsx

# Then wire:
T016  Update page.tsx
T017  Seed Sanity Studio
```

### Phase 6: US4

```
# Run all three component creation tasks together:
T023  Create LandingTestimonials.tsx
T024  Create LandingAbout.tsx
T025  Create LandingContact.tsx

# Then wire:
T026  Update page.tsx block-switch
T027  Seed Sanity Studio
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational — CRITICAL)
3. Complete Phase 3 (US1 — nav + hero + phone + footer)
4. **STOP and VALIDATE**: Phone CTA is tappable, address is visible, page loads
5. Demo or deploy MVP

### Incremental Delivery

| Step | Delivers | Independently testable |
|---|---|---|
| Phase 1 + 2 | Sanity schema, types, empty page shell | ✅ Studio works, page loads without error |
| + Phase 3 (US1) | Sticky nav, hero, phone CTA, footer | ✅ Visitor can call within 10 seconds |
| + Phase 4 (US2) | Emergency badge, SEO meta | ✅ Emergency info visible above fold |
| + Phase 5 (US3) | 17 services grouped by category | ✅ All services findable in 2 scrolls |
| + Phase 6 (US4) | About, testimonials, contact form | ✅ Trust + location verifiable |
| + Phase 7 | JSON-LD, mobile polish, build clean | ✅ Build passes, SEO structured data valid |

---

## Notes

- [P] tasks = different files, no incomplete dependencies — safe to implement simultaneously
- [US#] label maps each task to a user story for traceability
- Sanity seed tasks (T017, T022, T027) must be done in Studio UI or via `createDocuments` — not programmatically in code
- `LandingContact` is the **only** `'use client'` component; all others are RSC
- Error state in contact form is triggered by `?showError=1` query param — never fires in production mock
- Run `pnpm run sanity:typegen` (T010) in the `frontend/` directory, not the repo root
- `pageBuilder` block-switch in page.tsx must handle unknown `_type` gracefully (return `null`) to avoid runtime errors
