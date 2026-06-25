# Implementation Plan: GA4 + Landing-Page Click Tracking

**Spec:** [SPEC.md](../SPEC.md)
**Scope:** `frontend/` only. No `studio/` schema changes, no new dependencies.
**Date:** 2026-06-25

---

## Strategy

Slice **vertically by event**: each slice delivers one observable signal in GA4
DebugView, end to end, and is independently verifiable. Foundation comes first
(GA must load before any event can land), then the shared click-delegation
listener, then one event type per slice reusing that listener. The contact-form
lead is an independent path (the form is already a client component).

### Dependency graph

```
app/lib/analytics.ts                          ← foundation: trackEvent() + typed gtag + event names
  │
  ├─► GoogleAnalytics.tsx ─► layout.tsx + NEXT_PUBLIC_GA_ID      [Slice 1 · page_view]
  │
  ├─► AnalyticsClickTracker.tsx ─► layout.tsx   (shared click infra)
  │        ├─► data-ga on 4 tel: links                          [Slice 2 · phone_call]
  │        ├─► data-ga on maps link                             [Slice 4 · maps_click]
  │        └─► data-ga on in-page anchors                       [Slice 5 · navigation_click]
  │
  └─► LandingContact useEffect (status==='success')             [Slice 3 · generate_lead]
```

`analytics.ts` blocks everything. `GoogleAnalytics` and `AnalyticsClickTracker`
are siblings (no dependency between them) but both depend on `analytics.ts` and
both mount in `layout.tsx`. Slices 2/4/5 all depend on `AnalyticsClickTracker`.
Slice 3 depends only on `analytics.ts`. Slices 2–5 are parallelizable once their
infra exists, but are sequenced below for clean checkpoints.

---

## Phase 0 — Prerequisite (human, blocking)

You create the GA4 property and provide the Measurement ID. I cannot do this for you.

- Create / locate a GA4 property → copy its **Measurement ID** (`G-XXXXXXXXXX`).
- Add `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` to `frontend/.env.local`.
- (For production) add the same var to the Cloudflare Workers environment.

**Checkpoint 0:** `echo $NEXT_PUBLIC_GA_ID` resolves in the frontend env, or the
value is present in `frontend/.env.local`. Until then, code is built and merged
but GA stays inert (by design).

---

## Phase 1 — Foundation + page view  (Slice 1 · `page_view`)

**Goal:** GA4 loads when the id is present; a `page_view` lands. No id → fully inert.

- **T1 — `app/lib/analytics.ts`**
  Typed `declare global` for `window.gtag` and `window.dataLayer` (no `any`);
  `GA_ID` const read from `process.env.NEXT_PUBLIC_GA_ID`; an `AnalyticsEvent`
  union of the four event names; `trackEvent(name, params)` that guards
  `typeof window.gtag === 'function'` and no-ops otherwise.
- **T2 — `app/components/GoogleAnalytics.tsx`** (`'use client'`)
  Two `next/script` tags (`gtag/js?id=` + inline `config`), `strategy="afterInteractive"`.
  Returns `null` when `GA_ID` is empty.
- **T3 — wire-up**
  Render `<GoogleAnalytics />` in `app/layout.tsx`; document `NEXT_PUBLIC_GA_ID`
  in `frontend/.env.example`.

**Checkpoint A** (run from `frontend/`): `npm run type-check` + `npm run lint` +
`next build` all green. With id set → DebugView shows `page_view` + a Network
request to `google-analytics.com/g/collect`. With id unset → no GA script, no requests.

---

## Phase 2 — Click infra + phone calls  (Slice 2 · `phone_call`)

**Goal:** the primary conversion is measured from every `tel:` link.

- **T4 — `app/components/AnalyticsClickTracker.tsx`** (`'use client'`)
  Mount once in `layout.tsx`. One `document` `click` listener; on click,
  `event.target.closest('[data-ga-event]')`, read `dataset` (`gaEvent` + any
  `ga*` keys → params), call `trackEvent`. Never `preventDefault`. Cleanup on unmount.
- **T5 — phone data attributes**
  Add `data-ga-event="phone_call"` + `data-ga-location="…"` to the `tel:` links in
  `LandingNav` (`nav`), `LandingHero` (`hero`), `LandingContact` (`contact`),
  `LandingFooter` (`footer`). Components stay RSC.

**Checkpoint B:** clicking each of the 4 phone links fires `phone_call` with the
correct `location` in DebugView; navigation (the actual dial) is unaffected.

---

## Phase 3 — Contact form lead  (Slice 3 · `generate_lead`)

**Goal:** a successful price-estimate submit is counted as a lead; failures are not.

- **T6 — `app/components/LandingContact.tsx`**
  In `ContactFormInner`, `useEffect` keyed on the `state` object: when
  `state.status === 'success'`, call `trackEvent('generate_lead', {method:'form',
  form_location:'contact'})`. (Keying on the fresh state object means each
  successful submit fires once; error states never fire.) No PII in params.

**Checkpoint C:** valid submit → exactly one `generate_lead`; invalid submit
(missing field / bad email) → none.

---

## Phase 4 — Secondary signals  (Slices 4 & 5 · `maps_click`, `navigation_click`)

Both reuse the Phase 2 listener — data attributes only.

- **T7 — maps:** `data-ga-event="maps_click"` + `data-ga-location="contact"` on the
  Google Maps link in `LandingContact`.
- **T8 — anchors:** `data-ga-event="navigation_click"` + `data-ga-section="…"` on
  every in-page `#anchor` (`LandingNav` 4 links + `#top` logo, `LandingFooter` 4
  links, `LandingHero` `#kontakt`).

**Checkpoint D:** maps link → `maps_click`; each anchor → `navigation_click` with
the matching `section`.

---

## Phase 5 — Verification & ship

- **T9 — full pass:** `npm run type-check`, `npm run lint`, `next build` green;
  DebugView walk-through of `page_view` + all 4 events with correct params;
  negative check (unset id → silent); Lighthouse mobile ≥ 85 (SC-004).

**Checkpoint E (release gate):** every acceptance criterion in SPEC.md §2 met.

---

## Risk / rollback

- **GDPR:** GA loads with no consent banner (deliberate, see SPEC §Open risk).
  Rollback = unset `NEXT_PUBLIC_GA_ID`; GA goes fully inert with no code change.
- **Perf:** GA is `afterInteractive`; if PageSpeed drops below 85, revisit script
  strategy before considering the feature shipped.
- **Event-name churn:** names are centralised in `analytics.ts`; renaming after
  launch breaks GA historical reports — treat the event catalogue as a contract.
