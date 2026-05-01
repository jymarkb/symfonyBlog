---
name: content-model
description: Use when designing or changing the users, posts, categories, analytics, or media-field structure so the Laravel domain model and API contract remain consistent.
---

# Content Model

## Trigger Conditions

Use this skill when a task changes entity shape, relationships, naming, or content-storage decisions.

## Workflow

1. Read `docs/architecture/domain-model.md`.
2. Check whether the change affects API payloads in `docs/architecture/api-contract.md`.
3. Preserve the current rebuild naming conventions such as `content_html` and `thumbnail_path`.
4. Only introduce new tables when the app needs clear ownership or querying benefits.
5. Update both docs and implementation together when model shape changes.

## Expected Files To Touch

- `docs/architecture/domain-model.md`
- `docs/architecture/api-contract.md`
- future Laravel migrations and models under `apps/api`

## Acceptance Checks

- Relationships remain consistent across docs and code.
- Field names are normalized for the rebuild, not copied blindly from legacy entities.
- API payload expectations stay aligned with the model.

