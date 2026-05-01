# Data Model: Plumber Landing Page

**Phase**: 1 — Design  
**Branch**: `001-plumber-landing-page`  
**Date**: 2026-05-01  
**Source**: [spec.md](./spec.md), [research.md](./research.md)

---

## Overview

Content is managed in Sanity. All landing page sections are modelled as Sanity `object` types registered in the `page.pageBuilder` array. Global business data (phone, address, emergency flag) lives in the `settings` singleton. No new document types are required.

---

## 1. Settings Singleton (extend existing)

**Schema**: `studio/src/schemaTypes/singletons/settings.tsx`  
**GROQ**: `*[_type == "settings"][0]`

### New fields added to `settings`

| Field | Type | Required | Description |
|---|---|---|---|
| `phone` | `string` | ✅ | E.164 format: `+48518893308` |
| `address` | `object` | ✅ | Nested: `street`, `city`, `postalCode` |
| `address.street` | `string` | ✅ | `Tadeusza Gajcego 4` |
| `address.city` | `string` | ✅ | `Częstochowa` |
| `address.postalCode` | `string` | ✅ | `42-216` |
| `googleMapsUrl` | `url` | ✅ | `https://share.google/iTFr7fdAX5pKqkf48` |
| `emergencyAvailable` | `boolean` | ✅ | If true, display emergency badge in hero |

---

## 2. heroSection Object

**Schema**: `studio/src/schemaTypes/objects/heroSection.ts` *(new)*  
**Registered in**: `page.pageBuilder`

| Field | Type | Required | Description |
|---|---|---|---|
| `eyebrow` | `string` | — | Short badge text, e.g. "Pogotowie hydrauliczne 24/7" |
| `heading` | `string` | ✅ | Main H1 headline |
| `subheading` | `string` | — | Supporting subtitle |
| `ctaLabel` | `string` | ✅ | Primary button label, e.g. "Zadzwoń teraz" |

**Notes**: Phone number is pulled from `settings.phone` at query time; not stored redundantly in the hero block.

---

## 3. servicesSection Object

**Schema**: `studio/src/schemaTypes/objects/servicesSection.ts` *(new)*  
**Registered in**: `page.pageBuilder`

| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | `string` | ✅ | Section H2 heading |
| `subheading` | `string` | — | Optional section subtitle |
| `services` | `array of serviceItem` | ✅ | List of service entries |

### serviceItem (inline object within servicesSection)

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Polish service name |
| `category` | `string` (enum) | ✅ | One of: `naprawy` \| `montaze` \| `czyszczenie` |
| `description` | `string` | — | Optional 1-sentence description |

**Category enum labels (Polish)**:
- `naprawy` → "Naprawy"
- `montaze` → "Montaże"
- `czyszczenie` → "Czyszczenie"

**Validation**: `name` and `category` are required. 17 services seeded via initial values.

---

## 4. testimonialsSection Object

**Schema**: `studio/src/schemaTypes/objects/testimonialsSection.ts` *(new)*  
**Registered in**: `page.pageBuilder`

| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | `string` | ✅ | Section H2 heading |
| `subheading` | `string` | — | Optional subtitle |
| `yearsExperience` | `number` | ✅ | Displayed as trust badge, e.g. `10` |
| `testimonials` | `array of testimonialItem` | ✅ | 3 mock testimonials |

### testimonialItem (inline object within testimonialsSection)

| Field | Type | Required | Description |
|---|---|---|---|
| `authorName` | `string` | ✅ | Polish full name, e.g. "Marek Kowalski" |
| `text` | `string` | ✅ | Review text (1–3 sentences in Polish) |
| `rating` | `number` | ✅ | Integer 1–5; initial value `5` |

---

## 5. aboutSection Object

**Schema**: `studio/src/schemaTypes/objects/aboutSection.ts` *(new)*  
**Registered in**: `page.pageBuilder`

| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | `string` | ✅ | Section H2 heading |
| `body` | `blockContentTextOnly` | ✅ | Rich text (text-only); 2–3 sentences in Polish |
| `photo` | `image` | — | Placeholder for headshot/team photo; `hotspot: true` |
| `photoAlt` | `string` | — | Alt text for accessibility |

---

## 6. contactSection Object

**Schema**: `studio/src/schemaTypes/objects/contactSection.ts` *(new)*  
**Registered in**: `page.pageBuilder`

| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | `string` | ✅ | Section H2 heading |
| `subheading` | `string` | — | Supporting text, e.g. "Wycenimy Twoją pracę bezpłatnie" |
| `formEnabled` | `boolean` | — | Toggle to show/hide form; default `true` |

---

## 7. page Document (extend existing pageBuilder)

**Schema**: `studio/src/schemaTypes/documents/page.ts`  
**Change**: Add new block types to the `pageBuilder` array field.

```
pageBuilder: array of:
  - callToAction   (existing)
  - infoSection    (existing)
  - heroSection    (NEW)
  - servicesSection (NEW)
  - testimonialsSection (NEW)
  - aboutSection   (NEW)
  - contactSection (NEW)
```

---

## Entity Relationships

```
settings (singleton)
  └── phone, address, googleMapsUrl, emergencyAvailable

page (slug: "home")
  └── pageBuilder[]
        ├── heroSection         → references settings.phone, settings.emergencyAvailable
        ├── servicesSection
        │     └── services[]
        │           └── serviceItem (name, category, description?)
        ├── testimonialsSection
        │     └── testimonials[]
        │           └── testimonialItem (authorName, text, rating)
        ├── aboutSection
        └── contactSection
```

---

## State Transitions: Contact Form

```
idle  ──(submit)──▶  loading  ──(mock resolve)──▶  success
                                └──(hardcoded error flag)──▶  error
```

Both `success` and `error` states render distinct UI; the error state is accessible via a developer toggle (`SHOW_FORM_ERROR=true` in the component or a query param) for design review.

---

## Seed Data (Mock)

### Services (17 items)

**Naprawy (8)**:
1. Naprawa kranu
2. Naprawa rur wodociągowych
3. Remont łazienki
4. Wykrywanie nieszczelności w instalacjach
5. Naprawa podgrzewacza wody
6. Naprawa przeciekającej rury
7. Naprawa rury kanalizacyjnej
8. Naprawa kabiny prysznicowej

**Montaże (7)**:
9. Montaż kranu
10. Montaż podgrzewacza wody
11. Montaż kabiny prysznicowej
12. Montaż toalety
13. Montaż zbiornika na wodę
14. Montaż rozdrabniacza odpadów
15. Montaż pompy głębinowej

**Czyszczenie (2)**:
16. Czyszczenie rury odpływowej
17. Czyszczenie kanalizacji

### Testimonials (3 mock entries)

| Author | Text | Rating |
|---|---|---|
| Marek Kowalski | "Fachowa obsługa, szybka reakcja na awarię. Polecam każdemu!" | 5 |
| Anna Wiśniewska | "Pan hydraulik przyjechał w ciągu godziny, nawet w niedzielę. Bardzo sprawna naprawa." | 5 |
| Tomasz Nowak | "Solidna firma, uczciwe ceny i miła obsługa. Na pewno skorzystam ponownie." | 5 |
