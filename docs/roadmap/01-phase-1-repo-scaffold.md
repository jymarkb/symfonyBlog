# Phase 1: Repo Scaffold

## Goal

Separate the preserved Symfony application from the new rebuild workspace without losing the ability to inspect legacy code in the same git repository.

## Required Layout

```text
legacy/symfony-blog
apps/api
apps/web
packages
docker/local
docker/legacy
docs/roadmap
docs/architecture
docs/setup
docs/migration
docs/product
docs/prompts
docs/templates
codex/skills
```

## Repository Move Rules

- Move the existing Symfony project contents into `legacy/symfony-blog`.
- Leave `.git` at the repository root.
- Do not initialize Laravel or Vite during this phase.
- Keep `apps/api` and `apps/web` empty except for placeholder files.
- Reserve `packages/` for future shared code, contracts, configs, and utilities.
- Preserve the legacy application as a working reference snapshot, not as the active root app.

## Naming Rules

- App directories use short nouns: `api`, `web`.
- Skill directories use lowercase kebab-case.
- Planning docs use a numeric prefix only in `docs/roadmap`.
- Architecture and product docs use plain descriptive names.

## Root-Level Expectations

- Root `README.md` explains the split between legacy and rebuild work.
- Root `.gitignore` covers future generated files in `apps/api` and `apps/web`.
- `docker/local` is reserved for the future Laravel/Vite local stack.
- `docker/legacy` is reserved for copied or adapted legacy docker references if needed later.
- `docs/prompts` stores reusable implementation/review/refactor/bugfix prompt templates.
- `docs/templates` stores handoff, PR, and decision templates for human workflow.
- `packages/` is the only allowed home for cross-app shared code.

## Acceptance Criteria

- `legacy/symfony-blog` contains the prior application files
- `apps/api` and `apps/web` exist and are empty
- `packages/` exists as a reserved shared workspace
- The docs tree exists
- The repo-local skill tree exists
- No new runtime app code has been created outside the preserved legacy app

