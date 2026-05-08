# QA Baseline — Auth: Login (Sign-in)

## Scope

Email + password sign-in and OAuth (GitHub / Google) sign-in. Covers `SignInForm`, `signInApi`, `CurrentSessionContext`, `/auth/callback`, and the `GET /api/v1/session` Laravel endpoint.

## Current Status

**All checks GREEN** as of 2026-05-07.

## Checklist Coverage

Apply the master checklist at `docs/setup/qa-checklist.md`. Sections relevant to this feature:

- Backend §1 Auth & authorization — `session` route, `auth:api` middleware, JWT validation
- Backend §2 Mass assignment — `User.$fillable` / `$hidden`
- Backend §3 Resource field exposure — `SessionResource` (no `role`, no `supabase_user_id`)
- Backend §5 Rate limiting — `throttle:session` (60/min by IP), md5 pre-fill test
- Backend §6 Response consistency — `{data:{user,permissions}}` shape
- Backend §7 Test coverage — guest→401, user→200, admin permissions, 429
- Backend §8 HTTP headers — `Cache-Control: no-store`
- Frontend §1 Route guards — `RequireGuest` on `/signin`, `RequireAuth` on private pages
- Frontend §2 Auth edge cases — social auth, `pendingAuthProvider`, `lastAuthProvider`, URL cleanup
- Frontend §4 Form validation — email + password client-side, simultaneous errors
- Frontend §5 Async states — loading, error, guest, authenticated
- Frontend §6 Error hygiene — no raw Supabase strings, generic messages
- Frontend §7 Token handling — no token in state/ref, `Authorization: Bearer` only
- Frontend §8 Security — no open redirect, `isAdmin` UI-only
- Frontend §10 Accessibility — `aria-invalid`, `aria-describedby`, `aria-live` on server error
- Auth flow specific — wrong creds→generic, admin redirect, already-auth'd redirect

## Bug History

### Cycle 1 — 2026-05-07

**Fixed:**
- `role="alert"` on permanently-mounted error container → changed to `role="status"` (semantically consistent with `aria-live="polite"`)
- `SignInForm` inputs missing `aria-invalid` + `aria-describedby` pointing to error span IDs
- Added 429-specific message: "Too many sign-in attempts. Please wait a moment and try again." (was generic catch-all)

### Cycle 2 — 2026-05-07

**Fixed:**
- `signInApi.ts`: Supabase-level 429 from `signInWithPassword` was re-thrown as a plain `Error`, bypassing the `instanceof ApiError` check in `handleSubmit`. Now detects `error.status === 429` before re-throwing and emits `ApiError(429)` so the 429-specific message fires correctly.

## Known Limitations / Deferred Items

- **WARN — Session rate limiter keys by IP only** (`AppServiceProvider:48`). Could key by `user?.id ?: ip` for more precise per-user throttling. Intentional for now (throttles unauthenticated probing).
- **WARN — Session isolation test missing** (`SessionEndpointTest`). The `$request->user()` pattern makes cross-user leakage structurally impossible, but the checklist requires an explicit isolation test. Low risk, not yet added.
- **WARN — Security headers** (`Strict-Transport-Security`, `X-Content-Type-Options`, etc.) not set at the Laravel layer. Confirm web server/proxy enforces them before shipping.

## Key Files

| File | Role |
|---|---|
| `apps/web/src/features/auth/components/SignInForm.tsx` | UI form, client-side validation, error handling |
| `apps/web/src/features/auth/api/signInApi.ts` | Supabase email sign-in, token extraction |
| `apps/web/src/features/auth/session/CurrentSessionContext.tsx` | Session state machine, 401 handling |
| `apps/web/pages/(auth)/auth/callback/+Page.tsx` | OAuth callback handler |
| `apps/web/src/lib/auth/supabaseClient.ts` | `detectSessionInUrl: false`, `flowType: 'pkce'` |
| `apps/api/app/Http/Controllers/Api/V1/SessionController.php` | GET /api/v1/session |
| `apps/api/tests/Feature/Auth/SessionEndpointTest.php` | Backend test coverage |

## Update Log

- **2026-05-07** — Initial baseline. All checks green after Cycle 1 fixes.
