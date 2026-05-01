---
name: render-vercel-deploy
description: Use when setting up or revising deployment for the Laravel API on Render, the Vite frontend on Vercel, or the integration between those hosts and Supabase.
---

# Render Vercel Deploy

## Trigger Conditions

Use this skill when the task involves deployment setup, preview/production URLs, CORS, or environment wiring between platforms.

## Workflow

1. Read `docs/roadmap/05-phase-5-deployment.md`.
2. Separate backend, frontend, and Supabase responsibilities before editing configs.
3. Keep public URLs and secret env vars owned by the correct platform.
4. Verify any host-level change against the environment matrix.
5. Update docs with the new deployment assumptions in the same task.

## Expected Files To Touch

- `docs/roadmap/05-phase-5-deployment.md`
- `docs/setup/environment-matrix.md`
- future deployment config under `apps/api` and `apps/web`

## Acceptance Checks

- Render, Vercel, and Supabase ownership stays clear.
- URL and CORS assumptions are documented.
- Preview and production concerns are not mixed together.

