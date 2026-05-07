# QA Baseline — Auth: Forgot Password

## Scope

Email submission to trigger a Supabase password reset link. Covers `ForgotPasswordForm`, `ForgotPasswordSidePanel`, `sendPasswordResetEmail`, and the success confirmation panel. No Laravel backend route — fully Supabase-direct.

## Current Status

**All checks GREEN** as of 2026-05-07.

## Checklist Coverage

Apply the master checklist at `docs/setup/qa-checklist.md`. Sections relevant to this feature:

- Frontend §1 Route guards — `RequireGuest` on `/forgot-password`
- Frontend §2 Auth edge cases — no email-existence confirmation in success copy, URL cleanup
- Frontend §3 Error boundaries — `ErrorBoundary` at layout level
- Frontend §4 Form validation — email client-side, `aria-describedby` conditional
- Frontend §5 Async states — submitting, success, error
- Frontend §6 Error hygiene — generic messages, `console.error` in catch
- Frontend §7 Token handling — `redirectTo` from `window.location.origin` (no open redirect)
- Frontend §10 Accessibility — `aria-live` persistent wrapper across form/success states, conditional `aria-describedby`
- Frontend §13 Dead UI — side panel copy accurate

## Bug History

### Cycle 1 — 2026-05-07

**Fixed:**
- `role="alert"` on error container → `role="status"`
- `aria-describedby="forgot-password-email-error"` was unconditional — referenced non-existent element when no error. Now conditional.
- `aria-live="polite"` success panel was freshly mounted on `sent=true` — not announced by screen readers. Now a single persistent wrapper covers both form and success states.
- Side panel copy said "All sessions stay active" — contradicted `signOutAfterPasswordUpdate()` sign-out behaviour. Changed to "Pick a new password. You'll be signed out and redirected to sign in."
- Missing `console.error(error)` in `handleSubmit` catch block.
- Empty `.form-alert` `<div>` always rendered even when no error — changed to conditional render `{errors.server && <div>…</div>}`.

## Known Limitations / Deferred Items

- **WARN — No 429-specific message.** A rate-limited request shows the same generic "Unable to send reset link" message as any other failure. Supabase applies its own per-IP limits; 429 from Supabase is surfaced as a generic error which is acceptable but could be improved.
- **WARN — Email field has no `maxLength` attribute.** Added `validateEmail` length cap was deferred. RFC 5321 max is 254 chars. Low risk (Supabase enforces server-side), but `maxLength={254}` on the input would be defensive.

## Key Files

| File | Role |
|---|---|
| `apps/web/src/features/auth/components/ForgotPasswordForm.tsx` | UI form, email validation, persistent aria-live wrapper |
| `apps/web/src/features/auth/components/ForgotPasswordSidePanel.tsx` | Side panel copy |
| `apps/web/src/features/auth/api/resetPasswordApi.ts` | `sendPasswordResetEmail` — Supabase call, generic error |
| `apps/web/src/features/auth/components/AuthFooterLinks.tsx` | Footer Privacy/Terms links |

## Update Log

- **2026-05-07** — Initial baseline. All checks green after Cycle 1 fixes.
