<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial ratification)
Added sections: Core Principles, Technology Stack & Constraints, Development Workflow, Governance
Removed sections: N/A (first version)
Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check section is template-driven; no update needed
  ✅ .specify/templates/spec-template.md — No constitution-specific references; no update needed
  ✅ .specify/templates/tasks-template.md — No constitution-specific references; no update needed
Deferred TODOs: None
-->

# Hydraulik Constitution

## Core Principles

### I. Content-First Architecture

Sanity is the single source of truth for all content. Content MUST be modelled
in Sanity schemas and retrieved via GROQ queries; hardcoded copy inside
components is not permitted. Schema types and GROQ query result types MUST be
kept in sync using `sanity typegen generate` before every build.

### II. Component Composability

The page-builder pattern is the primary composition model. Every UI block MUST
be a self-contained React component that accepts typed props derived from
Sanity query results. Blocks MUST NOT reach outside their own scope or
perform their own data fetching; data flows top-down from page-level queries.

### III. Type Safety (NON-NEGOTIABLE)

TypeScript is mandatory across the entire codebase (`frontend/` and `studio/`).
The `any` type is prohibited without an explicit `// eslint-disable` comment
that names the justification. Generated types from `sanity.types.ts` MUST be
the primary source of Sanity document types; hand-rolled duplicates are not
allowed.

### IV. Performance-First Rendering

React Server Components are the default. `'use client'` MUST only be added
when browser-only APIs or interactive state are genuinely required. Static
generation and Incremental Static Revalidation (ISR) via the Next.js App
Router MUST be preferred over runtime server-side rendering wherever content
change frequency allows.

### V. Simplicity & YAGNI

Complexity requires justification. New abstractions, helpers, or shared
utilities MUST serve at least two concrete use sites before being extracted.
Features MUST NOT be built without a corresponding spec. Dependency additions
require a short rationale comment in the PR description.

## Technology Stack & Constraints

- **Frontend**: Next.js 16 App Router, React 19, TypeScript 5
- **CMS**: Sanity v5 (Studio + Content Lake)
- **Styling**: Tailwind CSS v4 (PostCSS plugin mode)
- **Package manager**: pnpm (monorepo workspaces: `frontend/`, `studio/`)
- **Deployment**: Vercel (frontend) + Sanity-hosted Studio
- **Node target**: LTS (22.x)
- **Browser support**: Last 2 major versions of evergreen browsers

Security constraints: All content mutations MUST go through authenticated
Sanity API calls; no write tokens MUST be exposed to the browser.
Environment variables holding secrets MUST use the `SANITY_API_*` prefix
and be restricted to server-only contexts (Next.js server components / route
handlers).

## Development Workflow

- Run both dev servers with `pnpm run dev` from the repository root.
- Before committing, run `pnpm run type-check` and `pnpm run lint` to ensure
  zero errors.
- Schema changes in `studio/` MUST be followed by `pnpm run sanity:typegen`
  in `frontend/` to regenerate `sanity.types.ts`.
- Feature branches MUST follow the naming convention `###-feature-name`
  (sequential number + hyphenated description).
- All features MUST have a spec in `specs/###-feature-name/` before
  implementation begins.

## Governance

This constitution supersedes all other documented development practices for
this project. Amendments MUST:

1. Increment `CONSTITUTION_VERSION` following semantic versioning
   (MAJOR: breaking governance change; MINOR: new principle/section;
   PATCH: clarification or wording fix).
2. Update `LAST_AMENDED_DATE` to the date of the change.
3. Include a Sync Impact Report (HTML comment at the top of this file)
   listing changed principles and any templates that required updates.
4. Be reviewed by the project owner before merging.

All pull requests MUST include a brief note confirming compliance with each
Core Principle. Non-compliance requires explicit approval and a follow-up
ticket.

**Version**: 1.0.0 | **Ratified**: 2026-04-30 | **Last Amended**: 2026-04-30
