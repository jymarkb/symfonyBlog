# Tech Stack & Coding Practices

## Purpose

This document is the primary reference for any agent planning or implementing work in this repo. Read it before writing a plan or generating code. It defines the exact tech stack, key patterns, and non-obvious conventions that apply across both apps.

---

## Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend language | PHP | 8.3 |
| Backend framework | Laravel | 12.x |
| Backend testing | Pest PHP | latest |
| Frontend framework | React | 19.x |
| Frontend meta-framework | Vike (SSR/CSR) | 0.4.x |
| Frontend language | TypeScript | 6.x |
| Frontend build | Vite | 8.x |
| Auth provider | Supabase Auth | — |
| Database | PostgreSQL | — |
| API format | JSON (Laravel JSON Resources) | — |
| Error telemetry | Sentry (planned) | Free tier (5k errors/month) |

---

## Backend Patterns (Laravel)

### Controller conventions

- Controllers live in `apps/api/app/Http/Controllers/Api/V1/`
- Admin controllers live in `apps/api/app/Http/Controllers/Api/V1/Admin/`
- Controllers only contain these methods: `index`, `show`, `store`, `update`, `destroy`
- No custom action methods (e.g. `comments()`, `history()`). Create a separate controller instead.
- Each resource gets its own controller — do not add sub-resource methods to parent controllers.

### Resource conventions

- Every API response is wrapped in a Laravel JSON Resource (`JsonResource` or `AnonymousResourceCollection`)
- Resources live in `apps/api/app/Http/Resources/`
- Field names in resources must exactly match the model column names and the frontend TypeScript types
- Always check the model `$fillable` and migration column names match the resource field names

### Service conventions

- Business logic lives in `apps/api/app/Services/`
- Services are organised by domain: `Services/Profile/`, `Services/Post/`, `Services/Auth/`, etc.
- Services are injectable via Laravel's service container
- **Controllers are thin** — they validate input (via FormRequest), call one service method, and return a resource. No business logic inside a controller.
- **Models are thin** — they define columns (`$fillable`, `$hidden`, `casts()`), relationships, and nothing else. No business logic inside a model.
- Any logic that decides *what* to do with data (auto-set `published_at`, wrap in a transaction, fire an event, sync a pivot) belongs in a service method.
- Every controller that writes data must go through a service. Read-only controllers (single-table, no logic) may query the model directly only when no transformation or decision is needed.

### Repository conventions

- Repositories live in `apps/api/app/Repositories/<Domain>/`
- A repository owns all database queries for one model — filtering, sorting, eager loading, pagination
- Services call repositories to fetch or persist data; services never build Eloquent queries directly
- Repositories are injected into services via the constructor
- **Not required yet** — introduce a repository when a service method starts building complex queries (multiple `where`, `with`, `withCount`, search, caching). Until then, the service may call the model directly.

```php
// app/Repositories/Post/PostRepository.php
class PostRepository
{
    public function getPublished(): LengthAwarePaginator
    {
        return Post::query()
            ->where('status', 'published')
            ->with(['user', 'tags'])
            ->withCount(['comments', 'stars'])
            ->latest()
            ->paginate(20);
    }
}

// app/Services/Post/PostService.php
class PostService
{
    public function __construct(private PostRepository $posts) {}

    public function listPublished(): LengthAwarePaginator
    {
        return $this->posts->getPublished();
    }
}
```

### Caching conventions

- Cache driver: Laravel `Cache` facade (configured per environment — Redis in production, `array` in tests)
- **Repository owns cache reads** — `Cache::remember()` wraps the query inside the repository method
- **Service owns cache writes/invalidation** — `Cache::forget()` is called from the service after a write action completes
- Controllers and models never touch the cache directly

#### Cache key format

```php
posts.published.{md5(serialize($filters))}   // listing with filters
posts.slug.{slug}                              // single post by slug
```

Always use a consistent prefix per domain so all related keys can be flushed together.

#### TTL guidelines

| Data type | TTL | Reason |
|---|---|---|
| Post listing | 5 minutes | changes when posts are published or updated |
| Post detail | 10 minutes | changes less frequently than listings |
| Session / user | never cached | always fresh from Supabase |

#### Invalidation rules

- When a post is **created** → flush the listing cache (`posts.published.*`)
- When a post is **updated** → flush that post's detail cache + listing cache
- When a post is **deleted** → flush that post's detail cache + listing cache
- Use tagged cache (`Cache::tags(['posts'])`) if the driver supports it (Redis), so all post caches can be flushed in one call

#### Cache driver — environment decisions

| Environment | Driver | Why |
|---|---|---|
| Local | `database` | matches production behaviour |
| Production (Render) | `database` | Render PostgreSQL — persistent, shared between web + cron |
| Testing | `array` | never persists between tests |

**Do not use `file` or `redis` on Render free tier** — file cache is wiped on every deploy/restart (no persistent disk), and Render's free Redis Key Value instance is volatile (wiped on any restart). Both are unreliable.

**Upgrade path** — when traffic justifies Redis, set `CACHE_DRIVER=redis` + `REDIS_URL=<Upstash>`. No application code changes required — the `Cache` facade is driver-agnostic.

#### Test environment

- Set `CACHE_DRIVER=array` in `.env.testing` so cache does not persist between tests
- Always call `Cache::flush()` in `tearDown` for tests that exercise cached endpoints

#### Sample pattern

```php
// PostRepository — owns cache read
public function getBySlug(string $slug): Post
{
    return Cache::remember("posts.slug.{$slug}", now()->addMinutes(10), function () use ($slug) {
        return Post::query()
            ->with(['user', 'tags'])
            ->withCount(['comments', 'stars'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();
    });
}

// PostService — owns cache invalidation
public function update(Post $post, array $data): Post
{
    $post->update($data);
    Cache::forget("posts.slug.{$post->slug}");
    Cache::tags(['posts.published'])->flush(); // or key-based flush
    return $post;
}
```

### File storage conventions

- All file storage goes through Laravel's `Storage` facade — never write to the local filesystem directly
- Storage driver: `supabase` disk (S3-compatible) in all non-local environments
- Supabase Storage speaks the S3 protocol — configured via `AWS_*` env vars pointing to the Supabase endpoint
- Local development may use `FILESYSTEM_DISK=local` for simplicity
- **Render free tier has no persistent disk** — any file written locally is wiped on restart or redeploy. All uploads must go to Supabase Storage in production.

```php
// always use the facade — never file_put_contents or move_uploaded_file
Storage::disk('supabase')->put("covers/{$filename}", $file);
$url = Storage::disk('supabase')->url("covers/{$filename}");
```

Config in `config/filesystems.php`:
```php
'supabase' => [
    'driver'                  => 's3',
    'key'                     => env('AWS_ACCESS_KEY_ID'),
    'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
    'region'                  => env('AWS_DEFAULT_REGION'),
    'bucket'                  => env('AWS_BUCKET'),
    'endpoint'                => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', true),
    'url'                     => env('AWS_ENDPOINT').'/'.env('AWS_BUCKET'),
    'visibility'              => 'public',
],
```

### Domain event conventions

- Events live in `apps/api/app/Events/`
- Listeners live in `apps/api/app/Listeners/`
- Events are fired from a service method after a business action completes — never from a controller or model
- Each listener handles one side effect (notify subscribers, update search index, clear cache)
- **Not required yet** — introduce events when a single service action needs to trigger more than one side effect. Until then, side effects may be handled inline in the service method.

```php
// fired inside PostService::publish()
event(new PostPublished($post));

// app/Listeners/NotifySubscribers.php reacts independently
public function handle(PostPublished $event): void { ... }
```

### Model conventions

- Models live in `apps/api/app/Models/`
- Always include `HasFactory` trait when the model needs factory support
- `$fillable` must list every column the app writes to
- Define all relationships explicitly (`belongsTo`, `hasMany`, etc.)
- Use `casts()` method (not `$casts` property) for type casting in Laravel 12

### Migration conventions

- Column names in migrations must exactly match model `$fillable` fields and factory `definition()` keys
- Use `->nullable()->constrained()->nullOnDelete()` for optional foreign keys
- Use `->constrained()->cascadeOnDelete()` for required foreign keys
- Use `$table->timestamps()` — never declare `created_at` and `updated_at` separately
- **Never modify an existing migration file.** Migrations are immutable once created. If a column needs to be added, renamed, or removed, create a new migration (`php artisan make:migration alter_<table>_<description>`).
- The only exception is a migration that has never been committed and never been run on any environment — correct it before it ships. Once committed or deployed, treat it as immutable.
- When migration columns change on a fresh table: `php artisan migrate:rollback --step=N && php artisan migrate`

### Factory conventions

- Factories live in `apps/api/database/factories/`
- `php artisan make:factory` generates a stub — always replace the full file content
- Factory field names must match migration column names exactly

### Seeder conventions

- `DatabaseSeeder` must use find-or-create patterns to be safe to re-run
- Pattern: `Model::where('unique_field', value)->first() ?? Model::factory()->create([...])`
- Never use bare `Model::factory()->create()` for records with unique constraints in the seeder

### Route conventions

- All API routes are prefixed with `v1` — `Route::prefix('v1')`
- Auth-protected routes are inside `Route::middleware('auth:api')`
- Admin routes are inside `Route::middleware('admin')->prefix('admin')`
- Every new route must be added to `apps/api/tests/Feature/Routes/ApiRouteCoverageTest.php`
- Route order matters: more specific paths (e.g. `/profile/comments`) must come before wildcard paths (e.g. `/profile/{id}`)

### Auth conventions

- Auth is handled by Supabase — Laravel never stores passwords
- Supabase JWTs use ES256 (asymmetric) — validated via JWKS endpoint
- The `auth:api` guard is a custom Supabase guard defined in `AppServiceProvider`
- `JWT::$leeway = 30` is set to handle clock skew between servers
- Use `$request->user()` inside auth-gated controllers to get the authenticated user

#### Supabase token verification (`SupabaseTokenVerifier`)

Every authenticated request is validated by `app/Services/Auth/SupabaseTokenVerifier.php`. It:

- Fetches the Supabase JWKS public key and **caches it for 10 minutes** via `Cache::remember('supabase.jwks', ...)` — a brief Supabase outage does not immediately break active sessions
- Validates `iss` (issuer) against `services.supabase.issuer`
- Validates `aud` (audience) against `services.supabase.audience` — handles both string and array formats
- Validates `sub` (subject) is present
- Uses `firebase/php-jwt` for decoding — the algorithm is determined by the JWKS key type (ES256), not read from the token header

**Resilience note:** JWKS caching means the app survives short Supabase downtime for already-authenticated users. If Supabase is unreachable and the cache has expired, all new authentication attempts will fail with a 500. This is an acceptable trade-off at current scale — no fallback key store is implemented.

### Testing conventions (Pest PHP)

- Tests live in `apps/api/tests/Feature/`
- Structure: `Auth/`, `Profile/`, `Public/`, `Admin/`, `Routes/`
- Every route must have: one entry in `ApiRouteCoverageTest.php` + at least one behavior test
- Use `uses(RefreshDatabase::class)` at the top of each test file
- Use `actingAs($user, 'api')` to authenticate requests in tests
- Minimum behavior test cases per route type:
  - Private user route: guest → 401, authenticated → 200
  - Admin route: guest → 401, user → 403, admin → 200
  - Public route: public → 200, correct response shape

---

## Frontend Patterns (React + Vike + TypeScript)

### Folder structure

- Pages live in `apps/web/pages/` — Vike route files only (`+Page.tsx`, `+config.ts`)
- Feature code lives in `apps/web/src/features/<feature>/`
- Each feature folder may contain: `components/`, `api/`, `lib/`, `<feature>Types.ts`
- Shared layouts live in `apps/web/src/layouts/`
- App shell components (Header, Footer) live in `apps/web/src/components/layout/`
- API clients live in `apps/web/src/lib/api/`

### Component placement rule

Use this decision order when placing a new component:

```text
1. Used by only one feature?          → features/<name>/components/
2. Used by 2+ features, opinionated?  → components/common/
3. Generic primitive, no feature?     → components/ui/
4. App shell (Header, Footer)?        → components/layout/
```

**`components/ui/`** — generic primitives with no feature context. Build these once, reuse everywhere:
```text
Brand.tsx     (site logo — accepts optional href and className)
FormMessage   (generic error/success alert)
Button        (variants: primary, ghost, sm)
Input         (text, email, password, textarea, select)
Badge         (status variants: published, draft, review)
Tag           (color variants)
Avatar        (sm, lg)
Divider
ProgressBar
Pagination
```

**`components/common/`** — shared across 2+ features, more opinionated than primitives:
```text
PasswordStrengthHint  (used by auth forms AND profile password section)
ErrorPage             (404/500 shared template)
MaintenancePage       (maintenance mode page)
PostCard              (blog listing + dashboard top posts)
PostRow               (index page + archive listings)
CommentBlock          (post thread + profile history — when blog comments are built)
AuthorBlock           (post header + featured post + comments)
EmptyState            (404 + any empty list state)
Card                  (generic bordered container)
```

**`features/<name>/`** — owned by one feature, stays there even if it looks reusable:
```text
features/blog/       → PostLayout, TOC, Callout, RelatedPosts, Footnotes
features/auth/       → AuthConfirm, AuthIntro, OAuthButtons, AuthSidePanel
features/dashboard/  → StatCard, BarChart, TopPostsTable, ModerationBox
features/profile/    → ProfileHead, CommentHistory, DangerZone, Sidebar
features/contact/    → ContactChannel, TopicPills, FAQ
```

**Current state (what's been ported):**
- All auth components are correctly in `features/auth/` — `AuthConfirm`, `AuthIntro` moved there from `ui/`
- All profile components are correctly in `features/profile/`
- `PasswordStrengthHint` is in `components/common/` — used by both `features/auth/` and `features/profile/`
- `components/ui/` contains only truly generic primitives: `Brand.tsx`, `FormMessage.tsx`
- `features/profile/components/comment/` holds `CommentList` and `CommentSkeleton` — correct, they use profile-specific types

**Do not move components preemptively.** Only move when a component is actually needed by a second feature. Three similar components in different features is better than a premature abstraction in `common/`.

**Test for correct placement before creating a component:**
- Does the name include a feature word (`Auth`, `Profile`, `Post`, `Dashboard`)? → it belongs in that feature
- Is it truly stateless and has no feature-domain knowledge? → `components/ui/`
- Is it used or will be used by 2+ features? → `components/common/`
- When in doubt, start in the feature — move to `common/` only when real reuse happens

### API client conventions

- All API calls go through `apiRequest<T>()` from `@/lib/api/apiClient`
- Bearer tokens come from `supabase.auth.getSession()` — always check for `access_token` before calling
- API functions live in `src/features/<feature>/api/<feature>Api.ts`
- Response types are defined in `src/features/<feature>/<feature>Types.ts`

### CSS conventions

- `src/styles/theme.css` is the shared design system — tokens, base resets, shared UI primitives (btn, card, nav, footer, avatar, tag, field, divider, etc.). Do not add feature-specific styles here.
- Feature CSS files live alongside the feature: `src/features/<feature>/<feature>.css` or `src/components/common/<component>.css`
- **All CSS files must be registered in `src/styles/global.css` via `@import`** — never import CSS inside a component file. Component-level CSS imports are not included in SSR HTML and break on hard refresh.
- `global.css` is imported once in `pages/+Layout.tsx` — do not import it anywhere else.
- When adding a new feature CSS file: create it, then add an `@import` line to `src/styles/global.css`.

Current CSS files:
```text
src/styles/global.css          — entry point, imports everything
src/styles/theme.css           — shared design system
src/features/auth/auth.css     — auth shell, OAuth, side panel, callback animations
src/features/profile/profile.css — profile layout, comment history, danger zone, sidebar
src/components/common/errorPage.css — 404/500 error page layout
```

#### Design token naming convention

The design system uses a semantic token vocabulary. Always use these tokens via Tailwind utilities rather than raw colors:

| Token group | Tailwind class examples | Purpose |
|-------------|------------------------|---------|
| `paper` | `bg-paper`, `bg-paper-2`, `bg-paper-3` | Page and surface backgrounds (light → elevated) |
| `ink` | `text-ink`, `text-ink-2` … `text-ink-5` | Text hierarchy (strong → muted) |
| `rule` | `border-rule`, `divide-rule` | Dividers and borders |
| `accent` | `bg-accent`, `text-accent-ink`, `bg-accent-soft` | Brand teal — primary interactive color |
| `accent-2` | `text-accent-2` | Secondary purple accent |

Tokens switch automatically between light and dark mode — never hardcode hex values in component markup. Use hardcoded values only when a surface must stay dark regardless of theme (e.g. the auth side panel).

Fonts: `font-sans` → Poppins, `font-mono` → JetBrains Mono. Use `font-mono-tech` utility for the tighter-spaced monospace variant.

### Component conventions

- Page files (`+Page.tsx`) stay thin — compose feature components, do not inline page logic
- Feature components handle their own data fetching with `useEffect` + `useCallback`
- When server-side data is available via `+data.ts`, components accept optional `initialX` props to skip the initial fetch and render immediately from SSR data
- Always include the dependency array in `useEffect` — omitting it causes infinite fetch loops
- Loading, error, empty, and data states must all be handled explicitly
- Use `void` prefix for floating async calls: `void load()`

### TypeScript conventions

- All API response shapes have a corresponding TypeScript type in the feature's types file
- Field names in TypeScript types must exactly match the API JSON keys
- Use `type` not `interface` for data shapes
- **One types file per feature** — all types for a feature live in `src/features/<feature>/<feature>Types.ts`. Do not split types into sub-files (e.g. no `sessionTypes.ts` alongside `authTypes.ts`). If a sub-module needs types, import from the feature root types file.
- **`src/types/` is for cross-feature shared types only** — only use it when a type is genuinely needed by 2+ features and has no feature ownership. Do not put feature-specific types here.
- Context value types and status union types belong in the same feature types file as the domain types they reference — not in a separate context types file

### Auth conventions (frontend)

- Auth state for UI rendering comes from `useCurrentSession()` hook
- Access tokens for API calls come from `getAccessToken()` (`src/lib/auth/getAccessToken.ts`) — not from `useCurrentSession()`
- Password changes go through Supabase (`supabase.auth.updateUser`) — never through the Laravel API
- After password change: sign out then `window.location.replace('/signin')`
- **Session exchange rule:** After `supabase.auth.exchangeCodeForSession()` or `supabase.auth.setSession()`, use the session returned directly — never call `supabase.auth.getSession()` again immediately after. The exchange return value is the session; calling `getSession()` again is a redundant round trip.
- **Client-side guards:** Only `RequireAdmin` exists as a client-side guard (`src/features/auth/guards/RequireAdmin.tsx`) — used as a hydration fallback in `pages/(admin)/+Layout.tsx`. `RequireAuth` and `RequireGuest` have been removed; server-side `+guard.ts` is the only gate for those cases.

### Error boundary conventions

- `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) accepts an optional `fallback` prop — defaults to `<ErrorPage code={500} />` when omitted
- Root layout (`pages/+Layout.tsx`), user layout (`pages/(user)/+Layout.tsx`), and admin layout (`pages/(admin)/+Layout.tsx`) all wrap their content in `<ErrorBoundary>` — a provider or shell crash shows the 500 page instead of a blank screen
- Auth layout (`pages/(auth)/+Layout.tsx`) already has its own `<ErrorBoundary>`
- `AppShell` wraps `<main>` in `<ErrorBoundary>` — Header and Footer remain visible even if page content crashes
- When adding a new top-level layout, always wrap with `<ErrorBoundary>`
- **Sentry (planned):** When added, swap `console.error` in `ErrorBoundary.componentDidCatch` with `Sentry.captureException(error)`. Use `-implement- sentry frontend` and `-implement- sentry backend` to scope the work. Free tier: 5k errors/month, 10k performance transactions/month.

### SSR auth patterns (Vike)

- Auth library: `@supabase/ssr` — `createBrowserClient` in the browser, `createSupabaseServerClient` on the server
- **Server-side guards:** Protected route groups use `+guard.ts` files — the only permitted client-side fallback guard is `RequireAdmin`. Guards run at request time on the server before any HTML is rendered.
  - `pages/(user)/+guard.ts` — redirects guests to `/signin`
  - `pages/(auth)/+guard.ts` — redirects authenticated users to `/`, with `/reset-password` bypass
- **`prerender: false`** is required in `+config.ts` for any route group that has a `+guard.ts` file. Guards cannot run at build time.
- **Server-side data fetching:** Use `+data.ts` in the page route directory. The `data()` function reads the Supabase session cookie via `createSupabaseServerClient`, calls Laravel API endpoints in parallel, and returns typed data. Components receive this data as `initialX` props via `useData()` in `+Page.tsx`.
- **Global SSR context:** `pages/+onBeforeRender.ts` runs on every request. It reads the session cookie, calls `GET /api/v1/session`, and populates `pageContext.initialUser` (`displayName`, `handle`, `isAdmin`). The `Header` component reads this from `usePageContext()` so it renders correctly on the first HTML response across all pages.
- **`passToClient`:** Fields added to `pageContext` server-side must be listed in `passToClient` in `pages/+config.ts` to be serialized and sent to the client for hydration consistency.
- **`initialX` prop pattern:** When a component normally fetches on mount, pass the server-fetched data as an optional `initialX` prop. When provided, the component seeds its state from the prop and skips the initial `useEffect` fetch. Mutations (save, delete) remain client-side and update local state directly.

---

## Cross-Cutting Rules

- `apps/api` and `apps/web` never import from each other
- Shared types that cross both apps go in `packages/`
- Documentation lives in `docs/architecture/` (feature docs) and `docs/setup/` (process docs)
- Agent workflow rules live in `docs/setup/agent-workflow.md`
- Feature status is tracked in `docs/architecture/<feature>.md`
