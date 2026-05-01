---
name: rebuild-orchestrator
description: Use when planning or implementing cross-phase rebuild work so docs, sequencing, and path conventions stay aligned across Laravel, Vite, Docker, and Supabase tasks.
---

# Rebuild Orchestrator

## Trigger Conditions

Use this skill when a task spans multiple rebuild phases or when a change in one subsystem affects docs, sequencing, or another app.

## Workflow

1. Identify the current phase using `docs/roadmap/00-master-plan.md`.
2. Check upstream dependencies in the roadmap docs before editing code.
3. Update docs first when the change alters architecture or sequencing.
4. Keep Laravel, frontend, Docker, and Supabase work scoped to their own directories.
5. After changes, verify the master plan still matches the detailed phase docs.

## Expected Files To Touch

- `docs/roadmap/00-master-plan.md`
- `docs/roadmap/02-phase-2-laravel-api.md`
- `docs/roadmap/03-phase-3-vite-web.md`
- `docs/roadmap/04-phase-4-local-docker.md`
- `docs/roadmap/05-phase-5-deployment.md`

## Acceptance Checks

- Phase order remains explicit.
- Cross-system assumptions are written down once and reused.
- No subsystem introduces conflicting conventions.

