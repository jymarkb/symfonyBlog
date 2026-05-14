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
2. Backend         done — GET /api/v1/posts/{slug} returns PostDetailResource with body
                          reserved slug validation via app/Rules/ReservedSlug.php
                          cache layer via PostRepository (posts.slug.{slug}, 10 min TTL)
3. Wiring          done — pages/@slug/ route wired with SSR, BlockRenderer, PostRail, +Head.tsx
4. Tests           done — PostEndpointTest: detail shape, sensitive field guards, 404 cases
                          AdminPostValidationTest: reserved slug rejection (store + update)
```

## Sections

| Section | Design | Backend | Wiring | Tests |
|---|---|---|---|---|
| Page route (`pages/@slug/`) | n/a | n/a | ✅ | n/a |
| SSR data fetch + 404 guard | n/a | ✅ | ✅ | ✅ |
| Left rail (author, stats, TOC stub, actions) | ✅ | ✅ | ✅ | n/a |
| Post header (title, dek, cover) | ✅ | ✅ | ✅ | n/a |
| Block body (`BlockRenderer`) | ✅ | ✅ | ✅ | n/a |
| Post footer (tags, share row, stubs) | ✅ | ✅ | ✅ | n/a |
| SEO Head (title, canonical, OG, JSON-LD) | ✅ | n/a | ✅ | n/a |
| Reserved slug validation | n/a | ✅ | n/a | ✅ |
| Cache layer (`posts.slug.{slug}`) | n/a | ✅ | n/a | n/a |
| Detail shape + sensitive field tests | n/a | ✅ | n/a | ✅ |
| Comments section (`DiscussionSection`) | ✅ | ✅ | ✅ | ✅ |

## User Interaction State (Follow, Star, Reaction)

| Section | Design | Backend | Wiring | Tests |
|---|---|---|---|---|
| Load current user state (`GET /posts/{slug}/me`) | ✅ | ✅ | ✅ | ✅ |
| Reaction system (`POST /posts/{slug}/reactions`) | ✅ | ✅ | ✅ | ✅ |
| Follow / Unfollow author (`POST/DELETE /authors/{id}/follow`) | ✅ | ✅ | ✅ | ✅ |

### Follow / Unfollow architecture

State ownership: `isFollowing` and `followersCount` are owned at the `+Page.tsx` level and passed down to both `AuthorCard` instances (rail + footer) via `initialFollowing`, `initialFollowersCount`, and `onFollowChange`. This ensures both instances always show the same state.

OAuth flow: when a guest clicks Follow, `pending_follow_author_id` is stored in `sessionStorage`. After OAuth redirect and re-mount, a single `useEffect([isAuthenticated])` in `+Page.tsx` picks up the key, clears it, and calls `followAuthor()`. The result updates page-level state which propagates to both cards.

Fresh follower count: `GET /posts/{slug}/me` (`PostUserStateResource`) returns `followers_count` loaded directly from the DB, bypassing the 10-minute post cache. `POST /authors/{id}/follow` (`FollowResource`) also returns the updated `followers_count` so the UI is immediately accurate after a follow.

204 body skip: `apiClient.ts` skips `response.json()` for 204 and 304 responses. The unfollow DELETE returns 204 (no body) — without this guard the JSON parse throws and the optimistic UI update silently reverts.

Key files added / changed:
- `apps/api/app/Models/PostReaction.php` + migration `2026_05_14_000001_create_post_reactions_table.php`
- `apps/api/app/Services/Post/PostReactionService.php` — toggle, getCounts, getUserReaction
- `apps/api/app/Services/Post/PostService.php` — `getUserStateForPost` loads author `followers_count` fresh via `loadCount`
- `apps/api/app/Http/Controllers/Api/V1/PostUserStateController.php` — GET /posts/{slug}/me
- `apps/api/app/Http/Controllers/Api/V1/PostReactionController.php` — POST /posts/{slug}/reactions
- `apps/api/app/Http/Controllers/Api/V1/AuthorFollowController.php` — POST/DELETE /authors/{id}/follow
- `apps/api/app/Http/Resources/FollowResource.php` — returns `followers_count` after follow
- `apps/api/app/Http/Resources/PostUserStateResource.php` — returns `is_following`, `reaction`, `followers_count`
- `apps/api/routes/api.php` — `->where('authorId', '[0-9]+')` enforces integer-only route param
- `apps/api/tests/Feature/Follow/AuthorFollowTest.php` — 12 tests: guest 401, auth flow, idempotency, self-follow, BOLA isolation, rate limits, route param validation
- `apps/api/tests/Feature/Public/PostUserStateTest.php` — 6 tests including sensitive field assertions
- `apps/web/src/lib/api/apiClient.ts` — 204/304 body skip
- `apps/web/src/lib/auth/getAccessToken.ts` — `tryGetAccessToken()` soft probe (no redirect) for auth-context-lag
- `apps/web/src/features/blog/api/blogApi.ts` — `followAuthor` returns `{ followers_count }`; `fetchPostUserState` typed against updated `PostUserState`
- `apps/web/src/features/blog/blogTypes.ts` — `PostUserState` includes `followers_count: number`
- `apps/web/src/features/blog/components/AuthorCard.tsx` — single `useEffect` for prop sync; `onFollowChange` callback; no page-reload auth logic (moved to page)
- `apps/web/src/features/blog/components/PostRail.tsx` — threads `initialFollowersCount` and `onFollowChange` to `AuthorCard`
- `apps/web/pages/@slug/+Page.tsx` — owns `isFollowing`/`followersCount` state; page-level pending follow handler; client-side `userState` fallback fetch

## Deferred

- **TOC rail** — ✅ Done. Scroll-spy TOC implemented in `PostRail.tsx` with `IntersectionObserver`; `activeId` owned at page level in `+Page.tsx`.
- **Related posts** — ✅ Done. `PostRepository::getRelatedPosts` queries by shared tag count; embedded in `GET /posts/{slug}` response under `related`; `RelatedPosts.tsx` component wired in `+Page.tsx`; 5 Pest tests covering ordering, self-exclusion, empty-tag guard, and shape.
- **Comments section** — ✅ Done. `DiscussionSection` component with paginated load, sort (latest/oldest/top), compose box (auth-gated), inline replies (depth 1), guest auth gate. Backend: `PostCommentController`, `CommentService`, `CommentResource`, `comment-create` rate limiter (10/min). 18 Pest tests.

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
├── apps/api/app/Http/Controllers/Api/V1/PostCommentController.php  — GET/POST /posts/{slug}/comments
├── apps/api/app/Services/Post/CommentService.php                   — listForPost, createComment, deleteComment
├── apps/api/app/Http/Resources/CommentResource.php                 — comment shape with nested replies
└── apps/api/tests/Feature/Public/PostCommentTest.php               — 12 tests
    apps/api/tests/Feature/Admin/AdminCommentTest.php               — 6 tests

Frontend
├── apps/web/pages/@slug/+config.ts                          — prerender: false
├── apps/web/pages/@slug/+data.ts                            — SSR fetch + 404 guard
├── apps/web/pages/@slug/+Page.tsx                           — page composition
├── apps/web/pages/@slug/+Head.tsx                           — dynamic title, canonical, OG, JSON-LD
├── apps/web/src/features/blog/components/PostLayout.tsx     — 3-column layout shell
├── apps/web/src/features/blog/components/ArticleHead.tsx    — title, byline, cover image
├── apps/web/src/features/blog/components/BlockRenderer.tsx  — block-tree renderer
├── apps/web/src/features/blog/components/ArticleFoot.tsx    — tag chips + share row
├── apps/web/src/features/blog/blog.css                      — post-detail CSS
└── apps/web/src/features/blog/components/DiscussionSection.tsx     — comment thread UI
```

## Notes

- `pages/@slug/` sits at the root of `pages/`. Vike resolves static named directories (`/archive`, `/about`, etc.) before the dynamic `@slug` catch-all — no collision risk.
- The `findPublishedBySlug` method must only return posts with `status = published`. Draft and scheduled posts must return 404 to unauthenticated readers.
- Cache key: `posts.slug.{slug}`, TTL 10 minutes. Cache must be invalidated in `PostService` when a post is updated or deleted.
- Slug uniqueness is enforced at the DB level (`unique` index on `posts.slug`).
