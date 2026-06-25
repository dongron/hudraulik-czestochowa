# TODO: Unify Header & Footer Across All Pages

Sequenced, behavior-safe slices. Full detail in [plan.md](./plan.md) · spec in [spec.md](./spec.md).
Each task lists its **Done when** (acceptance) and **Verify** (command/check).

---

## Slice 1 — Delete orphaned template chrome

- [x] **T1.1** Delete `frontend/app/components/Header.tsx` and `frontend/app/components/Footer.tsx`
  - **Done when:** both files removed.
  - **Verify:** `grep -rn "components/Header\|components/Footer" frontend/app` → no matches.

---

## Slice 2 — Rename chrome to site-wide names

- [x] **T2.1** `git mv` `LandingNav.tsx` → `SiteHeader.tsx`; rename default export `LandingNav` → `SiteHeader`
  - **Done when:** file renamed, export is `SiteHeader`, no markup/behavior change.
- [x] **T2.2** `git mv` `LandingFooter.tsx` → `SiteFooter.tsx`; rename default export `LandingFooter` → `SiteFooter`
  - **Done when:** file renamed, export is `SiteFooter`, no markup/behavior change.
- [x] **T2.3** Update `app/page.tsx` imports/usages to `SiteHeader` / `SiteFooter`
  - **Done when:** `page.tsx` references the new names only.
  - **Verify (Slice 2):** `pnpm run type-check` + `pnpm run lint` green; `grep -rn "LandingNav\|LandingFooter" frontend/app` → no matches; home page renders header/footer unchanged.

> **Checkpoint A** — type-check + lint green, home visually unchanged. (Optional review.)

---

## Slice 3 — Move chrome into the root layout

- [x] **T3.1** `app/layout.tsx`: fetch settings in the component body
  - Add `const {data: settings} = await sanityFetch({query: settingsQuery})` (import `settingsQuery` from `@/sanity/lib/queries`, `sanityFetch` already used via `live`).
  - **Done when:** `settings` available in `RootLayout`, no `any`.
- [x] **T3.2** `app/layout.tsx`: render `<SiteHeader settings={settings} />` before `<main>{children}</main>` and `<SiteFooter settings={settings} />` after, inside the existing `<section className="min-h-screen">`
  - **Done when:** layout owns the single `<main>` and both chrome components.
- [x] **T3.3** `app/page.tsx`: remove `SiteHeader`/`SiteFooter` renders + imports; remove the page's own `<main>` wrapper (return a fragment); keep `LocalBusinessSchema` + the page-builder `switch`
  - **Done when:** `page.tsx` renders only schema + sections; no chrome, no `<main>`.
  - **Verify (Slice 3):**
    - `pnpm run type-check` + `pnpm run lint` + `pnpm --filter frontend test` green.
    - DOM on `/`, `/[slug]`, `/posts/[slug]`: exactly **one** header, **one** footer, **one** `<main>` each (AC-1, AC-5).
    - No duplicated chrome on home.

> **Checkpoint B** — chrome on every route, single `<main>`, tests green. **Stop for human review.**

---

## Slice 4 — Root-relative nav links

- [x] **T4.1** `SiteHeader.tsx`: change `NAV_LINKS` hrefs `#uslugi/#opinie/#o-mnie/#kontakt` → `/#…`; logo href `#top` → `/`
  - Preserve all `data-ga-event` / `data-ga-section` attributes.
  - **Done when:** every header link is root-relative; logo → `/`.
- [x] **T4.2** `SiteFooter.tsx`: change footer nav anchor hrefs `#…` → `/#…`
  - Preserve all `data-ga-event` / `data-ga-section` attributes.
  - **Done when:** every footer nav link is root-relative.
  - **Verify (Slice 4):**
    - `pnpm --filter frontend test` green (data-ga assertions intact, AC-8).
    - From `/posts/<post>`: click "Usługi" → lands on `/` and scrolls to `#uslugi` (AC-2).
    - On `/`: click "Kontakt" → scrolls to section, no broken jump (AC-3).
    - Logo from any page → `/` (AC-4).

---

## Final checkpoint (CP-C)

- [x] **TF.1** Full gate green: `pnpm run type-check`, `pnpm run lint`, `pnpm --filter frontend test` (AC-7, AC-8)
- [x] **TF.2** `grep -rn "components/Header\|components/Footer\|LandingNav\|LandingFooter" frontend/app` → no matches (AC-6)
- [x] **TF.3** `pnpm run format` (Prettier) on touched files
- [x] **TF.4** Manual 3-route check per plan Verification Gate
- [x] **TF.5** Confirm `studio/`, `sanity.types.ts` untouched; `git status` shows only intended files

> **Stop for human review before committing.** Commit is a separate, explicitly-authorized step.

---

## Acceptance Criteria coverage map

| AC | Covered by |
|---|---|
| AC-1 chrome on all routes | T3.2, T3.3 |
| AC-2 post → home + scroll | T4.1 |
| AC-3 home in-page scroll | T4.1 |
| AC-4 logo → / | T4.1 |
| AC-5 single `<main>` | T3.2, T3.3 |
| AC-6 no old names | T1.1, T2.*, TF.2 |
| AC-7 type-check + lint | every Verify |
| AC-8 Vitest green | T3.3, T4.2, TF.1 |
