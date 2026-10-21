# Spec: Keep Sanity Live Error Toasts Out Of Google Snippets

## Assumptions I'm Making

1. Live content updates and error toasts only matter to editors in Draft Mode / Sanity Presentation. Public visitors and crawlers never need them.
2. The Sanity CORS list is correct today (`https://hydraulik-czestochowa-24.pl` and the `www.` variant are present) and does not need changes. Googlebot's renderer still hits the CORS error path, so the fix must not rely on CORS.
3. Out of scope: Google building snippets from page text (header, nav, phone, hero image alt) for some queries instead of using the meta description. That is normal Google behaviour, and the meta description itself is correct.

## Evidence

Confirmed on 2026-10-21:

- Google snippet (screenshot `google error.png`): "hydrauliczne w Częstochowie. Usługi Hydrauliczne Częstochowa Sanity Live · 518 893 308Zadzwoń Klucz · 10 lat doświadczenia. Naprawy, montaże i czyszczenie."
- Search Console URL Inspection for `/`: last crawl Oct 15, 2026 by Googlebot smartphone. The crawled (rendered) HTML contains the Sonner toast: title "Sanity Live couldn't connect", description "Your origin is blocked by CORS policy", button "Manage". That is the root cause.
- The meta description on `/` is correct: "Profesjonalne usługi hydrauliczne w Częstochowie. 10 lat doświadczenia, pogotowie całą dobę od poniedziałku do soboty." Google shows it for `site:` queries, but builds the snippet from page text for queries like `hydraulik-czestochowa-24.pl`, and the toast text gets mixed in.
- The server-rendered HTML and a normal browser visit have no "Sanity Live" text. The toast only appears when the Live connection fails, as it did in Google's renderer.
- `frontend/app/layout.tsx` always renders `<Toaster />` and `<SanityLive onError={handleError} />`, even outside Draft Mode.
- `handleError` in `frontend/app/client-utils.ts` shows the toast with `duration: Infinity`, so once it fires it stays in the DOM and ends up in Google's rendered snapshot.
- The toast lives in the root layout, so every page (including `/uslugi/*`) can be affected when Google renders it.

## Objective

Make sure no Sanity or developer error text can appear in the rendered public page, so Google cannot use it as the search snippet. Editors in Draft Mode keep the current toasts.

Acceptance criteria:

- Outside Draft Mode, a Sanity Live error (CORS or any other) shows no visible text in the page. The error is still logged to the browser console.
- In Draft Mode, Sanity Live errors still show the current toast, including the "Manage" CORS action.
- Live content refresh (`<SanityLive />`) keeps working for everyone. Only the error reporting changes.
- The toast container is marked `data-nosnippet` as a second safeguard, so Google ignores any toast text that still appears.
- Meta description, title and Open Graph output stay exactly as they are now.

## Proposed Approach

1. `frontend/app/layout.tsx`: pass `onError={isDraftMode ? handleError : undefined}` to `<SanityLive>`. Without `onError`, next-sanity uses its built-in handler, which only logs (`console.warn` for CORS errors, `console.error` otherwise). `frontend/app/client-utils.ts` stays unchanged.
2. `frontend/app/layout.tsx`: wrap `<Toaster />` in `<div data-nosnippet>`.
3. After deploy (done by Dominik): in Google Search Console, run URL Inspection on `/` and the `/uslugi/*` pages and click "Request indexing" so Google re-renders and refreshes the snippet. The snippet will not change until Google recrawls.

Rejected alternatives:

- Removing `<SanityLive />` in production: it drives content revalidation from Sanity, so content edits would stop showing up without a redeploy.
- Changing only the meta description: it is already correct. Google ignored it because visible toast text looked more relevant, so this would not fix anything.

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript
- `next-sanity` (`defineLive`, `isCorsOriginError`) and `sonner` toasts
- Vitest with jsdom and Testing Library

## Commands

Run from `frontend/`:

```bash
pnpm test
pnpm lint
pnpm type-check
pnpm build
pnpm exec prettier --write <changed-files>
```

## Project Structure

```text
frontend/app/layout.tsx        → renders <Toaster /> and <SanityLive onError=... />
frontend/app/client-utils.ts   → Sanity Live error handlers (client)
frontend/app/*.test.ts(x)      → Vitest tests, next to the code they cover
```

## Code Style

Follow the existing files: single quotes, no semicolons, `@sanity/prettier-config`, `@/` imports, short comments only where the reason isn't obvious.

## Testing Strategy

- Unit test (Vitest) `frontend/app/layout.test.tsx`: call `RootLayout` with `next/headers` `draftMode` and `@/sanity/lib/live` mocked, then inspect the returned element tree:
  - Draft Mode off: the `SanityLive` element has no `onError`;
  - Draft Mode on: the `SanityLive` element has `onError === handleError`;
  - the `Toaster` element sits inside an element with `data-nosnippet`.
- Manual check after `pnpm build && pnpm start`: block `api.sanity.io` live requests in DevTools, reload `/` and confirm no toast text appears outside Draft Mode.
- Manual check that the rendered HTML around the toaster carries `data-nosnippet`.

## Boundaries

- Always: run tests, lint, type-check and Prettier on changed files before finishing.
- Ask first: changing Sanity CORS origins, removing `<SanityLive />`, adding dependencies.
- Never: deploy the frontend (Dominik deploys it), change the meta description content in Sanity, touch the Studio.

## Success Criteria

- Tests above pass, plus the existing suite.
- In a production build, a forced Sanity Live failure outside Draft Mode leaves no visible error text on the page.
- After Dominik deploys and requests reindexing, the Google snippet for the homepage no longer contains "Sanity Live".

## Open Questions

None blocking. Resolved:

- Snippet text: confirmed from the screenshot and from Google's crawled HTML (see Evidence).
- Affected URLs: confirmed on `/`. Because the toast is in the root layout, request reindexing for `/` first, then the `/uslugi/*` pages.
- Search Console: Dominik has access (domain property `sc-domain:hydraulik-czestochowa-24.pl`).

Possible follow-up (separate spec): Google shows the default Next.js "N" favicon next to the result because `frontend/app/favicon.ico` is still the template icon.
