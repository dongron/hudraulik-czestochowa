# Quickstart: Plumber Landing Page

**Branch**: `001-plumber-landing-page`  
**Date**: 2026-05-01

---

## Prerequisites

- Node 22 LTS, pnpm installed
- Sanity project credentials in `frontend/.env.local` (already set up in the starter kit)
- Git branch `001-plumber-landing-page` checked out

---

## Development Workflow

### 1. Start both dev servers

```bash
# From repo root
pnpm run dev
```

This starts both `frontend/` (Next.js on port 3000) and `studio/` (Sanity Studio on port 3333) concurrently.

### 2. After any Sanity schema change

```bash
# From repo root
pnpm run sanity:typegen
```

Regenerates `frontend/sanity.types.ts`. Run this after every schema update before writing component code.

### 3. Seed initial Sanity content

After schema is deployed to Sanity, create the content manually in the Studio or via the Sanity CLI:

1. Open Studio at `http://localhost:3333`
2. Create a **Settings** document — fill in phone, address, Google Maps URL, set `emergencyAvailable: true`
3. Create a **Page** document:
   - Name: `Strona główna`
   - Slug: `home`
   - Add page builder blocks in order: Hero → Services → Testimonials → About → Contact
   - Use mock data from [data-model.md](./data-model.md) (Seed Data section)

### 4. Type-check and lint before committing

```bash
# From repo root
pnpm run type-check
pnpm run lint
```

Both must pass with zero errors before a commit.

---

## Key Files

| File | Purpose |
|---|---|
| `frontend/app/page.tsx` | Landing page root — fetches Sanity data, composes sections |
| `frontend/app/components/landing/` | All landing page section components |
| `frontend/app/components/LocalBusinessSchema.tsx` | JSON-LD structured data |
| `frontend/sanity/lib/queries.ts` | GROQ queries — `landingPageQuery` |
| `frontend/sanity.types.ts` | Auto-generated Sanity types (do not edit manually) |
| `studio/src/schemaTypes/objects/heroSection.ts` | Hero block schema |
| `studio/src/schemaTypes/objects/servicesSection.ts` | Services block schema |
| `studio/src/schemaTypes/objects/testimonialsSection.ts` | Testimonials block schema |
| `studio/src/schemaTypes/objects/aboutSection.ts` | About block schema |
| `studio/src/schemaTypes/objects/contactSection.ts` | Contact form block schema |

---

## Implementation Order

Follow this order to avoid type errors from missing generated types:

1. **Schema first**: Add all 5 new schema objects + extend settings + update page.ts + update index.ts
2. **Typegen**: Run `pnpm run sanity:typegen`
3. **Queries**: Add `landingPageQuery` to `queries.ts`
4. **Components**: Build landing components using generated types
5. **Page**: Replace `app/page.tsx` with the new landing page
6. **Layout**: Add `LocalBusinessSchema` to `app/layout.tsx`
7. **SEO**: Add `generateMetadata` to `app/page.tsx`
8. **Seed**: Create Sanity content via Studio

---

## Contract Reference

See [contracts/groq-queries.md](./contracts/groq-queries.md) for the exact GROQ query shape and TypeScript types.
