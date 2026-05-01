# Phase 4: Local Docker

## Goal

Provide a first-class local development stack that preserves the familiar container-based workflow while supporting the new split architecture.

## Incremental Rollout

- Start with a Postgres-only compose setup at the repo root
- Add `php` after the Laravel app is initialized
- Add `node` after the frontend SSR stack is initialized
- Add `nginx` last, once both app services can be proxied cleanly

## Target Services

- `nginx`: reverse proxy for local integration
- `php`: `php-fpm` container for Laravel
- `postgres`: local development database
- `node`: Vite dev/SSR service for the frontend

## Topology

- `nginx` routes `/api` to Laravel
- `nginx` routes frontend requests to the Vite app in development
- `postgres` is local-only and separate from Supabase production infrastructure
- Shared network and env configuration live at the repo root

## Container Intent

- `docker/local` holds the new stack files
- `docker/legacy` can preserve or adapt old Symfony docker references when useful
- Local Docker should not depend on the legacy app once `apps/api` and `apps/web` are initialized

## Environment Expectations

- Laravel reads local DB credentials for `postgres`
- Frontend reads local API base URL and Supabase project config
- Nginx uses stable upstream names aligned with compose service names

## Files To Touch In Implementation

- `compose.yaml` or a new root compose file for the rebuild stack
- `docker/local/nginx/`
- `docker/local/phpfpm/`
- `docker/local/node/`
- `apps/api/.env.example`
- `apps/web/.env.example`

## Acceptance Criteria

- The first increment can boot local Postgres independently
- Containers boot the new split stack locally
- Laravel and Vite are reachable through the local proxy
- Local Postgres works independently of production Supabase
- Environment values align with `docs/setup/environment-matrix.md`
