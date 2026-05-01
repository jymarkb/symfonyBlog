---
name: vite-web-setup
description: Use when initializing or extending the Vite frontend in apps/web, especially for SSR or prerendered public routes, dashboard UI, and Supabase-authenticated API access.
---

# Vite Web Setup

## Trigger Conditions

Use this skill when creating or modifying the frontend under `apps/web`.

## Workflow

1. Read `docs/roadmap/03-phase-3-vite-web.md`.
2. Read `docs/product/redesign-brief.md`.
3. Keep public routes SEO-friendly through SSR or prerender.
4. Keep dashboard and auth routes compatible with Supabase session handling.
5. If route or rendering strategy changes, update the roadmap doc first.

## Expected Files To Touch

- `apps/web/src/`
- `apps/web/vite.config.*`
- `apps/web/package.json`
- `docs/roadmap/03-phase-3-vite-web.md`
- `docs/product/redesign-brief.md`

## Acceptance Checks

- Work stays inside `apps/web` unless docs need updates.
- Public routes preserve the SEO-first rendering strategy.
- Frontend auth assumptions remain compatible with the API contract.

