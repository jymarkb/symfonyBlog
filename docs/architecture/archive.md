# Archive Page

## Purpose

The archive page at `/archive` is a fully filterable, searchable index of all published posts, grouped by year.

- `/archive` is public — no auth required.
- SSR via `+data.ts` fetches the initial post list and all tags in parallel before HTML is sent.
- Client-side filtering (search + tag chip) calls `GET /api/v1/posts` directly without page reload.
- `prerender: false` — the page must not be statically prerendered because filter state varies per request.
- Design reference: `design/archive.html` — source of truth for layout, typography, and interaction.

## Implementation Progress

```text
1. Design          done — page-head, toolbar, stats strip, year-grouped arc-item rows
2. Backend         done — GET /api/v1/posts already supports ?search=, ?tag=, ?page=, ?per_page=
                          search filter tests added (title + excerpt LIKE)
3. Wiring          done — +data.ts, +Page.tsx, +config.ts; client-side filter/search with hasMounted guard
4. Tests           done — PostEndpointTest covers shape, pagination, tag filter, featured filter,
                          search by title, search by excerpt (10 tests, 96 assertions)
```

## Sections

| Section              | Design | Backend | Wiring | Tests |
|----------------------|--------|---------|--------|-------|
| Page head + toolbar  | ✅     | n/a     | ✅     | n/a   |
| Filter chips (tags)  | ✅     | ✅      | ✅     | ✅    |
| Search input         | ✅     | ✅      | ✅     | ✅    |
| Stats strip          | ✅     | ✅      | ✅     | ✅    |
| Year-grouped list    | ✅     | ✅      | ✅     | ✅    |
| URL params (?tag=, ?year=, ?search=) | ✅ | n/a  | ✅     | ⏳    |
| SEO Head (dynamic title, canonical, noindex rule) | ✅ | n/a | ✅ | n/a |
| Suggested tags (search active) | ✅ | n/a | ✅ | n/a |

## Key Files

```text
design/archive.html                                      Design source of truth
apps/web/pages/archive/+Page.tsx                         Page composition — state, filter callbacks, SSR seed
apps/web/pages/archive/+data.ts                          SSR data function — parallel fetch posts + tags
apps/web/pages/archive/+config.ts                        prerender: false
apps/web/src/features/blog/api/blogApi.ts                fetchArchivePosts (search, tag, page, per_page params)
apps/web/src/features/blog/blogTypes.ts                  ArchivePageData type
apps/web/src/features/blog/components/ArchiveFilterBar.tsx  Search input + tag chip filter bar
apps/web/src/features/blog/components/ArchiveSection.tsx    Year-grouped post list
apps/web/src/features/blog/components/ArchiveRow.tsx        Single archive row (date / title+tags / meta)
apps/web/src/features/blog/components/ArchiveStatsStrip.tsx Total essays, avg read, comments, since year
apps/web/src/features/blog/blog.css                      Archive CSS (page-head, toolbar, chips, stats, arc-item)
apps/api/tests/Feature/Public/PostEndpointTest.php       Backend endpoint tests including search coverage
```

## Notes

- `fetchArchivePosts` defaults to `per_page=50`. The page loads up to 50 posts SSR; filtering calls the same endpoint client-side.
- The `hasMounted` ref in `+Page.tsx` prevents a double-fetch on initial load when SSR data is already present.
- `ArchiveStatsStrip` derives avg read time and earliest year from the loaded `posts` array — these are approximations based on the current page of data, not the full corpus.
- Tag filter chips use tags from SSR data (`data.tags`) — the chip list does not re-fetch when filtering.
- `ArchiveFilterBar` debounces the search input by 300ms before calling the parent's `onSearchChange`.
