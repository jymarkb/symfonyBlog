# Repository Overview

This repository contains a Symfony-based blogging CMS with a public-facing site, authentication flows, and an authenticated dashboard for managing blog pages.

## Stack

- Backend: PHP 8.2+, Symfony 7, Doctrine ORM, Twig
- Frontend: React 18, TypeScript, Webpack Encore, Tailwind CSS, shadcn/ui, Radix UI
- Editor and UI tooling: TinyMCE, Lucide icons, Sonner, Embla Carousel
- Infrastructure: Docker, Nginx, MySQL-compatible persistence via Doctrine migrations

## What The Application Does

- Serves a homepage with featured, latest, and most-viewed blog content
- Provides a blog listing page and individual blog detail pages
- Supports account signup, login, forgot-password, and profile/security pages
- Includes an authenticated dashboard for creating, previewing, editing, and deleting blog pages
- Exposes simple static/custom pages such as About and Contact
- Includes a health-check endpoint for deployment/runtime monitoring

## Main Route Areas

### Public

- `/` home page
- `/blog` blog index
- `/blog/{slug}` blog detail page
- `/about` custom about page
- `/contact` custom contact page
- `/health-check` returns `OK`

### Auth

- `/login`
- `/signup`
- `/forgot-password`
- `/logout`

### Dashboard

- `/dashboard`
- `/dashboard/account`
- `/dashboard/inbox`
- `/dashboard/pages`
- `/dashboard/pages/create`
- `/dashboard/pages/preview`
- `/dashboard/pages/edit/{slug}`
- `/dashboard/profile/*`

## Core Backend Areas

### Controllers

- `src/Controller/HomeController.php`: homepage data assembly and health check
- `src/Controller/BlogPageController.php`: blog listing, search filter endpoint, blog detail
- `src/Controller/SecurityController.php`: authentication and registration flows
- `src/Controller/DashboardController.php`: dashboard landing pages
- `src/Controller/Dashboard/PagesController.php`: CRUD-like page management for blogs
- `src/Controller/Dashboard/ProfileController.php`: profile and password-related dashboard pages
- `src/Controller/CustomPageController.php`: About and Contact pages

### Services

- `src/Service/PagesService.php`: creates and updates blog pages, handles thumbnail uploads
- `src/Service/SearchService.php`: delegates filtered blog search to the repository
- `src/Service/Account/UpdatePasswordService.php`: account password update logic

### Entities

- `src/Entity/Blog.php`: main content model, including title, slug, summary, HTML content, styling, script, thumbnail, status, and featured flag
- `src/Entity/Account.php`: application user model
- `src/Entity/Category.php`: blog categorization
- `src/Entity/BlogAnalytics.php`: per-blog analytics such as views, likes, dislikes, and reading time

## Frontend Structure

### Twig templates

- `templates/home/`: homepage sections
- `templates/blog/`: blog index and blog detail views
- `templates/account/` and `templates/security/`: auth-related views
- `templates/dashboard/`: dashboard layout, page forms, previews, and profile screens

### React and TypeScript

- `app/Resources/js/`: page-specific React/TypeScript code for home, contact, account, dashboard, and shared interactions
- `assets/components/ui/`: shared UI primitives based on Radix and shadcn-style patterns
- `assets/styles/` and `app/Resources/css/`: Tailwind and page-specific styling

## Content Model Notes

Blog content is stored with separate fields for:

- summary text
- HTML markup
- CSS/style content
- JavaScript content
- thumbnail asset

This means the dashboard is acting as a lightweight page builder/editor for blog posts rather than a plain Markdown-only blog engine.

## Useful Project Files

- `composer.json`: PHP dependencies and Docker helper scripts
- `package.json`: frontend tooling, build scripts, and React/Tailwind dependencies
- `compose.yaml`: local container orchestration
- `README.md`: short product/project introduction
- `README.Docker.md`: Docker-specific notes
- `migrations/`: database schema history

## Common Commands

### Backend

```bash
composer install
php bin/console doctrine:migrations:migrate
symfony server:start
```

### Frontend

```bash
yarn install
yarn dev
```

### Docker

```bash
composer docker
composer down
```

## Repository Layout

```text
src/                Symfony controllers, entities, services, security, form types
templates/          Twig templates for public pages, auth, dashboard, and errors
app/Resources/      Custom React/TypeScript and CSS used by feature areas
assets/             Shared frontend bootstrap, styles, and UI components
config/             Symfony package and routing configuration
public/             Public entrypoint and static assets
migrations/         Doctrine migration files
docker/             Nginx and PHP-FPM container definitions
tests/              PHPUnit bootstrap and test support
```

## Current State Summary

From the current codebase, the project is already structured around:

- public blog browsing
- account authentication
- dashboard-driven page authoring
- analytics-aware homepage content selection
- Docker-based local or deployment-oriented workflows

The existing `README.md` is a short introduction, while this file is intended to be a practical codebase reference for anyone opening the repository and trying to understand how it is organized.
