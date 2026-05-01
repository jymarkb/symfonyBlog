# Legacy Feature Inventory

## Purpose

Map the preserved Symfony application into rebuild targets so implementation can be phased without rediscovering feature scope.

## Public Site

- Home page with featured, latest, and most-viewed posts
  - legacy sources: `HomeController`, `templates/home/*`
  - rebuild target: SSR homepage in `apps/web`, backed by `/api/v1/posts`
- Blog listing and detail pages
  - legacy sources: `BlogPageController`, `templates/blog/*`
  - rebuild target: SSR blog routes in `apps/web`
- About and Contact pages
  - legacy sources: `CustomPageController`, `templates/about/*`, `templates/contact/*`
  - rebuild target: Vite public routes with redesigned content sections

## Auth

- Login
  - legacy source: `SecurityController@login`
  - rebuild target: Supabase Auth UI in `apps/web`
- Signup
  - legacy source: `SecurityController@signup`
  - rebuild target: Supabase Auth UI plus Laravel user bootstrap
- Forgot password
  - legacy source: `SecurityController@forgotPassword`
  - rebuild target: Supabase recovery flow

## Dashboard

- Dashboard landing pages
  - legacy source: `DashboardController`
  - rebuild target: authenticated frontend routes
- Post creation, preview, edit, delete
  - legacy source: `Dashboard/PagesController`, `PagesService`
  - rebuild target: dashboard forms backed by `/api/v1/admin/posts`
- Profile and security pages
  - legacy source: `Dashboard/ProfileController`, `UpdatePasswordService`
  - rebuild target: profile page in frontend plus Supabase-managed auth/security flows

## Content Model

- Posts store HTML, CSS, JS, summary, thumbnail, status, and featured flag
- Categories group posts
- Analytics track views, likes, dislikes, and reading-time-style data

## Non-Goals For Direct Porting

- Twig templates are not being ported as templates
- Symfony-specific forms, security components, and Doctrine migrations are reference-only
- Current Webpack Encore entry structure is not reused

