# Contract: Sanity GROQ Queries — Plumber Landing Page

**Type**: Data Contract (GROQ Query Results)  
**Consumer**: `frontend/` Next.js App Router  
**Producer**: Sanity Content Lake  
**Branch**: `001-plumber-landing-page`  
**Date**: 2026-05-01

---

## Overview

This contract defines the GROQ queries the frontend will issue and the exact shape of the data returned. TypeScript types are generated from these via `pnpm run sanity:typegen`. The frontend MUST use only the generated types from `sanity.types.ts` — hand-rolled duplicates are prohibited (Constitution III).

---

## Query 1: `landingPageQuery`

**File**: `frontend/sanity/lib/queries.ts`  
**Purpose**: Fetch the home page document with all pageBuilder blocks and global settings in a single query.

```groq
*[_type == "page" && slug.current == "home"][0]{
  _id,
  _type,
  name,
  heading,
  subheading,
  "pageBuilder": pageBuilder[]{
    ...,
    _type == "heroSection" => {
      eyebrow,
      heading,
      subheading,
      ctaLabel,
    },
    _type == "servicesSection" => {
      heading,
      subheading,
      "services": services[]{
        _key,
        name,
        category,
        description,
      },
    },
    _type == "testimonialsSection" => {
      heading,
      subheading,
      yearsExperience,
      "testimonials": testimonials[]{
        _key,
        authorName,
        text,
        rating,
      },
    },
    _type == "aboutSection" => {
      heading,
      body,
      "photo": photo{ asset->, alt },
      photoAlt,
    },
    _type == "contactSection" => {
      heading,
      subheading,
      formEnabled,
    },
  },
}
```

### Returned Shape (TypeScript)

```typescript
// Auto-generated via sanity typegen — do not hand-roll
type LandingPageQueryResult = {
  _id: string
  _type: 'page'
  name: string
  heading: string
  subheading: string | null
  pageBuilder: Array<
    | HeroSectionBlock
    | ServicesSectionBlock
    | TestimonialsSectionBlock
    | AboutSectionBlock
    | ContactSectionBlock
    | CallToActionBlock      // existing
    | InfoSectionBlock       // existing
  >
} | null

type HeroSectionBlock = {
  _type: 'heroSection'
  _key: string
  eyebrow: string | null
  heading: string
  subheading: string | null
  ctaLabel: string
}

type ServicesSectionBlock = {
  _type: 'servicesSection'
  _key: string
  heading: string
  subheading: string | null
  services: Array<{
    _key: string
    name: string
    category: 'naprawy' | 'montaze' | 'czyszczenie'
    description: string | null
  }>
}

type TestimonialsSectionBlock = {
  _type: 'testimonialsSection'
  _key: string
  heading: string
  subheading: string | null
  yearsExperience: number
  testimonials: Array<{
    _key: string
    authorName: string
    text: string
    rating: number
  }>
}

type AboutSectionBlock = {
  _type: 'aboutSection'
  _key: string
  heading: string
  body: PortableTextBlock[] | null
  photo: { asset: SanityImageAsset; alt: string | null } | null
  photoAlt: string | null
}

type ContactSectionBlock = {
  _type: 'contactSection'
  _key: string
  heading: string
  subheading: string | null
  formEnabled: boolean | null
}
```

---

## Query 2: `settingsQuery` (extend existing)

**File**: `frontend/sanity/lib/queries.ts`  
**Change**: The existing `settingsQuery` (`*[_type == "settings"][0]`) already fetches the full settings document. No query change needed — new fields (`phone`, `address`, `googleMapsUrl`, `emergencyAvailable`) are automatically included after schema update and typegen.

### Extended Settings Shape

```typescript
// Auto-generated after settings schema update + typegen
type SettingsQueryResult = {
  _id: string
  _type: 'settings'
  title: string
  description: PortableTextBlock[] | null
  // New fields:
  phone: string | null
  address: {
    street: string | null
    city: string | null
    postalCode: string | null
  } | null
  googleMapsUrl: string | null
  emergencyAvailable: boolean | null
} | null
```

---

## Contract Invariants

1. `slug.current == "home"` — the landing page MUST have exactly one `page` document with slug `home`.
2. `settings` singleton MUST have exactly one document (`[0]`).
3. If `page` or `settings` returns `null`, the page MUST render a graceful fallback (no runtime errors).
4. Service `category` values MUST be one of the three enum strings; any unknown value is filtered out in the component.
5. `emergencyAvailable: true` in settings triggers the emergency badge in `heroSection`; `false` or `null` hides it.

---

## Breaking Change Policy

Any change to query field names or removal of fields is a breaking change and requires:
1. Schema migration in `studio/`
2. `pnpm run sanity:typegen` in `frontend/`
3. Update to this contract file
4. Review of all consuming components
