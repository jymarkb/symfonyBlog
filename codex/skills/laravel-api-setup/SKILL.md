---
name: laravel-api-setup
description: Use when initializing or extending the Laravel backend in apps/api, including routes, models, migrations, policies, and API-first application structure.
---

# Laravel API Setup

## Trigger Conditions

Use this skill when creating or modifying the Laravel backend under `apps/api`.

## Workflow

1. Read `docs/roadmap/02-phase-2-laravel-api.md`.
2. Read `docs/architecture/domain-model.md` and `docs/architecture/api-contract.md`.
3. Implement API-first Laravel structure with `/api/v1` boundaries.
4. Keep Supabase as the identity source and Laravel as the business-logic layer.
5. If implementation changes the contract, update the docs in the same task.

## Expected Files To Touch

- `apps/api/routes/`
- `apps/api/app/Models/`
- `apps/api/app/Http/Controllers/`
- `apps/api/database/migrations/`
- `docs/architecture/domain-model.md`
- `docs/architecture/api-contract.md`

## Acceptance Checks

- Code stays inside `apps/api`.
- Endpoints match the documented API prefix and resource names.
- Data model changes remain consistent with the domain-model doc.

