# Frontend Structure

## Purpose

This document defines the intended production-ready structure for `apps/web`.

It is the source of truth for frontend organization in the rebuild:

- `apps/web` owns all product UI
- `apps/api` owns backend logic and JSON APIs only
- public pages, auth screens, and dashboard/admin UI all live in `apps/web`

Authentication and authorization structure lives in `docs/architecture/auth-authorization.md`.

This structure is designed for `Vite + React + Vike` and should support both:

- SEO-sensitive public pages rendered with SSR or prerender
- authenticated dashboard flows that may be more client-heavy

## Ownership Rules

### `apps/web`

`apps/web` owns:

- public marketing pages
- blog index and article pages
- signin, signup, and password reset screens
- dashboard and admin UI
- frontend layouts, components, client state, and API integration

### `apps/api`

`apps/api` owns:

- business logic
- JSON API endpoints
- authentication verification
- authorization and policies
- persistence and integrations

`apps/api` is not the intended home for product UI. Default Laravel Blade files may remain temporarily, but they are not part of the target architecture.

## Top-Level Structure

Use this shape for `apps/web`:

```text
apps/web/
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  .env.example
  .gitignore

  public/
    favicon.ico
    robots.txt
    images/

  pages/
    +config.ts               ← accessLevel: 'public' default; meta registration; passToClient
    +guard.ts                ← global SSR guard (reads accessLevel, enforces redirects)
    +onBeforeRender.ts       ← resolves initialUser for header on every request
    +Layout.tsx              ← root layout wrapped in ErrorBoundary
    +Head.tsx
    index/
      +Page.tsx
    about/
      +Page.tsx
    archive/
      +Page.tsx
    blog/
      +Page.tsx
      @slug/
        +Page.tsx
        +config.ts
    contact/
      +Page.tsx
    editor/
      +Page.tsx
    privacy/
      +Page.tsx
    tags/
      +Page.tsx
    terms/
      +Page.tsx
    _error/
      +Page.tsx
    (auth)/
      +config.ts             ← accessLevel: 'guest-only', prerender: false
      +Layout.tsx
      signin/
        +Page.tsx
      signup/
        +Page.tsx
      forgot-password/
        +Page.tsx
      reset-password/
        +Page.tsx
      auth/callback/
        +Page.tsx
    (user)/
      +config.ts             ← accessLevel: 'auth-required', prerender: false
      +Layout.tsx
      profile/
        +Page.tsx
        +data.ts
    (admin)/
      +config.ts             ← accessLevel: 'admin-required', prerender: false
      +Layout.tsx
      dashboard/
        +Page.tsx
        posts/
          +Page.tsx

  src/
    components/
      ErrorBoundary.tsx      ← root-level, used by all layouts
      common/
        ErrorPage.tsx
        MaintenancePage.tsx
        PasswordStrengthHint.tsx
      ui/
        Brand.tsx
        FormMessage.tsx
      layout/
        Header/
        Footer/
    features/
      auth/
        api/
        components/
        guards/
        lib/
        session/
        auth.css
        authTypes.ts
      blog/
      profile/
        api/
        components/
        hooks/
        lib/
        profile.css
        profileTypes.ts
      admin/
      dashboard/
    layouts/
      AppShell.tsx
      AuthShell.tsx
      DashboardShell.tsx
    lib/
      api/
      auth/
      env/
      theme/
    hooks/
    styles/
    assets/
```

## Route Tree

The canonical route ownership in `apps/web` is:

```text
Public (prerendered at build time)
/                       -> pages/index/+Page.tsx
/about                  -> pages/about/+Page.tsx
/archive                -> pages/archive/+Page.tsx
/blog                   -> pages/blog/+Page.tsx
/blog/:slug             -> pages/blog/@slug/+Page.tsx
/contact                -> pages/contact/+Page.tsx
/editor                 -> pages/editor/+Page.tsx
/privacy                -> pages/privacy/+Page.tsx
/tags                   -> pages/tags/+Page.tsx
/terms                  -> pages/terms/+Page.tsx

Guest-only auth (SSR per request, accessLevel: 'guest-only')
/signin                 -> pages/(auth)/signin/+Page.tsx
/signup                 -> pages/(auth)/signup/+Page.tsx
/forgot-password        -> pages/(auth)/forgot-password/+Page.tsx
/reset-password         -> pages/(auth)/reset-password/+Page.tsx
/auth/callback          -> pages/(auth)/auth/callback/+Page.tsx

Auth-required (SSR per request, accessLevel: 'auth-required')
/profile                -> pages/(user)/profile/+Page.tsx

Admin-required (SSR per request, accessLevel: 'admin-required')
/dashboard              -> pages/(admin)/dashboard/+Page.tsx
/dashboard/posts        -> pages/(admin)/dashboard/posts/+Page.tsx
```

`pages/` is for route entry files only. It should not become a dumping ground for reusable components or feature logic.

Use Vike route groups such as `(auth)` when related public routes should be organized together without changing their URL paths.

## Directory Responsibilities

### `pages/`

Use `pages/` only for Vike route files and route-specific config.

Allowed here:

- `+Page.tsx`
- route config files such as `+config.ts`
- route-specific data hooks only when they are tightly bound to Vike page lifecycle

Avoid putting shared UI, business logic, or general utilities in `pages/`.

### `src/components/ui/`

This is for reusable visual primitives:

- buttons
- inputs
- selects
- modals
- tables
- badges
- cards
- alerts

Rules:

- keep components small and composable
- keep them presentation-focused
- do not embed route-specific behavior here
- do not hardcode feature-specific API logic here

### `src/components/common/`

This is for shared non-primitive UI used across multiple features:

- SEO helpers
- empty states
- shared page sections
- loading states

Use `common/` only for real cross-feature reuse. If a component only belongs to one area, keep it in that feature instead.

### `src/components/layout/`

This is for shared page-frame components:

- `Header/`
- `Footer/`
- dashboard sidebars
- persistent navigation regions

Layout components may know about app routes, branding, and shell-level controls such as theme toggles. Keep their static data and types colocated with the owning layout component unless they become cross-layout shared data.

### `src/features/`

Organize business-area code by feature:

- `auth/` — signin, signup, password recovery, session, guards
- `profile/` — private user profile page
- `blog/` — public post listing and detail
- `dashboard/` — admin dashboard overview
- `admin/` — admin post/tag/user/comment management

Each feature owns:

- `components/` — feature-specific UI
- `api/` — API call functions for that feature
- `hooks/` — hooks used only within that feature
- `lib/` — pure helpers (validation, formatting) used only within that feature
- `<feature>Types.ts` — **one types file per feature**, named `<feature>Types.ts`
- `<feature>.css` — feature-specific styles, imported via `global.css`

Example:

```text
src/features/blog/
  components/
    BlogList.tsx
    BlogCard.tsx
    BlogArticle.tsx
  api/
    postsApi.ts
  hooks/
    usePosts.ts
  blogTypes.ts
```

The `auth` feature has additional sub-folders for session management and guards:

```text
src/features/auth/
  api/
    currentUserApi.ts
    signInApi.ts
    registerApi.ts
    resetPasswordApi.ts
  components/
    AuthConfirm.tsx
    AuthIntro.tsx
    AuthFooterLinks.tsx
    AuthProviderButtons.tsx
    SignInForm.tsx
    SignUpForm.tsx
    ForgotPasswordForm.tsx
    ResetPasswordForm.tsx
    SignInSidePanel.tsx
    SignUpSidePanel.tsx
    ForgotPasswordSidePanel.tsx
    ResetPasswordSidePanel.tsx
  guards/
    AuthGuard.tsx       ← @deprecated, replaced by +guard.ts
    RequireAdmin.tsx    ← client-side hydration fallback only
  lib/
    validation.ts
    lastAuthProvider.ts
  session/
    CurrentSessionContext.tsx
    useCurrentSession.ts
    index.ts
  auth.css
  authTypes.ts
```

### `src/layouts/`

Layouts define shared shells and structure, such as:

- `AppShell.tsx`
- `AuthShell.tsx`
- `DashboardShell.tsx`

Layouts may compose shared navigation, sidebars, footers, and route wrappers, but should not own backend data logic that belongs to a feature.

Shells own page frames. For example, `AuthShell` owns the auth grid, form column, side column, and side placement. The signin/signup copy, side-panel content, and form behavior stay in `src/features/auth/`.

### `src/lib/`

Use `src/lib/` for technical shared code:

- `api/` for Laravel API clients and request helpers
- `env/` for environment parsing and validation
- `utils/` for generic helpers

This is the preferred place for shared HTTP setup, not individual page files.
Do not put interfaces or domain types in `src/lib/utils`.

### `src/hooks/`

Use `src/hooks/` for generic reusable hooks that are not feature-specific.

If a hook only serves one feature, keep it inside that feature folder.

### `src/styles/`

Use `src/styles/` for global styling concerns:

- `global.css` — entry point, imports tailwind + theme + all feature CSS files
- `theme.css` — shared design system: tokens, base resets, shared primitives (btn, card, nav, footer, field, etc.)

Feature-specific CSS lives next to the feature (`src/features/<feature>/<feature>.css`) or component (`src/components/common/<name>.css`), **not** in `src/styles/`.

**Critical SSR rule:** Never import CSS inside a component file. CSS imported via JS is not included in the SSR HTML and breaks on hard page refresh. All CSS files must be registered in `global.css` via `@import`.

### Type Files

Each feature has exactly one types file: `src/features/<feature>/<feature>Types.ts`.

- `authTypes.ts` — session types, guard types, auth API contracts
- `profileTypes.ts` — `PrivateProfile`, `ProfileComment`, `ProfileReadingHistoryItem`
- `blogTypes.ts` — `Post`, `PostSummary` (when blog feature is built)

Do not create a `src/types/` directory for feature-specific types. If types are truly shared across multiple features (not just one), place them in `src/features/<feature>/<feature>Types.ts` of the owning feature and import from there, or move them to `packages/shared-types` if shared across apps.

For Vike-specific type augmentation (`PageContext`, `Config`, `AccessLevel`), use `src/vike.d.ts`.

## ErrorBoundary Placement

`src/components/ErrorBoundary.tsx` is the single error boundary component for the app. It accepts an optional `fallback` prop; when omitted it renders `<ErrorPage code={500} />`.

Every layout must wrap its content in an `ErrorBoundary`:

| Layout | Boundary placement |
|---|---|
| `pages/+Layout.tsx` | Wraps entire tree — catches errors on all public routes |
| `pages/(user)/+Layout.tsx` | Wraps `<AppShell>` — catches profile page errors |
| `pages/(admin)/+Layout.tsx` | Wraps `<RequireAdmin><DashboardShell>` — catches admin errors |
| `src/layouts/AppShell.tsx` | Wraps `<main>` only — keeps Header/Footer visible on content crash |

Place boundaries as close to the error source as the UX requires — but every layout must have at least one. Do not add per-page boundaries unless that page needs a custom fallback.

Rules:
- Never place an `ErrorBoundary` inside a hook or functional component without a class wrapper.
- Boundaries do not catch errors in async event handlers — those must be caught in try/catch.
- The root `pages/+Layout.tsx` boundary is the last safety net; inner boundaries provide better scope.

## Component Splitting Rules

The default rule is to keep components small.

### Thin route files

`+Page.tsx` files should stay thin. Their job is to:

- select the layout
- compose feature components
- connect route-level data to the page

They should not grow into large files containing all page markup and behavior.

### Split by responsibility

When a page becomes complex, split it into:

- page shell
- page sections
- form components
- data-display components
- action components

Example:

```text
src/features/dashboard/components/
  DashboardHeader.tsx
  DashboardSidebar.tsx
  PostTable.tsx
  PostFilters.tsx
  PostStatusBadge.tsx
```

### Separate presentation from data access

- UI primitives should not fetch data directly
- page sections should not duplicate request logic
- API calls should live in `src/lib/api/` or `src/features/*/api/`

### Reuse only when reuse is real

Do not prematurely move everything into shared folders. Use this 4-question placement test:

1. **Is it used by only one feature?** → keep it in `src/features/<feature>/components/`
2. **Is it a low-level stateless primitive (button, input, badge)?** → `src/components/ui/`
3. **Is it shared across two or more features?** → `src/components/common/`
4. **Is it a full page frame (header, footer, shell)?** → `src/components/layout/` or `src/layouts/`

Cross-feature components (shared by 2+ features) must go to `common/`, not stay in either feature folder.

## Admin And Dashboard Guidance

For this rebuild, admin and dashboard UI are frontend concerns and belong in `apps/web`.

That means:

- Laravel does not render dashboard pages
- dashboard routes are Vike routes in `apps/web`
- admin actions are performed through Laravel APIs
- auth-protected UI still belongs to the same frontend app as the public site

This avoids building two separate UI systems and keeps design tokens, layouts, auth state, and component patterns in one place.

## Boundary Rules

The following rules are mandatory:

- `apps/web` must not import from `apps/api`
- `apps/api` must not import from `apps/web`
- shared contracts and shared types must move into `packages/`
- do not duplicate the same UI in Laravel Blade and React
- do not treat legacy Symfony structure as the default for the rebuild

## Naming Rules

Use these naming defaults:

- kebab-case for directories
- PascalCase is allowed for component module directories such as `Header/` and `Footer/`
- PascalCase for React component filenames
- lowercase utility filenames unless the file exports a component
- Vike route files follow Vike conventions such as `+Page.tsx` and `+config.ts`

Examples:

- `src/components/ui/Button.tsx`
- `src/components/layout/Header/Header.tsx`
- `src/features/blog/components/BlogCard.tsx`
- `src/lib/api/client.ts`

## Anti-Patterns To Avoid

Avoid these structure problems:

- a giant `components/` folder with no ownership boundaries
- large `+Page.tsx` files that mix layout, UI, data, and action logic
- route files importing backend code directly from `apps/api`
- duplicated request logic across pages
- shared UI primitives containing feature-specific behavior
- placing reusable components inside `pages/`
- building a second admin UI in Laravel Blade

## Default Implementation Guidance

When starting a new page:

1. add the route file in `pages/`
2. compose the page from layout and feature components
3. place page-specific sections in the relevant feature folder
4. place reusable primitives in `src/components/ui/`
5. place shared page-frame UI in `src/components/layout/`
6. place API calls in `src/lib/api/` or the owning feature's `api/` directory

When in doubt, prefer clear ownership over convenience.

## Relationship To Roadmap

This structure supports the roadmap by reinforcing that:

- `apps/web` is the Vite-based frontend app
- public routes must remain SSR or prerender friendly
- dashboard routes live in the same frontend app
- `apps/api` stays focused on APIs, auth verification, and persistence

This document should be used as the default reference when scaffolding or refactoring frontend code in the rebuild.
