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

- [x] **T4** `app/components/AnalyticsClickTracker.tsx` (`'use client'`) —
      single delegated `document` click listener (`closest('[data-ga-event]')` →
      read `data-ga-*` → `trackEvent`), no `preventDefault`, cleanup on unmount;
      mounted in `layout.tsx`
- [x] **T5** Add `data-ga-event="phone_call"` + `data-ga-location` to `tel:` links:
  - [x] `LandingNav.tsx` → `nav`
  - [x] `LandingHero.tsx` → `hero`
  - [x] `LandingContact.tsx` → `contact`
  - [x] `LandingFooter.tsx` → `footer`
- [x] **✅ Checkpoint B (code gates)** — `type-check` + `lint` + `build` green.
      Runtime check (each phone link → `phone_call` w/ right `location`) pending manual confirm.

---

## Phase 3 — Contact form lead  (`generate_lead`)

- [x] **T6** `LandingContact.tsx` — `useEffect` keyed on `state`; on
      `status === 'success'` fire `generate_lead {method:'form', form_location:'contact'}`;
      no PII in params
- [x] **✅ Checkpoint C (code gates)** — `type-check` + `lint` + `build` green.
      Runtime check (valid submit → one `generate_lead`; invalid → none) pending manual confirm.

---

## Phase 4 — Secondary signals  (`maps_click`, `navigation_click`)

- [x] **T7** `LandingContact.tsx` maps link →
      `data-ga-event="maps_click"` + `data-ga-location="contact"`
- [x] **T8** In-page anchors → `data-ga-event="navigation_click"` + `data-ga-section`:
  - [x] `LandingNav.tsx` — 4 nav links + `#top` logo
  - [x] `LandingFooter.tsx` — 4 nav links
  - [x] `LandingHero.tsx` — `#kontakt` secondary CTA
- [x] **✅ Checkpoint D (code gates)** — `type-check` + `lint` + `build` green.
      Runtime check (maps → `maps_click`; anchors → `navigation_click` w/ `section`) pending manual confirm.

---

## Phase 5 — Verification & ship

- [x] **T9** Full pass — automated + served-HTML evidence:
  - [x] `type-check` ✅ · `lint` ✅ · `next build` ✅ (compiled 5.3s)
  - [x] Served HTML on `localhost:3000` confirms GA wiring:
    - GA script `gtag/js?id=G-6Y7V39HCJ7` + inline `gtag('config')` present
    - `phone_call` ×4 · `maps_click` ×1 · `navigation_click` ×10 (5 nav + 4 footer + 1 hero)
    - `data-ga-location` (nav/hero/contact/footer) and `data-ga-section` values all correct
  - [ ] **Manual (needs Google auth / Chrome):** GA4 DebugView shows `page_view`
        + all 4 events firing on click; Lighthouse mobile ≥ 85; negative check
        (unset id → no `g/collect`)
- [~] **Checkpoint E (release gate)** — code + HTML evidence green; awaiting the
      manual DebugView/Lighthouse confirm and Cloudflare `NEXT_PUBLIC_GA_ID` before merge/deploy

---

## Tests (added via /agent-skills:test)

Vitest + jsdom + React Testing Library in the frontend workspace.
Run: `pnpm --filter frontend test`.

- [x] `app/lib/analytics.test.ts` — `isAnalyticsEvent` (known/unknown names);
      `trackEvent` forwards to gtag and no-ops when gtag is absent
- [x] `app/components/AnalyticsClickTracker.test.tsx` — delegation + `data-ga-*`
      → param derivation: child-node click, `navigation_click` section, ignores
      untagged elements and unknown event names
- [x] **RED proven** — breaking the param derivation (`location` → `gaLocation`)
      fails the relevant assertions; reverted to green
- [x] 8/8 passing · `type-check` + `lint` + `build` unaffected
- Note: `generate_lead` form effect is not unit-tested (needs server-action +
      router mocks) — covered by manual DebugView; add later if wanted
