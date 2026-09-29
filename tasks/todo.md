# TODO: Opening Hours (spec 006)

Plan: [tasks/plan.md](plan.md) · Spec: [specs/006-opening-hours/spec.md](../specs/006-opening-hours/spec.md)

## Before starting
- [x] Plan reviewed and approved
- [x] Open questions answered: domain `https://hydraulik-czestochowa-24.pl/`, keep Maps link, leave settings draft
- [x] Polish content rewrites in T6 approved

## Phase 1: Foundation
- [x] T1 Settings schema: `openingHours` (7 fixed days, `dayHours` with mode `open24`/`closed`/`hours`), `websiteUrl`; validation; initial value; typegen (M)
- [x] T2 `app/lib/openingHours.ts`: `toDisplayRows` + `toOpeningHoursSpecification`, tests first (S)
- [x] Checkpoint: type-check, lint, tests green; no visible change

## Phase 2: Core Slices
- [x] T3 Contact section "Godziny otwarcia" `<dl>` block + tests (S) [after T1, T2]
- [x] T4 JSON-LD: hours from helper, Sunday explicit closed, `url` = `websiteUrl`, `hasMap` = Maps link + tests (S) [after T1, T2]
- [x] T5 Replace "24/7 / weekendy" wording in hero badge, contact note and Studio field title; grep code (S) [independent]
- [x] Checkpoint: all green (47 tests, type-check, lint, build); human approved live content writes (2026-09-29)

## Phase 3: Content and Release
- [x] T6 Deploy schema, seed hours + `websiteUrl` on published settings, rewrite 3 content claims (site description, hero subheading, O mnie), draft untouched (S) [each write approved]
  - Schema: `sanity schema deploy`. Content: one `sanity exec` transaction on published IDs with revision guards (tx `Xy29FT1JEEUfBqodS84RaB`); MCP patch was not used because it writes via `drafts.siteSettings`.
  - Verified: published values correct, no 24/7/weekend in published content, draft unchanged. Local dev render: JSON-LD + hours block correct.
  - [x] Visual check at 360px (checked manually by owner on a phone, 2026-09-29)
  - [ ] Redeploy hosted Studio (`pnpm deploy:studio`) after merge so the owner can edit the hours
- [ ] T7 Live verification: Rich Results Test 0 errors, 7/7 days match Google profile, owner hand-off of profile steps + settings draft warning (XS)
- [ ] Checkpoint: all FRs covered, ready for `/code-review`
