# Profile Page

## Purpose

This document defines the structure, data flow, and implementation plan for the private user profile page at `/profile`.

- `/profile` is auth-protected and only accessible to signed-in users.
- `/profile/:handle` is the public-facing profile (separate page, not covered here).
- The profile page is the primary surface where users manage their account, password, notification preferences, and view their reading/comment activity.

## Implementation Progress

```text
1. Frontend profile UI              done — layout, all components, CSS ported from design
2. Backend profile endpoints        done — GET/PATCH/DELETE /api/v1/profile wired and auth-gated
3. Frontend account form wiring     done — reads PrivateProfile, writes via PATCH, refreshes session
4. Password change                  done — Supabase re-auth + updateUser, signs out and redirects
5. Stats counts                     done — comments_count wired; profile state lifted to +Page.tsx
6. Comment history backend          done — Post/Comment models, migrations, ProfileCommentController,
                                    GET /api/v1/profile/comments, PostFactory, CommentFactory, DatabaseSeeder all done
7. Comment history frontend         done — ProfileComment types, fetchProfileComments, ProfileCommentHistory component wired;
                                    fixed session guard bug (missing session left component in permanent loading state)
8. Comment history tests            done — ApiRouteCoverageTest entry added, ProfileCommentHistoryTest (guest 401,
                                    empty 200, correct shape, isolation) all passing
8. Recently viewed                  pending — needs GET /api/v1/profile/reading-history endpoint
9. Notifications                    pending — UI stub only; no backend endpoint yet
10. Delete account                  pending — UI stub only; DELETE /api/v1/profile not wired
11. Security review                 pending — ownership checks, rate limiting on profile mutations
12. Cleanup                         pending — remove stubs, wire real data, remove disabled states
```

Frontend profile UI covers all eight components (`ProfileHead`, `ProfilePage`, `ProfilePasswordSection`, `ProfileCommentHistory`, `ProfileRecentlyViewed`, `ProfileDangerZone`, `ProfileSidebar`, `ProfileForm`), the full CSS port from `design/profile.html`, and session data displayed without extra fetches (`display_name`, `handle`, `avatar_url`, `created_at`).

Backend profile endpoints cover `ProfileController` behind `auth:api` middleware, `ProfileResource` and `ProfileService`, the `GET /api/v1/profile` load, `PATCH /api/v1/profile` update, and the `DELETE /api/v1/profile` route stub. The session endpoint (`GET /api/v1/session`) returns `created_at` via `SessionResource` so `ProfileHead` has member-since without a separate fetch.

Password change goes through Supabase — `ProfilePasswordSection` re-authenticates with the current password via `signInWithPassword`, then calls `updatePassword`. On success the user is signed out and redirected to `/signin`. No new Laravel endpoint is needed.

Comment history uses a dedicated `ProfileCommentController` (separate from `ProfileController` to follow Laravel's single-responsibility convention). The `GET /api/v1/profile/comments` route is auth-gated inside the `auth:api` middleware group. `ProfileService::getCommentHistory()` eager-loads the related post. `ProfileResource` now returns the real `comments_count` from `loadCount`. Remaining: run `PostFactory` and `CommentFactory`, seed test data, then wire the frontend component.

## Route and Auth

The page lives at `pages/(user)/profile/+Page.tsx`. The `(user)` route group layout (`pages/(user)/+Layout.tsx`) wraps every page in this group with:

```tsx
<AppShell>
  <RequireAuth>{children}</RequireAuth>
</AppShell>
```

`RequireAuth` redirects unauthenticated visitors to `/signin`. The page itself does not need to repeat the auth guard.

## Page Structure

```text
/profile
├── ProfileHead              — avatar, display name, handle, member since
│
└── .shell.profile-layout    — two-column grid (1fr 300px, collapses at 900px)
    ├── Left column
    │   ├── ProfilePage          — account form (display name, first/last name, avatar URL, email)
    │   ├── ProfilePasswordSection — change password (stub)
    │   ├── ProfileCommentHistory  — user's past comments (stub)
    │   ├── ProfileRecentlyViewed  — reading history (stub)
    │   └── ProfileDangerZone      — delete account (stub)
    │
    └── Right column
        └── ProfileSidebar     — reading stats, notifications, quick links
```

## Component Breakdown

### ProfileHead

- Source: `src/features/profile/components/ProfileHead.tsx`
- Data: `useCurrentSession().user` — `display_name`, `handle`, `avatar_url`, `created_at`
- Renders the page header with avatar (image or initial fallback), display name, handle, and member-since date.
- `created_at` is included in the session response (`SessionResource.php`) so no extra fetch is needed.
- `SessionUser` type (`authTypes.ts`) includes `created_at: string | null`.

### ProfilePage (account form)

- Source: `src/features/profile/components/ProfilePage.tsx`
- API: `GET /api/v1/profile` → `fetchPrivateProfile`, `PATCH /api/v1/profile` → `updatePrivateProfile`
- Fields: `display_name`, `first_name`, `last_name`, `avatar_url`
- Read-only display: `email` (shown in form with hint text)
- Calls `refreshSession()` after a successful update so the header reflects name changes.
- Delegates rendering to `ProfileForm` which uses `.profile-section`, `.field`, `.field-row`, `.field-error`, `.form-alert`, `.hint` CSS classes.

### ProfilePasswordSection

- Source: `src/features/profile/components/ProfilePasswordSection.tsx`
- Status: **done** — fully wired.
- Re-authenticates via `supabase.auth.signInWithPassword` with the current password before calling `updatePassword`.
- On success: signs the user out and redirects to `/signin`.
- Password changes do not go through Laravel — Supabase owns credentials.

### ProfileCommentHistory

- Source: `src/features/profile/components/ProfileCommentHistory.tsx`
- Status: **in progress** — backend endpoint done; frontend component still a stub.
- Backend: `GET /api/v1/profile/comments` via `ProfileCommentController::index()`, auth-gated, returns `ProfileCommentResource` collection (id, body, post_title, post_slug, created_at).
- Frontend pending: rewrite component to fetch from the endpoint, display loading/error/empty/data states.

### ProfileRecentlyViewed

- Source: `src/features/profile/components/ProfileRecentlyViewed.tsx`
- Status: **stub** — shows empty state.
- Future: `GET /api/v1/profile/reading-history` with read progress percentage per post.

### ProfileDangerZone

- Source: `src/features/profile/components/ProfileDangerZone.tsx`
- Status: **stub** — delete button disabled.
- Future: `DELETE /api/v1/profile` with a confirmation modal before calling the endpoint.

### ProfileSidebar

- Source: `src/features/profile/components/ProfileSidebar.tsx`
- Status: `comments_count` and `posts_read_count` wired from `PrivateProfile` (profile state lifted to `+Page.tsx`); member-since date wired from session; notifications dropdowns are disabled.
- `posts_read_count` always shows 0 until the reading history endpoint is implemented.
- Quick links (Browse posts, Contact support) are live.

## API Touchpoints

```text
Authenticated user (/profile)
├── GET  /api/v1/profile          — load private profile fields + comments_count
├── PATCH /api/v1/profile         — update display_name, first_name, last_name, avatar_url
├── DELETE /api/v1/profile        — delete account (route exists, not wired on frontend)
└── GET /api/v1/profile/comments  — comment history list (backend done, frontend pending)

Future
├── GET /api/v1/profile/reading-history  — recently viewed posts with progress
└── PATCH /api/v1/profile/notifications  — save notification preferences
```

## Data Flow

```text
User lands on /profile
└── (user)/+Layout.tsx checks session via RequireAuth
    └── If unauthenticated: redirect to /signin
    └── If authenticated: render page
        └── ProfileHead reads useCurrentSession().user (no extra fetch)
        └── ProfilePage fetches GET /api/v1/profile (separate from session)
            └── On submit: PATCH /api/v1/profile -> refreshSession()
```

## CSS Classes

Profile page styles live in `src/features/profile/profile.css`, imported globally via `src/styles/global.css`.

```text
.profile-head        — flex header with avatar and info
.profile-info        — name + meta container
.profile-name        — h1 display name
.profile-meta        — handle, member since (mono, small)
.profile-layout      — two-column grid layout
.profile-section     — left-column section with bottom border
.field-row           — two-column field grid (collapses at 540px)
.comment-list        — comment items grid
.comment-item        — individual comment card
.viewed-list         — recently viewed items
.viewed-item         — single viewed post row with progress bar
.read-progress-bar   — horizontal reading progress indicator
.danger-section      — red-tinted delete account card
.profile-sidebar     — right sidebar grid
.side-card           — sidebar card with bordered header
.stat-row            — flex row with label and mono value
.field select        — styled dropdown (width, border, padding, appearance reset)
```

Shared form primitives (`.field`, `.field-error`, `.form-alert`, `.hint`, `.divider`, `.row-2`) live in `src/styles/theme.css` — they are used by both auth and profile features.

## Current Acceptance Checks

- Signed-out users visiting `/profile` are redirected to `/signin`.
- Signed-in users see their avatar initial (or image if set), display name, handle, and member-since date in the header.
- The account form pre-fills with current profile data from `GET /api/v1/profile`.
- Saving the account form updates the API and refreshes the session so the header name updates immediately.
- Password change re-authenticates, calls Supabase `updatePassword`, signs the user out, and redirects to `/signin`.
- Sidebar shows real `comments_count` from the profile API; `posts_read_count` shows 0 (stub).
- `GET /api/v1/profile/comments` returns the authenticated user's comment history (backend only; frontend still a stub).
- Comment history, recently viewed, notifications, and delete account are visible but rendered as stubs (empty states, disabled buttons).
- The layout collapses to a single column on screens narrower than 900px.
- Field rows (first name / last name) collapse to a single column on screens narrower than 540px.

## Future Acceptance Checks

- Comment history frontend shows the last 10 comments with a link to the originating post and a timestamp.
- Recently viewed shows posts with a read progress bar and the last-viewed date.
- Notifications dropdowns save preferences via a backend endpoint and confirm on save.
- Delete account shows a confirmation modal before calling `DELETE /api/v1/profile`; public comments are anonymised on deletion.
- Profile mutations (`PATCH`, `DELETE`) reject requests where the authenticated user does not own the target record.
