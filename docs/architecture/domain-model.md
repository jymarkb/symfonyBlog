# Domain Model

## Core Entities

### users

- `id`: local primary key
- `supabase_user_id`: unique foreign identity reference
- `email`
- `display_name`
- `first_name`
- `last_name`
- `avatar_url`
- `role`
- `created_at`
- `updated_at`

Notes:

- Supabase Auth is the identity source.
- Local user records store app-specific metadata and authorization fields.

### categories

- `id`
- `name`
- `slug`
- `description` nullable
- `created_at`
- `updated_at`

### posts

- `id`
- `user_id`
- `category_id`
- `title`
- `slug`
- `status`
- `summary` nullable
- `content_html` nullable
- `content_css` nullable
- `content_js` nullable
- `thumbnail_path` nullable
- `is_featured`
- `published_at` nullable
- `created_at`
- `updated_at`

Status defaults:

- `draft`
- `published`
- `archived` only if later needed

### post_analytics

- `id`
- `post_id`
- `views_count`
- `likes_count`
- `dislikes_count`
- `avg_read_time_seconds` nullable
- `last_viewed_at` nullable
- `created_at`
- `updated_at`

### media assets

Use a separate table only if the app needs searchable upload records, ownership, or moderation state. Otherwise store only `thumbnail_path` and similar references directly on content entities.

## Relationships

- one user has many posts
- one category has many posts
- one post has one analytics record

## Legacy Mapping

- `Account` -> `users`
- `Category` -> `categories`
- `Blog` -> `posts`
- `BlogAnalytics` -> `post_analytics`
- `htmlContent` -> `content_html`
- `htmlStyle` -> `content_css`
- `htmlScript` -> `content_js`
- `htmlThumbnail` -> `thumbnail_path`

## Constraints

- `users.supabase_user_id` must be unique
- `users.email` must be unique
- `categories.slug` must be unique
- `posts.slug` must be unique
- `posts.user_id` and `posts.category_id` are required

