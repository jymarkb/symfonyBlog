# QA Baseline — Auth: Signup (Register)

## Scope

Email + password registration and OAuth (GitHub / Google) social signup. Covers `SignUpForm`, `registerApi`, `AppServiceProvider` user provisioning, and the confirmation screen.

## Current Status

**All checks GREEN** as of 2026-05-07.

## Checklist Coverage

Apply the master checklist at `docs/setup/qa-checklist.md`. Sections relevant to this feature:

- Backend §1 Auth & authorization — `auth:api` + `admin` middleware, JWT algorithm confusion
- Backend §2 Mass assignment — `User.$fillable` excludes `role`, `email`, `supabase_user_id`, `handle`
- Backend §3 Resource exposure — `SessionResource`, `PublicProfileResource` field audit
- Backend §5 Rate limiting — all named limiters, md5 pre-fill test pattern
- Backend §7 Test coverage — `ApiRouteCoverageTest`, isolation tests, `assertJsonMissingPath`
- Backend §10 Race conditions — `lockForUpdate()`, `UniqueConstraintViolationException` handling
- Frontend §1 Route guards — `RequireGuest` on `/signup`
- Frontend §2 Auth edge cases — OAuth cleanup, `pendingAuthProvider`, `lastAuthProvider`
- Frontend §4 Form validation — all 5 fields + terms, simultaneous errors, `@` normalization
- Frontend §6 Error hygiene — no email-existence confirmation, generic messages
- Frontend §10 Accessibility — `aria-invalid`, `aria-describedby` on all inputs including terms
- Auth flow specific — silent duplicate email (shows confirmation, no leakage), confirmation screen

## Bug History

### Cycle 1 — 2026-05-07

**Fixed:**
- `role="alert"` on permanently-mounted error containers → `role="status"`
- All `SignUpForm` inputs (display name, handle, email, password) missing `aria-invalid` + `aria-describedby`
- Terms checkbox missing `aria-invalid`, `aria-describedby`, and explicit `id="signup-terms"`
- Password input missing `maxLength={72}` — bcrypt silently truncates passwords over 72 bytes, making long passwords equivalent to their 72-char prefix
- `validateNewPassword` missing 72-char upper bound — now returns "Password must be 72 characters or fewer."

## Known Limitations / Deferred Items

- **WARN — Handle collision is silent.** Server silently renames a taken handle (e.g. `@alice` → `@alice2`) with no user notification. User discovers mismatch on their profile. Fix requires a public `GET /api/v1/handle-availability?handle=@alice` endpoint + debounced blur check on the form. Deferred; not a security issue.
- **WARN — No user provisioning tests.** `AppServiceProvider` provisioning logic (new user creation, handle de-duplication, race-condition catch, email-collision fallback) has no feature test coverage. Deferred as `tests/Feature/Auth/UserProvisioningTest.php`.
- **WARN — `display_name` from JWT not server-side length-capped.** `normalizeHandleBase` limits handle to 19 chars, but `display_name` from Supabase `user_metadata` is stored as-is. Unlikely in practice (Supabase enforces limits), but worth adding a `substr(…, 0, 120)` guard.
- **WARN — `manage_categories` / `upload_media` permissions emitted by API but not declared in `UserPermissions` TypeScript type.** Falls through the index signature safely, but should be explicitly typed or removed.
- **WARN — Security headers** not set at Laravel layer. See login baseline.

## Key Files

| File | Role |
|---|---|
| `apps/web/src/features/auth/components/SignUpForm.tsx` | UI form, all field validation, confirmation screen |
| `apps/web/src/features/auth/api/registerApi.ts` | Supabase signup, social auth, handle normalization |
| `apps/web/src/features/auth/lib/validation.ts` | `validateNewPassword` (72-char cap), `validateHandle`, etc. |
| `apps/api/app/Providers/AppServiceProvider.php` | User provisioning, handle de-duplication, race handling |

## Update Log

- **2026-05-07** — Initial baseline. All checks green after Cycle 1 fixes.
