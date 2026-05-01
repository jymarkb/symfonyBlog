---
name: project-architecture
description: Use when working on repository structure, deciding where files belong, or preserving the boundary between the legacy Symfony app and the new Laravel/Vite rebuild workspace.
---

# Project Architecture

## Trigger Conditions

Use this skill when the task involves repo layout, file placement, path conventions, or deciding whether a change belongs in `legacy/symfony-blog`, `apps/api`, `apps/web`, `docs/`, or `codex/skills`.

## Workflow

1. Confirm whether the task targets the preserved legacy app or the rebuild workspace.
2. Preserve `legacy/symfony-blog` as reference-only unless the task explicitly says to change legacy code.
3. Keep new backend work in `apps/api` and new frontend work in `apps/web`.
4. Put architecture, setup, migration, and redesign decisions in `docs/`.
5. If the task changes repo conventions, update `docs/roadmap/00-master-plan.md` and any affected doc.

## Expected Files To Touch

- `README.md`
- `docs/roadmap/00-master-plan.md`
- `docs/roadmap/01-phase-1-repo-scaffold.md`
- paths under `apps/`, `legacy/`, `docs/`, and `codex/skills`

## Acceptance Checks

- The change respects the split between legacy and rebuild work.
- Paths match the locked conventions in the master plan.
- Any structural change is reflected in the docs.

