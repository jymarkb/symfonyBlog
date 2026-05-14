# QA Checklist

## Purpose

This is the master checklist that `-qa-frontend-` and `-qa-backend-` agents read before reviewing any feature or flow. It is organized by area — agents must apply every relevant section, not just the sections that seem obvious for the surface being reviewed.

The list is built from OWASP API Top 10, common React/Laravel QA gaps, and issues found in this specific codebase. Update it whenever a QA round surfaces a class of bug that was not in the list.

---

## Backend QA Checklist (Laravel API)

### 1. Authentication and authorization

- [ ] Every private route is protected by the global default-deny (`Authenticate::using('api')` appended to api group) — guest returns 401, not 500 or 200; new routes are protected unless explicitly placed in the `withoutMiddleware` public block
- [ ] Every admin route uses `->middleware('permission:admin')` — regular user returns 403, not just 401; no one-off middleware created instead
- [ ] Controllers scope all reads and writes to `$request->user()` — never a request-supplied user ID
- [ ] BOLA check: can authenticated user A access user B's record by guessing an ID or handle? (OWASP API #1)
- [ ] BFLA check: can a regular user call an admin endpoint by bypassing the middleware? (OWASP API #5)
- [ ] JWT: is `exp` claim validated? Is issuer validated? Is audience validated?
- [ ] JWT algorithm confusion: is the `alg` header hardcoded server-side (not read from the token)? The library must not accept `alg: none` or allow RS256→HS256 downgrade using the public key as an HMAC secret.
- [ ] Session fixation: is the session/token regenerated after a successful login, not reused from the pre-login state?
- [ ] Is the auth driver consistently applied to all relevant route groups?

### 2. Mass assignment and model safety (OWASP API #3)

- [ ] `$fillable` includes only columns the client is allowed to set
- [ ] `role`, `email`, `supabase_user_id`, `handle` are NOT in `$fillable`
- [ ] Sensitive fields are in `$hidden` to prevent accidental model serialization leakage
- [ ] No `fill()` or `create()` called with raw request data for privileged fields
- [ ] Explicit column assignment (`$model->field = ...`) used for system-managed fields

### 3. Resource field exposure

- [ ] Every Resource exposes only the fields the client actually needs
- [ ] `role` is absent from user-facing Resources that are not the session endpoint
- [ ] `supabase_user_id` is absent from every Resource
- [ ] Internal system fields (foreign keys, audit timestamps) are not exposed unless required
- [ ] Test assertions use `assertJsonMissingPath` for every sensitive field — not just positive checks
- [ ] Session Resource specifically: check `data.user.role`, `data.user.supabase_user_id` are absent if not intended

### 4. Input validation

- [ ] All inputs are validated: type, presence, length (`max:255` on free text), format
- [ ] URL fields use `url:https` not plain `url` — blocks HTTP and data: URIs (SSRF risk) (OWASP API #7)
- [ ] Enum/option fields use `in:value1,value2,...` — no open string inputs for constrained sets
- [ ] File uploads (if any): MIME type, extension, max size — never trust `Content-Type` header alone
- [ ] No injection risk in raw query fragments (use query builder bindings, not string concat)
- [ ] Case-insensitive text search uses `LOWER(column) LIKE ?` with `strtolower()` on the PHP side — plain `LIKE` is case-sensitive on PostgreSQL (unlike MySQL/SQLite) and will silently miss results when the stored value uses mixed case
- [ ] LIKE wildcard inputs are escaped with `addcslashes($term, '%_')` before being wrapped in `%...%` — unescaped `%` and `_` in user input become metacharacters and match unintended rows
- [ ] Request body size is not unlimited — check for missing `max` rules on text fields

### 5. Rate limiting (OWASP API #4)

- [ ] Every mutation route (POST, PATCH, PUT, DELETE) has a `throttle:` middleware applied
- [ ] GET endpoints that trigger expensive operations (DB writes on first call, external API calls) are also rate-limited
- [ ] Named limiters are registered in `AppServiceProvider` — not inline on routes
- [ ] Rate limit tests pre-fill the cache bucket using `md5($limiterName . $limitKey)` to match `ThrottleRequests` key format
- [ ] 429 tests assert `assertTooManyRequests()`, not just a status code
- [ ] Limits are appropriately tight on destructive operations (e.g., account delete: 5/min vs mutations: 60/min)

### 6. API response consistency

- [ ] 401 responses use the canonical shape `{"error":"unauthenticated","message":"A valid authentication token is required."}` — centralized in `bootstrap/app.php`, not per-middleware
- [ ] 403 responses use the canonical shape `{"error":"forbidden","message":"You do not have permission to access this resource."}` — same centralized handler
- [ ] Error responses use a consistent shape across all endpoints — `{message: string}` or `{errors: {field: [...]}}`
- [ ] Validation error responses return 422 with `{errors: {field: [...]}}` from Laravel's default validator
- [ ] 401 for unauthenticated, 403 for unauthorized (authenticated but not permitted), 404 for not found, 422 for validation
- [ ] Collections are wrapped consistently — `AnonymousResourceCollection` not bare arrays
- [ ] Pagination applied to any list endpoint that could return unbounded rows
- [ ] Response field names exactly match frontend TypeScript type field names

### 7. Test coverage

- [ ] Every `/api/v1` route has an entry in `ApiRouteCoverageTest.php`
- [ ] Every route has a behavior test: guest, signed-in user, admin as applicable
- [ ] Private user routes: guest → 401, signed-in → correct response
- [ ] Admin routes: guest → 401, user → 403, admin → correct response
- [ ] Public routes: unauthenticated → correct response, correct shape
- [ ] Tests assert response shape, not just status code
- [ ] Isolation tests: user A's data is not returned when user B is authenticated
- [ ] Rate limit tests present for every throttled route
- [ ] `assertJsonMissingPath` assertions for every field that must NOT be exposed

### 8. HTTP response headers

- [ ] `Cache-Control: no-store` on all authenticated API responses — prevents sensitive data being cached in shared proxies or browser disk cache
- [ ] `Content-Type: application/json` enforced — the API must reject `application/x-www-form-urlencoded` requests on JSON-only endpoints
- [ ] CORS origin whitelist in use — `Access-Control-Allow-Origin: *` must not be combined with `Access-Control-Allow-Credentials: true`
- [ ] Security headers present: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`

### 9. Query hygiene

- [ ] No N+1 queries on collection endpoints — use `with()` or `withCount()` in the query, not `load()`/`loadCount()` after
- [ ] `loadCount` is acceptable on single-record endpoints; `withCount` is preferred on collections
- [ ] Only columns the endpoint uses are fetched — no `SELECT *` on large tables
- [ ] Frequently filtered columns (`user_id`, `handle`, foreign keys) have DB indexes in migrations

### 10. Race conditions and data integrity

- [ ] Unique-constraint operations use `firstOrCreate` or a DB transaction — not read-then-write
- [ ] Loops with per-iteration DB queries have a maximum iteration cap
- [ ] Foreign key constraints correctly use `constrained()->cascadeOnDelete()` or `nullOnDelete()` — no orphan rows
- [ ] Soft deletes (if used) do not leak deleted records into public queries

### 11. Security misconfiguration (OWASP API #8)

- [ ] Verbose error messages and stack traces are not returned in JSON responses in production
- [ ] CORS is configured — only allowed origins can call the API
- [ ] Debug mode is off in production config
- [ ] No secrets or credentials logged at any log level
- [ ] Undocumented or debug-only routes are not reachable in production (OWASP API #9)

---

## Frontend QA Checklist (React + TypeScript + Vike)

### 1. Route guards and auth state

- [ ] All pages inherit route security from their route group's `accessLevel` config — no per-page auth check needed or should be added
- [ ] New route groups declare `accessLevel` in `+config.ts` and `prerender: false` — guards cannot run at build time
- [ ] Any `+data.ts` that calls the backend uses `resolveServerAuth(pageContext)` from `src/lib/auth/serverAuth.ts` — not a direct `createSupabaseServerClient` or `getSession()` call
- [ ] Special-case bypass routes (`/reset-password`, `/auth/callback`) are listed in `GUEST_GATE_BYPASS` in `pages/+guard.ts` — not handled inside the page component
- [ ] Admin-gated UI checks `isAdmin` from `useCurrentSession()` or `pageContext.initialUser.isAdmin` for display — but never treats this as the sole gate; server-side `accessLevel: 'admin-required'` is always the real gate
- [ ] Unauthenticated API calls (401 responses) redirect to `/signin` — not just show an error message
- [ ] Components that receive SSR data via `initialX` props render immediately without a loading flash — verify by checking view-source HTML for content

### 2. Auth flow edge cases

- [ ] OAuth / social auth: error messages are generic — raw provider error strings (`invalid_grant`, `JWT expired`, provider name) are never shown to the user
- [ ] `pendingAuthProvider` in `sessionStorage` is cleared on both success AND failure — a failed OAuth redirect does not leave a stale key
- [ ] `lastAuthProvider` in `localStorage` is set after a successful auth, not before
- [ ] After OAuth redirect, the `?code=` or `#access_token=` fragment is removed from the URL bar before any redirect (use `history.replaceState`)
- [ ] Token fragments are stripped even on the error path — they must not linger in browser history
- [ ] Password reset flow: recovery token exchange fires `SIGNED_IN` — any `RequireGuest` guard must tolerate this without redirecting the user away mid-flow
- [ ] Logout: Supabase session is ended, all relevant `localStorage`/`sessionStorage` keys are cleared, in-memory auth state is reset
- [ ] "Last used provider" badge appears on the sign-in page, not just the sign-up page, if the infrastructure exists

### 3. Error boundaries and runtime safety

- [ ] React error boundaries are in place at the page or feature level — an unhandled render error must not crash the entire app
- [ ] Root layout, user layout, and admin layout each wrap their content in `<ErrorBoundary>` with `<ErrorPage code={500} />` as fallback — a provider crash must not produce a blank screen
- [ ] API response shapes are validated at the boundary before use — never call `.map()` on data that might not be an array (use type guards or Zod where critical)
- [ ] Optimistic UI updates roll back on mutation failure — UI must not stay in the "success" state after an API error
- [ ] `aria-live` region present for dynamically injected messages — success/error toasts and inline alerts must be announced to screen readers

### 4. Form validation and submission

- [ ] All required fields validated client-side before the API call — no network request for obviously invalid input
- [ ] Field errors shown simultaneously (not one at a time on sequential submit)
- [ ] Submit button disabled while the request is in flight — prevents double-submit
- [ ] After successful submit: form state reset or navigation occurs — stale values do not persist
- [ ] URL fields validated for HTTPS scheme, not just URL format
- [ ] Handle fields: `@` prefix normalized (prepended if missing, not shown as error for user convenience)
- [ ] Checkboxes and dropdowns with no state, no handler, and no API wiring are identified as dead UI — must be either wired or removed
- [ ] Terms/consent checkboxes are wired and validated before the form submits

### 5. Async state coverage

- [ ] Every data-fetching component handles all four states explicitly: loading, error, empty, data
- [ ] Network failure (no response) is handled separately from API error (response with error status)
- [ ] 429 Too Many Requests shows a user-friendly message — not a raw status code or a blank page
- [ ] 401 on a private page triggers a sign-out and redirect — not just an error banner
- [ ] Retry or refresh affordance available where appropriate — a "Try again" button must be rendered alongside error messages, not just a message that says "please try again" with no button
- [ ] SSR pages with client-side filtering use a `hasMounted` ref guard to skip the initial `useEffect` fetch — without this the page double-fetches on hydration (SSR data is already in state from `useData()`)

### 6. Error message hygiene

- [ ] No raw API error messages, Supabase error strings, or stack traces rendered in the UI
- [ ] All user-visible error text is generic and actionable (e.g., "We couldn't sign you in. Please try again.")
- [ ] Detailed error context goes to `console.error` for debugging — the UI message stays generic
- [ ] Network error messages distinguish between "you're offline" and "server error" where possible

### 7. Token and credential handling

- [ ] Access tokens retrieved from `supabase.auth.getSession()` immediately before each API call — never stored in component state or a ref
- [ ] No token, password, or credential passed in a URL query string or hash
- [ ] No `console.log` calls that include tokens, session objects, or user PII
- [ ] `Authorization: Bearer ...` header is the only channel for token transmission

### 8. Security risks in the browser

- [ ] No `dangerouslySetInnerHTML` with user-supplied content — if used, content must be sanitized
- [ ] No open redirect via URL params (e.g., `?redirect=https://evil.com`) — validate redirect targets against an allowlist
- [ ] Client-side role checks (`isAdmin`) are used only to conditionally show/hide UI — never to gate actual access
- [ ] No sensitive data (tokens, passwords, PII) stored in `localStorage` beyond what auth libraries require

### 9. Performance and correctness

- [ ] No duplicate API calls on mount — check for multiple `useEffect` hooks fetching the same data
- [ ] `useEffect` dependency arrays are complete — missing deps cause stale closures or infinite loops
- [ ] Concurrent requests for the same resource are deduplicated or the last one wins (no race between two fetches)
- [ ] Lists with unbounded length have pagination or virtualization
- [ ] Large data sets do not cause layout shifts (render skeleton with known height)
- [ ] Aggregate calculations (average, sum, min/max) that operate on a filtered subset reduce over that filtered subset — not over the full array with a denominator derived from the subset; `fullArray.reduce(...) / filteredSubset.length` silently produces wrong averages when the arrays differ in length
- [ ] Props declared in a component's type are actually destructured and used — unused props that survive in the interface silently accept values from the parent without effect; review `Props` type and destructured parameters together

### 10. Accessibility basics

- [ ] Interactive elements that are icon-only (no visible text) have `aria-label` or `title` — this is a 🔴 bug
- [ ] Links and buttons with visible text children should also have a descriptive `aria-label` attribute for screen readers — flag as 🟡 gap, never 🔴 bug
- [ ] Form inputs have associated `<label>` elements — not just placeholder text
- [ ] Error messages are associated with their input via `aria-describedby`
- [ ] Focus returns to a logical element after dialog close or async state change
- [ ] Page is navigable by keyboard alone — no focus traps outside of modals

### 11. Responsive and mobile

- [ ] Layout does not overflow or break at 375px, 768px, and 1280px widths
- [ ] Touch targets (buttons, links) are at least 44×44px on mobile
- [ ] Form fields do not require horizontal scrolling on narrow screens
- [ ] Two-column grids collapse correctly at the intended breakpoints

### 12. TypeScript and type safety

- [ ] No `any` or `as unknown as T` casts on API response data — types match the Resource shape
- [ ] Optional fields (nullable columns) typed as `T | null`, not just `T`
- [ ] Non-null assertions (`!`) only used where null is structurally impossible — not as a workaround for missing guards
- [ ] `tsc --noEmit` produces zero errors after any change
- [ ] All types for a feature live in one file: `src/features/<feature>/<feature>Types.ts` — no split type files (e.g. no separate `sessionTypes.ts` or `contextTypes.ts` alongside the main types file)
- [ ] No feature-specific types placed in `src/types/` — that folder is for genuinely cross-feature shared types only
- [ ] Import style matches the export style — named exports use `import { Component }`, default exports use `import Component`; a mismatch compiles in some bundler configs but silently imports `undefined` at runtime

### 13. Dead and inconsistent UI

- [ ] Every visible checkbox, dropdown, toggle, or button either does something or is explicitly disabled with an explanation
- [ ] Placeholder/stub UI (disabled buttons, hardcoded "Coming soon" text) is intentional and documented — not accidentally shipped unfinished
- [ ] Feature parity between similar pages (e.g., "Last used" badge on sign-in AND sign-up, not just one)

### 14. Component placement

- [ ] Components with a feature word in the name (`Auth`, `Profile`, `Post`, `Dashboard`) live inside that feature's `components/` folder — not in `components/ui/` or `components/common/`
- [ ] `components/ui/` contains only truly generic, stateless primitives with no feature-domain knowledge
- [ ] `components/common/` is used only when a component is actively shared by 2+ features — not preemptively
- [ ] No feature imports a component from another feature's folder — cross-feature shared components go to `components/common/` first

---

## Auth Flow Specific Checklist

Use this section when reviewing any sign-in, sign-up, password reset, or OAuth callback flow.

### Sign-up

- [ ] All required fields validated before submit (display name, handle, email, password, terms)
- [ ] Error messages do not confirm whether an email already exists ("User already registered" must not be shown)
- [ ] After signup: confirmation screen shown, form fields cleared
- [ ] Email confirmation link expiry handled gracefully
- [ ] Handle uniqueness validated client-side AND enforced server-side

### Sign-in

- [ ] Wrong credentials → generic message, no "invalid password" vs "user not found" distinction
- [ ] Admin vs user redirect handled correctly on success
- [ ] Social sign-in errors use generic messages — no provider-specific error strings
- [ ] Already-authenticated users redirected away from the sign-in page without seeing the form

### Password reset

- [ ] Recovery token flow does not conflict with `RequireGuest` guard
- [ ] Recovery token is consumed once — replay returns an error, not a new session
- [ ] `?code=` or recovery hash is stripped from the URL after exchange
- [ ] Reset success signs the user out and redirects to sign-in — no auto-login after reset

### OAuth callback

- [ ] `state` parameter generated before redirect and validated on callback — absence or mismatch must abort the flow (CSRF on OAuth)
- [ ] `redirect_uri` used in the authorization request exactly matches the registered URI — no open redirect
- [ ] Authorization code is single-use — replay must return an error, not a new session
- [ ] Both PKCE (`?code=`) and implicit (`#access_token=`) flows handled
- [ ] Token exchange errors show user-friendly message — no raw Supabase strings
- [ ] Callback URL is cleaned (no `?code=` or `#` remaining) before the final redirect
- [ ] `pendingAuthProvider` cleaned up in both success and failure paths
- [ ] Session returned from `exchangeCodeForSession` or `setSession` is used directly — no redundant `getSession()` call after a successful exchange (extra round trip, no benefit)

---

## Update Log

Update this section when new QA checks are added:

- **2026-05-07** — Initial checklist. Derived from OWASP API Top 10 (2023), OWASP WSTG, OWASP ASVS, RFC 8725 JWT Best Practices, WCAG 2.1, QA rounds on profile page and auth flows, and practical bugs found in this codebase.
- **2026-05-08** — Updated route guards section: `RequireAuth`/`RequireGuest` replaced by `+guard.ts` server-side guards; added `prerender: false` check and `initialX` prop SSR hydration check.
- **2026-05-08** — Global security centralization. Frontend: per-group guards replaced by single `pages/+guard.ts` reading `accessLevel`; `resolveServerAuth()` is the only permitted server-side session resolver. Backend: default-deny global auth; `auth:api`/`admin` references replaced with default middleware + `permission:admin`; canonical 401/403 body shapes added to API response consistency checks.
- **2026-05-09** — OAuth callback: added check for redundant `getSession()` call after `exchangeCodeForSession`/`setSession` — use the session returned directly. Error boundaries: `ErrorBoundary` must wrap root, user, and admin layouts with `<ErrorPage code={500} />` as fallback. Dead guard cleanup: `RequireAuth` and `RequireGuest` removed; `RequireAdmin` is the only permitted client-side fallback guard.
- **2026-05-09** — Component placement: added section 14 — feature-named components must live in their feature folder, not `components/ui/`. Types consolidation: one types file per feature, no split sub-files. Cross-feature components go to `components/common/` only when real reuse exists.
- **2026-05-12** — Archive page QA (5 rounds). New backend checks: PostgreSQL LIKE is case-sensitive (must use `LOWER(col) LIKE ?` + `strtolower()`); LIKE inputs must be wildcard-escaped with `addcslashes($term, '%_')`. New frontend checks: error state must include a retry button (not just text); SSR pages need a `hasMounted` ref guard to prevent double-fetch on hydration; import style must match export style (named vs default mismatch silently imports undefined); aggregates over a filtered subset must reduce over that subset (not the full array); unused Props interface fields must be removed from the type and call site.
