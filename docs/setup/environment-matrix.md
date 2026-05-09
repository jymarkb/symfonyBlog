# Environment Matrix

## Summary

This project runs across local Docker, Render (API), Vercel (frontend), Supabase (database, auth, storage), and cron-job.org (scheduled tasks). Environment ownership must stay explicit to avoid leaking server-only secrets into the frontend.

## Deployment Stack

| Service | Provider | Tier | Purpose |
|---|---|---|---|
| `apps/api` | Render Web Service | Free | Laravel API — kept warm by cron-job.org pings |
| `apps/web` | Vercel | Free | Vike + React — global CDN, no spin-down |
| Database | Supabase PostgreSQL | Free (500MB) | primary data store |
| Auth | Supabase Auth | Free | JWT issuance and user management |
| Storage | Supabase Storage | Free (1GB) | image and file uploads |
| Cache | Render PostgreSQL (`database` driver) | Free | shared between web service and cron |
| Sessions | Render PostgreSQL (`database` driver) | Free | persistent across spin-downs |
| Cron | cron-job.org | Free | HTTP pings to Laravel API on schedule |

**Total cost: $0/month**

**Upgrade path:** swap `CACHE_DRIVER=database` → `CACHE_DRIVER=redis` + add Upstash Redis when traffic justifies it. No application code changes required.

## Backend: `apps/api`

### Local

```env
APP_ENV=local
APP_URL=http://localhost
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=blog_local
DB_USERNAME=blog
DB_PASSWORD=blog
CACHE_DRIVER=database
SESSION_DRIVER=database
FILESYSTEM_DISK=local
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWKS_URL=...
SUPABASE_ISSUER=...
SUPABASE_AUDIENCE=authenticated
FRONTEND_APP_URL=http://localhost:3000
```

### Production (Render)

```env
APP_ENV=production
APP_URL=https://your-app.onrender.com
DB_CONNECTION=pgsql
DB_URL=<Supabase PostgreSQL connection string>
CACHE_DRIVER=database
CACHE_DATABASE_CONNECTION=render_cache
RENDER_CACHE_DATABASE_URL=<Render PostgreSQL internal URL>
SESSION_DRIVER=database
FILESYSTEM_DISK=supabase
AWS_ACCESS_KEY_ID=<Supabase Storage access key>
AWS_SECRET_ACCESS_KEY=<Supabase Storage secret>
AWS_DEFAULT_REGION=<Supabase region>
AWS_BUCKET=<bucket name>
AWS_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3
AWS_USE_PATH_STYLE_ENDPOINT=true
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWKS_URL=...
SUPABASE_ISSUER=...
SUPABASE_AUDIENCE=authenticated
FRONTEND_APP_URL=https://your-app.vercel.app
```

## Frontend: `apps/web`

### Local

```env
VITE_API_BASE_URL=http://localhost/api/v1
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SITE_URL=http://localhost:3000
```

### Production (Vercel)

```env
VITE_API_BASE_URL=https://your-app.onrender.com/api/v1
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SITE_URL=https://your-app.vercel.app
```

## Provider Ownership

- **Render** — backend runtime env vars, PostgreSQL (cache + sessions)
- **Vercel** — frontend public env vars (`VITE_*` only, never secrets)
- **Supabase** — database URL, auth keys, storage credentials, JWKS endpoint
- **cron-job.org** — no env vars needed; just a URL + schedule configured in the dashboard
- Root repo docs record variable names only — secrets never go in git

## Cache and Session Notes

- Both `CACHE_DRIVER` and `SESSION_DRIVER` use `database` in all non-local environments
- Run `php artisan cache:table && php artisan session:table && php artisan migrate` once on first deploy
- Set `CACHE_DRIVER=array` in `.env.testing` so cache does not persist between tests
- To upgrade to Redis later: set `CACHE_DRIVER=redis` and `REDIS_URL=...` — no application code changes required

## Codex Workspace Note

Intended repo-local skill path: `.codex/skills`

Active tracked fallback in this environment:

- `codex/skills`

Reason:

- root `.codex` is a read-only placeholder file in this workspace

