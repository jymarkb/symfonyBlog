# Profile Page

## Purpose

This document defines the structure, data flow, and implementation plan for the private user profile page at `/profile`.

- `/profile` is auth-protected and only accessible to signed-in users.
- `/profile/:handle` is the public-facing profile (separate page, not covered here).
- The profile page is the primary surface where users manage their account, password, notification preferences, and view their reading/comment activity.

## Implementation Progress

```text
1. Profile page layout and CSS        done
2. Profile head (avatar, name, handle, member since) done — reads from session
3. Account form (display name, email)  done — wired to PATCH /api/v1/profile
4. Password section                    stub — UI only, not wired
5. Comment history                     stub — no data yet
6. Recently viewed                     stub — no data yet
7. Danger zone (delete account)        stub — UI only, disabled
8. Sidebar (stats, notifications)      stub — reads member-since from session
```

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
├── ProfileHead              — avatar, display name, handle
│
└── .shell.profile-layout    — two-column grid (1fr 300px, collapses at 900px)
    ├── Left column
    │   ├── ProfilePage          — account form (display name, avatar, name fields)
    │   ├── ProfilePasswordSection — change password (stub)
    │   ├── ProfileCommentHistory  — user's past comments (stub)
    │   ├── ProfileRecentlyViewed  — reading history (stub)
    │   └── ProfileDangerZone      — delete account (disabled)
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
- Status: **stub** — UI rendered, inputs disabled.
- Future: Supabase `updateUser({ password })` after verifying current password.
- Password changes do not go through Laravel — Supabase owns credentials.

### ProfileCommentHistory

- Source: `src/features/profile/components/ProfileCommentHistory.tsx`
- Status: **stub** — shows empty state.
- Future: `GET /api/v1/profile/comments` (not yet implemented in backend).

### ProfileRecentlyViewed

- Source: `src/features/profile/components/ProfileRecentlyViewed.tsx`
- Status: **stub** — shows empty state.
- Future: `GET /api/v1/profile/reading-history` or local storage tracking.

### ProfileDangerZone

- Source: `src/features/profile/components/ProfileDangerZone.tsx`
- Status: **stub** — delete button disabled.
- Future: `DELETE /api/v1/profile` with a confirmation modal.

### ProfileSidebar

- Source: `src/features/profile/components/ProfileSidebar.tsx`
- Status: reading stats and notifications are placeholder values.
- Quick links (Browse posts, Contact support) are live.
- Future: stats wired to comment count and reading history API.

## API Touchpoints

```text
Authenticated user (/profile)
├── GET  /api/v1/profile        — load private profile fields
├── PATCH /api/v1/profile       — update display_name, first_name, last_name, avatar_url
└── DELETE /api/v1/profile      — delete account (not yet wired)

Future
├── GET /api/v1/profile/comments         — comment history list
└── GET /api/v1/profile/reading-history  — recently viewed posts
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

All profile page styles live in `src/styles/theme.css` under the `/* ── Profile page ── */` section.

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

## Acceptance Checks

- Signed-out users visiting `/profile` are redirected to `/signin`.
- Signed-in users see their avatar initial (or image if set), display name, handle, and member-since date in the header.
- The account form pre-fills with current profile data from the API.
- Saving the account form updates the API and refreshes the session so the header name updates.
- Password section, comment history, recently viewed, and delete account are visible but clearly marked as coming soon or disabled.
- The layout collapses to a single column on screens narrower than 900px.

## Future Acceptance Checks

- Password change works via Supabase `updateUser` and signs the user out after success.
- Comment history shows the last N comments with links to the originating post.
- Recently viewed shows posts with a reading progress bar.
- Delete account shows a confirmation modal before calling `DELETE /api/v1/profile`.
