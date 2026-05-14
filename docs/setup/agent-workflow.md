# Agent Workflow

## Purpose

This document records how the main agent session (Claude or Codex) should route repeatable multi-step work when the user asks for planning, committing, reviewing, or implementation through short command-style prefixes.

The main session stays responsible for coordination and user communication. Specialized sub-agents should do bounded work only when their task is explicit.

## Claude Model Tiers

When running under Claude, use these model tiers per agent type:

```text
-feature-            -> sonnet  (feature orchestration, use Plan subagent type)
-feature-auto-       -> main session workflow (full automated section close-out — plan + implement + verify + commit)
-autotest-           -> main session workflow (iterative QA fix loop — runs until all 🔴 bugs cleared and tests green)
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
-autotest-           -> main session workflow (fix → test → repeat until all green; never stops on red)
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
-autotest-           -> main session workflow              (iterative QA fix loop; runs until all 🔴 bugs cleared and tests green)
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

Provider note:
- Claude agents use the explicit `run_in_background: true` field.
- Codex agents use the async `spawn_agent` lifecycle. Do not pass a `run_in_background` field in Codex; spawn the agent, continue useful local work, and call `wait_agent` only when the result is needed.

Rules:
- Always spawn in the provider's background/async mode.
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
-autotest- <feature-name>
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
- Spawn the designated agent in the provider's background/async mode.
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

1. **Plan** — Spawn a Plan sub-agent in the provider's background/async mode. Wait for the notification, then integrate the result: a complete structured subtask list with dependency order, owner per subtask, and verification checklist. Close the plan agent after integrating.

2. **Backend** — Spawn `-core-php-` agents in the provider's background/async mode so the main session stays free for user interaction. Where subtasks are independent, spawn them in parallel. Where one depends on another, wait for the notification before spawning the next. Close each agent after integrating its result.

3. **Verify backend** — Run `php artisan test` in foreground (fast, must gate the next phase). If any new test fails, spawn a `-core-php-` fix agent in background before continuing. Do not proceed to frontend wiring if tests are red.

4. **Frontend** — Spawn `-core-react-` agents in **background** for types, API function, and component in dependency order. Close each agent after integrating its result.

5. **Typecheck** — Run `npx tsc --noEmit` from `apps/web` to verify the frontend compiles clean.

6. **QA gate** — Spawn `-qa-frontend-` and `-qa-backend-` in parallel (background). Wait for both. If either reports any 🔴 bug, spawn targeted fix agents (background, parallel where independent), re-run `php artisan test` and `npx tsc --noEmit`, then re-run QA. Repeat until zero 🔴 bugs. Do not proceed to step 7 until QA is clean. This gate exists so that fix commits never accumulate after the feature is reported done.

7. **Update feature doc** — Edit `docs/architecture/<feature>.md` to mark the section's phases as done.

8. **Report** — Only after all phases complete and QA is green, post one consolidated summary: what was implemented, test results, QA iteration count, and suggested commit grouping. The user runs `-commit` manually.

### Rules

- Always verify actual file state before planning — never trust the doc alone.
- Respect the phase order: Backend → Tests → Wiring → QA gate. Do not wire the frontend before backend tests pass. Do not mark done before QA is green.
- If a step fails (test red, type error, missing dependency, 🔴 QA bug), stop the loop, fix the blocker, then continue — do not skip ahead.
- **Silent mode** — do not post intermediate progress updates ("Batch 1 done", "tests green", "QA iteration 1 done", etc.) to the main chat. Run all phases silently and post only the final consolidated summary when everything is complete.
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

## AutoTest Agent

Use `-autotest- <feature-name>` to automatically clear all QA bugs and make the feature green, without manual approval between fix iterations.

**Important:** `-autotest-` is a **main session workflow** — the main session drives every iteration itself, not a single spawned agent.

### How the main session executes it

1. **QA** — Spawn `-qa-frontend-` and `-qa-backend-` in parallel (background). Wait for both notifications. Synthesize findings. If zero 🔴 bugs and all tests green, stop — post the clean report and suggested commit grouping.

2. **Fix** — For each 🔴 bug:
   - Frontend bugs → spawn `-core-react-` fix agents (background). Independent fixes run in parallel.
   - Backend bugs → spawn `-core-php-` fix agents (background). Independent fixes run in parallel.
   - Wait for all fix agents before proceeding.

3. **Verify** — Run `php artisan test` (backend) and `npx tsc --noEmit` (frontend) in foreground. If red, spawn a targeted fix agent for the failure before continuing. Do not proceed to the next QA iteration if tests are red.

4. **Loop** — Return to step 1. Re-run QA agents in parallel. Repeat until the synthesized report contains zero 🔴 bugs and all tests pass.

5. **Report** — When green, post one consolidated summary: what was fixed each iteration, final test results, and suggested commit grouping. The user runs `-commit` manually.

### Rules

- Only fix 🔴 bugs per iteration. Do not auto-fix 🟡 gaps unless a gap causes a test failure.
- Silent between iterations — do not post intermediate progress ("Iteration 1 done", "Fixing X") to the main chat. Only surface failures and the final green report.
- Do NOT auto-commit. After reaching green, report the suggested commit grouping and wait for the user to run `-commit`.
- Cap at 5 iterations. If the feature is not green after 5 fix cycles, stop and post the remaining open bugs with a note that manual intervention is needed.
- Each iteration's QA agents must read `docs/setup/qa-checklist.md` and `docs/setup/security.md` before reviewing — brief them explicitly.
- **QA agents must use full-depth prompts every iteration** — do not shorten the prompt for later iterations with "re-check prior findings only." Every iteration is a fresh full review. Shortened prompts miss new bugs introduced by fixes and bugs that the prior pass overlooked.
- **Explicitly instruct QA agents to audit every `catch` block** — silent failures (catch blocks that roll back state or do nothing without showing the user an error) are 🔴 bugs and are easily missed by shallow prompts.
- Track which bugs were fixed in which iteration so the final report shows the full fix history.

### Output format (final report only)

```text
## AutoTest: <feature-name> — Green ✅ (or: Stopped after N iterations)

### Iterations
- Iteration 1: fixed X bugs — [list]
- Iteration 2: fixed Y bugs — [list]
- ...

### Final test results
- php artisan test: N passed, 0 failed
- tsc --noEmit: clean

### Suggested commit grouping
- Commit 1: ...
- Commit 2: ...
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
- **Lift shared interactive state to the page.** When the same piece of state (e.g. `isFollowing`, `followersCount`) is displayed by more than one component instance on a page, own it at the page level. Pass it down as `initialXxx` props and propagate changes upward via `onXxxChange` callbacks. Never let two sibling instances maintain independent copies — they will diverge silently after any mutation.
- **OAuth pending actions belong at the page level, not inside components.** When a guest triggers an auth-gated action (follow, star, reaction), save the intent to `sessionStorage` before opening the auth gate. A single `useEffect([isAuthenticated])` at the **page** level picks up the pending key, removes it, and executes the action after login. Do not put this `useEffect` inside a component that can appear more than once on the page — only the first mounted instance will find the key; the second will see nothing.
- **`isAuthenticated` lags behind the Supabase session.** `isAuthenticated` from `useCurrentSession()` does not flip to `true` until `fetchCurrentUser` resolves, which can take one or more render cycles after a successful OAuth login. When a component must decide synchronously whether a click should open the auth gate (e.g. on a Follow button click handler), always probe `tryGetAccessToken()` first. If it returns a token, the user is authenticated even if `isAuthenticated` is still `false` — fall through to the authenticated path. Only open the auth gate if both `isAuthenticated === false` AND `tryGetAccessToken()` returns `null`.
- **Skip `response.json()` for 204 and 304 responses.** Any API call that can return 204 No Content (e.g. DELETE unfollow, DELETE unlike) must not call `response.json()` — it throws a `SyntaxError` on empty body, which is caught silently and reverts optimistic UI. Ensure `apiClient.ts` checks `response.status === 204 || response.status === 304` before the `.json()` call and returns early.
- **One `AuthGateModal` instance per page.** Do not render `AuthGateModal` (or any modal/dialog overlay) inside a component that appears more than once on the same page. Multiple instances compete for the same `onSuccess` callback and produce duplicate DOM overlays. Instead, the page owns a single `authGateOpen` boolean and `pendingCallback` ref, and passes an `onOpenAuthGate` prop to child components so they delegate upward.
- **Every `<button>` and `<a>` must have an `aria-label` attribute.** Icon-only elements (no visible text) require it to be accessible at all. Elements with visible text still require it so screen readers announce a clean, descriptive label rather than raw text content. Set `aria-label` at the time you write the element — do not leave it for QA to catch. This applies to ALL anchor tags, including navigational links in card or list components (author links, date links, post title links) — not just icon-only buttons. Example: `<a href={`/profile/${handle}`} aria-label={`View ${name}'s profile`}>` and `<a href={`#comment-${id}`} aria-label={`Comment posted on ${absolute}`}>`.
- **HTML strings generated for `dangerouslySetInnerHTML` must embed `aria-label` in the string template.** When a function returns an HTML string (e.g. a markdown renderer, a highlight function), every `<a>` and interactive element in that string must include `aria-label="..."` as a literal attribute in the template — you cannot add React props to HTML strings after the fact. Write the aria-label into the string at generation time. Example: `` `<a href="/profile/${handle}" aria-label="View @${handle}'s profile">@${handle}</a>` ``.
- **Every error message that includes "try again" wording must have an adjacent retry `<button>`.** An error `<p>` that says "please try again" with no button is a 🔴 bug — the user has no affordance to act. Place a `<button>` that executes the retry action immediately after (or inside) the error element. The retry button must have `aria-label` and must be `disabled` while the operation is in flight.
- **Every `<textarea>` must have `maxLength`, `aria-label`, and `aria-describedby`.** Set `maxLength` to the character limit enforced by the backend. Add `aria-label` describing the field ("Write a comment", "Write a reply", "Edit comment"). Add `aria-describedby` pointing to the `id` of the associated character counter element. Do not leave any of these for QA to catch.
- **Character counters must always be visible**, never conditionally rendered. Use CSS classes (`warn`, `over`) to change appearance at thresholds — never toggle visibility with a boolean. The counter is always present; only its style changes.
- **Every error message element must have `role="alert"`.** Apply `role="alert"` to every `<p>`, `<div>`, or `<span>` that conditionally renders an error string. Do not render error text without it.
- **Every `catch` block on a user-visible mutation must set user-visible error state.** A catch that only rolls back optimistic state (e.g. `setItems(snapshot)`) without also calling `setError(...)` is a silent failure — a 🔴 bug. Every async user action (post, edit, delete, load-more, follow, react) must tell the user what went wrong. Write the error state and its render at the same time as the catch block.
- **Use proper generic types on API calls — never `as` casts on response values.** Pass the full expected shape as the generic: `apiRequest<{ data: Comment }>(...)`. Casting with `as { data: Comment }` bypasses type inference and hides shape mismatches silently.

### Pre-report self-verification checklist (run before reporting done)

Before reporting a task complete, execute each step — do not self-report without running the grep:

- [ ] **Grep `<textarea` in every file you touched** — count each instance; every one must have `maxLength=`, `aria-label=`, and `aria-describedby=`. Missing any attribute on any instance is a 🔴 bug. Fix before reporting.
- [ ] **Grep `<button` and `<a ` in every file you touched** — every one must have `aria-label=`. This includes plain navigational anchor tags in card/list components (author links, date links, title links) — not just icon-only buttons. Fix before reporting.
- [ ] **Grep `dangerouslySetInnerHTML` in every file you touched** — for each usage, open the function that generates the HTML string and confirm every `<a>` in the generated string has `aria-label="..."` embedded as a literal attribute in the template
- [ ] **Grep `try again` and `please try` in rendered JSX** — every match must have an adjacent `<button>` that executes the retry action; a bare error message with retry wording and no button is a 🔴 bug
- [ ] Every element that conditionally renders an error string has `role="alert"` — grep for `setError\|error &&\|error ?` and confirm each render site has the attribute
- [ ] Every `catch` block on a user-visible mutation calls `setError(...)` — grep `catch` in each file and confirm no block only rolls back state without also calling `setError`
- [ ] Character counters are always rendered — never behind a conditional; grep for the counter component and confirm no `&&` or ternary gates its render
- [ ] Counter `id` values are unique per instance — grep `id="` in components that render in lists; hardcoded IDs like `id="reply-counter"` are a 🔴 bug when the component renders more than once
- [ ] **Grep `) as {` and `response as ` in every file you touched** — every match on an API response value is a violation; replace with `apiRequest<{ data: Type }>(...)` generics
- [ ] `npx tsc --noEmit` from `apps/web` exits clean

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
- Controllers must not contain business logic. Validate input via FormRequest, call a service method, return a resource. That is all. No `Model::query()`, no `where()` chains, no Eloquent calls of any kind inside a controller — read or write. There is no "simple enough to skip the service" exception.
- **No model or entity operations in controllers.** This means no `->load()`, `->loadCount()`, `->with()`, `->withCount()`, `->find()`, `->findOrFail()`, `->where()`, `->firstOrCreate()`, `->save()`, `->delete()`, or any other Eloquent method. Every model touch — including eager-loading relationships or counts needed for a Resource — must live in the service method that returns the model. The controller receives a fully-hydrated model or value object from the service and passes it directly to the Resource. **Accessing `$model->relation` on a route-model-bound object is also a model operation** — it triggers a lazy load query in the controller. Pass the bound model to the service; the service loads any required relationships internally.
- **Slug resolution is a service call, never raw Eloquent.** When a controller needs a `Post` by slug, it must call `$this->postService->findPublishedBySlug($slug)` — never `Post::where('slug', $slug)->where('status', 'published')->firstOrFail()`. The same applies to every other model: if a service method exists to look it up, use it. If one does not exist, add it to the service. A controller that imports any `App\Models\*` class (other than for route model binding type-hints) is violating this rule.
- **Service methods must fully hydrate for their Resource.** Before writing or modifying any service method that returns a model, read every Resource that will consume it. Find every `$this->whenLoaded('relation')` and `$this->whenCounted('alias')` call inside those Resources and ensure the service query includes the matching `->with(['relation'])` and `->withCount(['alias' => ...])` clauses. A service method used by more than one controller (e.g. `findPublishedBySlug` called from `PostController::show`, `PostUserStateController`, and `PostReactionController`) must load the union of all relationships and counts required by any of the Resources those controllers return. Missing eager loads cause silent null fields or missing keys in the JSON response — they will not throw an error and will not be caught until a test asserts on the specific field.
- Models must not contain business logic. Models own columns (`$fillable`, `$hidden`, `casts()`), relationships, and nothing else.
- Any logic that decides what to do with data belongs in a service under `app/Services/<Domain>/`. Create the service if it does not exist. If the service does not exist, create it — do not inline logic in the controller as a shortcut.
- When adding, removing, or changing `/api/v1` routes, update Pest route coverage in `apps/api/tests/Feature/Routes/ApiRouteCoverageTest.php`.
- Add or update behavior tests beside the owned endpoint area, for example `tests/Feature/Auth`, `tests/Feature/Profile`, `tests/Feature/Public`, or `tests/Feature/Admin`.
- Run the relevant Pest suite before reporting done, using `php artisan test` or a targeted test command from `apps/api`.
- If an endpoint is still a placeholder, test the placeholder status/body explicitly so future implementation changes are intentional.
- `php artisan make:model` generates a minimal stub — always replace the full file content. The stub will be missing `HasFactory`, relationships, casts, and may use wrong fillable field names. Never assume the generated content is correct.
- When factories write a column name (e.g. `body`), the migration and model fillable must use the exact same name. Mismatches cause silent insert failures.
- `DatabaseSeeder` must use a find-or-create pattern (`Model::where(...)->first() ?? Model::factory()->create(...)`) so re-running `db:seed` does not throw a unique constraint violation.
- **Never modify an existing migration file.** Migrations are immutable once committed or run. If a schema change is needed, always create a new migration (`php artisan make:migration alter_<table>_<description>`). The only exception is a migration that has never been committed and never run on any environment.
- When migration columns change on a freshly created table, run `php artisan migrate:rollback --step=N && php artisan migrate` before seeding — do not just re-seed.
- **Ownership checks must return `response()->json(['error' => 'forbidden'], 403)` directly**, not `abort(403)`. In the test environment (`APP_DEBUG=true`), `abort(403)` routes through the debug exception renderer and emits the full stack trace instead of the canonical JSON error shape. The custom handler in `bootstrap/app.php` only applies when debug mode is off. Using `response()->json()` directly guarantees the correct shape in all environments.
- **Every test that asserts a 401 or 403 must also assert the response body shape.** Chain `->assertJson(['error' => 'unauthenticated'])` after every `->assertUnauthorized()` and `->assertJson(['error' => 'forbidden'])` after every `->assertForbidden()`. Status-only assertions allow response body regressions to go undetected.
- **Every endpoint that returns user or resource data must have `assertJsonMissingPath` tests** pinning that `role`, `email`, `supabase_user_id`, and `user_id` are absent from the response. Add these assertions when you write the endpoint test — do not leave them for QA.
- **FormRequest validation must include all constraints, including ownership scoping.** If a field references a resource that is scoped to the current post/user/context (e.g. `parent_id` must belong to the same post), validate this in the FormRequest using `Rule::exists(...)->where(...)` with a subquery. Do not rely solely on the service layer — service exceptions produce less user-friendly errors than a FormRequest 422.
- **Rate limit tests must pre-fill the bucket `limit + 1` times, not `limit`.** Hitting N times when the limit is N *reaches* the limit but does not trigger a 429 — the 429 fires on hit N+1. Write the loop as `for ($i = 0; $i <= $limit; $i++)` (note `<=`, not `<`). Also verify the cache key format: `ThrottleRequests` uses `md5($limiterName . '|' . $identifier)` — check the named limiter's `->by()` value and match it exactly in the test.

### Pre-report self-verification checklist (run before reporting done)

Before reporting a task complete, execute each step — do not self-report without running the grep:

- [ ] Every ownership check uses `response()->json(['error' => 'forbidden', 'message' => '...'], 403)` — grep `abort(403)` in files you touched; every match is a 🔴 bug
- [ ] Every test asserting 401 chains `->assertJson(['error' => 'unauthenticated'])` — grep `assertUnauthorized` and confirm every call is followed by `->assertJson`
- [ ] Every test asserting 403 chains `->assertJson(['error' => 'forbidden', ...])` — grep `assertForbidden` and confirm every call is followed by `->assertJson` with both `error` and `message` keys
- [ ] Every endpoint test that returns user or resource data has `assertJsonMissingPath` for `role`, `email`, `supabase_user_id`, and `user_id`
- [ ] Every controller method is one of: `index`, `show`, `store`, `update`, `destroy` — no custom action methods added
- [ ] **Grep `->` in every controller method body** — any Eloquent chain (`->where`, `->find`, `->load`, `->with`, or a relationship property like `$model->relation`) is a violation; all model access must go through service methods
- [ ] Service methods fully hydrate relationships required by every Resource that consumes them
- [ ] FormRequest includes all validation constraints including cross-resource ownership scoping
- [ ] **Rate limit test loops use `<= $limit` (N+1 hits)**, not `< $limit` or `$limit` iterations — confirm the loop count exceeds the throttle ceiling by one
- [ ] New or changed `/api/v1` routes are reflected in `ApiRouteCoverageTest.php`
- [ ] `php artisan test` exits clean (no new failures)

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
- **Silent failures** — every `catch` block on a user-visible mutation (post, edit, delete, load-more, follow, react, etc.) must surface an error message to the user; rolling back optimistic state without showing an error is a 🔴 bug; audit every `catch {}` and `catch (e) {}` in the feature
- **Error message hygiene** — no raw API error strings, Supabase messages, or stack traces in the UI; generic messages throughout
- **Token handling** — `getSession()` called immediately before each API call, not cached in state; no token in URL params or `console.log`
- **Security** — no `dangerouslySetInnerHTML` without sanitization; no open redirect via URL params; no sensitive data in `localStorage` beyond library requirements
- **TypeScript** — `tsc --noEmit` would pass; no unchecked `!` assertions on nullable API fields; no `any` on API response types
- **React correctness** — no duplicate API calls on mount; `useEffect` dependency arrays complete; error boundaries present at page/feature level
- **Accessibility** — icon-only buttons (no visible text) missing `aria-label` are 🔴 bugs; links and buttons with visible text but no `aria-label` attribute are 🟡 gaps only, never 🔴 bugs; form inputs have `<label>`; `aria-live` regions for async state changes; keyboard navigability
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

1. Spawn `-qa-frontend-` and `-qa-backend-` as read-only subagents **in parallel** using the provider's background/async mode.
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

## Autotest Agent

Use `-autotest- <scope>` to fix all failures and keep running until every test passes. This is a **main session workflow** — the main session drives every step itself.

### How the main session executes it

1. **Run tests** — Execute `cd apps/api && php artisan test` and `cd apps/web && npx tsc --noEmit` in parallel. Capture all failures.
2. **If green** — Post final passing output and stop. Done.
3. **If red** — Group failures by concern (backend test failures → `-core-php-` agents; frontend type errors → `-core-react-` agents). Spawn fix agents in background. Where failures are independent, spawn in parallel.
4. **Wait** — Wait for all fix agents to complete.
5. **Re-run tests** — Go back to step 1.
6. **Repeat** — Never stop on red. Only stop when both `php artisan test` and `npx tsc --noEmit` exit clean.
7. **Report** — Post the final green test output and a summary of all fixes made.

### Rules

- Never stop the loop because a fix agent failed or a fix looks partial — re-run tests and let the result decide.
- If the same failure appears 3 times in a row without progress, surface it to the user and pause — it may require architectural input.
- Do not auto-commit. After all tests green, report suggested commit grouping and wait for the user to run `-commit`.
- **Silent mode** — do not post intermediate "round N" updates to main chat. Only post the final green summary. Surface failures immediately if the same test fails 3 consecutive rounds (the exception to silent mode).
- When spawning fix agents, give them the exact failure output and the file paths — do not make them re-run the tests themselves.

### Example

```
User: -autotest- archive page

Main session:
  Round 1:
    → Run php artisan test + tsc --noEmit in parallel
    → 3 PHP failures, 1 TS error
    → Spawn -core-php- with failure output (parallel where independent)
    → Spawn -core-react- with TS error
    → Wait for both
  Round 2:
    → Re-run php artisan test + tsc --noEmit
    → 1 PHP failure remains
    → Spawn -core-php- fix agent
    → Wait
  Round 3:
    → Re-run tests
    → All green
    → Post final summary + suggested commit grouping
```

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

1. Spawn in the provider's background/async mode.
2. Wait for the completion notification.
3. Integrate the result.
4. Post the result to the main chat.
5. Close the agent.

Never let a completed agent linger after its result has been posted.

If spawning fails because the agent thread limit is reached:

1. Close completed agents that have already had their results posted.
2. Retry the requested spawn.
3. If spawning still fails, inform the user and continue only with approval or a clear fallback.
