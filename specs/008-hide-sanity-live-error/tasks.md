# Tasks: Keep Sanity Live Error Toasts Out Of Google Snippets

## Task 1: Show Sanity Live Error Toasts Only In Draft Mode

**Description:** Write a failing layout test first, then change `RootLayout` so it passes `handleError` to `<SanityLive>` only when Draft Mode is on. Outside Draft Mode `onError` is left out, so next-sanity's built-in console-only handler runs and no toast can appear.

**Acceptance criteria:**
- [x] Draft Mode off: the `SanityLive` element has no `onError` prop.
- [x] Draft Mode on: the `SanityLive` element has `onError === handleError`.
- [x] `frontend/app/client-utils.ts` is unchanged.

**Verification:**
- [x] New test fails before the layout change and passes after it: `pnpm test -- app/layout.test.tsx`
- [x] `pnpm type-check`

**Dependencies:** None

**Files likely touched:**
- `frontend/app/layout.test.tsx` (new)
- `frontend/app/layout.tsx`

**Estimated scope:** S: 2 files

## Task 2: Hide The Toast Container From Google Snippets

**Description:** Add a test that `Toaster` sits inside an element with `data-nosnippet`, then wrap `<Toaster />` in `<div data-nosnippet>` in the layout.

**Acceptance criteria:**
- [x] The `Toaster` element in the `RootLayout` tree has an ancestor with `data-nosnippet`.
- [x] No visual or layout change (Sonner positions toasts as fixed, so the wrapper has no effect on layout).

**Verification:**
- [x] `pnpm test -- app/layout.test.tsx`
- [x] `pnpm test`, `pnpm lint` and `pnpm type-check` (full suite at the Phase 1 checkpoint)
- [x] `pnpm exec prettier --write app/layout.tsx app/layout.test.tsx`

**Dependencies:** Task 1

**Files likely touched:**
- `frontend/app/layout.test.tsx`
- `frontend/app/layout.tsx`

**Estimated scope:** XS: 2 files, a few lines

## Checkpoint: Fix

- [x] All tests, lint and type-check pass in `frontend/`
- [ ] Dominik reviews the diff

## Task 3: Verify In A Production Build With Sanity Live Blocked

**Description:** Build and run the production frontend locally, force the Sanity Live connection to fail and confirm no toast text shows up outside Draft Mode, while Draft Mode still shows it.

**Acceptance criteria:**
- [x] Outside Draft Mode with `*.api.sanity.io` live requests blocked in DevTools, `/` shows no "Sanity Live" text and the console shows next-sanity's warning or error.
- [x] The rendered DOM has `<div data-nosnippet>` around the Sonner section.
- [ ] With Draft Mode enabled (`/api/draft-mode/enable` from Presentation) and the same block, the "Sanity Live couldn't connect" toast still appears.

**Verification:**
- [x] `pnpm build && pnpm start` in `frontend/`
- [x] Manual browser check of the first two points (port 3100 is not a Sanity CORS origin, so Live failed with the real CORS error). The Draft Mode point is covered by `app/layout.test.tsx` only.

**Dependencies:** Tasks 1 and 2

**Files likely touched:**
- None

**Estimated scope:** XS: 0 files

## Checkpoint: Complete

- [x] Spec success criteria 1 and 2 met
- [ ] One commit with code, test and `specs/008-hide-sanity-live-error/`

## Task 4: Deploy And Request Reindexing (Dominik)

**Description:** Dominik deploys the frontend, then asks Google to re-render the affected pages.

**Acceptance criteria:**
- [ ] Production `/` serves the new layout (`data-nosnippet` present in the HTML).
- [ ] In Search Console, URL Inspection then "Request indexing" for `/`, followed by the `/uslugi/*` pages.
- [ ] After Google recrawls, "View crawled page" for `/` no longer contains "Sanity Live", and the snippet for the `hydraulik-czestochowa-24.pl` query no longer shows it.

**Verification:**
- [ ] `curl -s https://hydraulik-czestochowa-24.pl/ | grep -c data-nosnippet`
- [ ] Search Console crawled-page HTML check after the recrawl date

**Dependencies:** Task 3

**Files likely touched:**
- None

**Estimated scope:** XS: 0 files
