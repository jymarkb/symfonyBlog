---
name: supabase-integration
description: Use when implementing or adjusting Supabase Postgres, Auth, Storage, JWT verification, or environment setup across the Laravel and Vite apps.
---

# Supabase Integration

## Trigger Conditions

Use this skill when a task touches Supabase configuration, auth flow, storage usage, or DB connectivity.

## Workflow

1. Read `docs/setup/environment-matrix.md`.
2. Check whether the task affects backend-only secrets, frontend public keys, or both.
3. Keep Supabase Auth as the identity source.
4. Keep service role usage backend-only.
5. Update docs whenever env variable names or auth/storage responsibilities change.

## Expected Files To Touch

- `docs/setup/environment-matrix.md`
- `docs/roadmap/02-phase-2-laravel-api.md`
- `docs/roadmap/05-phase-5-deployment.md`
- future files under `apps/api/config/` and `apps/web/src/`

## Acceptance Checks

- Secret ownership is explicit.
- Frontend uses only public Supabase configuration.
- Backend-only operations never require exposing privileged keys to the web app.

