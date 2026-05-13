# SEO

## Purpose

SEO infrastructure for all public-facing pages. Covers global defaults, per-page meta tags,
URL shareability for archive filters, and crawl/index control for private pages.

Full spec: `docs/seo/01-global-seo-setup.md` and `docs/seo/02-per-page-seo.md`.
Roadmap and backlog: `docs/roadmap/06-seo-roadmap.md`.

## Implementation Progress

```text
Phase 1 — Global setup       in progress
Phase 2 — Archive + tags     in progress
Phase 3 — Static pages       pending
Phase 4 — Post detail        blocked (page is a stub)
Phase 5 — Sitemap / RSS      blocked (needs server route + post detail working)
```

## Sections

| Section                        | Design | Wiring | Notes |
|--------------------------------|--------|--------|-------|
| Global: lang, title, desc      | ✅     | ⏳     | Via `pages/+config.ts` vike-react config |
| Global: OG + Twitter defaults  | ✅     | ⏳     | Via `pages/+Head.tsx` |
| Global: noindex private pages  | ✅     | ⏳     | `(auth)`, `(admin)`, `(user)` layout +Head.tsx |
| Global: robots.txt             | ✅     | ⏳     | `apps/web/public/robots.txt` |
| Archive: URL params            | ✅     | ✅     | Read ?tag=/?year= on load; push on change |
| Archive: dynamic Head          | ✅     | ✅     | Title/desc/canonical change with active params |
| Tags: redirect to archive      | ✅     | ✅     | /tags → /archive, /tags/@slug → /archive?tag=slug |
| Home: +Head.tsx                | ✅     | ⏳     | Static title/desc/canonical/OG |
| Terms: +Head.tsx               | ✅     | ⏳     | Static |
| Privacy: +Head.tsx             | ✅     | ⏳     | Static |
| About: +Head.tsx               | ⏳     | ⏳     | Pending — page is a stub |
| Contact: +Head.tsx             | ⏳     | ⏳     | Pending — page is a stub |
| Post detail: +Head.tsx         | ⏳     | ⏳     | Blocked — `/blog/@slug` has no data layer |
| Sitemap.xml                    | ⏳     | ⏳     | Blocked — needs server route + published post slugs |
| RSS feed                       | ⏳     | ⏳     | Blocked — needs post detail working |

## Key Files

```text
docs/seo/01-global-seo-setup.md          Global SEO spec with code snippets
docs/seo/02-per-page-seo.md              Per-page SEO spec with checklist
docs/roadmap/06-seo-roadmap.md           Full roadmap, phases, and backlog

apps/web/pages/+config.ts                lang, title, description global defaults
apps/web/pages/+Head.tsx                 og:site_name, og:image, twitter:card defaults
apps/web/public/robots.txt               Crawl control for private routes
apps/web/pages/(auth)/+Head.tsx          noindex for auth pages
apps/web/pages/(admin)/+Head.tsx         noindex for admin pages
apps/web/pages/(user)/+Head.tsx          noindex for profile pages
apps/web/pages/archive/+Page.tsx         URL params: read on load, push on filter change
apps/web/pages/archive/+Head.tsx         Dynamic title/desc/canonical from active params
apps/web/pages/tags/+guard.ts            301 redirect /tags → /archive
apps/web/pages/tags/@slug/+guard.ts      301 redirect /tags/@slug → /archive?tag=slug
apps/web/pages/index/+Head.tsx           Home page Head
apps/web/pages/terms/+Head.tsx           Terms page Head
apps/web/pages/privacy/+Head.tsx         Privacy page Head
```

## Notes

- `?search=` is intentionally excluded from URL params — search result pages are thin/dynamic content
  not worth indexing. Only `?tag=` and `?year=` are persisted in the URL.
- Canonical on filtered archive pages is self-referencing (includes active params). Do not strip
  params back to `/archive` — filtered views are distinct content.
- `robots.txt` blocks crawling but does not block indexing if a page is externally linked.
  The `noindex` meta tag in private layout `+Head.tsx` files is the reliable index guard.
- vike-react auto-injects `<meta charset="UTF-8">` and `<meta name="viewport">` — do not duplicate.
- `<meta name="keywords">` is obsolete (Google dropped 2009) — do not add.
