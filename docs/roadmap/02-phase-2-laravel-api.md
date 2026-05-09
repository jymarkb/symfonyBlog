# Phase 2: Laravel API

## Goal

Initialize `apps/api` as a Laravel application that serves as the system of business logic and API shaping for the rebuild.

## Responsibilities

- Own application domain models and policies
- Expose versioned JSON APIs under `/api/v1`
- Verify Supabase-issued JWTs for authenticated requests
- Persist app-specific user profile and role data
- Manage posts, categories, analytics, and upload metadata
- Coordinate with Supabase Storage for media assets

## Package Direction

- Base framework: current Laravel stable release at implementation time
- API auth verification: Supabase-compatible JWT verification library or Laravel-native JWT validation strategy
- Testing: Pest or PHPUnit, chosen once the app is initialized
- Queue/cache additions only if needed by uploads, analytics, or webhook handling

## App Boundaries

- Laravel does not render the public site HTML
- Laravel does not own end-user password flows when Supabase Auth is active
- Laravel does own admin authorization, content workflows, and API contracts

## Initial API Areas

- `GET /api/v1/posts`
- `GET /api/v1/posts/{slug}`
- `GET /api/v1/tags`
- `GET /api/v1/session`
- `GET /api/v1/profile`
- `PATCH /api/v1/profile`
- `GET /api/v1/profiles/{handle}`
- `GET /api/v1/admin/posts`
- `POST /api/v1/admin/posts`
- `PATCH /api/v1/admin/posts/{id}`
- `DELETE /api/v1/admin/posts/{id}`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{id}`
- `GET /api/v1/admin/comments`
- `PATCH /api/v1/admin/comments/{id}`
- `GET /api/v1/admin/tags`
- `POST /api/v1/admin/tags`
- `PATCH /api/v1/admin/tags/{id}`
- `DELETE /api/v1/admin/tags/{id}`
- `POST /api/v1/admin/uploads`
- `POST /api/v1/posts/{slug}/view`

## Data Ownership

- Supabase Auth is the identity source
- Laravel maintains a local `users` table keyed by Supabase user ID
- Laravel owns content entities and app-specific analytics
- Supabase Storage stores media binaries; Laravel stores references and metadata as needed

## Files To Touch In Implementation

- `apps/api/composer.json`
- `apps/api/routes/`
- `apps/api/app/Models/`
- `apps/api/app/Http/Controllers/`
- `apps/api/database/migrations/`
- `apps/api/config/`

## Acceptance Criteria

- Laravel app initializes in `apps/api`
- Auth boundary with Supabase is explicit
- API namespaces and versioning are consistent with this doc
- Domain model matches `docs/architecture/domain-model.md`
