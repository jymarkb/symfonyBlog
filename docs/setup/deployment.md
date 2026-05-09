# Deployment

## Architecture

```
Browser
  ├── static assets  → Vercel (global CDN, free)
  └── API requests   → Render Web Service (free, kept warm)
                            ├── Supabase PostgreSQL  (database)
                            ├── Supabase Auth        (JWT verification)
                            ├── Supabase Storage     (file uploads, S3-compatible)
                            └── Render PostgreSQL    (cache + sessions, database driver)

cron-job.org → HTTP ping → Render Web Service (scheduled tasks + keeps service warm)
```

## Services

### Vercel — `apps/web`

- Deploys the Vike + React frontend as a static site
- Global CDN — zero cold starts, instant loads worldwide
- Auto-deploys on push to `main`
- Environment variables set in Vercel dashboard (`VITE_*` only — never secrets)

### Render Web Service — `apps/api`

- Runs the Laravel API
- Free tier spins down after 15 minutes of inactivity
- Cold start time: ~60 seconds
- **Kept warm** by cron-job.org pinging a health endpoint every 10 minutes
- Environment variables set in Render dashboard
- No persistent disk — all file storage goes through Supabase Storage

### Supabase

| Feature | Used for |
|---|---|
| PostgreSQL | primary database |
| Auth | JWT issuance, user management, OAuth |
| Storage | image and file uploads (S3-compatible) |

### Render PostgreSQL

- Used exclusively for Laravel cache and sessions (`database` driver)
- Shared between the web service and any cron jobs
- Persistent — survives spin-downs and restarts
- Run once on first deploy: `php artisan cache:table && php artisan session:table && php artisan migrate`

### cron-job.org

- Free external HTTP scheduler
- Configured in the cron-job.org dashboard — no Render service needed
- Pings a protected Laravel endpoint on schedule (e.g. `POST /api/v1/cron/run`)
- Side effect: keeps the Render web service warm, eliminating cold starts during active hours

## Deploying `apps/api` on Render

Render has no native PHP runtime. Use **Docker** environment.

### Files required

- `apps/api/Dockerfile` — production image (PHP 8.3 Alpine + pdo_pgsql + Composer)
- `apps/api/.dockerignore` — excludes `.env`, `vendor/`, `tests/`, logs, cache

### Render Web Service setup

```
Environment:      Docker
Root Directory:   apps/api
Dockerfile Path:  apps/api/Dockerfile
Port:             8000
```

### What the Docker startup does automatically

```
php artisan config:cache    → caches all config files for performance
php artisan route:cache     → caches route definitions
php artisan view:cache      → caches compiled Blade views
php artisan migrate --force → runs any pending migrations on every deploy
php artisan serve           → starts HTTP server on 0.0.0.0:8000
```

### Render environment variables to set

Set all variables from the production section of `docs/setup/environment-matrix.md` in the Render dashboard. Never commit `.env` to git — Render injects env vars at runtime.

Key variables:
```
APP_KEY=<generate with: php artisan key:generate --show>
APP_ENV=production
APP_DEBUG=false
DB_URL=<Supabase PostgreSQL connection string>
CACHE_DRIVER=database
CACHE_DATABASE_CONNECTION=render_cache
RENDER_CACHE_DATABASE_URL=<Render PostgreSQL internal URL>
SESSION_DRIVER=database
FILESYSTEM_DISK=supabase
```

### Render PostgreSQL (cache + sessions)

Create a **separate** PostgreSQL instance on Render for cache and sessions:

```
Render Dashboard → New → PostgreSQL → Free tier
```

- Use the **Internal Database URL** (same network, faster)
- Add as `RENDER_CACHE_DATABASE_URL` env var on the web service
- The `migrate --force` in the Dockerfile startup will create the cache and sessions tables automatically on first deploy

### Pre-deploy: run once locally

```bash
# generate cache and session migration files
cd apps/api
php artisan cache:table
php artisan session:table
git add database/migrations
git commit -m "add - cache and session table migrations"
```

## Deploying `apps/web` on Vercel

Vercel is purpose-built for React/Vike. No Dockerfile needed.

### Vercel project setup

```
Framework Preset:  Vite (or Other)
Root Directory:    apps/web
Build Command:     npm run build
Output Directory:  dist/client
```

### Vercel environment variables to set

```
VITE_API_BASE_URL=https://your-app.onrender.com/api/v1
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_SITE_URL=https://your-app.vercel.app
```

Only `VITE_*` variables go in Vercel — never backend secrets.

## First Deploy Checklist

### Supabase (do first)
- [ ] Create a PostgreSQL project if not already done
- [ ] Create a Storage bucket named `covers`, set to public
- [ ] Copy connection string, anon key, service role key, JWKS URL

### Render PostgreSQL (cache DB)
- [ ] Create a free PostgreSQL instance on Render
- [ ] Copy the Internal Database URL
- [ ] Add as `RENDER_CACHE_DATABASE_URL` on the web service

### Render Web Service (API)
- [ ] Create Web Service → Docker → Root: `apps/api`
- [ ] Set all env vars from environment-matrix.md production section
- [ ] First deploy — startup will auto-migrate and cache config
- [ ] Verify `GET /api/v1/posts` returns 200
- [ ] Verify `GET /api/v1/session` returns 401 for unauthenticated requests

### Vercel (Frontend)
- [ ] Import repo → set root to `apps/web`
- [ ] Set all `VITE_*` env vars
- [ ] Verify blog listing page loads and calls the API correctly
- [ ] Verify sign-in flow completes end-to-end

### Supabase Storage
- [ ] Verify `POST /api/v1/admin/uploads` returns a public URL

### cron-job.org
- [ ] Create a job: `GET https://your-app.onrender.com/api/v1/health`
- [ ] Set interval to every 10 minutes to keep the service warm
- [ ] Verify the job returns 200 in the cron-job.org dashboard

## Upgrade Path

| When | Change |
|---|---|
| Traffic justifies Redis | Set `CACHE_DRIVER=redis` + `REDIS_URL=<Upstash>` — no code changes |
| Storage needs grow beyond 1GB | Upgrade Supabase Storage or move to Cloudinary |
| API needs always-on | Upgrade Render to $7/month paid instance |
| Database grows beyond 500MB | Upgrade Supabase free tier |

## Cold Start Mitigation

Render free tier spins down after 15 minutes of inactivity. cron-job.org pings prevent this during active hours:

```
cron-job.org pings every 10 min
→ Render web service stays warm
→ no 60-second cold start for real users
```

Outside active hours (overnight) the service may still spin down. This is acceptable for a blog — traffic is predictably low overnight.
