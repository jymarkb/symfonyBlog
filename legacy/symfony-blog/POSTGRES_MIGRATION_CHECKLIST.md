# MySQL to PostgreSQL Migration Checklist

This checklist is tailored to the current Symfony setup in this repository.

## Goal

Move the app from MySQL to PostgreSQL with the smallest-risk path:

1. prepare PostgreSQL locally
2. update Symfony and Docker config
3. migrate schema and data
4. verify the app end to end

## Current Repository State

The project is currently using MySQL in these places:

- `.env` uses a MySQL `DATABASE_URL`
- `compose.yaml` runs a `mysql:9.0` container
- `docker/phpfpm/Dockerfile` installs `pdo_mysql`
- `docker/phpfpm/Dockerfile.Prod` installs `pdo_mysql`

Doctrine itself is already configured well for a database switch because it reads from `DATABASE_URL` in `config/packages/doctrine.yaml`.

## Pre-Migration Checklist

- [ ] Make a full backup of the current MySQL database
- [ ] Export a schema dump and a data dump from MySQL
- [ ] Confirm you can restore that dump before changing anything
- [ ] Create a git branch dedicated to the PostgreSQL migration
- [ ] Freeze schema changes while the migration is in progress

## 1. Update Environment Variables

Files to review:

- `.env`
- `.env.test`
- deployment secrets or CI variables if you use them

Checklist:

- [ ] Change `DATABASE_URL` from MySQL to PostgreSQL
- [ ] Use a PostgreSQL DSN format such as:

```env
DATABASE_URL="postgresql://postgres:password@database:5432/symfonyBlog?serverVersion=16&charset=utf8"
```

- [ ] Set `serverVersion` to the actual PostgreSQL version you will run
- [ ] Update test environment DB config if tests use a separate database
- [ ] Update any production or staging secrets that still point to MySQL

## 2. Update Docker Compose

File to review:

- `compose.yaml`

Checklist:

- [ ] Replace the MySQL service with a PostgreSQL service
- [ ] Change the container port mapping from `3306` to `5432`
- [ ] Change environment variables from `MYSQL_*` to `POSTGRES_*`
- [ ] Replace the MySQL volume path with `/var/lib/postgresql/data`
- [ ] Rename the persistent volume from something MySQL-specific like `dev_mysql_data` to `dev_postgres_data`
- [ ] Confirm the PHP service still receives the updated `DATABASE_URL`

Suggested shape:

```yaml
services:
  database:
    image: postgres:16
    container_name: symfonyblog-db
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: symfonyBlog
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: test
      TZ: ${TZ}
    volumes:
      - dev_postgres_data:/var/lib/postgresql/data
```

## 3. Update PHP PostgreSQL Driver Support

Files to review:

- `docker/phpfpm/Dockerfile`
- `docker/phpfpm/Dockerfile.Prod`

Checklist:

- [ ] Replace `pdo_mysql` with `pdo_pgsql`
- [ ] Rebuild containers after the Dockerfile change
- [ ] Confirm the PHP container has the PostgreSQL driver loaded

Current pattern:

```dockerfile
docker-php-ext-install pdo pdo_mysql intl
```

Target pattern:

```dockerfile
docker-php-ext-install pdo pdo_pgsql intl
```

## 4. Review Doctrine Configuration

File to review:

- `config/packages/doctrine.yaml`

Checklist:

- [ ] Keep `url: '%env(resolve:DATABASE_URL)%'`
- [ ] If needed, explicitly set the PostgreSQL server version in the DSN
- [ ] Confirm there is no MySQL-specific Doctrine config elsewhere in the repo

Notes:

- The current Doctrine config is already mostly database-agnostic.
- The most important part is getting the PostgreSQL `DATABASE_URL` right.

## 5. Review Entities for PostgreSQL Compatibility

Files to review:

- `src/Entity/Blog.php`
- `src/Entity/Account.php`
- `src/Entity/Category.php`
- `src/Entity/BlogAnalytics.php`
- all files under `migrations/`

Checklist:

- [ ] Review string length assumptions and index usage
- [ ] Review any columns that relied on MySQL-specific behavior
- [ ] Review booleans, timestamps, and text fields for generated SQL differences
- [ ] Check for mismatched entity PHP types before generating new migrations

Important repo-specific note:

- `src/Entity/BlogAnalytics.php` has `dislikes` declared with `#[ORM\Column(length: 255)]` while the PHP property is typed as `?int`. That kind of mismatch should be cleaned up before or during the migration so Doctrine generates predictable PostgreSQL schema.

## 6. Decide Your Data Migration Strategy

Pick one:

### Option A: Fresh PostgreSQL database and re-run Doctrine migrations

Use this if local data is disposable.

- [ ] Create a clean PostgreSQL database
- [ ] Run Doctrine migrations from scratch
- [ ] Seed or recreate the minimal data you need

### Option B: Move existing MySQL data into PostgreSQL

Use this if the current content matters.

- [ ] Export MySQL schema and data
- [ ] Convert the dump to PostgreSQL-compatible SQL
- [ ] Import into PostgreSQL
- [ ] Reconcile Doctrine migration history after import

Common tools for this step:

- `pgloader`
- manual CSV export/import for smaller datasets
- custom SQL transformation scripts

## 7. Migrations and Schema Alignment

Checklist:

- [ ] Run `php bin/console doctrine:database:create` against PostgreSQL
- [ ] Run `php bin/console doctrine:migrations:migrate`
- [ ] If the migrated schema differs, inspect with `php bin/console doctrine:schema:validate`
- [ ] Use `php bin/console doctrine:migrations:diff` only after cleaning up entity issues
- [ ] Verify the `migration_versions` table state is correct for the new database

If you import existing data instead of rebuilding the schema:

- [ ] Confirm migration history matches the imported schema
- [ ] Avoid blindly re-running old migrations against an already-imported PostgreSQL schema

## 8. App-Level Verification

Checklist:

- [ ] Homepage loads
- [ ] Blog index loads
- [ ] Blog detail page loads by slug
- [ ] Login works
- [ ] Signup works
- [ ] Dashboard loads for an authenticated user
- [ ] Create page works
- [ ] Edit page works
- [ ] Delete page works
- [ ] Blog search/filter endpoint still works
- [ ] File upload for thumbnails still works

Routes worth smoke-testing in this repo:

- `/`
- `/blog`
- `/blog/{slug}`
- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/pages`

## 9. Cleanup

- [ ] Remove old MySQL-specific Docker comments and unused volumes
- [ ] Remove any stale MySQL credentials from env files or secrets
- [ ] Update project docs to say PostgreSQL is the active database
- [ ] Document the final local startup steps for teammates

## 10. Rollback Plan

Before finalizing, make sure rollback is simple:

- [ ] Keep the MySQL backup untouched
- [ ] Keep the old MySQL `DATABASE_URL`
- [ ] Keep a copy of the previous `compose.yaml`
- [ ] Keep the pre-migration Dockerfiles in git history
- [ ] Verify you can switch back by checking out the branch or reverting the commit set

## Recommended Execution Order

- [ ] Back up MySQL
- [ ] Update Dockerfiles to `pdo_pgsql`
- [ ] Switch `compose.yaml` to PostgreSQL
- [ ] Update `.env` with a PostgreSQL DSN
- [ ] Rebuild containers
- [ ] Create the PostgreSQL database
- [ ] Run migrations or import converted data
- [ ] Validate schema
- [ ] Smoke-test public pages and dashboard flows
- [ ] Clean up docs and leftover MySQL config

## Suggested Commands

These are the commands you will likely use during the migration:

```bash
docker compose down
docker compose up --build -d
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:schema:validate
php bin/console cache:clear
```

## Final Advice

For this repository, the safest path is usually:

1. switch Docker and PHP from MySQL to PostgreSQL
2. start with a fresh PostgreSQL database
3. run Doctrine migrations
4. import only the content you actually need

If you want, the next step can be converting this checklist into actual code changes for:

- `.env`
- `compose.yaml`
- `docker/phpfpm/Dockerfile`
- `docker/phpfpm/Dockerfile.Prod`
