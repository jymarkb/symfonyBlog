---
name: local-docker-workflow
description: Use when building or updating the local Docker workflow for the split Laravel, Vite, nginx, and Postgres development stack.
---

# Local Docker Workflow

## Trigger Conditions

Use this skill when editing compose files, local container images, nginx routing, or service networking for development.

## Workflow

1. Read `docs/roadmap/04-phase-4-local-docker.md`.
2. Keep the local stack limited to `nginx`, `php-fpm`, `postgres`, and `node` unless a new service is justified.
3. Route API and frontend traffic explicitly through nginx where integration matters.
4. Keep local Postgres separate from Supabase production concerns.
5. Update environment documentation if service names or ports change.

## Expected Files To Touch

- root compose files
- `docker/local/`
- `docs/roadmap/04-phase-4-local-docker.md`
- `docs/setup/environment-matrix.md`

## Acceptance Checks

- Service boundaries are clear.
- Local networking matches documented app paths and ports.
- Docker changes do not depend on the legacy Symfony app.

