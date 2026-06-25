# Implementation Plan: Unify Header & Footer Across All Pages

**Spec:** [spec.md](./spec.md)
**Scope:** `frontend/` only. No `studio/` schema changes, no new dependencies, no `sanity.types.ts` regen.
**Date:** 2026-06-25

---

## Strategy

This is a **structural refactor**, not a new feature: take the plumber chrome that
lives only on the home page and make it the single, site-wide header/footer rendered
from the root layout. The risk is regression (duplicated chrome, broken anchors,
broken imports), so each slice is **behavior-safe and independently verifiable**, and
the order keeps the build green at every checkpoint.

Slicing is sequenced by **blast radius**, smallest and safest first:

1. **Remove dead code** (orphaned template `Header`/`Footer`) — zero runtime impact.
2. **Rename** the kept components — mechanical, behavior-preserving.
3. **Move** chrome into the layout — the user-visible outcome (chrome on every route).
4. **Fix nav links** for cross-page navigation — makes the moved chrome correct off-home.

Slices 3 and 4 ship together; between them the app builds and runs, with the only
known gap being off-home anchor links (closed in slice 4).

---

## Dependency Graph

```
                 ┌─────────────────────────┐
                 │ S1: delete Header/Footer │  (independent, no importers)
                 └─────────────────────────┘

  page.tsx ──imports──▶ LandingNav / LandingFooter
     │                        │
     │                        ▼
     │            ┌──────────────────────────────────┐
     │            │ S2: rename → SiteHeader/SiteFooter │
     │            │     (update page.tsx imports)      │
     │            └──────────────────────────────────┘
     │                        │
     ▼                        ▼
  ┌────────────────────────────────────────────────┐
  │ S3: layout.tsx owns SiteHeader + <main> + SiteFooter │
  │     page.tsx drops chrome + its own <main>           │
  └────────────────────────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────┐
  │ S4: SiteHeader/SiteFooter hrefs → root-relative  │
  │     (/#uslugi …), logo → /                        │
  └────────────────────────────────────────────────┘
```

**Key edges:**
- `layout.tsx` (S3) depends on the renamed components existing (S2).
- `page.tsx` is touched in S2 (import rename) and S3 (drop chrome + `<main>`).
- S4 only touches the two chrome components; nothing depends on it structurally, but it
  is required for AC-2/3/4 correctness.
- S1 is fully independent and could run any time; done first to shrink the surface.

---

## Slices

### Slice 1 — Delete orphaned template chrome
**Files:** delete `frontend/app/components/Header.tsx`, `frontend/app/components/Footer.tsx`
**Why first:** they are already imported nowhere; removing them shrinks the component
directory before we add the new canonical names, avoiding confusion mid-refactor.
**Risk:** none — verified by grep + type-check.

### Slice 2 — Rename chrome to site-wide names
**Files:** `git mv LandingNav.tsx → SiteHeader.tsx` (export `SiteHeader`),
`git mv LandingFooter.tsx → SiteFooter.tsx` (export `SiteFooter`), update the only
importer `page.tsx`.
**Why:** the components are now site-wide; names should say so. `git mv` preserves
blame/history. Pure rename — **no markup or behavior change** in this slice.
**Risk:** broken imports — caught immediately by type-check.

### Slice 3 — Move chrome into the root layout (core unification)
**Files:** `layout.tsx`, `page.tsx`
- `layout.tsx`: `await sanityFetch({query: settingsQuery})` in the component body, render
  `<SiteHeader settings={settings} />`, `<main>{children}</main>`, `<SiteFooter settings={settings} />`
  inside the existing `<section className="min-h-screen">`.
- `page.tsx`: remove the `SiteHeader`/`SiteFooter` renders + imports; remove the page's
  own `<main>` wrapper (return a fragment); **keep** `LocalBusinessSchema` + the page-builder sections.
**Why:** single source of chrome → every current and future route inherits it (FR-1).
Also resolves the pre-existing nested-`<main>` (layout `<main>` + page `<main>`) → FR-6/AC-5.
**Risk:** duplicated chrome if a render isn't removed; nested `<main>`. Verified by DOM
inspection (exactly one header/footer/main) on `/`, `/[slug]`, `/posts/[slug]`.
**Note:** `LocalBusinessSchema` stays in `page.tsx` (home-only JSON-LD) per spec boundary.

### Slice 4 — Root-relative nav links
**Files:** `SiteHeader.tsx`, `SiteFooter.tsx`
- Header `NAV_LINKS` hrefs `#uslugi…` → `/#uslugi…`; logo `#top` → `/`.
- Footer nav anchor hrefs `#uslugi…` → `/#uslugi…`.
- **Preserve** every `data-ga-event` / `data-ga-section` / `data-ga-location` attribute.
**Why:** anchors must resolve from any page (FR-3/FR-4, AC-2/3/4). Targets confirmed to
exist: `#top`, `#uslugi`, `#opinie`, `#o-mnie`, `#kontakt`.
**Risk:** breaking analytics attributes or in-page scroll. Verified by existing Vitest
(asserts on `data-ga-*`) + manual scroll check on home and from a post.

---

## Checkpoints

- **CP-A (after S1+S2):** `pnpm run type-check` + `pnpm run lint` green; home page renders
  identically to before (rename + delete are behavior-neutral). → human review optional.
- **CP-B (after S3):** chrome appears once on `/`, `/[slug]`, `/posts/[slug]`; exactly one
  `<main>` each; type-check + lint + `pnpm --filter frontend test` green. **Stop for review.**
- **CP-C (after S4 — final):** full gate (type-check + lint + test) + manual 3-route check
  (AC-1..AC-8). `grep` for old names returns nothing (AC-6). **Stop for review before commit.**

---

## Verification Gate (every checkpoint)

```bash
pnpm run type-check            # tsc --noEmit, all workspaces
pnpm run lint                  # next lint
pnpm --filter frontend test    # vitest run (regression guard on data-ga-*)
grep -rn "components/Header\|components/Footer\|LandingNav\|LandingFooter" frontend/app  # expect: no matches
```

Manual (dev server) at CP-C:
1. `/` — sticky header, in-page scroll on nav, footer present, one `<main>`.
2. `/posts/<existing-post>` — same chrome; "Usługi" → home + scroll.
3. `/<existing-page>` — same chrome; logo → `/`.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Duplicate chrome (forgot to remove from `page.tsx`) | Med | CP-B DOM check counts headers/footers |
| Nested `<main>` persists | Med | Explicit FR-6 step in S3; AC-5 count check |
| Off-home anchors dead | Low | S4 dedicated slice; targets pre-verified |
| Analytics regression | Low | Preserve `data-ga-*`; Vitest asserts them |
| Double settings fetch (layout body + `generateMetadata`) | Low | Acceptable — matches old `Header.tsx` pattern; one extra cached fetch, not a blocker |
| Overwriting prior `tasks/*` (GA4 plan) | n/a | Prior content is committed in git history |

## Out of Scope (per spec boundaries)

- No visual redesign, no "Blog" nav link, no `usePathname` client logic.
- `LocalBusinessSchema` stays on the home page (not moved to layout).
- No `studio/` / schema / `sanity.types.ts` changes. No new tests unless a regression appears.
