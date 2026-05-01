# Research: Plumber Landing Page

**Phase**: 0 — Pre-Design Research  
**Branch**: `001-plumber-landing-page`  
**Date**: 2026-05-01

---

## 1. LocalBusiness JSON-LD in Next.js App Router

**Decision**: Inject JSON-LD as a `<script type="application/ld+json">` tag rendered in a Server Component inside `app/layout.tsx`.

**Rationale**: The App Router renders `<head>` content via React's native support for `<script>` elements in RSCs. A dedicated `LocalBusinessSchema` Server Component (no `'use client'` needed since it has no interactivity) is the cleanest approach — readable, typesafe via a plain TypeScript object, and doesn't add client bundle weight.

**Pattern**:
```typescript
// app/components/LocalBusinessSchema.tsx  (Server Component — no 'use client')
export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: 'Usługi Hydrauliczne',
    telephone: '+48518893308',
    url: 'https://uslugihidrauliczne.pl',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tadeusza Gajcego 4',
      addressLocality: 'Częstochowa',
      postalCode: '42-216',
      addressCountry: 'PL',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    areaServed: { '@type': 'City', name: 'Częstochowa' },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**Note**: Use `@type: 'Plumber'` (subtype of `LocalBusiness`) for more precise schema.org classification.

**Alternatives considered**:
- `next-seo` package — unnecessary dependency for a single schema type; YAGNI (Constitution V).
- Metadata API — does not support LocalBusiness; only covers OpenGraph/Twitter.

---

## 2. generateMetadata Pattern (Next.js 16 App Router, Static Page)

**Decision**: Export `generateMetadata` as an async function returning `Metadata` from the `app/page.tsx` root page (no params needed for the root `/` route).

**Rationale**: Static metadata for the home page is set once. The `Metadata` type from `next` provides autocomplete and type checking. Including `alternates.canonical` is important for local SEO to signal the canonical URL to Google.

**Pattern**:
```typescript
import type { Metadata } from 'next'

export const generateMetadata = async (): Promise<Metadata> => ({
  title: 'Hydraulik Częstochowa – Usługi Hydrauliczne | Pogotowie hydrauliczne',
  description:
    'Usługi hydrauliczne w Częstochowie: naprawa rur, montaż armatury, usuwanie awarii. Działamy całą dobę – także w nocy i weekendy. Zadzwoń: +48 518 893 308.',
  openGraph: {
    title: 'Hydraulik Częstochowa – Usługi Hydrauliczne',
    description: 'Fachowe usługi hydrauliczne w Częstochowie. Awarie 24/7.',
    type: 'website',
    locale: 'pl_PL',
    url: 'https://uslugihidrauliczne.pl',
  },
  alternates: { canonical: 'https://uslugihidrauliczne.pl' },
})
```

**Target keywords embedded in title**: "Hydraulik Częstochowa", "Usługi Hydrauliczne", "Pogotowie hydrauliczne".

**Alternatives considered**:
- Static `export const metadata: Metadata = { ... }` — valid but `generateMetadata` is preferred when values may later be fetched from Sanity settings.

---

## 3. Contact Form Mock State Pattern (React + Next.js App Router)

**Decision**: Implement the contact form as a `'use client'` component using `useState` to toggle between `idle | success | error` states. On submit, call a mock async function that resolves to `{ ok: true }` after a short delay (simulates a network call). The `error` state is rendered based on a hardcoded flag that can be toggled for development/design review.

**Rationale**: Constitution IV requires `'use client'` only when genuinely needed — form interactivity (input state, submit handler, conditional rendering of success/error) qualifies. Using React state is simpler than a Server Action for a fully mocked form (YAGNI, Constitution V).

**Pattern**:
```typescript
'use client'
import { useState } from 'react'

type FormState = 'idle' | 'success' | 'error'

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mock: always succeeds
    await new Promise(r => setTimeout(r, 600))
    setState('success')
  }

  if (state === 'success') return <SuccessMessage />
  if (state === 'error')   return <ErrorMessage />   // reachable via dev toggle
  return <form onSubmit={handleSubmit}>...</form>
}
```

**Alternatives considered**:
- Next.js Server Actions — over-engineered for a fully mocked form with no real backend (Constitution V).
- External form service (Formspree, EmailJS) — deferred to a future iteration; not in spec scope for this phase.

---

## 4. Sticky Navigation in Tailwind CSS v4

**Decision**: Use `position: sticky; top: 0; z-index: 50` via Tailwind utility classes (`sticky top-0 z-50`) on the nav element, combined with a subtle `backdrop-blur` and `bg-white/95` for legibility on scroll.

**Rationale**: Native CSS `position: sticky` is supported in all target browsers (last 2 major evergreen), requires zero JavaScript, and is fully compatible with RSC (no `'use client'`). Tailwind v4 PostCSS mode supports these utilities without configuration.

**Pattern**:
```tsx
<nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
  ...
</nav>
```

**Alternatives considered**:
- `position: fixed` — requires body padding offset; more brittle with dynamic content height.
- JavaScript scroll listener — unnecessary complexity; CSS sticky is sufficient.

---

## 5. Sanity Schema Extension Strategy

**Decision**: Add new page-builder block types as Sanity `object` types and register them in the existing `page.pageBuilder` array field alongside the existing `callToAction` and `infoSection` blocks.

**Rationale**: The existing `page` document type uses a `pageBuilder` array pattern. Adding new block types follows the established pattern (Constitution II — composability). The landing page will be a single `page` document with slug `home`.

**New schema objects required**:
| Schema Type | Purpose |
|---|---|
| `heroSection` | Hero block: eyebrow (emergency badge), heading, subheading, phone CTA |
| `servicesSection` | Services grid: grouped by Naprawy / Montaże / Czyszczenie |
| `testimonialsSection` | Trust: mock testimonial items with name + text + rating |
| `aboutSection` | About: body (blockContentTextOnly), photo asset |
| `contactSection` | Contact: form heading + subheading |

**Settings singleton extension**: Add `phone`, `address`, `googleMapsUrl`, `emergencyAvailable` fields to the existing `settings` singleton for site-wide access via GROQ.

**Alternatives considered**:
- Separate `landingPage` singleton document — creates parallel structure with no reuse benefit; existing `page` + `settings` pattern is sufficient.
- Hardcoding content in components — violates Constitution I.
