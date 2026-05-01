# Environment Matrix

## Summary

This project will run across local Docker, Render, Vercel, and Supabase. Environment ownership must stay explicit to avoid leaking server-only secrets into the frontend.

## Backend: `apps/api`

### Local

- `APP_ENV=local`
- `APP_URL=http://localhost`
- `API_PREFIX=/api/v1`
- `DB_CONNECTION=pgsql`
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_DATABASE=blog_local`
- `DB_USERNAME=blog`
- `DB_PASSWORD=blog`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SUPABASE_JWT_SECRET` or equivalent verification configuration
- `FRONTEND_APP_URL=http://localhost`

### Preview

- Render preview app URL
- Supabase preview or shared non-production project values
- restricted preview frontend origin list

### Production

- Render production app URL
- Supabase production DB URL
- Supabase service role key
- production frontend origin list

## Frontend: `apps/web`

### Local

- `VITE_API_BASE_URL=http://localhost/api/v1`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`
- `VITE_SITE_URL=http://localhost`

### Preview

- Vercel preview URL
- preview API URL
- preview Supabase public keys

### Production

- Vercel production URL
- Render API URL
- production Supabase public keys

## Provider Ownership

- Render owns backend runtime env vars
- Vercel owns frontend public env vars
- Supabase issues DB/auth/storage credentials
- Root repo docs record variable names, but secrets stay out of git

## Codex Workspace Note

Intended repo-local skill path: `.codex/skills`

Active tracked fallback in this environment:

- `codex/skills`

Reason:

- root `.codex` is a read-only placeholder file in this workspace

