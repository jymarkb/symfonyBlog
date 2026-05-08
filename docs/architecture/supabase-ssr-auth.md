# Supabase SSR Auth

## Purpose

Migrate the frontend from `supabase-js` localStorage-based sessions to `@supabase/ssr` cookie-based sessions, enabling true server-side auth gating in Vike via `+guard.ts` files.

- Eliminates the "Checking your session..." loading flash on hard refresh.
- Enables PHP-style server-side auth gates: Vercel SSR validates the session before rendering any protected page.
- Required before production deployment on Vercel — localStorage is client-only and cannot be read during SSR.

## Deployment Context

- **Frontend:** Vercel (Vike + React SSR, Node.js serverless)
- **Backend:** Render (Laravel 12 JSON API, JWT auth via Supabase JWKS)
- **Auth:** Supabase (currently localStorage, migrating to cookies)

## Implementation Progress

```text
1. @supabase/ssr setup         done — @supabase/ssr@0.10.3 installed, supabaseClient.ts replaced with
                               createBrowserClient, supabaseServerClient.ts factory created with
                               getAll/setAll cookie adapter (read-only in guard context)
2. Server-side guards          done — pages/(user)/+guard.ts redirects guests to /signin server-side,
                               pages/(auth)/+guard.ts redirects authenticated users to / with /reset-password
                               bypass; RequireAuth/RequireGuest removed from layouts; guards marked @deprecated
3. Prerender config            done — prerender: false in pages/(user)/+config.ts and pages/(auth)/+config.ts
                               so guards run at request time not build time
4. Session context update      done — CurrentSessionProvider uses same supabase import; createBrowserClient
                               reads cookies on INITIAL_SESSION, eliminating localStorage loading flash
5. Server-side data fetching   done — pages/(user)/profile/+data.ts fetches profile, comments, and
                               reading-history in parallel server-side; components accept initialX props;
                               useProfileFetch hook accepts initialData; zero loading flash on /profile
6. Auth callback update        pending — verify /auth/callback sets cookies correctly post-OAuth
7. Tests and verification      pending — manual verification of no loading flash, correct server redirects,
                               cookie persistence after OAuth
```

## Route and Auth

Current:
- `pages/(user)/+Layout.tsx` wraps children in `<RequireAuth>` (client-side guard)
- `pages/(auth)/+Layout.tsx` wraps children in `<RequireGuest>` (client-side guard)
- Session stored in localStorage by Supabase default

Target:
- `pages/(user)/+guard.ts` — server-side guard, reads session cookie, redirects to `/signin` if invalid
- `pages/(auth)/+guard.ts` — server-side guard, reads session cookie, redirects to `/` if already authenticated
- Session stored in cookies by `@supabase/ssr`
- `RequireAuth` and `RequireGuest` components removed or kept as fallback only

## Key Files

```text
apps/web/src/lib/auth/supabaseClient.ts          — browser client (createBrowserClient from @supabase/ssr)
apps/web/src/lib/auth/supabaseServerClient.ts    — server client factory (read-only cookie adapter)
apps/web/src/features/auth/guards/AuthGuard.tsx  — @deprecated, replaced by +guard.ts
apps/web/src/features/auth/guards/RequireAuth.tsx — @deprecated, replaced by +guard.ts
apps/web/src/features/auth/guards/RequireGuest.tsx — @deprecated, replaced by +guard.ts
apps/web/pages/(user)/+Layout.tsx               — wraps in AppShell only, no auth wrapper
apps/web/pages/(auth)/+Layout.tsx               — wraps in AuthShell only, no auth wrapper
apps/web/pages/(user)/+guard.ts                 — server-side auth gate for protected routes
apps/web/pages/(auth)/+guard.ts                 — server-side guest gate for auth routes
apps/web/pages/(user)/+config.ts                — prerender: false (required for guards)
apps/web/pages/(auth)/+config.ts                — prerender: false (required for guards)
apps/web/pages/(user)/profile/+data.ts          — SSR data fetch: profile + comments + reading-history
apps/web/pages/+onBeforeRender.ts               — global SSR hook: GET /api/v1/session → pageContext.initialUser
apps/web/pages/+config.ts                       — passToClient: ['initialUser']
apps/web/src/vike.d.ts                          — Vike PageContext type augmentation
```

## Vike Hook Execution Order

In Vike 0.4, server-side hooks execute in this order per request:

```
guard() → data() → onBeforeRender() → render()
```

**Critical constraint:** `data()` runs **before** `onBeforeRender()`. Any value set on `pageContext` inside `onBeforeRender` is not yet available when `data()` executes.

This means `+data.ts` must read the Supabase session cookie independently via `createSupabaseServerClient` — it cannot rely on a token passed by `onBeforeRender`. As a result, the profile page performs three independent session reads per SSR request:

| Hook | Why it reads the session |
|------|--------------------------|
| `guard()` | Check whether the user is authenticated; redirect if not |
| `data()` | Get the access token to call Laravel API endpoints |
| `onBeforeRender()` | Get the access token to call `GET /api/v1/session` and populate `pageContext.initialUser` for the Header |

This redundancy is unavoidable without a custom Vike server (which would allow `pageContextInit` to be populated before any hook runs).

## Acceptance Checks

- Hard refresh on `/profile` renders the full page — header with avatar, account form, comment history, reading history — with zero loading flash. All content present in view-source HTML.
- Guest visiting `/profile` is redirected to `/signin` via HTTP 302 (server-side, before HTML is sent) — visible in DevTools Network tab as a 302 response with no HTML body.
- Signed-in user visiting `/signin` is redirected to `/` server-side.
- Main site header renders with correct avatar initial, display name, and account menu on first HTML response across all pages — no blank span flash on any page.
- OAuth callback (`/auth/callback`) correctly sets the session cookie after sign-in. (pending verification)
- Token refresh works transparently — expired tokens are refreshed via the cookie flow.
- All existing profile page features continue to work (account form, notifications, delete, etc.).
