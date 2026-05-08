# QA Feature Baselines

Per-feature QA history. Each file records what's green, what was fixed each cycle, and what's deferred. When a new QA round runs on a feature, compare against the baseline to distinguish regressions from new issues.

## How to use

1. Run `-qa- <feature>` to get a full QA report for the feature.
2. Open the baseline doc for that feature.
3. Any FAIL that was previously in "Bug History → Fixed" is a **regression** — highest priority.
4. Any FAIL not in the doc is a **new issue** — add it to Bug History when fixed.
5. After fixing, update the doc: move the bug to the relevant cycle's Fixed list and update "Current Status" date.

## Features

| Feature | Baseline | Status |
|---|---|---|
| Sign-in (login) | [auth-login.md](features/auth-login.md) | GREEN 2026-05-07 |
| Sign-up (register) | [auth-signup.md](features/auth-signup.md) | GREEN 2026-05-07 |
| Forgot password | [auth-forgot-password.md](features/auth-forgot-password.md) | GREEN 2026-05-07 |
| Reset password | [auth-reset-password.md](features/auth-reset-password.md) | GREEN 2026-05-07 |

## Adding a new feature baseline

Copy the structure from any existing file. Sections:
- **Scope** — what the feature covers (files, endpoints)
- **Current Status** — GREEN/YELLOW/RED + date
- **Checklist Coverage** — which checklist sections apply
- **Bug History** — one sub-section per QA cycle with Fixed list
- **Known Limitations / Deferred Items** — WARNs and design trade-offs
- **Key Files** — table of relevant files and their roles
- **Update Log** — one line per cycle

## Master checklist

`docs/setup/qa-checklist.md` — OWASP API Top 10, WCAG 2.1, Laravel + React patterns, and project-specific checks. Update it when a QA round surfaces a new class of bug.
