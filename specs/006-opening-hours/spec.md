# Feature Specification: Opening Hours in Contact Section

**Feature Branch**: `006-opening-hours`
**Created**: 2026-09-29
**Status**: Draft (clarified)
**Input**: User description: "Add opening hours in the contact section, the same as on the Google Business Profile (kgmid /g/11nhm7lzc4). It's open Mon-Sat 24h and closed on Sundays. Do it in a way that makes sure Google won't accept someone's malicious change suggestions to the profile (they mark it as temporarily closed, which is a false statement)."

## Context

The Google Business Profile for "Usługi Hydrauliczne" lists these hours: **Monday to Saturday open 24 hours, Sunday closed**. Third parties have repeatedly suggested the business be marked "temporarily closed". Google decides whether to accept such suggestions partly by cross-checking independent sources, and the business's own website is one of the strongest of those sources.

Today the website works **against** the profile:

- The machine-readable business data on the home page says the business is open **7 days a week, 24 hours**, including Sunday.
- The hero badge says "Pogotowie 24/7 — noce i weekendy" and the contact section says "Pogotowie hydrauliczne 24/7 ... w weekendy", which also implies Sunday availability.
- Editable page content repeats the claim (verified on the live site 2026-09-29):
  - the site description used for search results and social sharing: "... pogotowie 24/7."
  - the hero subheading: "... Pogotowie hydrauliczne 24/7."
  - the "O mnie" text: "Oferuję pogotowie hydrauliczne 24/7 — reaguję na awarie także w nocy i w weekendy."
- The machine-readable business data gives the Google Maps short link as the business's own website address instead of https://hydraulik-czestochowa-24.pl/, so it does not clearly point back to the site as the official source.
- No opening hours are visible to visitors at all.

A website that disagrees with the profile weakens the owner's data in Google's eyes and makes a false "closed" suggestion easier to accept. This feature makes the website an unambiguous, consistent and current confirmation that the business is operating, with the same hours as the profile.

**Important limitation**: no website change can *guarantee* that Google rejects a suggested edit. Google weighs several sources and the owner's actions in the profile dashboard. This feature removes the website as a source of contradiction and turns it into supporting evidence. The companion actions in the profile dashboard are listed under [Companion Actions](#companion-actions-outside-the-website-out-of-scope-for-implementation).

## Clarifications

### Session 2026-09-29

- Q: Do you take emergency calls on Sundays? → A: No. Sunday is fully closed, including emergencies. Monday to Saturday is open 24 hours.
- Q: What is the site's public address? → A: https://hydraulik-czestochowa-24.pl/
- Q: Replace the Google Maps short link with a canonical Maps link? → A: No, keep the existing link.
- Q: What to do with the stale unpublished settings draft? → A: Leave it untouched.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees when the plumber is available (Priority: P1)

A person with a plumbing problem opens the site, scrolls to the contact section and immediately sees the weekly opening hours: every day Monday to Saturday marked as open 24 hours and Sunday marked as closed. They know they can call right now (or that they need to wait until Monday).

**Why this priority**: This is the visible part of the request and the direct customer value. It also gives Google's systems and human reviewers a visible statement of hours on the official site.

**Independent Test**: Open the home page, go to the contact section and compare the listed hours day by day against the Google Business Profile.

**Acceptance Scenarios**:

1. **Given** a visitor on the home page, **When** they view the contact section, **Then** they see an "opening hours" block listing all seven days of the week in Polish, in order from Monday to Sunday.
2. **Given** the opening hours block, **When** the visitor reads Monday to Saturday, **Then** each of those days is shown as open 24 hours (e.g. "Otwarte całą dobę").
3. **Given** the opening hours block, **When** the visitor reads Sunday, **Then** Sunday is shown as closed (e.g. "Nieczynne").
4. **Given** a visitor on a phone-width screen, **When** they view the contact section, **Then** the hours are fully readable without horizontal scrolling and appear near the phone number.
5. **Given** a visitor using a screen reader, **When** they reach the hours block, **Then** each day and its status are announced as a meaningful pair (day + hours).

---

### User Story 2 - Search engines read the same hours as the Google profile (Priority: P1)

Google (and other search engines) read the business information embedded in the website and find exactly the same weekly hours as the Google Business Profile: Monday to Saturday 24 hours, Sunday closed. The data also identifies the website as the business's own site and links it to the Google profile.

**Why this priority**: This is what addresses the malicious "temporarily closed" suggestions. The current embedded data contradicts the profile (claims Sunday is open), so fixing it is as important as showing the hours to visitors.

**Independent Test**: Run the home page through a public structured-data testing tool and confirm the reported opening hours match the profile, with no errors or warnings about opening hours.

**Acceptance Scenarios**:

1. **Given** the published home page, **When** its business data is validated with a structured-data testing tool, **Then** it reports Monday to Saturday open all day, Sunday closed, and no errors for the opening hours.
2. **Given** the embedded business data, **When** it is read, **Then** it contains no statement that the business is open on Sunday.
3. **Given** the embedded business data, **When** it is read, **Then** the business's website address is the site's own public address and the Google profile / Maps link is included as a separate reference to the same business.
4. **Given** the embedded business data, **When** it is read, **Then** the business is not described as closed, temporarily closed or permanently closed anywhere.

---

### User Story 3 - No contradicting "24/7" claims anywhere on the site (Priority: P1)

Wherever the site currently promises "24/7" or weekend availability, the wording matches the real hours, so no page contradicts the Google profile or the new hours block.

**Why this priority**: A single "24/7, also on weekends" line next to a "Sunday closed" block confuses customers and gives Google conflicting signals, which is the exact weakness a false edit can exploit.

**Independent Test**: Search every public page for "24/7", "weekend" and "niedziel" wording and check each occurrence against the hours.

**Acceptance Scenarios**:

1. **Given** the hero section, **When** emergency availability is shown, **Then** neither the badge nor the subheading claims Sunday, weekend or "24/7" availability; both reflect Monday to Saturday round-the-clock service.
2. **Given** a search result or social-media preview of the home page, **When** its description is shown, **Then** it does not say "24/7".
3. **Given** the "O mnie" section, **When** it describes emergency service, **Then** it says Monday to Saturday, day and night, without mentioning weekends.
4. **Given** the contact section, **When** the emergency availability note is shown, **Then** its wording is consistent with the hours block directly next to it.
5. **Given** any page on the site, **When** it is searched for availability claims, **Then** none of them contradicts "Mon to Sat 24h, Sunday closed".

---

### User Story 4 - Owner keeps hours in one place (Priority: P2)

The owner can change the weekly hours in the content editor they already use (for example, to open on Sundays in future) and the visible hours block and the embedded search-engine data both update together from that single source.

**Why this priority**: Consistency must survive future changes. If hours are typed in two places, they will drift apart and recreate the contradiction this feature removes. Lower priority because hours rarely change.

**Independent Test**: Change one day's hours in the content editor, publish, and confirm both the visible block and the embedded data show the new value while all other days are unchanged.

**Acceptance Scenarios**:

1. **Given** the owner edits the weekly hours in the content editor, **When** they publish, **Then** the contact section and the embedded business data both show the new hours.
2. **Given** the owner has not entered any hours, **When** the page is rendered, **Then** the hours block is hidden and the embedded data contains no opening hours at all (rather than guessed or default hours).
3. **Given** the owner enters an invalid time range (e.g. closing before opening on a normal day), **When** they try to publish, **Then** the editor blocks publishing and explains the problem.

---

### Edge Cases

- **Hours not set**: the hours block is hidden and no opening hours are published in the embedded data; the site never falls back to made-up hours.
- **"Open 24 hours" representation**: a 24-hour day must be understood by search engines as open all day (not as "closes at midnight" or "open 0 hours"), and shown to visitors as "całą dobę", not "00:00–23:59".
- **Closed day**: Sunday must be explicitly understood as closed, not merely missing, so it cannot be read as "hours unknown".
- **Public holidays**: holidays follow the regular weekly schedule on the site. Holiday-specific hours are managed only in the Google profile (see Assumptions).
- **Emergency setting off**: if the owner turns off the existing "emergency available" setting, the hours block still shows the regular hours; only the emergency note disappears.
- **Pages other than the home page**: service pages must not contain availability wording that contradicts the hours.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The contact section MUST display a weekly opening hours block listing all seven days, Monday first, with Polish day names.
- **FR-002**: The hours MUST match the Google Business Profile: Monday to Saturday open 24 hours, Sunday closed.
- **FR-003**: A 24-hour day MUST be shown to visitors in plain Polish wording meaning "open around the clock" (not as a numeric time range), and a closed day MUST be shown as "closed".
- **FR-004**: The hours block MUST be readable on phone-width screens, placed with the other contact details (phone, address) and accessible to screen readers as day/hours pairs.
- **FR-005**: The embedded machine-readable business data on the home page MUST publish the same weekly hours as the visible block, with 24-hour days expressed in the form search engines interpret as "open all day" and Sunday expressed explicitly as closed.
- **FR-006**: The embedded business data MUST NOT state or imply that the business is open on Sunday or that it is closed, temporarily closed or permanently closed.
- **FR-007**: The embedded business data MUST use the site's own public address (https://hydraulik-czestochowa-24.pl/) as the business website and include the existing Google Maps link as a separate reference to the same business.
- **FR-008**: The visible hours and the embedded hours MUST come from a single owner-editable source so they cannot diverge.
- **FR-009**: The owner MUST be able to edit the hours for each day of the week (open 24 hours, closed, or an opening and closing time) in the existing content editor, with validation that prevents impossible time ranges.
- **FR-010**: If no hours are set, the site MUST hide the hours block and publish no opening hours in the embedded data.
- **FR-011**: All existing availability wording ("24/7", "noce i weekendy", "w weekendy") MUST be revised so it does not contradict the published hours. This covers the fixed wording in the hero badge and contact section and the editable content listed in [Context](#context): site description (search results and social sharing), hero subheading and "O mnie" text. Sunday is fully closed, including for emergencies, so the wording MUST describe round-the-clock service Monday to Saturday (e.g. "Pogotowie całą dobę, pon–sob") and MUST NOT mention "24/7", weekends or Sunday availability.
- **FR-012**: The initial content MUST be set to Monday to Saturday 24 hours, Sunday closed, so the feature is correct on first publish without further editing.

### Key Entities

- **Weekly opening hours**: the business's regular schedule; one entry per day of the week, each being "open 24 hours", "closed" or "open from X to Y". Owned by the site-wide business settings (alongside phone, address and the Google Maps link) and used by both the visible contact section and the embedded business data.
- **Emergency availability note**: the existing on/off setting and its visible wording in the hero and contact sections; its wording must be consistent with the weekly opening hours.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A day-by-day comparison of the website's visible hours, the website's embedded business data and the Google Business Profile shows 7 of 7 days identical.
- **SC-002**: A public structured-data testing tool reports 0 errors and 0 warnings for the business's opening hours on the home page.
- **SC-003**: 0 occurrences of availability wording on the public site that contradict "Mon to Sat 24h, Sunday closed".
- **SC-004**: A first-time visitor can find the opening hours within 10 seconds of arriving on the home page (contact section reachable from the main navigation, hours visible without extra clicks).
- **SC-005**: After one change to the hours in the content editor and publishing, both the visible block and the embedded data reflect the change on the next page load, with no second place to edit.
- **SC-006**: Within 60 days of release, no "temporarily closed" suggestion is applied to the Google profile without the owner being notified and able to reject it (tracked by the owner in the profile dashboard; depends on the companion actions below).

## Assumptions

- The hours given by the owner (Mon to Sat 24h, Sunday closed) are the source of truth; the Google profile currently shows the same hours. The Google search page was not machine-read for this spec.
- Hours are shown in the contact section on the home page. Adding them to the footer or service pages is out of scope, but those pages must not contradict them (FR-011).
- The site is Polish-only, so hours are shown only in Polish.
- Public holiday and one-off special hours are managed only in the Google profile; the website shows regular weekly hours.
- A live "open now / closed now" indicator is out of scope for this feature.
- The business's public website address is https://hydraulik-czestochowa-24.pl/ and the Google profile's website field points to it (to be confirmed by the owner, see Companion Actions).
- The unpublished settings draft is left untouched at the owner's request. If it is published later without the new hours, the hours block disappears and the hours are removed from the embedded data (FR-010 behaviour), so the owner must discard or update that draft before publishing it.
- The existing "emergency available" setting stays; only its wording changes.

## Companion Actions Outside the Website *(out of scope for implementation)*

The website change supports the profile but does not control it. For the protection the owner wants, these actions in Google Business Profile are needed alongside this feature:

1. Keep the profile verified and signed in regularly; review the "Google updates" / "Edits from Google" notice and reject false "temporarily closed" changes as soon as they appear.
2. Make sure the profile's website field points to this site's home page, so Google can match the site to the profile.
3. Keep the profile active (recent photos, replies to reviews, posts), which signals an operating business.
4. If a false closure is applied, request a correction through Business Profile support and report the malicious edits, referencing the website hours as evidence.
