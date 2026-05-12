# Post Detail Page

## Purpose

The post detail page at `/<slug>` renders a single published post for public readers.

- `/<slug>` is public — no auth required.
- SSR via `+data.ts` fetches the post by slug before HTML is sent.
- `prerender: false` — posts are dynamic (published_at, comment counts change).
- URL is top-level clean slug (e.g. `jymb.blog/why-rust-matters`) — no `/blog/` prefix.
- Design reference: `design/post-v2.html` — source of truth for layout, typography, and interaction.

## URL Decision

Top-level `/<slug>` was chosen over `/blog/<slug>` for SEO (shorter path, slug is the full keyword signal). Reserved slug collisions are prevented at the API validation layer — see Reserved Slugs below.

## Implementation Progress

```text
1. Design          done — design/post-v2.html ported to React components
2. Backend         partial — GET /api/v1/posts/{slug} exists and returns PostDetailResource with body
                             reserved slug validation not yet added
                             cache layer not yet added
3. Wiring          done — pages/@slug/ route wired with SSR, BlockRenderer, PostRail, +Head.tsx
4. Tests           partial — PostEndpointTest covers basic shape; detail assertions incomplete
                             reserved slug rejection tests not yet added
```

## Sections

| Section | Design | Backend | Wiring | Tests |
|---|---|---|---|---|
| Page route (`pages/@slug/`) | n/a | n/a | ✅ | n/a |
| SSR data fetch + 404 guard | n/a | ✅ | ✅ | ⏳ |
| Left rail (author, stats, TOC stub, actions) | ✅ | ✅ | ✅ | n/a |
| Post header (title, dek, cover) | ✅ | ✅ | ✅ | n/a |
| Block body (`BlockRenderer`) | ✅ | ✅ | ✅ | n/a |
| Post footer (tags, share row, stubs) | ✅ | ✅ | ✅ | n/a |
| SEO Head (title, canonical, OG, JSON-LD) | ✅ | n/a | ✅ | n/a |
| Reserved slug validation | n/a | ⏳ | n/a | ⏳ |
| Cache layer (`posts.slug.{slug}`) | n/a | ⏳ | n/a | n/a |
| Detail shape + sensitive field tests | n/a | ✅ | n/a | ⚠️ |

## Deferred

- **TOC rail** — left rail (`<aside class="toc-rail">`) is an empty stub. Real scroll-spy TOC is a standalone task.
- **Margin-notes rail** — right rail (`<aside class="margin-notes">`) is an empty stub. Deferred.
- **Related posts** — design shows "Related essays" section. No backend endpoint exists. Deferred.
- **Comments section** — full comment thread UI. Deferred.
- **Star/reaction bar** — star API exists (`POST/DELETE /posts/{slug}/stars`) but UI is deferred.

## Reserved Slugs

The following top-level routes must never be used as post slugs. The API rejects them at validation:

```text
archive, about, contact, signin, signup, forgot-password,
reset-password, auth, profile, dashboard, editor, terms, privacy
```

Enforced via `app/Rules/ReservedSlug.php` referenced in `StorePostRequest` and `UpdatePostRequest`.

## Block Body Format

Post body is stored as `BlockElement[]` JSON — a custom block schema (not Markdown, not Slate/TipTap standard). Frontend renders via a custom `BlockRenderer` component that walks the array by `type` field.

Supported node types: `heading` (h1–h6 via `level`), `paragraph`, `blockquote`, `pre`/`code`, `callout`, `ul`, `ol`, `hr`. Text nodes within `children[]` support inline marks: `bold`, `italic`, `code`, `link`.

No `dangerouslySetInnerHTML` — each node type renders as safe React elements.

## Layout (from post-v2.html)

Two-column layout:
- **Left rail** (`.post-rail`) — author card, stat pills (stars, comments, date/read time), sticky TOC stub, reading progress stub, action buttons
- **Right column** (`.post-content`) — `block-title`, `block-dek`, `block-cover`, `block-body` (BlockRenderer output), footnotes, `post-footer` (tags, reactions stub, share row, related essays stub)
- **Comments section** (`.comments-wrap`) — below the main layout, deferred

Block body is rendered by `BlockRenderer` from `@jymarkb/block-editor/render` (already installed at `^1.2.1`).

## Key Files

```text
Backend
├── apps/api/app/Http/Controllers/Api/V1/PublicPostController.php
├── apps/api/app/Services/Post/PostService.php               — findPublishedBySlug (+ cache layer)
├── apps/api/app/Http/Resources/PostResource.php             — detail shape
├── apps/api/app/Http/Requests/Admin/StorePostRequest.php    — reserved slug validation
├── apps/api/app/Http/Requests/Admin/UpdatePostRequest.php   — reserved slug validation
├── apps/api/app/Rules/ReservedSlug.php                      — custom Rule class (to be created)
└── apps/api/tests/Feature/Public/PostEndpointTest.php       — detail shape + sensitive field tests

Frontend
├── apps/web/pages/@slug/+config.ts                          — prerender: false
├── apps/web/pages/@slug/+data.ts                            — SSR fetch + 404 guard
├── apps/web/pages/@slug/+Page.tsx                           — page composition
├── apps/web/pages/@slug/+Head.tsx                           — dynamic title, canonical, OG, JSON-LD
├── apps/web/src/features/blog/components/PostLayout.tsx     — 3-column layout shell
├── apps/web/src/features/blog/components/ArticleHead.tsx    — title, byline, cover image
├── apps/web/src/features/blog/components/BlockRenderer.tsx  — block-tree renderer
├── apps/web/src/features/blog/components/ArticleFoot.tsx    — tag chips + share row
└── apps/web/src/features/blog/blog.css                      — post-detail CSS
```

## Notes

- `pages/@slug/` sits at the root of `pages/`. Vike resolves static named directories (`/archive`, `/about`, etc.) before the dynamic `@slug` catch-all — no collision risk.
- The `findPublishedBySlug` method must only return posts with `status = published`. Draft and scheduled posts must return 404 to unauthenticated readers.
- Cache key: `posts.slug.{slug}`, TTL 10 minutes. Cache must be invalidated in `PostService` when a post is updated or deleted.
- Slug uniqueness is enforced at the DB level (`unique` index on `posts.slug`).
