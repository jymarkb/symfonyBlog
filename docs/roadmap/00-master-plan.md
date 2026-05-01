# Master Plan

## Summary

This repository is being rebuilt as a split platform:

- `apps/api`: Laravel API on Render
- `apps/web`: Vite-based React frontend on Vercel
- `packages/`: reserved shared workspace for cross-app contracts, configs, and utilities
- Supabase for Postgres, Auth, and Storage
- `legacy/symfony-blog`: preserved Symfony reference application

This pass creates only the workspace scaffold, planning docs, and repo-local Codex skills. No Laravel or Vite runtime code is introduced yet.

## Locked Conventions

- Backend app path: `apps/api`
- Frontend app path: `apps/web`
- Shared workspace path: `packages/`
- Legacy reference path: `legacy/symfony-blog`
- API prefix: `/api/v1`
- Frontend rendering: SEO-first SSR/prerender for public pages
- Auth source: Supabase Auth
- Storage source: Supabase Storage
- Production hosting:
  - Laravel on Render
  - Frontend on Vercel
  - Database/Auth/Storage on Supabase

## Phase Order

1. Move the current Symfony application into `legacy/symfony-blog`
2. Add the new top-level `apps/`, `docs/`, and repo-local Codex skills workspace
3. Write architecture and roadmap docs
4. Add focused repo-local skills for future work
5. Initialize Laravel in `apps/api`
6. Initialize the Vite frontend in `apps/web`
7. Build local Docker for the new stack
8. Implement Supabase integration
9. Build API, frontend, and redesign iteratively

## Dependencies

- Phase 5 depends on the phase 2 API contract and domain model docs.
- Phase 6 depends on the frontend architecture and redesign brief.
- Phase 7 depends on the finalized app paths and environment matrix.
- Phase 8 depends on the Laravel auth boundary and frontend session model.
- Public-page redesign depends on the API contract for posts and categories.

## Deliverables For This Pass

- Legacy code preserved under `legacy/symfony-blog`
- Empty targets at `apps/api` and `apps/web`
- Reserved shared workspace at `packages/`
- Decision-complete docs under `docs/`
- Repo-local skill set under `codex/skills`

## Developer System

- Human-readable task templates live in `docs/prompts` and `docs/templates`
- Agent-operational workflows live in `codex/skills`
- Cross-app reuse goes into `packages/`, not directly from one app into another
- Architecture-affecting changes must update the relevant docs in the same task

## Acceptance Criteria

- Root layout clearly separates legacy and rebuild work
- All roadmap, setup, prompt, and architecture docs exist and use the same conventions
- Each repo-local skill contains trigger conditions, workflow, touched files, and acceptance checks
- A future implementation pass can start without re-deciding structure, providers, or path layout

## Environment Note

The intended in-repo skill path is `.codex/skills`. In this workspace, root `.codex` is a read-only placeholder file, so the tracked skill path for this scaffold is `codex/skills`. If that placeholder is removed in a later environment, move `codex/skills` to `.codex/skills` without changing skill contents.
