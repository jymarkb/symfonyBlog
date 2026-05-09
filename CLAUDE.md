# Claude Code Instructions

This repository is a Laravel + Vike React rebuild.

## Read First

Before doing any work, read these files in order:

1. `AGENTS.md` — app ownership, active targets, legacy warning
2. `docs/setup/repository-conventions.md` — naming, structure, and code conventions
3. `docs/setup/context-strategy.md` — how context is managed across sessions
4. `docs/setup/agent-workflow.md` — **command routing**: all `-feature-`, `-plan-`, `-commit`, `-core-php-`, `-core-react-`, `-qa-`, and related sub-agent commands are defined here

## Command Routing

User requests prefixed with `-feature-`, `-commit`, `-plan-`, `-core-react-`, `-core-php-`, `-qa-`, `-ux-`, `-architecture-`, `-tutorial-`, `-review-`, `-implement-`, or `-pr-` are routing commands. Read `docs/setup/agent-workflow.md` to understand how to handle them — each prefix maps to a specific sub-agent type, model tier, and output contract.

All sub-agents run in the background (`run_in_background: true`). After completion, post the result to the main chat and close the agent.

## Scope

- `apps/api` — Laravel API backend
- `apps/web` — Vike + React frontend
- `docs/` — architecture, roadmap, prompts, and conventions
- `legacy/symfony-blog` — read-only reference; do not modify
