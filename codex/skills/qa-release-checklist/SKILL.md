---
name: qa-release-checklist
description: Use when validating milestones, preparing a release, or checking that the split stack works end to end across API, frontend, auth, storage, and deployment assumptions.
---

# QA Release Checklist

## Trigger Conditions

Use this skill when verifying milestones, checking acceptance criteria, or preparing local or hosted releases.

## Workflow

1. Read the relevant phase doc and `docs/roadmap/00-master-plan.md`.
2. Identify which user flows should work for the current milestone.
3. Verify public pages, auth, dashboard, uploads, and API behavior as applicable.
4. Record gaps as concrete failures, not vague concerns.
5. Update docs if the acceptance criteria changed during implementation.

## Expected Files To Touch

- `docs/roadmap/00-master-plan.md`
- phase-specific roadmap docs
- future test files under `apps/api` and `apps/web`

## Acceptance Checks

- Validation is tied to documented acceptance criteria.
- Gaps are reported by route, flow, or subsystem.
- Testing scope matches the current implementation phase.

