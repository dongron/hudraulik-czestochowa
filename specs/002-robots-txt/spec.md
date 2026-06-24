# Spec: Robots.txt From Project Routes And Sanity Pages

## Assumptions I'm Making

1. The `robots.txt` file is for the public Next.js frontend in `frontend/`, not for the Sanity Studio workspace.
2. Public crawlable content is limited to the routes that are rendered by the frontend app: `/`, Sanity pages at `/:slug`, Sanity posts at `/posts/:slug` and `/sitemap.xml`.
3. Internal API routes, especially `/api/draft-mode/enable`, should not be crawled.
4. Published Sanity documents with defined slugs are crawlable; drafts, preview mode and unpublished content are not intended for search indexing.
5. The crawler policy should be permissive for public marketing/content pages and restrictive only for internal technical routes.
6. The canonical production domain is `https://hydraulik-czestochowa-24.pl`.

## Objective

Create a `robots.txt` policy for the plumbing landing site that lets search engines crawl public pages while excluding internal technical routes.

The primary users are search engine crawlers and SEO tools. The business goal is to support indexing of the homepage, Sanity-managed pages and Sanity-managed posts while avoiding accidental crawling of preview/draft infrastructure.

Acceptance criteria:

- Crawlers can access `/robots.txt` successfully on the frontend deployment.
- Crawlers are allowed to crawl `/`, Sanity page routes like `/home` or other published page slugs, and Sanity post routes like `/posts/example-post`.
- Crawlers are discouraged from crawling `/api/` routes, including `/api/draft-mode/enable`.
- The robots response references the sitemap for dynamic Sanity pages and posts.
- The implementation is generated from or aligned with existing route sources rather than manually inventing routes.

## Tech Stack

- Monorepo package manager: pnpm 10.33.2
- Frontend: Next.js 16.2.3 App Router, React 19.2.5, TypeScript 5.9.3
- CMS: Sanity 5.23.0 with `next-sanity` 12.2.2
- Deployment target: OpenNext Cloudflare tooling is present; existing docs also mention Vercel for the original feature plan
- Existing SEO route: `frontend/app/sitemap.ts`

## Commands

Run from the repository root unless noted otherwise.

```bash
pnpm run lint
pnpm run type-check
pnpm --filter frontend build
pnpm --filter frontend dev
```

Useful frontend-scoped commands:

```bash
pnpm --filter frontend lint
pnpm --filter frontend type-check
pnpm --filter frontend build
pnpm --filter frontend dev
```

## Project Structure

```text
frontend/
├── app/
│   ├── page.tsx                         → Homepage, backed by Sanity page slug `home`
│   ├── [slug]/page.tsx                  → Dynamic Sanity page route
│   ├── posts/[slug]/page.tsx            → Dynamic Sanity post route
│   ├── sitemap.ts                       → Existing dynamic sitemap route
│   └── api/draft-mode/enable/route.ts   → Internal preview route to disallow
├── public/                              → Static public assets if robots is implemented as a static file
└── sanity/lib/queries.ts                → Route source queries: `pagesSlugs`, `postPagesSlugs`, `sitemapData`

studio/
└── src/schemaTypes/
    ├── documents/page.ts                → Sanity page document with required slug
    ├── documents/post.ts                → Sanity post document with required slug
    └── singletons/settings.tsx          → Global metadata and optional production base source

specs/002-robots-txt/
└── spec.md                              → This specification
```

## Code Style

Use the existing project style: TypeScript, named exports where routes require them, 2-space indentation, single quotes and trailing commas.

Example implementation style if this becomes a Next.js metadata route:

```ts
import type {MetadataRoute} from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: 'https://hydraulik-czestochowa-24.pl/sitemap.xml',
  }
}
```

Expected generated `robots.txt` shape:

```text
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://hydraulik-czestochowa-24.pl/sitemap.xml
```

## Testing Strategy

No dedicated test framework is configured for this repo. Verification should use the existing type, lint and build checks plus a manual route check.

- Static/type verification: `pnpm --filter frontend type-check`
- Lint verification: `pnpm --filter frontend lint`
- Build verification: `pnpm --filter frontend build`
- Manual verification after starting dev server: open or fetch `http://localhost:3000/robots.txt`
- Manual SEO verification: confirm the robots response references `/sitemap.xml` and does not disallow `/`, `/:slug` or `/posts/:slug`

## Boundaries

- Always: Keep public marketing and content routes crawlable.
- Always: Keep `/api/` routes out of crawl scope.
- Always: Keep the robots policy aligned with `frontend/app/sitemap.ts` and Sanity route queries in `frontend/sanity/lib/queries.ts`.
- Always: Run lint, type-check and build before treating implementation as complete.
- Ask first: Change the approved production domain for the sitemap directive.
- Ask first: Disallow posts, dynamic Sanity pages or any future content type from indexing.
- Ask first: Change Sanity schemas, sitemap behavior, metadata generation or deployment config.
- Never: Expose Sanity tokens, draft-mode secrets or unpublished draft URLs.
- Never: Use robots.txt as the only protection for private content.
- Never: Remove existing sitemap coverage for published Sanity pages or posts without approval.

## Success Criteria

- `/robots.txt` returns HTTP 200 in local dev and production build output.
- Robots policy includes exactly one global crawler rule for `User-agent: *` unless a future requirement adds bot-specific behavior.
- Robots policy allows `/` and does not block Sanity page routes or Sanity post routes.
- Robots policy disallows `/api/`, covering `/api/draft-mode/enable`.
- Robots policy includes a `Sitemap` directive pointing to the frontend sitemap.
- `pnpm --filter frontend lint`, `pnpm --filter frontend type-check` and `pnpm --filter frontend build` pass.
- The final implementation changes no more than two source files unless the production domain source requires a documented follow-up.

## Route And Content Source Summary

Current frontend routes discovered from the codebase:

```text
/                              → frontend/app/page.tsx
/:slug                         → frontend/app/[slug]/page.tsx, Sanity `page` documents
/posts/:slug                   → frontend/app/posts/[slug]/page.tsx, Sanity `post` documents
/sitemap.xml                   → frontend/app/sitemap.ts
/api/draft-mode/enable         → frontend/app/api/draft-mode/enable/route.ts
```

Current Sanity route sources:

```text
page.slug.current              → public route `/:slug`
post.slug.current              → public route `/posts/:slug`
sitemapData query              → pages and posts with defined slugs for sitemap generation
```

Recommended crawler policy:

```text
Allow public site content:
- /
- /:slug for published Sanity pages
- /posts/:slug for published Sanity posts
- /sitemap.xml

Disallow internal technical routes:
- /api/
```

## Open Questions

- None. The canonical production domain for the `Sitemap:` directive is `https://hydraulik-czestochowa-24.pl`.
