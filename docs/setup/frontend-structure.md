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
    +config.ts
    +onBeforeRender.ts
    index/
      +Page.tsx
    about/
      +Page.tsx
    contact/
      +Page.tsx
    blog/
      +Page.tsx
    blog/@slug/
      +Page.tsx
    (auth)/
      signin/
        +Page.tsx
      signup/
        +Page.tsx
      forgot-password/
        +Page.tsx
    dashboard/
      +Page.tsx
    dashboard/posts/
      +Page.tsx
    dashboard/profile/
      +Page.tsx

  src/
    components/
      ui/
      common/
      layout/
    features/
      blog/
      auth/
      dashboard/
      admin/
    layouts/
    lib/
      api/
      env/
      utils/
    hooks/
    styles/
    types/
```

## Route Tree

The canonical route ownership in `apps/web` is:

```text
/                       -> pages/index/+Page.tsx
/about                  -> pages/about/+Page.tsx
/contact                -> pages/contact/+Page.tsx
/blog                   -> pages/blog/+Page.tsx
/blog/:slug             -> pages/blog/@slug/+Page.tsx
/signin                 -> pages/(auth)/signin/+Page.tsx
/signup                 -> pages/(auth)/signup/+Page.tsx
/forgot-password        -> pages/(auth)/forgot-password/+Page.tsx
/dashboard              -> pages/dashboard/+Page.tsx
/dashboard/posts        -> pages/dashboard/posts/+Page.tsx
/dashboard/profile      -> pages/dashboard/profile/+Page.tsx
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

- `blog/`
- `auth/`
- `dashboard/`
- `admin/`

Each feature may contain:

- `components/`
- `api/`
- `hooks/`
- `types.ts`
- `utils.ts`

Example:

```text
src/features/blog/
  components/
    BlogList.tsx
    BlogCard.tsx
    BlogArticle.tsx
  api/
    get-posts.ts
    get-post-by-slug.ts
  hooks/
    usePosts.ts
  types.ts
```

Feature folders are the default place for page sections and feature behavior.

Auth-specific page content belongs in `src/features/auth/`, not in layout shells or route files. For example:

```text
src/features/auth/
  components/
    SignInIntro.tsx
    SignInSidePanel.tsx
    SignUpIntro.tsx
    SignUpSidePanel.tsx
    ForgotPasswordIntro.tsx
    ForgotPasswordSidePanel.tsx
    SignInForm.tsx
    SignUpForm.tsx
    ForgotPasswordForm.tsx
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

### `src/types/`

Use `src/types/` for shared frontend types that are not specific to one feature.

If types are shared across apps, move them into `packages/` instead of importing directly between `apps/web` and `apps/api`.
Feature-specific types should stay in `src/features/*/types.ts`.

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

Do not prematurely move everything into shared folders.

Rules of thumb:

- one-route-only component: keep it in the owning feature
- reused across multiple features: move to `src/components/common/`
- low-level primitive: move to `src/components/ui/`

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
