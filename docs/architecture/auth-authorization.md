# Frontend Authentication And Authorization

## Purpose

This document defines the target frontend authentication and authorization structure for the Laravel + Vike React rebuild.

- `apps/web` owns signin, signup, password reset, public profile, user account, and admin dashboard screens.
- `apps/api` owns JSON APIs, Supabase token verification, authorization, policies, models, and persistence.
- `legacy/symfony-blog` is reference-only and must not drive the new auth structure.

## Implementation Progress

```text
1. Frontend auth UI foundation     done
2. Backend/Supabase auth setup     done
3. Frontend auth wiring            next
4. Authorization guards/roles      partially started
```

Backend/Supabase setup currently includes the `auth:api` guard, Supabase bearer-token verification through JWKS, local `users.supabase_user_id` mapping, `GET /api/v1/me`, CORS config, JSON `401` behavior for API routes, and the initial admin middleware/role helpers.

## Backend Auth Implementation

Protected API routes use Laravel's built-in `auth` middleware with the custom `api` guard:

```php
Route::middleware('auth:api')->group(function () {
    Route::get('/me', \App\Http\Controllers\Api\V1\CurrentUserController::class);
});
```

The backend request flow is:

```text
GET /api/v1/me
└── auth:api middleware
    └── api guard from apps/api/config/auth.php
        └── supabase driver registered in AppServiceProvider
            └── read Authorization: Bearer <token>
                └── SupabaseTokenVerifier verifies token through JWKS
                    └── claims.sub maps to users.supabase_user_id
                        └── User::firstOrCreate resolves local app user
                            └── CurrentUserController reads $request->user()
```

Authentication outcomes:

```text
No token      -> guard returns null -> 401
Invalid token -> guard returns null -> 401
Valid token   -> guard returns User -> controller runs
```

Supabase Auth remains the identity source. Laravel does not store passwords or implement password login/register for this rebuild. Laravel stores the local app user record, role, profile metadata, and future relationships such as post authorship.

```text
Supabase Auth user id
└── token claims.sub
    └── users.supabase_user_id
        └── local users.id for Laravel relationships
```

## Route Structure

Use one centralized signin and signup experience for every account type.

```text
apps/web
├── Public area
│   ├── /
│   ├── /blog
│   ├── /blog/:slug
│   ├── /profile/:username
│   ├── /signin
│   ├── /signup
│   └── /forgot-password
│
├── User account area
│   ├── /me
│   ├── /me/profile
│   ├── /me/comments
│   └── /me/security
│
└── Admin dashboard
    ├── /dashboard
    ├── /dashboard/posts
    ├── /dashboard/posts/new
    ├── /dashboard/posts/:id/edit
    ├── /dashboard/comments
    ├── /dashboard/categories
    └── /dashboard/profile
```

## Role Behavior

```text
Guest
├── Read blog posts
├── View public profiles
├── View approved comments
└── Redirect to /signin when trying to comment

User
├── Everything Guest can do
├── Add comments
├── Track own comments
├── Manage own profile
└── Cannot access /dashboard

Admin
├── Everything User can do
├── Access /dashboard
├── Create/edit/delete posts
├── Moderate comments
└── Manage categories
```

## Signin Flow

```text
/signin
└── Supabase signin
    └── frontend receives auth session/token
        └── call Laravel: GET /api/v1/me
            ├── role: admin -> redirect /dashboard
            ├── role: user + returnUrl -> redirect back
            └── role: user no returnUrl -> redirect /me
```

## Frontend Folder Structure

Keep route files thin and put behavior in feature folders.

```text
apps/web/src
├── features
│   ├── auth
│   │   ├── components
│   │   ├── hooks
│   │   ├── api
│   │   └── types.ts
│   ├── account
│   ├── admin
│   ├── blog
│   ├── comments
│   └── profile
│
├── layouts
│   ├── AppShell.tsx
│   ├── AuthShell.tsx
│   ├── AccountLayout.tsx
│   └── DashboardShell.tsx
│
├── lib
│   ├── api
│   ├── auth
│   └── env
│
└── components
    ├── ui
    ├── common
    └── layout
```

## API Touchpoints

The frontend should rely on these backend capabilities:

```text
Public
├── GET /api/v1/posts
├── GET /api/v1/posts/{slug}
├── GET /api/v1/posts/{slug}/comments
├── GET /api/v1/profiles/{username}
└── GET /api/v1/categories

Authenticated user
├── GET /api/v1/me
├── PATCH /api/v1/me
├── GET /api/v1/me/comments
├── POST /api/v1/posts/{slug}/comments
├── PATCH /api/v1/comments/{id}
└── DELETE /api/v1/comments/{id}

Admin
├── GET /api/v1/admin/posts
├── POST /api/v1/admin/posts
├── PATCH /api/v1/admin/posts/{id}
├── DELETE /api/v1/admin/posts/{id}
├── GET /api/v1/admin/comments
├── PATCH /api/v1/admin/comments/{id}/moderation
└── CRUD /api/v1/admin/categories
```

## Mermaid Visualization

Paste this into Mermaid Live Editor: https://mermaid.live

```mermaid
flowchart TD
  A["Visitor Opens App"] --> B{"Authenticated?"}

  B -->|No| C["Guest/Public Area"]
  B -->|Yes| D["GET /api/v1/me"]

  D --> E{"User Role"}

  E -->|user| F["User Account Area"]
  E -->|admin| G["Admin Dashboard"]

  C --> C1["Home"]
  C --> C2["Blog List"]
  C --> C3["Blog Detail"]
  C --> C4["Public Profile"]
  C --> C5["Signin / Signup / Forgot Password"]

  C3 --> H{"Wants to Comment?"}
  H -->|Guest| I["Redirect to /signin"]
  H -->|Logged in User| J["Submit Comment"]

  I --> K["Central Signin Form"]
  K --> L["Supabase Auth"]
  L --> D

  F --> F1["/me Overview"]
  F --> F2["/me/profile"]
  F --> F3["/me/comments"]
  F --> F4["/me/security"]

  G --> G1["/dashboard Overview"]
  G --> G2["Manage Posts"]
  G --> G3["Create/Edit Post"]
  G --> G4["Moderate Comments"]
  G --> G5["Manage Categories"]
  G --> G6["Admin Profile"]

  J --> M["Laravel API: Create Comment"]
  G2 --> N["Laravel API: Admin Posts"]
  G4 --> O["Laravel API: Admin Comment Moderation"]
```

## Acceptance Checks

- Guest users can read posts and public profiles.
- Guest users are redirected to `/signin` when trying to comment.
- Normal users can comment and view their own comment history.
- Normal users cannot access `/dashboard`.
- Admin users can access `/dashboard` from the same signin flow.
- Admin-only API calls are rejected unless `GET /api/v1/me` resolves an admin role.
