# Security Conventions

## Purpose

This document defines the security baseline for the current working features. It is a living document — update it when new features introduce new security concerns. Do not document security for features that do not exist yet.

Agents must read this file alongside `techstack.md` before planning or implementing any backend or frontend work.

---

## Backend Security (Laravel)

### Authentication and authorization

- All private user routes must be inside `Route::middleware('auth:api')`.
- All admin routes must be inside `Route::middleware('admin')`.
- Controllers must scope all data operations to `$request->user()`. Never accept a `user_id` from the request body or query string to identify the target record.
- Password changes go through Supabase only — never through Laravel.

### Mass assignment

- `User::$fillable` must never include `role`, `email`, `supabase_user_id`, or `handle`. These fields must only be set via explicit column assignment (`$user->role = ...`), never via `fill()` with user-supplied data.
- Only include columns in `$fillable` that the user is allowed to set through the API.

### Model serialization

- `User::$hidden` must include `supabase_user_id` at minimum. This prevents accidental exposure if the model is serialized directly instead of going through a Resource class.

### Input validation

- URL fields (e.g. `avatar_url`) must use `'url:https'` — not plain `'url'` — to block non-HTTPS schemes.
- Enum/option fields (e.g. notification preferences) must use `'in:value1,value2,...'` to restrict to the allowed set.
- Validate field lengths for free-text inputs (`display_name`, `first_name`, `last_name`): `'max:255'` at minimum.

### API response contracts (Resources)

- Resources must only expose fields the client actually needs.
- `role` must not appear in `ProfileResource` — role context belongs in `SessionResource` only.
- `supabase_user_id`, `email` (if internal), and any other system fields must not appear in public or private-user Resources.

### Rate limiting

- All authenticated mutation routes (`PATCH`, `DELETE`, `POST`) must have a throttle applied.
- Apply `throttle:60,1` at the `auth:api` group level as a baseline.
- Tighter limits on destructive or expensive operations (e.g. `DELETE /profile`).
- Register named rate limiters in a service provider using `RateLimiter::for(...)` — not inline on individual routes.

> **Current status:** Rate limiting is not yet implemented. This is a known gap — tracked as the primary item in the security review section of `docs/architecture/profile-page.md`.

### Test coverage for auth boundaries

Every route must have at minimum:
- Private user route: guest → 401, authenticated → expected response
- Admin route: guest → 401, user → 403, admin → expected response
- Public route: unauthenticated → expected response

---

## Frontend Security (React + Vike)

### Route guards

- All pages under `pages/(user)/` are protected by `pages/(user)/+guard.ts` — a server-side Vike guard that reads the Supabase session cookie and redirects guests to `/signin` before any HTML is rendered.
- All pages under `pages/(auth)/` are protected by `pages/(auth)/+guard.ts` — redirects authenticated users to `/`. The `/reset-password` path is bypassed because the recovery token flow fires `SIGNED_IN`.
- Do not add a second auth check inside individual page components — the guard runs before the page renders.
- `RequireAuth` and `RequireGuest` components are deprecated. Do not use them in new pages.
- Admin UI must check the `isAdmin` flag from `useCurrentSession()` or `pageContext.initialUser.isAdmin` to hide admin-only controls, but the real gate is always the `admin` middleware server-side. Never rely on a client-side role check as the sole protection.

### Access token handling

- Always retrieve the access token via `supabase.auth.getSession()` immediately before an API call — do not store it in component state or a ref.
- Never pass tokens in URL params or query strings.
- Never log tokens to the console.

### Error messages

- Never render raw API error responses, stack traces, or internal error strings to the UI.
- Show user-friendly messages only (e.g. `"Failed to save. Please try again."`).
- Log detailed errors to the console for debugging, but keep the UI message generic.

### Client-side validation

- Forms must validate required fields and basic format before submitting to the API. This reduces unnecessary round-trips and gives faster feedback.
- Client-side validation is for UX only — the server is always the authoritative validation layer.

---

## Per-Feature Security Checklist

Use this checklist when a planning agent decomposes a new feature. Add items here as new feature types are introduced.

### New backend endpoint
- [ ] Is the route in the correct middleware group (`auth:api`, `admin`, or public)?
- [ ] Does the controller use `$request->user()` to scope data — never a request-supplied ID?
- [ ] Are all inputs validated (type, length, format, enum)?
- [ ] Is a throttle applied to any mutation method?
- [ ] Does the Resource expose only the fields the client needs?
- [ ] Is the route added to `ApiRouteCoverageTest.php`?
- [ ] Are guest / auth / admin behavior tests written?

### New frontend page or form
- [ ] Is the page in the correct route group with a `+guard.ts` server-side guard?
- [ ] If the route group has a guard, does it also have `prerender: false` in `+config.ts`?
- [ ] Does the form validate client-side before calling the API?
- [ ] Are error messages user-friendly (no raw API errors rendered)?
- [ ] Are tokens fetched via `supabase.auth.getSession()` immediately before use?
- [ ] Does any admin-gated UI also have a server-side gate?

---

## Update Log

Update this section when new security conventions are added:

- **2026-05-07** — Initial doc. Covers profile page, auth flow, and current route structure.
- **2026-05-08** — Updated route guards: `RequireAuth`/`RequireGuest` replaced by `+guard.ts` server-side guards. Added `prerender: false` requirement and admin `isAdmin` source clarification.
