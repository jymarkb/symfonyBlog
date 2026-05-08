# QA Baseline — Auth: Reset Password

## Scope

Recovery token exchange (PKCE `?code=` and legacy `#access_token=` hash flows), password update form, sign-out after update, and redirect to sign-in. Covers `ResetPasswordForm`, `ResetPasswordSidePanel`, `startPasswordRecoverySession`, `updatePassword`, and `signOutAfterPasswordUpdate`. No Laravel backend route — fully Supabase-direct.

## Current Status

**All checks GREEN** as of 2026-05-07.

## Checklist Coverage

Apply the master checklist at `docs/setup/qa-checklist.md`. Sections relevant to this feature:

- Frontend §1 Route guards — `RequireGuest` bypass for `/reset-password` via URL check in layout
- Frontend §2 Auth edge cases — URL cleanup before exchange, replay protection, no auto-login after reset
- Frontend §3 Error boundaries — `ErrorBoundary` at layout level, `isMounted` guard
- Frontend §4 Form validation — password + confirmPassword simultaneous errors, 12-char min, 72-char max
- Frontend §5 Async states — loading (spinner), error (message + re-request link), form ready
- Frontend §6 Error hygiene — `getPasswordUpdateErrorMessage` maps Supabase codes, no raw strings
- Frontend §7 Token handling — `detectSessionInUrl: false`, `flowType: 'pkce'`, URL stripped before exchange
- Frontend §10 Accessibility — single persistent `aria-live` wrapper across loading/ready states, `aria-invalid`, `aria-describedby` on both inputs
- Auth flow specific — token single-use, URL stripped, sign-out on success, no auto-login
- Frontend §13 Dead UI — side panel copy accurate ("Secure authentication", not "Supabase Auth")

## Bug History

### Cycle 1 — 2026-05-07

**Fixed:**
- Dead `isComplete` state and unreachable confirmation screen removed. `window.location.replace('/signin')` is the sole completion signal.
- `role="alert"` on error container → `role="status"`
- `supabaseClient` missing `detectSessionInUrl: false` — race between SDK auto-exchange and manual `exchangeCodeForSession` on `/reset-password`. Fixed.
- Added `flowType: 'pkce'` to `supabaseClient` — guarantees PKCE and Supabase-owned `state` validation for all OAuth flows.
- `signOutAfterPasswordUpdate` silently swallowed sign-out errors — session remained alive in localStorage; `RequireGuest` then trapped user away from `/signin`. Now rethrows as typed `new Error(…)`.
- `handleSubmit` split into two guarded try/catch blocks: password update failure shows "unable to update" and stops; sign-out failure shows "password updated but could not sign you out — close all tabs" and stops. Only both succeeding triggers navigation.
- Two separate `aria-live` DOM nodes (one per early-return branch) — screen readers couldn't observe mutations across `isReady` state change. Replaced with a single persistent outer `<div aria-live="polite" role="status">` wrapper.
- `setSubmitting(false)` on success path before navigation removed — was creating a brief window for race-condition double-submit.
- `signOutAfterPasswordUpdate` was throwing raw `AuthError` object — changed to `throw new Error("Sign-out failed after password update.")` for consistent contract.
- `ResetPasswordSidePanel` exposed "Supabase Auth" as visible copy — changed to "Secure authentication".
- Password inputs missing `maxLength={72}` — bcrypt truncates silently at 72 bytes. Added `maxLength` and `validateNewPassword` 72-char upper bound.

## Known Limitations / Deferred Items

- **WARN — No 429-specific message.** Rate-limited password update shows the same generic error as other failures. Low priority since the form is only reachable after a valid recovery token exchange.
- **WARN — AuthFooterLinks Privacy/Terms links.** Changed from `href="#"` to `/privacy` and `/terms` — those pages should exist. If they don't yet, revisit.

## Key Files

| File | Role |
|---|---|
| `apps/web/src/features/auth/components/ResetPasswordForm.tsx` | UI form, persistent aria-live wrapper, split try/catch submit |
| `apps/web/src/features/auth/components/ResetPasswordSidePanel.tsx` | Side panel copy |
| `apps/web/src/features/auth/api/resetPasswordApi.ts` | Token exchange, password update, sign-out |
| `apps/web/src/features/auth/lib/validation.ts` | `validateNewPassword` (12-char min, 72-char max) |
| `apps/web/src/lib/auth/supabaseClient.ts` | `detectSessionInUrl: false`, `flowType: 'pkce'` |

## Update Log

- **2026-05-07** — Initial baseline. All checks green after Cycle 1 fixes.
