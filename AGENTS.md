# Agent Instructions

This repository is a Laravel + Vike React rebuild.

## Active Targets

- `apps/api` is the Laravel API backend.
- `apps/web` is the Vike + React frontend.
- `docs/` is the source of truth for architecture, roadmap, prompts, and conventions.

## Legacy Warning

- `legacy/symfony-blog` is preserved reference material only.
- Do not inspect or modify `legacy/symfony-blog` unless the user explicitly asks for legacy behavior, migration comparison, or reference lookup.
- Do not use Symfony/Twig patterns as the default implementation direction.

## First Files To Read

For new sessions, read in this order:

1. `README.md`
2. `docs/setup/repository-conventions.md`
3. `docs/setup/context-strategy.md`
4. `docs/setup/agent-workflow.md`
5. `docs/setup/deployment.md`
6. Task-specific files in `apps/api`, `apps/web`, or `docs`

## App Ownership

- `apps/web` owns public pages, auth screens, account pages, profile pages, and admin dashboard UI.
- `apps/api` owns JSON APIs, authentication verification, authorization, policies, database models, and persistence.
- Laravel Blade views are not the target product UI.
