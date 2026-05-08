# Security Conventions

## Purpose

This document defines the security baseline for the current working features. It is a living document — update it when new features introduce new security concerns. Do not document security for features that do not exist yet.

Agents must read this file alongside `techstack.md` before planning or implementing any backend or frontend work.

---

## Backend Security (Laravel)

### Authentication and authorization

- All `/api/v1/*` routes require authentication by default. `Authenticate::using('api')` is appended globally to the `api` middleware group in `bootstrap/app.php` — no per-route or per-group `auth:api` declaration is needed or should be added.
- Public routes must be explicitly opted out using `Route::withoutMiddleware(Authenticate::using('api'))`. Opt-outs must appear in the clearly marked public block in `routes/api.php`. Adding a route outside that block automatically makes it protected.
- Admin routes use `->middleware('permission:admin')`. The `permission` alias resolves to `RequirePermission`, which accepts any permission name: `permission:comment`, `permission:moderate_comments`, etc. Do not create new one-off middleware for permissions — use the `RequirePermission` pattern.
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

- A single global `pages/+guard.ts` enforces all route-level security server-side before any HTML is rendered. It reads `pageContext.config.accessLevel` from the route's inherited config.
- Access levels are declared in route group `+config.ts` files and inherited by every page in that group:
  - `accessLevel: 'public'` — no auth required (default, set in `pages/+config.ts`)
  - `accessLevel: 'guest-only'` — redirects authenticated users to `/` (set in `pages/(auth)/+config.ts`)
  - `accessLevel: 'auth-required'` — redirects guests to `/signin` (set in `pages/(user)/+config.ts`)
  - `accessLevel: 'admin-required'` — redirects guests to `/signin`, non-admins to `/` (set in `pages/(admin)/+config.ts`)
- Adding a new page to an existing route group inherits its `accessLevel` automatically. No per-page security code is needed.
- Adding a new route group requires a `+config.ts` with the appropriate `accessLevel` and `prerender: false`.
- `/reset-password` and `/auth/callback` bypass the `guest-only` gate — the Supabase recovery token flow fires `SIGNED_IN` before those pages load.
- `RequireAuth` and `RequireGuest` components are deprecated. Do not use them in new pages.
- `RequireAdmin` in `pages/(admin)/+Layout.tsx` is a client-side fallback for hydration only — the real gate is `accessLevel: 'admin-required'` enforced by the global server-side guard.
- Session resolution for `guard()`, `+data.ts`, and `+onBeforeRender.ts` must all use `resolveServerAuth(pageContext)` from `src/lib/auth/serverAuth.ts`. Never call `createSupabaseServerClient` or `supabase.auth.getSession()` directly in a page hook.

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
- [ ] Is the route inside the explicit public `withoutMiddleware` block, or left as default-protected?
- [ ] If admin-only, does it use `->middleware('permission:admin')` (not a new one-off middleware)?
- [ ] Does the controller use `$request->user()` to scope data — never a request-supplied ID?
- [ ] Are all inputs validated (type, length, format, enum)?
- [ ] Is a throttle applied to any mutation method?
- [ ] Does the Resource expose only the fields the client needs?
- [ ] Is the route added to `ApiRouteCoverageTest.php`?
- [ ] Are guest / auth / admin behavior tests written, including a body-shape assertion on 401/403?

### New frontend page or form
- [ ] Is the page inside the correct route group folder — does it inherit the right `accessLevel`?
- [ ] If creating a new route group, does its `+config.ts` declare `accessLevel` and `prerender: false`?
- [ ] Does any `+data.ts` use `resolveServerAuth(pageContext)` from `src/lib/auth/serverAuth.ts` instead of calling Supabase directly?
- [ ] Does the form validate client-side before calling the API?
- [ ] Are error messages user-friendly (no raw API errors rendered)?
- [ ] Are tokens fetched from `auth.accessToken` returned by `resolveServerAuth()` — not a separate `getSession()` call?
- [ ] Does any admin-gated UI also have server-side enforcement via `accessLevel: 'admin-required'`?

---

## Update Log

Update this section when new security conventions are added:

- **2026-05-07** — Initial doc. Covers profile page, auth flow, and current route structure.
- **2026-05-08** — Updated route guards: `RequireAuth`/`RequireGuest` replaced by `+guard.ts` server-side guards. Added `prerender: false` requirement and admin `isAdmin` source clarification.
- **2026-05-08** — Global security centralization. Frontend: single `pages/+guard.ts` reads `accessLevel` from route config; `resolveServerAuth()` is the only permitted server-side session resolver. Backend: default-deny via `Authenticate::using('api')` globally appended; `EnsureAdmin` removed in favour of composable `RequirePermission`; 401/403 error shape centralized in `bootstrap/app.php`.
