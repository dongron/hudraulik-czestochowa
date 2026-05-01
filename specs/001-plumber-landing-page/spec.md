# Feature Specification: Plumber Landing Page (Strona Główna Hydraulika)

**Feature Branch**: `001-plumber-landing-page`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "Landing page for Usługi Hydrauliczne, a plumber in Częstochowa, serving individual clients, Polish language, SEO-optimized, emergency availability on weekends and nights."

---

## Clarifications

### Session 2026-05-01

- Q: Is there a missing 18th service or should the count be corrected to 17? → A: Correct all "18" references to "17"; 17 services confirmed.
- Q: How should the mocked contact form behave on submission? → A: Hardcode success state on submit; both success ("Dziękujemy! Oddzwonimy wkrótce.") and error ("Coś poszło nie tak. Spróbuj ponownie.") states must be designed and visible.
- Q: How should the 17 services be visually organized? → A: Grouped into 3 labeled subsections: Naprawy / Montaże / Czyszczenie, each category as an H3 heading.
- Q: How should the phone number remain accessible while scrolling? → A: Sticky top navigation bar fixed on scroll, containing company name and a "Zadzwoń" button with the phone number.
- Q: Should the sticky nav include section anchor links? → A: Yes — anchor links to Usługi, O nas, Kontakt sections plus the "Zadzwoń" button.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor Calls the Plumber (Priority: P1)

A potential client in Częstochowa (age 35–45) searches for a plumber online, lands on the page, quickly understands the company provides the service they need, and initiates contact by calling the phone number.

**Why this priority**: Phone calls are the primary conversion goal. The page must remove friction and drive visitors to call as quickly as possible.

**Independent Test**: A visitor can land on the page, read the company name, see the phone number prominently displayed, and click/tap to call — all within 10 seconds of arriving.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the homepage, **When** they view the hero section, **Then** they see the company name ("Usługi Hydrauliczne"), a clear headline about plumbing services in Częstochowa, and a prominent "Zadzwoń teraz" (Call Now) button with the phone number.
2. **Given** a visitor is browsing on a mobile device, **When** they tap the phone number, **Then** their phone app opens and dials +48 518 893 308 directly.
3. **Given** a visitor scrolls past the hero section, **When** they reach any other section, **Then** the phone number remains accessible (e.g., sticky header or section-level CTA).

---

### User Story 2 - Emergency Contact After Hours (Priority: P1)

A homeowner has a plumbing emergency (burst pipe, flooding) on a Saturday night. They need to know immediately whether this company accepts emergency calls at night or on weekends before committing to calling.

**Why this priority**: Emergency availability is a strong differentiator and must be communicated immediately to capture high-urgency visitors who might otherwise call a competitor.

**Independent Test**: A visitor can identify within 5 seconds that emergency service is available 24/7 or on weekends/nights, and find the call CTA, without scrolling.

**Acceptance Scenarios**:

1. **Given** a visitor opens the page at any time, **When** they view the hero or top section, **Then** they see a clear visual indicator (badge, banner, or highlighted text) that emergency plumbing is available nights and weekends.
2. **Given** a visitor is in an emergency situation, **When** they see the emergency badge, **Then** they can immediately tap/click to call without hunting for the phone number.
3. **Given** a visitor searches "hydraulik awaria Częstochowa" (emergency plumber Częstochowa), **When** Google shows the result, **Then** the meta description communicates emergency availability.

---

### User Story 3 - Service Discovery (Priority: P2)

A homeowner needs a specific job done (e.g., toilet installation, pipe leak repair) and wants to confirm the plumber handles that specific service before calling.

**Why this priority**: Service clarity reduces phone call friction and increases qualified lead quality. Visitors need to self-qualify before calling.

**Independent Test**: A visitor can find their specific service listed within two scroll actions from the top of the page.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the page, **When** they scroll to the services section, **Then** they see all 17 services clearly listed, organized in a scannable grid or list.
2. **Given** a visitor scans the services, **When** they identify their needed service (e.g., "Montaż podgrzewacza wody"), **Then** a call CTA is visible near or within the section so they can act immediately.
3. **Given** a search engine indexes the page, **When** it crawls the services, **Then** each service name is present as readable text (not inside images).

---

### User Story 4 - Trust and Location Verification (Priority: P3)

A potential client wants to verify the company is a legitimate local business in Częstochowa before calling, by checking the address and location.

**Why this priority**: Trust signals increase conversion rates, especially for in-home service providers. Address verification is a key trust step.

**Independent Test**: A visitor can find the business address and open Google Maps to verify location without leaving the page flow.

**Acceptance Scenarios**:

1. **Given** a visitor reaches the contact/footer section, **When** they view it, **Then** they see the full address: Tadeusza Gajcego 4, 42-216 Częstochowa.
2. **Given** a visitor wants to verify location, **When** they click the address or the map link, **Then** they are directed to Google Maps (https://share.google/iTFr7fdAX5pKqkf48) in a new tab.
3. **Given** Google indexes the page, **When** it processes structured data, **Then** the business name, phone, and address are available as local business markup.

---

### Edge Cases

- What happens when a visitor has JavaScript disabled? The page must still display phone number, address, and services as plain HTML.
- What happens when the visitor is on a very slow mobile connection (2G)? Core content (headline, phone, key services) must be visible before all images load.
- What if the user clicks the map link on mobile? It should open the Google Maps app or browser tab correctly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display the company name "Usługi Hydrauliczne" as the primary brand name.
- **FR-002**: The page MUST show phone number "+48 518 893 308" as a tappable/clickable `tel:` link in at least two visible locations (hero section + contact/footer). The page MUST include a sticky top navigation bar that remains fixed while scrolling, containing the company name, anchor links to page sections (Usługi, O nas, Kontakt), and a "Zadzwoń" button linking to the phone number.
- **FR-003**: The page MUST communicate emergency plumbing availability on weekends and nights, prominently in the hero or header area.
- **FR-004**: The page MUST list all 17 services in Polish, grouped into three labeled visual subsections: **Naprawy** (Naprawa kranu, Naprawa rur wodóciągowych, Remont łazienki, Wykrywanie nieszczelności w instalacjach, Naprawa podgrzewacza wody, Naprawa przeciekającej rury, Naprawa rury kanalizacyjnej, Naprawa kabiny prysznicowej), **Montaże** (Montaż kranu, Montaż podgrzewacza wody, Montaż kabiny prysznicowej, Montaż toalety, Montaż zbiornika na wodę, Montaż rozdrabniacza odpadów, Montaż pompy głębinowej), **Czyszczenie** (Czyszczenie rury odpływowej, Czyszczenie kanalizacji). Each category label MUST be rendered as a heading (H3 or equivalent) for SEO hierarchy.
- **FR-005**: The page MUST display the business address: Tadeusza Gajcego 4, 42-216 Częstochowa.
- **FR-006**: The page MUST include a Google Maps link (https://share.google/iTFr7fdAX5pKqkf48) opening in a new browser tab.
- **FR-007**: The page MUST be fully responsive and optimized for mobile devices (primary use case for target audience on the go).
- **FR-008**: The page MUST be written entirely in Polish.
- **FR-009**: The page MUST include SEO-optimized content: unique title tag, meta description, heading hierarchy (H1, H2, H3), and LocalBusiness structured data (schema.org).
- **FR-010**: Each service MUST be rendered as readable HTML text (not images) for search engine indexing.
- **FR-011**: The page MUST include at least one primary call-to-action (CTA) visible without scrolling on desktop and mobile.
- **FR-012**: The page MUST load core content (headline, phone CTA, emergency info) before non-critical images complete loading.
- **FR-013**: The page MUST include a contact form with fields for name, phone number, and message, positioned as a secondary contact option primarily for price estimate requests on larger jobs. The form submission is mocked: on submit, the form MUST always resolve to a hardcoded success state and display a success message (e.g., "Dziękujemy! Oddzwonimy wkrótce."). The form MUST also render a distinct error state UI (e.g., "Coś poszło nie tak. Spróbuj ponownie.") so the error layout is visible and testable, even though it is never triggered in the mock.
- **FR-014**: The page MUST include a trust section combining: (a) three mock customer testimonials with Polish names and short review text, and (b) a trust badge displaying "10 lat doświadczenia" (10 years of experience).

### Key Entities

- **Business**: Name, phone number, address, city, service area, emergency availability hours.
- **Service**: Polish name, category (Naprawy / Montaże / Czyszczenie), optional short description. Services are grouped by category in the UI with each category rendered under a labeled H3 subsection.
- **Page Section**: Hero, Services, Emergency Info, About/Trust, Contact, Footer.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor on mobile can find and tap the phone number within 10 seconds of the page loading.
- **SC-002**: A visitor can identify their needed service (from the 17 listed) within two scroll actions from the top of the page.
- **SC-003**: Emergency availability information is visible without any scrolling on both mobile and desktop viewports.
- **SC-004**: The page achieves a Google PageSpeed Insights score of 85 or higher on mobile.
- **SC-005**: The page appears in Google search results for at least 5 targeted Polish-language queries (e.g., "hydraulik Częstochowa", "naprawa rur Częstochowa") within 60 days of publication.
- **SC-006**: The page includes valid LocalBusiness structured data with no critical errors when validated.
- **SC-007**: All 17 services are indexable as plain text by search engines.

---

## Assumptions

- The landing page is a **single-page site** (no blog, no multi-page navigation) for this phase.
- All service descriptions are short (name-only or 1–2 sentence descriptions); no detailed per-service pages in this phase.
- All content, CTAs, and navigation labels are in Polish.
- The target audience primarily accesses the site on mobile devices (smartphones).
- The company has no existing logo; a text-based or simple icon-based brand treatment will be used unless an image is provided.
- The page MUST include an "About" section with a 2–3 sentence description of the company (written in Polish, referencing 10 years of experience and service in Częstochowa) alongside a photo placeholder (headshot or team photo slot to be replaced before launch).
- No user accounts, payment system, or booking calendar is required for this phase — phone call is the sole conversion action.
- All internal links are mocked for the initial implementation.
- The Google Maps link provided will be used as-is for the map CTA.
- Standard Polish privacy policy and cookie consent are not required for this phase (no data collection beyond a potential contact form).
