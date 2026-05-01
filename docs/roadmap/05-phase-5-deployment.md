# Phase 5: Deployment

## Goal

Deploy the split platform with clear ownership across Render, Vercel, and Supabase.

## Platform Responsibilities

- Render:
  - host Laravel API
  - manage backend runtime env vars
  - run Laravel build/start commands
- Vercel:
  - host the Vite SSR/prerender frontend
  - manage frontend env vars and preview deployments
- Supabase:
  - host Postgres
  - host Auth
  - host Storage

## Deployment Boundaries

- Laravel connects to Supabase Postgres using the managed connection string
- Frontend calls the Render API URL
- Frontend uses Supabase public client configuration
- Backend-only operations use the Supabase service role key

## Environment Mapping

- Backend needs:
  - database URL
  - Supabase URL
  - Supabase service role key
  - allowed frontend origin list
- Frontend needs:
  - public API base URL
  - Supabase URL
  - Supabase anon key
  - canonical site URL

## Release Order

1. Create Supabase project and buckets
2. Deploy Laravel API to Render
3. Deploy frontend to Vercel
4. Verify CORS, auth, storage, and public-page rendering

## Acceptance Criteria

- Runtime ownership is unambiguous
- Secrets are separated by backend and frontend responsibility
- Preview and production URLs are planned before rollout

