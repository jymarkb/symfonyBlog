# Phase 3: Vite Web

## Goal

Initialize `apps/web` as a Vite-based React frontend that serves public marketing/blog pages and authenticated dashboard flows.

## Rendering Strategy

- Public routes are SEO-first and must use SSR or prerender
- Recommended implementation direction: Vite + React with a Vite-native SSR/prerender layer such as Vike
- Do not ship the public blog routes as SPA-only pages
- Authenticated dashboard routes may behave like a client-heavy app as long as session protection and routing stay consistent

## Route Split

- Public:
  - `/`
  - `/blog`
  - `/blog/:slug`
  - `/about`
  - `/contact`
- Auth:
  - `/login`
  - `/signup`
- Dashboard:
  - `/dashboard`
  - `/dashboard/posts`
  - `/dashboard/profile`

## Design-System Goals

- Create a distinct visual identity instead of carrying over the current Symfony theme directly
- Use shared primitives for layout, typography, cards, form fields, feedback states, and tables
- Keep public-site and dashboard UI visually related but purpose-specific
- Preserve strong mobile and desktop behavior from the start

## Frontend Responsibilities

- Render SEO-sensitive pages
- Handle Supabase Auth sessions on the client
- Send authenticated requests to Laravel using Supabase JWTs
- Provide authoring UI for dashboard post management

## Files To Touch In Implementation

- `apps/web/package.json`
- `apps/web/src/`
- `apps/web/vite.config.*`
- `apps/web/public/`
- `apps/web/.env.example`

## Acceptance Criteria

- Frontend initializes in `apps/web`
- Public route rendering approach is fixed before page implementation
- Public blog routes render with SSR or prerender instead of SPA-only delivery
- Auth flow is compatible with Laravel API expectations
- Design-system work follows `docs/product/redesign-brief.md`
