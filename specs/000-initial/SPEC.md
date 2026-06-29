# SPEC: Google Analytics 4 + Landing-Page Click Tracking

**Status:** Draft — awaiting confirmation
**Date:** 2026-06-25
**Scope:** `frontend/` (Next.js app). No `studio/` schema changes.
**Related plan:** [specs/001-plumber-landing-page/plan.md](specs/001-plumber-landing-page/plan.md)

---

## 1. Objective

Add Google Analytics 4 (GA4) to the plumber landing site and measure the
interactions that signal lead intent, so the business can see how visitors
reach the primary conversion (a phone call) and which page elements drive it.

**Target users of the data:** the site owner / Dominik (marketing & conversion
insight). **End users** (Polish-speaking visitors on mobile) are unaffected in
behaviour; GA must not degrade their experience or page performance.

**Primary success signal:** GA4 Realtime / DebugView shows page views plus the
four tracked event types firing with correct parameters, with no measurable
PageSpeed regression (must stay ≥ 85 mobile per SC-004).

### Confirmed decisions (from clarification)

| Decision               | Choice                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Consent / GDPR         | **Load GA unconditionally** — no consent banner (may be added later)                |
| Measurement ID storage | **`NEXT_PUBLIC_GA_ID` environment variable**                                        |
| What to track          | **Phone clicks, contact-form submit, Google Maps click, nav/section anchor clicks** |

### Assumptions (correct me before I build)

1. **No new dependency.** GA is injected with `next/script` (built into Next),
   not `@next/third-parties`. Rationale: YAGNI + full control over custom events.
   `@next/third-parties` was considered and rejected as unnecessary weight.
2. **A GA4 property + Measurement ID (`G-XXXXXXXXXX`) already exists or you can
   create one.** I cannot create the GA property for you; I'll wire the code to
   read the ID from the env var and document where to paste it.
3. **GA loads only when `NEXT_PUBLIC_GA_ID` is set.** Local dev / preview without
   the var = no GA (keeps dev traffic out of analytics and avoids dev console noise).
4. **RSC links stay RSCs.** Phone/maps/nav links remain server components; they
   gain `data-ga-*` attributes and are tracked by one global client-side click
   listener (delegation). Only the already-client contact form calls the tracker directly.
5. **Cloudflare Workers (OpenNext) deploy target** — `next/script` tags render
   client-side and are fully compatible; the env var must also be set in Cloudflare.
6. No A/B testing, no GTM container, no server-side tagging, no Consent Mode in this scope.

---

## 2. Functional Requirements & Acceptance Criteria

### FR-1 — Load GA4

- GIVEN `NEXT_PUBLIC_GA_ID` is set, WHEN any page loads, THEN the gtag.js script
  loads with `strategy="afterInteractive"` and a standard `page_view` is sent.
- GIVEN `NEXT_PUBLIC_GA_ID` is **unset**, WHEN the app renders, THEN no GA script
  is injected and no `window.gtag` calls occur.

### FR-2 — Phone call clicks (primary conversion)

- WHEN a visitor clicks any `tel:` link (nav, hero, contact, footer), THEN event
  `phone_call` fires with params `{ location: 'nav' | 'hero' | 'contact' | 'footer' }`.

### FR-3 — Contact form submission

- WHEN the price-estimate form submits **successfully** (server action resolves OK),
  THEN event `generate_lead` fires with params `{ method: 'form', form_location: 'contact' }`.
- A failed/validation-rejected submit MUST NOT fire the event.

### FR-4 — Google Maps / directions click

- WHEN a visitor clicks the maps link in the contact section, THEN event
  `maps_click` fires with params `{ location: 'contact' }`.

### FR-5 — Nav / section anchor clicks

- WHEN a visitor clicks an in-page anchor (`#uslugi`, `#opinie`, `#o-mnie`, `#kontakt`),
  THEN event `navigation_click` fires with params `{ section: '<slug>' }`.

### Cross-cutting acceptance

- AC-A: GA4 **DebugView** shows all four event types with correct params during a manual click-through.
- AC-B: `npm run type-check` passes with **no `any`** (gtag/dataLayer fully typed).
- AC-C: `npm run lint` passes.
- AC-D: No new runtime dependency added to `frontend/package.json`.
- AC-E: Lighthouse/PageSpeed mobile score remains ≥ 85 (GA loaded after interactive).

### Event catalogue (single source of truth)

| Event name         | Trigger                             | Params                            |
| ------------------ | ----------------------------------- | --------------------------------- |
| `phone_call`       | click on `tel:` link                | `location`                        |
| `generate_lead`    | successful contact-form submit      | `method: 'form'`, `form_location` |
| `maps_click`       | click on Google Maps link           | `location`                        |
| `navigation_click` | click on in-page nav/section anchor | `section`                         |

---

## 3. Commands

```bash
# from repo root
npm run dev                         # run frontend + studio (needs NEXT_PUBLIC_GA_ID in frontend/.env.local)
npm run type-check                  # tsc --noEmit across workspaces (must pass, no any)

# from frontend/
npm run lint                        # eslint
npm run build                       # next build (prod build sanity check)
```

Verification uses the browser (GA4 DebugView / Realtime + DevTools Network tab
filtering `google-analytics.com/g/collect`). No automated test runner is configured.

---

## 4. Project Structure (changes)

```text
frontend/
├── app/
│   ├── lib/
│   │   └── analytics.ts            NEW — trackEvent() helper, event-name constants,
│   │                                     typed window.gtag / dataLayer (no `any`)
│   ├── components/
│   │   ├── GoogleAnalytics.tsx     NEW client — injects gtag.js via next/script,
│   │   │                                 renders nothing if GA id is missing
│   │   ├── AnalyticsClickTracker.tsx NEW client — one delegated document click
│   │   │                                 listener; reads data-ga-* and calls trackEvent
│   │   ├── LandingNav.tsx          EDIT — data-ga-* on tel: + anchor links
│   │   ├── LandingHero.tsx         EDIT — data-ga-* on tel: link + #kontakt anchor
│   │   ├── LandingContact.tsx      EDIT — data-ga-* on tel:/maps; trackEvent on form success
│   │   └── LandingFooter.tsx       EDIT — data-ga-* on tel: + anchor links
│   └── layout.tsx                  EDIT — mount <GoogleAnalytics/> + <AnalyticsClickTracker/>
├── .env.example                    EDIT — document NEXT_PUBLIC_GA_ID
└── .env.local                      EDIT (local only, gitignored) — set NEXT_PUBLIC_GA_ID
```

**Delegation pattern:** RSC links render e.g.
`<a href={phoneHref} data-ga-event="phone_call" data-ga-location="hero">`.
`AnalyticsClickTracker` (mounted once) listens on `document`, resolves
`event.target.closest('[data-ga-event]')`, reads the `data-ga-*` dataset, and
forwards to `trackEvent(name, params)`. This keeps every link a server component.

---

## 5. Code Style

- Follows repo + global conventions: TypeScript, `type` over `interface`,
  `const` components, single quotes, trailing commas, 2-space indent, Prettier
  (`@sanity/prettier-config`), import ordering per existing files.
- `'use client'` ONLY on `GoogleAnalytics.tsx` and `AnalyticsClickTracker.tsx`
  (and the already-client `LandingContact.tsx`). No other component becomes a client component.
- **No `any`.** `window.gtag` and `window.dataLayer` declared via a typed
  `declare global` block in `app/lib/analytics.ts`. Event names are a string-union/const map.
- All copy/labels untouched (content stays in Sanity); this feature adds no visible UI.

---

## 6. Testing / Verification Strategy

No unit test runner exists in the project, so verification is manual + build gates:

1. **Build gates:** `npm run type-check` and `npm run lint` pass; `next build` succeeds.
2. **Runtime (browser):** with a real `G-` id, open the site, enable GA4 DebugView, and:
   - confirm `page_view` on load,
   - click each `tel:` link → `phone_call` with right `location`,
   - submit the form → `generate_lead`,
   - click maps → `maps_click`,
   - click each nav anchor → `navigation_click` with right `section`.
     Cross-check requests to `google-analytics.com/g/collect` in DevTools Network.
3. **Negative check:** unset `NEXT_PUBLIC_GA_ID` → no gtag script, no collect requests.
4. **Perf check:** Lighthouse mobile ≥ 85 (GA is `afterInteractive`).

(Optional: the `browser-testing-with-devtools` skill can automate step 2.)

---

## 7. Boundaries

**Always**

- Keep `tel:` as the primary conversion; tracking must never block/delay navigation.
- Gate GA behind the presence of `NEXT_PUBLIC_GA_ID`.
- Keep changes inside `frontend/`; preserve existing Sanity-driven content.

**Ask first**

- Adding a consent banner / Consent Mode (deferred for now — flagged GDPR risk).
- Adding any new dependency (`@next/third-parties`, GTM, etc.).
- Changing event names/params after they're live (breaks GA reports/historical data).

**Never**

- Hardcode the Measurement ID in source.
- Send PII (names, phone numbers, form field values) to GA.
- Convert RSC landing components into client components just to track clicks.
- Block or `preventDefault` a user's click/navigation for the sake of an event.

---

## Open risk to acknowledge

Loading GA unconditionally on an EU (Polish) site without a consent mechanism is
a **GDPR exposure**. Chosen deliberately for speed; recommend revisiting with a
consent banner + Consent Mode v2 before heavy traffic. Tracked under "Ask first".
