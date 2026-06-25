# SPEC: Unify Header & Footer Across All Pages

**Status:** Draft — awaiting approval
**Date:** 2026-06-25
**Scope:** `frontend/` (Next.js App Router). No Sanity schema changes.

---

## 1. Objective

Every route in the site currently renders a different chrome:

| Route | Header | Footer |
|---|---|---|
| `/` (home) | `LandingNav` (plumber) | `LandingFooter` (plumber) |
| `/[slug]` (dynamic pages) | none | none |
| `/posts/[slug]` (blog posts) | none | none |
| _(orphaned)_ `Header.tsx` / `Footer.tsx` | Sanity-template defaults | unused anywhere |

**Goal:** one consistent, plumber-branded header and footer on **every** page, rendered from a single place (the root layout), with navigation links that work no matter which page the visitor is on.

**Target users:** visitors to the Częstochowa plumbing site landing on a blog post or sub-page (e.g. from search), who need the same logo, phone CTA, and navigation they get on the home page.

**Non-goals:** redesigning the header/footer visuals, adding new nav destinations, changing Sanity schema, or touching page-section content.

---

## 2. Decisions (confirmed)

1. **Unified design** = the existing plumber `LandingNav` + `LandingFooter`. The template `Header.tsx` / `Footer.tsx` are retired.
2. **Rename** = `LandingNav` → `SiteHeader`, `LandingFooter` → `SiteFooter` (they are now site-wide chrome, not landing-only). Files renamed to `SiteHeader.tsx` / `SiteFooter.tsx`; all imports updated.
3. **Nav links off-home** = root-relative anchors (`/#uslugi`, `/#opinie`, `/#o-mnie`, `/#kontakt`). On the home page they navigate-and-scroll in place; on any other page they go home and scroll to the section. Logo links to `/`.
4. **Cleanup** = delete `Header.tsx` and `Footer.tsx` (nothing imports them after this change).
5. **No Blog link** = nav keeps the existing four section links only; a "Blog" destination is deferred (not in scope).

---

## 3. Functional Requirements

- **FR-1** The header and footer render once per page via the **root layout** (`app/layout.tsx`), wrapping `children`, so all current and future routes inherit them automatically.
- **FR-2** Header and footer receive Sanity `settings` (title, phone, address). The layout fetches `settingsQuery` once and passes it down.
- **FR-3** All header nav links and footer nav links use **root-relative** hrefs: `/#uslugi`, `/#opinie`, `/#o-mnie`, `/#kontakt`. The header logo links to `/`.
- **FR-4** Anchor navigation still scrolls to the correct section when the visitor is already on the home page (no full reload required for same-page hash).
- **FR-5** The home page (`app/page.tsx`) no longer renders the header / footer itself (moved to layout). It keeps `LocalBusinessSchema` and its page-builder sections.
- **FR-6** The duplicate/nested `<main>` is resolved: the root layout owns the single `<main>`; the home page returns its sections without wrapping them in a second `<main>`.
- **FR-7** `Header.tsx` and `Footer.tsx` are deleted; no remaining imports reference them.
- **FR-10** `LandingNav` is renamed to `SiteHeader` (`SiteHeader.tsx`) and `LandingFooter` to `SiteFooter` (`SiteFooter.tsx`); the default export names and all import sites are updated to match.
- **FR-8** The phone CTA in the header and the phone/address in the footer continue to render only when the corresponding `settings` fields exist (preserve existing conditional rendering).
- **FR-9** Existing analytics hooks (`data-ga-event`, `data-ga-section`, `data-ga-location`) are preserved on all moved/edited links.

## 4. Acceptance Criteria

- **AC-1** Visiting `/`, `/[slug]` (any existing page), and `/posts/[slug]` (any existing post) all show the same plumber header and footer.
- **AC-2** From a blog post, clicking "Usługi" navigates to `/` and scrolls to the Usługi section.
- **AC-3** On the home page, clicking "Kontakt" scrolls to the Kontakt section without a hard reload jump to a broken anchor.
- **AC-4** The header logo returns the visitor to `/` from any page.
- **AC-5** No page renders two `<main>` elements; exactly one `<main>` per page.
- **AC-6** `grep -r "components/Header\|components/Footer\|LandingNav\|LandingFooter" frontend/app` returns no matches; the old files are gone and the renamed components are referenced as `SiteHeader` / `SiteFooter`.
- **AC-7** `pnpm run type-check` passes and `pnpm run lint` passes.
- **AC-8** The plumber landing page's existing Vitest suite still passes (no regression in `LandingContact.test.tsx`, analytics tests).

---

## 5. Commands

Run from repo root (`/Users/dominik/projects/hydraulik`):

```bash
pnpm run dev            # run-p dev:next + dev:studio
pnpm run lint           # next lint (frontend workspace)
pnpm run type-check     # tsc --noEmit across workspaces
pnpm --filter frontend test   # Vitest suite (verify no regressions)
pnpm run format         # prettier --write .
```

## 6. Affected Project Structure

```text
frontend/app/
├── layout.tsx                    UPDATE: fetch settings; render SiteHeader + SiteFooter around <main>{children}</main>
├── page.tsx                      UPDATE: drop header/footer + own <main>; keep LocalBusinessSchema + sections
├── components/
│   ├── LandingNav.tsx  → SiteHeader.tsx    RENAME + UPDATE: export SiteHeader; nav hrefs → /#…, logo → /
│   ├── LandingFooter.tsx → SiteFooter.tsx  RENAME + UPDATE: export SiteFooter; footer nav hrefs → /#…
│   ├── Header.tsx                DELETE (orphaned template default)
│   └── Footer.tsx                DELETE (orphaned template default)
├── [slug]/page.tsx               unchanged (inherits chrome from layout)
└── posts/[slug]/page.tsx         unchanged (inherits chrome from layout)
```

No changes under `studio/` or `sanity.types.ts`.

---

## 7. Code Style

- TypeScript, React 19 Server Components (header/footer stay RSC — no `'use client'`).
- `const` arrow function components; `type` over `interface`; single quotes; trailing commas; 2-space indent (matches existing files + Prettier `@sanity/prettier-config`).
- No `any`; reuse the existing `SettingsQueryResult` type for the `settings` prop.
- Tailwind v4 utility classes; class ordering via `prettier-plugin-tailwindcss`.
- Keep all Polish UI copy unchanged.
- Surgical edits only — do not restyle the header/footer or rename components beyond what the decisions require.

## 8. Testing Strategy

- **Type/lint gate:** `pnpm run type-check` + `pnpm run lint` must pass (primary automated gate; project has no header/footer unit tests today).
- **Existing Vitest:** run the frontend suite to confirm analytics/contact tests still pass after the link href changes (they assert on `data-ga-*` attributes, which are preserved).
- **Manual verification (dev server):**
  1. `/` — header sticky, nav scrolls in-page, footer present.
  2. `/posts/<existing-post>` — same header/footer; "Usługi" link goes home + scrolls.
  3. `/<existing-page>` — same header/footer.
  4. Confirm a single `<main>` in rendered DOM on each.
- New automated tests are **out of scope** unless a regression surfaces; this is a structural/move change covered by type-check + existing tests.

## 9. Boundaries

**Always:**
- Render header/footer from the root layout only (single source).
- Preserve existing analytics attributes and conditional (settings-gated) rendering.
- Keep components as Server Components.
- Run type-check + lint + existing tests before declaring done.

**Ask first:**
- Any visual redesign of the header/footer.
- Adding new nav links or destinations (e.g. a "Blog" link).
- Moving `LocalBusinessSchema` off the home page or into the layout.
- Introducing path-aware (`usePathname`) client logic in the header.

**Never:**
- Touch Sanity schema, `sanity.types.ts`, or `studio/`.
- Change page-section content or copy.
- Convert header/footer to client components without cause.
- Delete or refactor code unrelated to header/footer unification.

---

## 10. Open Questions

_None._ The "Blog link" question is resolved: **not in scope** (see Decision 5). Nav keeps the four existing section links only.
