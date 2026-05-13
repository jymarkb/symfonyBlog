# Landing Page

## Purpose

This document defines the structure, data flow, and implementation status for the public landing page at `/`.

- `/` is public — no auth required.
- The page is server-side rendered via Vike's `+data.ts` data layer, which fetches featured posts, latest posts, and tags in parallel before HTML is sent to the browser.
- Static sidebar blocks (About, Currently Reading, Recent Projects, Listening Now) are hardcoded stubs — no backend planned for these sections.
- Design reference: `design/index.html` — this is the source of truth. Legacy Symfony templates are reference-only and should not be followed.

## Removed / Deferred

- **Newsletter block** — removed. CSS and any future component must not be added until explicitly scoped.
- **RSS button** — removed. Do not add to the header until explicitly scoped.
- **"Now" nav link** — removed. Do not add the `/now` route or nav entry until explicitly scoped.

## Implementation Progress

```text
1. Hero section              done — centered layout, accent top stripe, paper-2 background,
                                    total post count stat, two CTAs (Browse essays + About me)
2. Featured post section     done — FeaturedPostsSection + FeaturedPostCard, SSR via
                                    fetchFeaturedPosts(); full-width layout when no cover image
3. Latest posts list         done — LatestPostsSection + PostRow, SSR via fetchLatestPosts();
                                    left-accent row design with title, excerpt, tags, date
4. Tags cloud (sidebar)      done — TagsSection, SSR via fetchTags()
5. Sidebar static blocks     done — AboutCard, ListeningNowBlock, CurrentlyReadingBlock,
                                    RecentProjectsBlock (hardcoded stubs)
6. SSR wiring                done — pages/index/+data.ts calls fetchFeaturedPosts,
                                    fetchLatestPosts, fetchTags in parallel via Promise.all;
                                    totalPosts threaded to HeroSection and LatestPostsSection
7. Tests                     done — backend Pest tests complete for all three public endpoints;
                                    frontend tests deferred pending tooling decision (Vitest vs Playwright)
```

## Sections

| Section                      | Design | Backend | Wiring | Tests |
|------------------------------|--------|---------|--------|-------|
| Hero section                 | ✅     | n/a     | ✅     | ✅    |
| Featured post                | ✅     | ✅      | ✅     | ✅    |
| Latest posts list            | ✅     | ✅      | ✅     | ✅    |
| Sidebar — Tags cloud         | ✅     | ✅      | ✅     | ✅    |
| Sidebar — About card         | ✅     | n/a     | n/a    | n/a   |
| Sidebar — Listening now      | ✅     | n/a     | n/a    | n/a   |
| Sidebar — Currently reading  | ✅     | n/a     | n/a    | n/a   |
| Sidebar — Recent projects    | ✅     | n/a     | n/a    | n/a   |

## Key Files

```text
design/index.html                          Design source of truth for the landing page
design/now.html                            Source for Listening Now block design
apps/web/pages/index/+data.ts              SSR data function — fetches all landing page data
apps/web/pages/index/+Page.tsx             Page composition
apps/web/src/features/blog/api/blogApi.ts  fetchFeaturedPosts, fetchLatestPosts, fetchTags
apps/web/src/features/blog/blogTypes.ts    PostSummary, PostTag, HomePageData types
apps/web/src/features/blog/components/     FeaturedPostsSection, LatestPostsSection, TagsSection,
                                           AboutCard, ListeningNowBlock, CurrentlyReadingBlock,
                                           RecentProjectsBlock, HeroSection
apps/web/src/features/blog/blog.css        Landing page styles
```

## Notes

- `fetchFeaturedPosts` uses `GET /api/v1/posts?featured=true` — returns all posts where `is_featured = true`. If more than one post is featured, extras are silently ignored by `FeaturedPostsSection` (it renders only the first).
- `HeroSection` accepts a `total` prop (from `data.totalPosts`) and renders it as a stat line below the CTAs.
- `FeaturedPostCard` renders full-width with a larger title when no cover image is present (`.featured--no-image`). The grey placeholder box is not used.
- `ListeningNowBlock` is a static stub. The track, artist, and source are hardcoded. Backend/scrobbling integration is not scoped.
