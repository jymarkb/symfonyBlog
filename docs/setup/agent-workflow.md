# Agent Workflow

## Purpose

This document records how the main agent session (Claude or Codex) should route repeatable multi-step work when the user asks for planning, committing, reviewing, or implementation through short command-style prefixes.

The main session stays responsible for coordination and user communication. Specialized sub-agents should do bounded work only when their task is explicit.

## Claude Model Tiers

When running under Claude, use these model tiers per agent type:

```text
-feature-            -> sonnet  (feature orchestration, use Plan subagent type)
-feature-auto-       -> main session workflow (full automated section close-out — plan + implement + verify + commit)
-commit              -> haiku   (diff inspection, staging, commit hygiene, use general-purpose subagent type)
-plan-               -> sonnet  (subtask decomposition for feature agent delegation, use Plan subagent type)
-tutorial-           -> sonnet  (manual coding tutorial for a specific task, use Plan subagent type)
-architecture-       -> sonnet  (boundary analysis, use Plan subagent type)
-ux-                 -> sonnet  (screen state and copy design, use general-purpose subagent type)
-core-react-         -> sonnet  (frontend implementation, use general-purpose subagent type)
-core-php-           -> sonnet  (backend implementation, use general-purpose subagent type)
-qa-frontend-        -> sonnet  (read-only review, use Explore subagent type)
-qa-backend-         -> sonnet  (read-only review, use Explore subagent type)
-qa-                 -> main session workflow (parallel frontend + backend QA, synthesized report)
-review-             -> sonnet  (general review, use general-purpose subagent type)
-implement-          -> sonnet  (scoped implementation, use general-purpose subagent type)
-pr-                 -> haiku   (GitHub PR description, plain text ready to paste, use general-purpose subagent type)
-deploy-             -> sonnet  (deployment checklist and verification, use general-purpose subagent type)
```

Use `haiku` only for commit and PR work. Use `sonnet` for everything else unless the task requires deep multi-file reasoning, in which case `opus` is acceptable.

## Codex Model And Reasoning Tiers

When running under Codex, sub-agents inherit the main session model by default. Use reasoning effort to split cost first, and override the model only when the user explicitly asks or the task has a clear need for a different available GPT model.

```text
-feature-            -> inherited model, medium reasoning  (feature orchestration/status, explorer/default sub-agent when explicitly delegated)
-feature-auto-       -> main session workflow              (plan + implement + verify + docs; do not auto-commit)
-commit              -> inherited model, low reasoning     (diff inspection, explicit staging, commit hygiene)
-plan-               -> inherited model, medium reasoning  (subtask decomposition and dependency order)
-tutorial-           -> inherited model, medium reasoning  (manual coding tutorial for a specific task)
-architecture-       -> inherited model, high reasoning    (boundary analysis and cross-app design decisions)
-ux-                 -> inherited model, medium reasoning  (screen state, interaction, and copy design)
-core-react-         -> inherited model, medium reasoning  (frontend implementation)
-core-php-           -> inherited model, medium reasoning  (backend implementation)
-qa-frontend-        -> inherited model, low/medium reasoning (read-only frontend review; use medium for broad UI risk)
-qa-backend-         -> inherited model, low/medium reasoning (read-only backend review; use medium for auth/data risk)
-qa-                 -> main session workflow              (parallel frontend + backend QA, synthesized report)
-review-             -> inherited model, medium reasoning  (general review; raise to high for complex behavioral risk)
-implement-          -> inherited model, medium reasoning  (scoped implementation)
-pr-                 -> inherited model, low reasoning     (PR description, plain text ready to paste)
-deploy-             -> inherited model, medium reasoning  (deployment checklist and verification)
```

Codex cost rule: prefer lowering reasoning effort for narrow, mechanical tasks (`-commit`, `-pr-`, small QA checks) before changing models. Use high reasoning for architecture, security-sensitive changes, complex migrations, or multi-system behavior. If the current Codex toolset does not support a documented sub-agent behavior from this file, the main session should state the limitation briefly and continue with the closest safe workflow.

## Background Execution Rules

**All sub-agents run in the background.** This applies to every spawned agent without exception.

Rules:
- Always spawn with `run_in_background: true`.
- The main session stays free for user interaction while agents run.
- When an agent completes, the main session receives a notification automatically.
- After integrating the result, the main session posts the full agent output into the main chat.
- After posting, close the agent to free the concurrent agent slot.
- Do not silently absorb an agent result — always surface it to the user in the main chat after it arrives.
- If multiple independent agents are spawned at once, send them all in a single message so they run in parallel.

## Routing Syntax

Use these prefixes in user requests:

```text
-feature- <feature-name>
-feature-auto- <feature-name> <section>
-commit
-plan- <task>
-tutorial- <task>
-architecture- <task>
-ux- <task>
-core-react- <task>
-core-php- <task>
-qa- <task>
-qa-frontend- <task>
-qa-backend- <task>
-review- <task>
-implement- <task>
-pr-
-deploy-
```

Multiple prefixes in one request should run in parallel when the tasks are independent.

Example:

```text
-commit
-plan- do the planning for forgot password
```

Expected routing:

```text
Commit agent   -> review diff, group files, stage, commit, report hashes
Planning agent -> inspect relevant files and return the tutorial/implementation plan
Main session   -> coordinate, answer the user, integrate results
```

## Main Session Responsibilities

- Interpret the routing prefix.
- Spawn the designated agent with `run_in_background: true`.
- Continue useful coordination work while agents run — the main session is never blocked by a background agent.
- Wait for the completion notification, then integrate the result.
- Post the full agent result into the main chat after integrating it.
- Close the completed agent after posting its result.
- Do not silently convert a requested agent task into main-thread work unless spawning is blocked and the user is informed.

## Commit Agent

Use a commit agent for `-commit`.

Use the cheapest narrow agent that is sufficient for commit work. Commit work is mostly diff inspection, staging, and commit hygiene, so prefer low reasoning effort unless the diff is unusually complex. Under Claude, use `haiku` model with `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the commit hashes and tree status to chat, then closes the agent.

Responsibilities:

1. Run `git status --short`.
2. Review the relevant diff by file.
3. Propose commit grouping by concern.
4. Stage files explicitly by path.
5. Commit the intended files itself.
6. Use the user's commit author:

   ```text
   arcobaleno <jymark.borja@gmail.com>
   ```

7. Use the user's commit message style:

   ```text
   add - ...
   wire - ...
   fix - ...
   docs - ...
   ```

8. Run final `git status --short`.
9. Report commit hashes and whether the tree is clean.

Rules:

- Split commits by concern unless the user explicitly asks for one commit.
- Do not include unrelated files.
- Do not use bulk staging commands such as `git add .`, `git add -A`, broad app folders, or broad docs folders.
- Stage each file explicitly, or stage a small tightly related file group with every path named.
- Do not commit ignored environment files or secrets.
- Do not add `Co-Authored-By` trailer lines — use only the user's git account as configured.
- If the grouping is ambiguous, report the ambiguity before committing.
- If a prior plan already defined commit groups, follow that split unless the diff proves it is unsafe.

## Feature Agent

Use a feature agent for `-feature- <feature-name>`. Under Claude, use `Plan` subagent type, `run_in_background: true`. When done, main session posts the full status table and next-step recommendation to chat, then closes the agent.

The feature agent is the top-level orchestrator for large features that span multiple sections (e.g. profile page, auth, admin dashboard). It owns the full picture — what sections exist, what phase each section is in, and what the next concrete step is. It delegates down to `-plan-`, `-core-php-`, `-core-react-`, `-qa-backend-`, `-qa-frontend-`, and `-commit` for actual work.

### Where feature docs live

Feature docs live in `docs/architecture/`. Each major feature has one file:

```text
docs/architecture/profile-page.md
docs/architecture/auth-authorization.md
```

The feature agent always reads the feature doc first before reporting status or planning next steps.

### Section phase structure

Every section within a feature follows this phase order:

```text
1. Design     — UI ported from design file, all placeholders and stubs
2. Backend    — model, migration, controller, resource, service, route
3. Wiring     — frontend connected to real API endpoint
4. Tests      — route coverage + behavior tests (guest, auth, admin as applicable)
```

A section is not complete until all four phases are done. Do not mix phases — finish one phase for a section before moving to the next.

### Responsibilities

- Read `docs/setup/techstack.md` first — stack, patterns, and conventions.
- Read the feature doc (`docs/architecture/<feature>.md`) to get the current section list and phase status.
- Read `docs/setup/agent-workflow.md` to understand routing and agent rules.
- Report a status table: every section × every phase (✅ done / ⚠️ partial / ⏳ pending).
- Identify the current active section and phase.
- Recommend the next concrete step and which sub-agent should handle it.
- Update the feature doc's Implementation Progress block after each phase completes.
- Do not implement. Do not edit code files. Only read, report, and delegate.

### Rules

- Always read the feature doc before reporting — never rely on conversation memory alone.
- Respect the phase order: design → backend → wiring → tests. Do not skip or reorder.
- One section at a time. Do not plan the next section until the current one is fully done.
- When a section spans both `apps/api` and `apps/web`, split backend and frontend steps explicitly.
- Flag any section where the design phase is not done before backend work starts.
- Works across AI models — all context comes from files in the repo, not from model memory.

### Output format

```text
## Feature: <name>

| Section          | Design | Backend | Wiring | Tests |
|------------------|--------|---------|--------|-------|
| Account          | ✅     | ✅      | ✅     | ⏳    |
| Comment history  | ✅     | ⚠️     | ⚠️    | ⏳    |
| Recently viewed  | ✅     | ⏳      | ⏳     | ⏳    |
| ...              |        |         |        |       |

**Active section:** Comment history
**Active phase:** Backend (fix `body` field in ProfileCommentResource)

**Next step:** [concrete action + which sub-agent]
```

## Feature Auto Agent

Use `-feature-auto- <feature-name> <section>` to fully close a feature section without manual approval between steps.

**Important:** Sub-agents cannot spawn other sub-agents. `-feature-auto-` is a **main session workflow** — the main session drives every step itself, not a single spawned agent.

### How the main session executes it

1. **Plan** — Spawn a Plan sub-agent in **background** (`run_in_background: true`). Wait for the notification, then integrate the result: a complete structured subtask list with dependency order, owner per subtask, and verification checklist. Close the plan agent after integrating.

2. **Backend** — Spawn `-core-php-` agents in **background** (`run_in_background: true`) so the main session stays free for user interaction. Where subtasks are independent, spawn them in parallel. Where one depends on another, wait for the notification before spawning the next. Close each agent after integrating its result.

3. **Verify backend** — Run `php artisan test` in foreground (fast, must gate the next phase). If any new test fails, spawn a `-core-php-` fix agent in background before continuing. Do not proceed to frontend wiring if tests are red.

4. **Frontend** — Spawn `-core-react-` agents in **background** for types, API function, and component in dependency order. Close each agent after integrating its result.

5. **Typecheck** — Run `npx tsc --noEmit` from `apps/web` to verify the frontend compiles clean.

6. **Update feature doc** — Edit `docs/architecture/<feature>.md` to mark the section's phases as done.

7. **Report** — Only after all phases complete, post one consolidated summary: what was implemented, test results, and suggested commit grouping. The user runs `-commit` manually.

### Rules

- Always verify actual file state before planning — never trust the doc alone.
- Respect the phase order: Backend → Tests → Wiring. Do not wire the frontend before backend tests pass.
- If a step fails (test red, type error, missing dependency), stop the loop, fix the blocker, then continue — do not skip ahead.
- **Silent mode** — do not post intermediate progress updates ("Batch 1 done", "tests green", etc.) to the main chat. Run all phases silently and post only the final consolidated summary when everything is complete.
- Do not silently absorb failures — surface them immediately when they occur (failures are the exception to silent mode).
- Do NOT auto-commit. After all phases close, report the suggested commit grouping and wait for the user to run `-commit`.
- Multiple `-feature-auto-` tasks with different sections can run in parallel — each drives its own independent backend + frontend loop. The main session coordinates completion notifications and posts each summary as sections finish.

### Parallel execution

Multiple `-feature-auto-` calls in a single message run as independent parallel workflows:

```text
User: -feature-auto- profile page security review
      -feature-auto- profile page cleanup

Main session:
  → Spawns Plan agents for both sections in parallel (background, sent in one message)
  → Spawns backend agents for both in background (parallel)
  → Waits for both backend notifications
  → Runs tests once (covers both)
  → Spawns frontend agents for both in background (parallel)
  → Posts one consolidated summary covering both sections when all complete
```

### Example

```
User: -feature-auto- profile page recently viewed

Main session:
  1. Spawn Plan agent → get subtask list with 14 subtasks
  2. Spawn -core-php- → migration + model + factory (parallel where possible)
  3. Spawn -core-php- → service + resource + controller
  4. Spawn -core-php- → route + coverage test entry
  5. Run php artisan test → verify green
  6. Spawn -core-php- → behavior test file
  7. Run php artisan test → verify green
  8. Spawn -core-react- → types + API function
  9. Spawn -core-react- → rewrite component
  10. Update profile-page.md
  11. Spawn -feature- → confirm section is ✅ across all phases
  12. Report suggested commit grouping → user runs -commit manually
```

## Planning Agent

Use a planning agent for `-plan- <task>`. Under Claude, use `Plan` subagent type, `run_in_background: true`. When done, main session posts the full subtask list and commit grouping to chat, then closes the agent.

The planning agent is the task decomposition layer between the feature agent and the implementation sub-agents. It reads the feature context and breaks a section/phase down into discrete, delegatable subtasks — one per sub-agent call. Its output is structured so the feature agent (or main session) can read it and spawn the right sub-agents in order.

Responsibilities:

- Always read `docs/setup/techstack.md` first — it defines the stack, patterns, and conventions for both apps.
- Always read `docs/setup/security.md` — include security subtasks (auth gating, throttle, validation, resource field whitelist, route guard) in every plan using the per-feature checklist.
- Read the relevant feature doc (`docs/architecture/<feature>.md`) to understand section and phase context.
- Inspect the task-specific files to understand current state.
- Do not edit files.
- Return a structured subtask list: each subtask has a name, the sub-agent that owns it (`-core-php-`, `-core-react-`, `-qa-backend-`, etc.), the exact files it touches, and a one-line description of what it must do.
- Include a suggested execution order and flag which subtasks can run in parallel.
- End with a verification checklist and suggested commit grouping.

Rules:

- Prefer repository context over generic advice.
- Use the exact stack from `techstack.md` — do not suggest patterns that contradict it.
- Mention backend/frontend ownership explicitly when a flow crosses apps.
- Keep external service setup (Supabase dashboard, SMTP) in the plan when it affects implementation.
- The main session must post the planning result back into the chat after the planning agent finishes.

## Tutorial Agent

Use a tutorial agent for `-tutorial- <task>`. Under Claude, use `Plan` subagent type, `run_in_background: true`. When done, main session posts the full tutorial to chat, then closes the agent.

The tutorial agent is for manual coding guidance. Use it when you want a step-by-step walkthrough to implement something yourself rather than delegating to a sub-agent.

Responsibilities:

- Always read `docs/setup/techstack.md` first.
- Inspect the task-specific files and closest docs.
- Do not edit files.
- Act like an experienced developer pairing with a less experienced one.
- Return a beginner-friendly but technically accurate tutorial.
- Include: product goal, user flow, current state, target state, exact files to touch, step-by-step implementation with code snippets, edge cases to watch for, verification checklist, and commit grouping suggestions.

Rules:

- Prefer repository context over generic advice.
- Use the exact stack from `techstack.md` — do not suggest patterns that contradict it (e.g. do not add custom action methods to controllers, do not put passwords through Laravel).
- Mention backend/frontend ownership explicitly when a flow crosses apps.
- Keep external service setup in the tutorial when it affects implementation.
- The main session must post the tutorial back into the chat after the agent finishes.

## Architecture Agent

Use an architecture agent for `-architecture- <task>`. Under Claude, use `Plan` subagent type, `run_in_background: true`. When done, main session posts the boundary analysis and recommendations to chat, then closes the agent.

Responsibilities:

- Inspect app boundaries, docs, and relevant contracts.
- Check whether the proposed work belongs in `apps/web`, `apps/api`, or shared packages.
- Identify data model, API contract, route, auth, and security implications.
- Recommend documentation updates when architecture changes.
- Do not edit files unless explicitly assigned implementation.

## UX/UI Design Agent

Use a UX/UI design agent for `-ux- <task>`. Under Claude, use `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the screen states, copy, and component recommendations to chat, then closes the agent.

Responsibilities:

- Define screen states, copy, empty/loading/error states, and success states.
- Check consistency with existing auth/dashboard/public UI patterns.
- Identify accessibility, responsive layout, and interaction risks.
- Recommend component structure only when it affects UX quality.
- Do not edit files unless explicitly assigned implementation.

## Core React/TypeScript Developer Agent

Use a React/TypeScript implementation agent for `-core-react- <task>`. Under Claude, use `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the changed files and verification results to chat, then closes the agent.

Responsibilities:

- Implement scoped frontend work in `apps/web`.
- Own clearly listed files or feature areas.
- Add or update TypeScript types, validation, and frontend tests when appropriate.
- Run relevant frontend verification such as typecheck or targeted tests when feasible.
- Report changed files and verification results.

Rules:

- Do not edit Laravel/PHP files.
- Do not broaden scope into unrelated UI refactors.
- Follow existing Vike React and feature-folder patterns.
- Follow `docs/setup/security.md` frontend conventions: route guards, token handling, client-side validation, user-friendly error messages.

## Core PHP/Laravel Developer Agent

Use a PHP/Laravel implementation agent for `-core-php- <task>`. Under Claude, use `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the changed files and test results to chat, then closes the agent.

Responsibilities:

- Implement scoped backend work in `apps/api`.
- Own clearly listed files or backend feature areas.
- Add or update migrations, models, middleware, policies, API routes, and tests when appropriate.
- Run relevant PHP verification such as syntax checks or targeted tests when feasible.
- Report changed files and verification results.

Rules:

- Do not edit React/frontend files.
- Do not add password ownership to Laravel when Supabase owns the auth flow.
- Follow existing Laravel guard, middleware, and API response patterns.
- Follow `docs/setup/security.md` backend conventions: auth gating, `$fillable` discipline, `$hidden`, input validation rules, throttle on mutations, Resource field whitelist.
- Controllers must only contain the five RESTful methods: `index`, `show`, `store`, `update`, `destroy`. Do not add custom action methods (e.g. `comments()`, `history()`). If a resource needs its own endpoint, create a separate dedicated controller for it.
- Controllers must not contain business logic. Validate input via FormRequest, call a service method, return a resource. That is all.
- Models must not contain business logic. Models own columns (`$fillable`, `$hidden`, `casts()`), relationships, and nothing else.
- Any logic that decides what to do with data belongs in a service under `app/Services/<Domain>/`. Create the service if it does not exist.
- When adding, removing, or changing `/api/v1` routes, update Pest route coverage in `apps/api/tests/Feature/Routes/ApiRouteCoverageTest.php`.
- Add or update behavior tests beside the owned endpoint area, for example `tests/Feature/Auth`, `tests/Feature/Profile`, `tests/Feature/Public`, or `tests/Feature/Admin`.
- Run the relevant Pest suite before reporting done, using `php artisan test` or a targeted test command from `apps/api`.
- If an endpoint is still a placeholder, test the placeholder status/body explicitly so future implementation changes are intentional.
- `php artisan make:model` generates a minimal stub — always replace the full file content. The stub will be missing `HasFactory`, relationships, casts, and may use wrong fillable field names. Never assume the generated content is correct.
- When factories write a column name (e.g. `body`), the migration and model fillable must use the exact same name. Mismatches cause silent insert failures.
- `DatabaseSeeder` must use a find-or-create pattern (`Model::where(...)->first() ?? Model::factory()->create(...)`) so re-running `db:seed` does not throw a unique constraint violation.
- **Never modify an existing migration file.** Migrations are immutable once committed or run. If a schema change is needed, always create a new migration (`php artisan make:migration alter_<table>_<description>`). The only exception is a migration that has never been committed and never run on any environment.
- When migration columns change on a freshly created table, run `php artisan migrate:rollback --step=N && php artisan migrate` before seeding — do not just re-seed.

## Frontend QA Agent

Use a frontend QA agent for `-qa-frontend- <task>`. Under Claude, use `Explore` subagent type (read-only, does not write files), `run_in_background: true`. When done, main session posts the full QA report to chat, then closes the agent.

### Read first

Before reviewing, always read:
1. `docs/setup/qa-checklist.md` — full frontend checklist organized by area
2. `docs/setup/security.md` — frontend security conventions for this project

### Responsibilities

Apply every relevant section of the QA checklist. At minimum cover:

- **Route guards** — correct layout guard (`RequireAuth`/`RequireGuest`) per route group; no duplicate check inside the page; admin-gated UI does not treat client-side `isAdmin` as the sole gate
- **Auth flow edge cases** — OAuth error messages generic (no raw provider strings); `pendingAuthProvider` cleared on failure not just success; token fragments stripped from URL before redirect; password reset does not conflict with `RequireGuest`
- **Form validation and UX** — client-side validation fires before any API call; double-submit prevented; all four async states handled (loading, error, empty, data); dead UI identified (unchecked checkboxes, disabled buttons with no enable path)
- **Error message hygiene** — no raw API error strings, Supabase messages, or stack traces in the UI; generic messages throughout
- **Token handling** — `getSession()` called immediately before each API call, not cached in state; no token in URL params or `console.log`
- **Security** — no `dangerouslySetInnerHTML` without sanitization; no open redirect via URL params; no sensitive data in `localStorage` beyond library requirements
- **TypeScript** — `tsc --noEmit` would pass; no unchecked `!` assertions on nullable API fields; no `any` on API response types
- **React correctness** — no duplicate API calls on mount; `useEffect` dependency arrays complete; error boundaries present at page/feature level
- **Accessibility** — icon-only buttons have `aria-label`; form inputs have `<label>`; `aria-live` regions for async state changes; keyboard navigability
- **Dead and inconsistent UI** — feature parity between similar pages; no unbound checkboxes or links
- **Duplicate and extractable code** — identify JSX blocks, fetch lifecycle patterns, error/success display patterns, or utility logic that appears in two or more components and could be moved to a shared component or utility; report file paths and the common pattern so it can be extracted in a follow-up

### Output format

```text
## [Task]: Frontend QA

### 🔴 Bugs
[file:line] — description and why it matters

### 🟡 Gaps
[file:line] — description and risk level

### 🟢 Confirmed Working
- concise list of checks that passed

### 📋 Manual QA Checklist
- [ ] specific step to test in the browser

### 🔁 Refactor Candidates
[file:line] — duplicate pattern and suggested extraction target
```

Do not edit files unless separately assigned implementation.

---

## Backend QA Agent

Use a backend QA agent for `-qa-backend- <task>`. Under Claude, use `Explore` subagent type (read-only, does not write files), `run_in_background: true`. When done, main session posts the full QA report to chat, then closes the agent.

### Read first

Before reviewing, always read:
1. `docs/setup/qa-checklist.md` — full backend checklist organized by area
2. `docs/setup/security.md` — backend security conventions for this project

### Responsibilities

Apply every relevant section of the QA checklist. At minimum cover:

- **Auth and authorization** — every private route behind `auth:api`; admin routes behind `admin`; BOLA check (user A cannot access user B's data); BFLA check (regular user cannot call admin endpoints); JWT `exp`, issuer, and audience all validated; JWT `alg` hardcoded server-side (not read from token header)
- **Mass assignment** — `$fillable` audit; `role`, `email`, `supabase_user_id`, `handle` absent; no `fill()` with raw request data for privileged fields; `$hidden` includes sensitive fields
- **Resource field exposure** — every Resource exposes only what the client needs; `role` and `supabase_user_id` absent from all non-session Resources; `assertJsonMissingPath` tests present for every field that must not be exposed
- **Input validation** — all inputs have type, presence, length, and format rules; URL fields use `url:https`; enum fields use `in:`; no raw query fragments built from user input
- **Rate limiting** — every mutation (POST, PATCH, DELETE) has `throttle:` middleware; GET endpoints that trigger expensive operations are also limited; 429 tests use correct `md5($limiterName . $limitKey)` cache key format
- **Response consistency** — consistent error shape across all endpoints; correct HTTP status codes; pagination on list endpoints
- **Test coverage** — every `/api/v1` route in `ApiRouteCoverageTest.php`; guest/auth/admin behavior tests; isolation tests; rate limit tests; `assertJsonMissingPath` assertions
- **Query hygiene** — no N+1 queries on collection endpoints; frequently filtered columns have DB indexes
- **Race conditions** — unique-constraint operations use `firstOrCreate` or a transaction; unbounded loops have an iteration cap

### Output format

```text
## [Task]: Backend QA

### 🔴 Bugs
[file:line] — description and why it matters

### 🟡 Gaps
[file:line] — description and risk level

### 🟢 Confirmed Working
- concise list of checks that passed

### 🔒 Security Scorecard
| Check | Result |
|---|---|
| ... | PASS / FAIL |
```

Do not edit files unless separately assigned implementation.

---

## Master QA Agent

Use a master QA agent for `-qa- <task>`. This is a **main session workflow** — the main session runs it directly, it does not spawn a single agent.

Use this when you want both frontend and backend QA run together and synthesized into one report. Use `-qa-frontend-` and `-qa-backend-` individually when you only need one side.

### How the main session executes it

1. Spawn `-qa-frontend-` and `-qa-backend-` as `Explore` subagents **in parallel** (`run_in_background: true` for both, sent in a single message).
2. Wait for both task notifications to arrive.
3. Read both result summaries.
4. Synthesize into one unified report:
   - Deduplicate findings that appear in both (e.g., a backend field leaking that the frontend reads for auth decisions is one combined issue)
   - Cross-reference: if a backend Resource exposes a field and the frontend relies on it for authorization, flag it as higher severity
   - Sort all findings by priority: 🔴 bugs first, 🟡 gaps second
5. Post the unified report in chat. No auto-commit. No implementation.

### Output format

```text
## QA: [task]

### 🔴 Bugs — fix before merge
#### Frontend
[file:line] — description
#### Backend
[file:line] — description

### 🟡 Gaps — address before launch
#### Frontend
...
#### Backend
...

### 🟢 Confirmed Working
- frontend: concise list
- backend: concise list

### 📋 Manual QA Checklist
Combined list of in-browser steps to verify

### 🔁 Refactor Candidates
Combined list of duplicate patterns across frontend that could be extracted

### Suggested fix grouping (for -commit after fixes)
- Commit 1: ...
- Commit 2: ...
```

### Rules

- Both subagents must read `docs/setup/qa-checklist.md` before reviewing — brief them explicitly to do this.
- Main session posts ONE combined report — not two separate reports pasted together.
- Do not implement fixes. Do not commit. Surface findings only.
- If one subagent fails to complete, post that side's partial result with a note, then complete the other side.

## Backend API Test Coverage

Use this structure when agents create or update backend endpoint tests:

- `apps/api/tests/Feature/Routes/ApiRouteCoverageTest.php` is the route inventory guard. It should list every intentional `/api/v1` route once by method and URI.
- `apps/api/tests/Feature/Public/*` covers public endpoints that do not require login.
- `apps/api/tests/Feature/Auth/*` covers signed-in session/auth endpoints.
- `apps/api/tests/Feature/Profile/*` covers private profile and public profile behavior.
- `apps/api/tests/Feature/Admin/*` covers admin-only endpoints and role boundaries.

Minimum rule:

- Every `/api/v1` route must have one route inventory assertion and at least one behavior test.
- Admin routes should test guest `401`, normal user `403`, and admin success or placeholder response.
- Private user routes should test guest `401` and signed-in success or intentional placeholder response.
- Public routes should test public access and the expected response contract.

## PR Description Agent

Use a PR description agent for `-pr-`. Under Claude, use `haiku` model with `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the PR description (inside a fenced code block) to chat, then closes the agent.

Responsibilities:

1. Run `git log main..HEAD --oneline` to get all commits on the branch.
2. Run `git diff main..HEAD --stat` to get a sense of scope.
3. Group commits into meaningful sections (features, fixes, docs, infra).
4. Write a GitHub-ready PR description in **plain text inside a code block** so the user can copy it directly into the GitHub PR description field.

Output format (always inside a single fenced code block):

```
## Summary

- **Section name** — what was built, key files and endpoints

## Test plan

- [ ] specific thing to verify
- [ ] specific thing to verify
```

Rules:

- Output must be inside a single fenced code block — no prose outside it.
- Use plain markdown that renders correctly on GitHub (no shell-specific escaping).
- Keep bullet points concise — one line per item.
- Do not include commit hashes or raw git log output.
- Do not add a PR title line inside the body — GitHub has a separate title field.
- Test plan items must be specific and manually verifiable, not generic ("tests pass").

## Review Agent

Use a review agent for `-review- <task>`. Under Claude, use `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the full review findings to chat, then closes the agent.

Responsibilities:

- Read the relevant brief template from `docs/prompts/review-brief.md`.
- Read task-specific files listed in the brief.
- Report bugs, regressions, security concerns, and missing tests using the brief's priority order.
- Do not edit files.

## Implementation Agent

Use an implementation agent for `-implement- <task>`. Under Claude, use `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the changed files and verification results to chat, then closes the agent.

Responsibilities:

- Read the relevant brief template from `docs/prompts/implementation-brief.md`.
- Read `docs/setup/techstack.md` first.
- Implement only the files explicitly listed in scope.
- Run relevant verification (tests, typecheck) before reporting done.
- Report changed files and verification status.

Rules:

- Do not broaden scope beyond what the brief defines.
- Follow `docs/setup/security.md` conventions for whichever app is in scope.
- When touching `apps/api`, follow all `-core-php-` rules. When touching `apps/web`, follow all `-core-react-` rules.

## Deploy Agent

Use a deploy agent for `-deploy-`. Under Claude, use `general-purpose` subagent type, `run_in_background: true`. When done, main session posts the full deployment report to chat, then closes the agent.

Responsibilities:

1. Read `docs/setup/deployment.md` — full deployment architecture and checklists
2. Read `docs/setup/environment-matrix.md` — required env vars per environment
3. Read `docs/setup/techstack.md` — cache driver decisions and storage conventions
4. Inspect the current state of the repo:
   - Check `database/migrations/` for cache and session table migrations
   - Check `apps/api/Dockerfile` exists
   - Check `apps/api/config/database.php` has `render_cache` connection
   - Check `apps/api/config/filesystems.php` has `supabase` disk
5. Report a deployment readiness checklist — what is done, what is missing, what must be done before deploying
6. Walk through each service in order: Supabase → Render PostgreSQL → Render Web Service → Vercel → cron-job.org
7. For each service, report the exact steps needed based on current repo state

### Output format

```text
## Deployment Readiness

### ✅ Ready
- list of things confirmed ready

### ❌ Missing — must fix before deploy
- [file or step] — what is missing and what to do

### ⚠️ Manual steps — cannot be automated
- Supabase: ...
- Render: ...
- Vercel: ...
- cron-job.org: ...

### Deploy order
1. ...
2. ...
```

Rules:

- Do not edit files unless a missing migration or config is blocking the deploy and the fix is trivial
- Always verify actual file state — do not assume anything is in place
- Flag any env var that is required in production but not documented in `environment-matrix.md`
- Do not expose or guess secret values — reference env var names only

## Agent Cleanup

Every sub-agent lifecycle follows this sequence:

1. Spawn with `run_in_background: true`.
2. Wait for the completion notification.
3. Integrate the result.
4. Post the result to the main chat.
5. Close the agent.

Never let a completed agent linger after its result has been posted.

If spawning fails because the agent thread limit is reached:

1. Close completed agents that have already had their results posted.
2. Retry the requested spawn.
3. If spawning still fails, inform the user and continue only with approval or a clear fallback.
