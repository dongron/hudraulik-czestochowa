# Implementation Plan: Keep Sanity Live Error Toasts Out Of Google Snippets

## Overview

Google rendered the homepage on Oct 15, 2026, the Sanity Live connection failed and the permanent error toast ("Sanity Live couldn't connect") ended up in the indexed page text and the search snippet. The fix stops the toast from rendering for anyone outside Draft Mode and marks the toast container `data-nosnippet` as a fallback. Everything happens in `frontend/app/layout.tsx`, plus one new test file.

## Architecture Decisions

- **Choose the handler on the server, in the layout.** The layout already reads `isDraftMode` from `draftMode()`. Passing `isDraftMode ? handleError : undefined` keeps the choice in one place. The browser cannot read Draft Mode itself because the cookie is httpOnly.
- **Reuse next-sanity's default `onError` for the public site.** `SanityLive` falls back to a built-in handler that only logs (`console.warn` for CORS, `console.error` otherwise). That is exactly what the spec asks for, so no new handler and no change to `client-utils.ts`.
- **Keep `<SanityLive />` and `<Toaster />` rendered for everyone.** `SanityLive` drives content revalidation. `Toaster` is harmless without toasts, and a future non-Sanity toast would still work.
- **`data-nosnippet` on a wrapping `<div>`.** Google supports the attribute on `div`, `span` and `section`. A wrapper is safer than relying on Sonner to forward unknown props.

## Dependency Graph

```text
layout.test.tsx (failing tests)
    └── layout.tsx change (onError by Draft Mode + data-nosnippet wrapper)
            └── production build + manual forced-failure check
                    └── deploy + Search Console reindex (Dominik)
```

Everything is sequential. Nothing is worth running in parallel.

## Task List

### Phase 1: Fix

- [x] Task 1: Show Sanity Live error toasts only in Draft Mode
- [x] Task 2: Hide the toast container from Google snippets

### Checkpoint: Fix

- [x] `pnpm test`, `pnpm lint` and `pnpm type-check` pass in `frontend/`
- [ ] Review the diff with Dominik

### Phase 2: Verify

- [x] Task 3: Verify in a production build with Sanity Live blocked

### Checkpoint: Complete

- [ ] All spec acceptance criteria met
- [ ] Ready to commit (one commit: code, test and specs)

### Phase 3: Release (Dominik)

- [ ] Task 4: Deploy and request reindexing

Details for each task are in `tasks.md`.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Passing a client function from the server layout to `SanityLive` stops working when it is conditional | Med | The layout already passes `handleError` today. `undefined` is a valid prop value. `pnpm build` and the Draft Mode check in Task 3 confirm it. |
| Testing an async server layout needs lots of mocking | Low | Follow the `vi.hoisted` + `vi.mock` pattern in `app/uslugi/[slug]/page.test.tsx`. Inspect the returned element tree instead of rendering `<html>` into jsdom. |
| Google keeps the old snippet for a while after deploy | Med | Request indexing in Search Console. The snippet changes only after Google renders the page again, usually within days. |
| Googlebot still hits Live errors, which are now only logged to the console | Low | Console output is not indexed. Content still updates through revalidation. |

## Open Questions

None.
