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
apps/web/src/lib/auth/supabaseClient.ts          — current browser client (replace with SSR-aware client)
apps/web/src/features/auth/guards/AuthGuard.tsx  — client-side guard (to be replaced by +guard.ts)
apps/web/src/features/auth/guards/RequireAuth.tsx
apps/web/src/features/auth/guards/RequireGuest.tsx
apps/web/pages/(user)/+Layout.tsx
apps/web/pages/(auth)/+Layout.tsx
apps/web/pages/(user)/+guard.ts                  — new file
apps/web/pages/(auth)/+guard.ts                  — new file
```

## Acceptance Checks

- Hard refresh on `/profile` renders the page immediately — no "Checking your session..." flash.
- Guest visiting `/profile` is redirected to `/signin` via HTTP 302 (server-side, before HTML is sent).
- Signed-in user visiting `/signin` is redirected to `/` server-side.
- OAuth callback (`/auth/callback`) correctly sets the session cookie after sign-in.
- Token refresh works transparently — expired tokens are refreshed via the cookie flow.
- All existing profile page features continue to work (account form, notifications, delete, etc.).
