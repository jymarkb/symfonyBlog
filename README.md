# Rebuild Workspace

This repository now tracks two parallel tracks:

- `legacy/symfony-blog`: the preserved Symfony application
- `apps/api` and `apps/web`: the new Laravel + Vite rebuild targets
- `packages`: the reserved shared workspace for future cross-app contracts, configs, and utilities

Planning, prompts, templates, and architecture live under `docs/`.

Repo-local Codex skills are intended to live under `.codex/skills`, but this environment ships with a read-only root `.codex` placeholder file. For this scaffold pass, the tracked skill files live under `codex/skills` and the docs below treat that as the active repo-local fallback path.

## Working Conventions

- `docs/` is the human-readable source of truth for roadmap, setup, prompts, templates, and conventions.
- `.local/` is personal, gitignored workspace for snapshots, notes, and scratch markdown that should not be shared in the repo.
- `codex/skills` is the agent-operational layer for repeatable development workflows.
- `packages/` is reserved for shared code only. `apps/api` and `apps/web` should not import directly from each other.
- Non-trivial work should start from a prompt or template in `docs/prompts` or `docs/templates`.
- Reviewer-style specialist checks now live in `codex/skills` for frontend, backend, security, and architecture review.
- Context, prompt composition, and resumable handoff workflows are part of the same repo-local skill layer.
- `macky` is the documented compact-snapshot command name for writing current work context into `.local/snapshots/current.md`.
