# Profile Page

## Purpose

This document defines the structure, data flow, and implementation status for the private user profile page at `/profile`.

- `/profile` is auth-protected and only accessible to signed-in users.
- `/api/v1/profiles/{handle}` is the public-facing profile endpoint (read-only, no auth required).
- The profile page is the primary surface where users manage their account, password, notification preferences, and view their reading/comment activity.

## Implementation Progress

```text
1.  Frontend profile UI              done — layout, all components, CSS ported from design
2.  Backend profile endpoints        done — GET/PATCH/DELETE /api/v1/profile wired and auth-gated
3.  Frontend account form wiring     done — reads PrivateProfile, writes via PATCH, refreshes session
4.  Password change                  done — Supabase re-auth + updateUser, signs out and redirects
5.  Stats counts                     done — comments_count and posts_read_count wired via loadCount
6.  Comment history backend          done — ProfileCommentController, GET /api/v1/profile/comments,
                                           eager-loads post, limit 10, fully tested
7.  Comment history frontend         done — fetchProfileComments, ProfileCommentHistory wired,
                                           loading/error/empty/data states via ProfileDataSection
8.  Comment history tests            done — guest 401, empty 200, shape, isolation, 10-item limit,
                                           assertJsonMissingPath for user_id
9.  Recently viewed backend          done — PostView model/factory, ProfileReadingHistoryController,
                                           GET /api/v1/profile/reading-history, limit 10
10. Recently viewed frontend         done — fetchReadingHistory, ProfileRecentlyViewed wired,
                                           progress bar rendered per item
11. Recently viewed tests            done — guest 401, empty 200, shape, isolation, 10-item limit,
                                           assertJsonMissingPath for user_id
12. Notifications backend            done — notify_comment_replies + notify_new_posts columns,
                                           ProfileNotificationController,
                                           PATCH /api/v1/profile/notifications, fully tested
13. Notifications frontend           done — ProfileSidebar selects wired, isSaving/notifSuccess state,
                                           selects disabled when profile null or saving
14. Delete account                   done — ProfileService::deleteAccount wrapped in DB::transaction
                                           (anonymise comments, delete post_views, delete user),
                                           ProfileDangerZone wired, redirects to /signin
15. Security hardening               done — User::$fillable excludes role/email/supabase_user_id/handle;
                                           User::$hidden = [supabase_user_id, role, email];
                                           named rate limiters (profile-mutations 60/min,
                                           profile-delete 5/min, auth-read 60/min);
                                           throttle middleware on all PATCH/DELETE/GET profile routes;
                                           assertJsonMissingPath tests for every sensitive field
16. avatar_url removal               done — removed from PrivateProfile, SessionUser, SessionResource,
                                           PublicProfileResource, AppServiceProvider provisioning,
                                           UserFactory, Header.tsx, ProfileHead.tsx;
                                           initials fallback always shown; assertJsonMissingPath
                                           assertions added to ProfileEndpointTest and
                                           PublicProfileEndpointTest
17. Shared component extraction      done — FormMessage (aria-live wrapper), ProfileDataSection
                                           (loading/error/empty/data shell), ProfileSection,
                                           ProfilePlaceholder; useProfileFetch hook with
                                           mountedRef unmount guard
18. QA and cleanup                   done — ProfilePasswordSection null-safe user guard,
                                           confirmPassword validation when field is blank,
                                           passwordUpdated flag ensures redirect fires even if
                                           signOut throws; notify field assertions in
                                           ProfileNotificationTest; ProfileService::deleteAccount
                                           wrapped in DB::transaction
```

## Route and Auth

The page lives at `pages/(user)/profile/+Page.tsx`. The `(user)` route group layout (`pages/(user)/+Layout.tsx`) wraps every page in this group with:

```tsx
<AppShell>
  <RequireAuth>{children}</RequireAuth>
</AppShell>
```

`RequireAuth` redirects unauthenticated visitors to `/signin`. The page itself does not repeat the auth guard.

## Page Structure

```text
/profile
├── ProfileHead              — display name, handle, member since (initials fallback avatar)
│
└── .shell.profile-layout    — two-column grid (1fr 300px, collapses at 900px)
    ├── Left column
    │   ├── ProfilePage            — account form (display name, first/last name, read-only email)
    │   ├── ProfilePasswordSection — change password (Supabase re-auth flow)
    │   ├── ProfileCommentHistory  — last 10 comments with post link and timestamp
    │   ├── ProfileRecentlyViewed  — last 10 viewed posts with read-progress bar
    │   └── ProfileDangerZone      — delete account with inline confirmation
    │
    └── Right column
        └── ProfileSidebar   — reading stats, notification preferences, quick links
```

## Component Breakdown

### ProfileHead

- Source: `src/features/profile/components/ProfileHead.tsx`
- Data: `useCurrentSession().user` — `display_name`, `handle`, `created_at`
- Renders the page header with initials avatar, display name, handle, and member-since date.
- `avatar_url` has been fully removed — initials fallback is always shown.
- `created_at` is included in the session response (`SessionResource`) so no extra fetch is needed.

### ProfilePage (account form)

- Source: `src/features/profile/components/ProfilePage.tsx`
- API: `GET /api/v1/profile` → `fetchPrivateProfile`, `PATCH /api/v1/profile` → `updatePrivateProfile`
- Fields: `display_name`, `first_name`, `last_name`
- Read-only display: `email` (read from `useCurrentSession()`, never from the profile API)
- Calls `refreshSession()` after a successful update so the header reflects name changes immediately.
- Error state shows a "Try again" retry button; loading state shows a placeholder.

### ProfilePasswordSection

- Source: `src/features/profile/components/ProfilePasswordSection.tsx`
- Returns `null` when `user` is null (type-safe guard via early return after hooks; `RequireAuth` ensures this path is never reached).
- Re-authenticates via `supabase.auth.signInWithPassword` with the current password before calling `updatePassword`.
- Uses a `passwordUpdated` flag so the redirect to `/signin` fires even if `signOut` throws.
- Validates: current password required; new password passes strength check; confirm password must match and must not be blank when new password is set.
- Password changes do not go through Laravel — Supabase owns credentials.

### ProfileCommentHistory

- Source: `src/features/profile/components/ProfileCommentHistory.tsx`
- API: `GET /api/v1/profile/comments` via `fetchProfileComments`
- Uses `useProfileFetch` hook + `ProfileDataSection` for all four states (loading / error / empty / data).
- Backend returns at most 10 comments ordered by latest, eager-loading the related post.

### ProfileRecentlyViewed

- Source: `src/features/profile/components/ProfileRecentlyViewed.tsx`
- API: `GET /api/v1/profile/reading-history` via `fetchReadingHistory`
- Uses `useProfileFetch` hook + `ProfileDataSection` for all four states.
- Each item shows post title, last-viewed date, and a horizontal read-progress bar.
- Backend returns at most 10 items ordered by `last_viewed_at` desc.

### ProfileDangerZone

- Source: `src/features/profile/components/ProfileDangerZone.tsx`
- API: `DELETE /api/v1/profile` via `deleteAccount`, then `supabase.auth.signOut()`
- Inline two-step confirmation (button → confirm/cancel) before firing the delete.
- On success: redirects immediately to `/signin` with no intermediate message.
- Backend wraps all deletion writes (comment anonymisation, post-view deletion, user deletion) in a `DB::transaction`.

### ProfileSidebar

- Source: `src/features/profile/components/ProfileSidebar.tsx`
- Data: `profile` prop (lifted from `+Page.tsx`); `useCurrentSession().user` for member-since date.
- Stats: `posts_read_count` and `comments_count` from `PrivateProfile`.
- Notifications: two `<select>` dropdowns wired to `PATCH /api/v1/profile/notifications`.
  - Selects are disabled while saving (`isSaving`) or while profile is not yet loaded (`!profile`).
  - Success shows "Saved." for 2 s via `FormMessage`; error shows inline via `FormMessage`.
- Quick links: Browse posts, Contact support.

## Shared Components and Hooks

| Name | Source | Purpose |
|---|---|---|
| `FormMessage` | `src/components/ui/FormMessage.tsx` | `aria-live="polite"` wrapper for error/success messages |
| `ProfileSection` | `src/features/profile/components/ProfileSection.tsx` | `div.profile-section` wrapper with optional `h2` |
| `ProfilePlaceholder` | `src/features/profile/components/ProfilePlaceholder.tsx` | Muted placeholder text for loading/empty/error states |
| `ProfileDataSection` | `src/features/profile/components/ProfileDataSection.tsx` | Combines ProfileSection + ProfilePlaceholder for all four async states |
| `useProfileFetch` | `src/features/profile/hooks/useProfileFetch.ts` | Shared fetch lifecycle: token → API call → state; `mountedRef` prevents post-unmount updates |

## API Touchpoints

```text
Authenticated user (/profile)
├── GET    /api/v1/profile                  — private profile (display_name, first/last name,
│                                             comments_count, posts_read_count, notify prefs)
├── PATCH  /api/v1/profile                  — update display_name, first_name, last_name
├── DELETE /api/v1/profile                  — delete account (anonymise comments, cascade views)
├── GET    /api/v1/profile/comments         — last 10 comments with post context
├── GET    /api/v1/profile/reading-history  — last 10 viewed posts with progress
└── PATCH  /api/v1/profile/notifications    — save notify_comment_replies / notify_new_posts

Public (no auth)
└── GET    /api/v1/profiles/{handle}        — id, handle, display_name only
```

## Security Properties

| Property | Implementation |
|---|---|
| Auth gate | All `/api/v1/profile*` routes inside `auth:api` + `no-cache` middleware |
| BOLA | Every query scoped to `$request->user()` |
| Mass assignment | `$fillable` = [display_name, first_name, last_name, notify_*]; role/email/supabase_user_id excluded |
| Hidden fields | `User::$hidden` = [supabase_user_id, role, email] |
| Resource exposure | ProfileResource exposes no role, email, supabase_user_id, avatar_url, user_id |
| Rate limiting | profile-mutations: 60/min (PATCH profile + notifications); profile-delete: 5/min; auth-read: 60/min |
| Transactional safety | Account deletion wrapped in `DB::transaction` |
| Password flow | Re-auth via Supabase before update; redirect on success regardless of signOut result |

## CSS Classes

Profile page styles live in `src/features/profile/profile.css`.

```text
.profile-head        — flex header with avatar and info
.profile-info        — name + meta container
.profile-name        — display name heading
.profile-meta        — handle, member since (mono, small)
.profile-layout      — two-column grid layout (collapses to 1 col at 900px)
.profile-section     — left-column section with bottom border
.comment-list        — comment items grid
.comment-item        — individual comment card
.viewed-list         — recently viewed items grid
.viewed-item         — single viewed post row with progress bar
.read-progress-bar   — horizontal reading progress indicator
.danger-section      — red-tinted delete account card
.btn-danger          — red-bordered danger button
.profile-sidebar     — right sidebar grid
.side-card           — sidebar card with header
.stat-row            — flex row with label and mono value
```

## Acceptance Checks

- Signed-out users visiting `/profile` are redirected to `/signin`.
- Signed-in users see their initials avatar, display name, handle, and member-since date.
- Account form pre-fills from `GET /api/v1/profile`; saving updates the API and refreshes the header.
- Password change re-authenticates via Supabase, updates credentials, signs out, and redirects to `/signin`.
- Comment history shows last 10 comments (empty state if none); capped at 10 server-side.
- Reading history shows last 10 viewed posts with progress bar (empty state if none); capped at 10 server-side.
- Notification preferences save on dropdown change; "Saved." confirmation clears after 2 s.
- Account deletion requires explicit confirmation, anonymises comments, deletes post views, and redirects to `/signin`.
- All private fields (`role`, `email`, `supabase_user_id`, `avatar_url`) absent from all API responses; `assertJsonMissingPath` tests enforce this.
- Rate limit tests assert 429 for all throttled endpoints using `md5($limiterName . $userId)` cache key format.
