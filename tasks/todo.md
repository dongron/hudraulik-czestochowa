# TODO: GA4 + Landing-Page Click Tracking

Vertical slices, each independently verifiable in GA4 DebugView.
Full detail in [plan.md](./plan.md) · spec in [SPEC.md](../SPEC.md).

---

## Phase 0 — Prerequisite (human, blocking)

- [x] **P0** GA4 property exists — Measurement ID `G-6Y7V39HCJ7` (stream "hcz24", hydraulik-czestochowa-24.pl)
  - [x] Add `NEXT_PUBLIC_GA_ID=G-6Y7V39HCJ7` to `frontend/.env.local`
  - [ ] Add the same var to Cloudflare Workers env (for prod)
  - **Verify:** value present in frontend env ✅

---

## Phase 1 — Foundation + page view  (`page_view`)

- [x] **T1** `app/lib/analytics.ts` — typed `window.gtag`/`dataLayer` (no `any`),
      `GA_ID`, `AnalyticsEvent` union, guarded `trackEvent(name, params)`
  - **AC:** compiles; `trackEvent` no-ops when `window.gtag` is absent ✅
- [x] **T2** `app/components/GoogleAnalytics.tsx` (RSC — no interactivity) —
      `next/script` gtag.js + `config`, `afterInteractive`; returns `null` if no `GA_ID`
  - **AC:** renders nothing when id unset ✅
- [x] **T3** Mount `<GoogleAnalytics />` in `app/layout.tsx`; document
      `NEXT_PUBLIC_GA_ID` in `frontend/.env.example`
- [x] **✅ Checkpoint A (code gates)** — `type-check` + `lint` + `next build` green.
      Runtime check (DebugView `page_view`; id unset → no `g/collect`) pending manual confirm.

---

## Phase 2 — Click infra + phone calls  (`phone_call`)

- [ ] **T4** `app/components/AnalyticsClickTracker.tsx` (`'use client'`) —
      single delegated `document` click listener (`closest('[data-ga-event]')` →
      read `data-ga-*` → `trackEvent`), no `preventDefault`, cleanup on unmount;
      mount in `layout.tsx`
- [ ] **T5** Add `data-ga-event="phone_call"` + `data-ga-location` to `tel:` links:
  - [ ] `LandingNav.tsx` → `nav`
  - [ ] `LandingHero.tsx` → `hero`
  - [ ] `LandingContact.tsx` → `contact`
  - [ ] `LandingFooter.tsx` → `footer`
- [ ] **✅ Checkpoint B** — each phone link fires `phone_call` with right
      `location`; dialing/navigation unaffected

---

## Phase 3 — Contact form lead  (`generate_lead`)

- [ ] **T6** `LandingContact.tsx` — `useEffect` keyed on `state`; on
      `status === 'success'` fire `generate_lead {method:'form', form_location:'contact'}`;
      no PII in params
- [ ] **✅ Checkpoint C** — valid submit → exactly one `generate_lead`;
      invalid submit → none

---

## Phase 4 — Secondary signals  (`maps_click`, `navigation_click`)

- [ ] **T7** `LandingContact.tsx` maps link →
      `data-ga-event="maps_click"` + `data-ga-location="contact"`
- [ ] **T8** In-page anchors → `data-ga-event="navigation_click"` + `data-ga-section`:
  - [ ] `LandingNav.tsx` — 4 nav links + `#top` logo
  - [ ] `LandingFooter.tsx` — 4 nav links
  - [ ] `LandingHero.tsx` — `#kontakt` secondary CTA
- [ ] **✅ Checkpoint D** — maps → `maps_click`; each anchor → `navigation_click`
      with matching `section`

---

## Phase 5 — Verification & ship

- [ ] **T9** Full pass: `type-check` + `lint` + `next build` green; DebugView
      walk-through of `page_view` + all 4 events; negative check (unset id →
      silent); Lighthouse mobile ≥ 85
- [ ] **✅ Checkpoint E (release gate)** — all SPEC.md §2 acceptance criteria met
