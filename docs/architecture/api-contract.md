# API Contract

## General Rules

- Base prefix: `/api/v1`
- JSON-only responses
- Authenticated requests use a Supabase JWT bearer token
- Laravel resolves the caller into a local app user record
- List endpoints return paginated payloads by default

## Controller Conventions

API controllers should use resource-style method names by default:

- `index` for `GET` collection endpoints
- `store` for `POST` create endpoints
- `show` for `GET` single-resource endpoints
- `update` for `PATCH` update endpoints
- `destroy` for `DELETE` endpoints

Avoid custom action names such as `moderate`, `approve`, `reject`, `publish`, or `archive` unless the action cannot reasonably be represented as a resource update.

Admin controller class names should not repeat `Admin` inside the admin namespace. Use `App\Http\Controllers\Api\V1\Admin\PostController`, not `App\Http\Controllers\Api\V1\Admin\AdminPostController`.

Controllers should stay thin:

- controllers handle request orchestration
- services own business logic and model lookup/update rules
- resources own JSON response shape
- middleware and policies own authorization boundaries

## Public Endpoints

### `GET /api/v1/posts`

Purpose:

- list public posts with optional filtering

Default fields:

- `id`
- `title`
- `slug`
- `summary`
- `thumbnail_url`
- `is_featured`
- `published_at`
- `category`
- `author`

Suggested query parameters:

- `page`
- `per_page`
- `category`
- `featured`
- `search`

### `GET /api/v1/posts/{slug}`

Purpose:

- fetch a single public post by slug

Payload includes:

- list fields
- `content_html`
- `content_css`
- `content_js`
- analytics summary if exposed publicly later

### `GET /api/v1/categories`

Purpose:

- list available blog categories

### `GET /api/v1/profiles/{handle}`

Purpose:

- return a public profile for another user

Must not include:

- email address
- password or security controls
- notification settings
- private reading history
- account deletion controls

## Authenticated Endpoints

### `GET /api/v1/session`

Purpose:

- return the current app user and resolved permissions

### `GET /api/v1/profile`

Purpose:

- return the signed-in user's private profile/settings payload

### `PATCH /api/v1/profile`

Purpose:

- update the signed-in user's profile fields

### `PATCH /api/v1/profile/password`

Purpose:

- update the signed-in user's Supabase-owned password flow or broker the frontend password update state

### `DELETE /api/v1/profile`

Purpose:

- delete or deactivate the signed-in user's local account according to the product deletion policy

## Admin Endpoints

Admin endpoints are currently scaffolded as protected controller placeholders. The authorization boundary is the important part for this phase: every `/api/v1/admin/*` route must sit behind both `auth:api` and `admin` middleware.

Future admin business logic belongs behind these routes and should be implemented feature by feature:

- posts: draft, create, edit, publish, unpublish, archive, delete, slug/SEO/category/tag/media fields
- users: list, view, role changes, suspend/restore, activity review
- comments: list, approve, hide, mark spam, delete, review reports
- categories: create, rename, reorder, merge, delete
- uploads: create media upload records or broker storage uploads
- stats: dashboard totals, post views, popular posts, traffic summaries, user/comment growth

Keep controllers as thin request/response classes. Put admin business rules in services and response shaping in resources.

### `GET /api/v1/admin/posts`

- dashboard post listing

### `POST /api/v1/admin/posts`

- create a new post

### `PATCH /api/v1/admin/posts/{id}`

- update an existing post

### `DELETE /api/v1/admin/posts/{id}`

- delete a post

### `POST /api/v1/admin/uploads`

- create or broker upload flow for media assets

### `GET /api/v1/admin/users`

- dashboard user listing

### `PATCH /api/v1/admin/users/{id}`

- admin update for user role/status/moderation fields

### `GET /api/v1/admin/comments`

- dashboard comment/moderation listing

### `PATCH /api/v1/admin/comments/{id}`

- update comment moderation fields such as status, hidden state, or spam state

### `GET /api/v1/admin/categories`

- dashboard category listing

### `POST /api/v1/admin/categories`

- create a category

### `PATCH /api/v1/admin/categories/{id}`

- update a category

### `DELETE /api/v1/admin/categories/{id}`

- delete or archive a category

## Analytics Endpoint

### `POST /api/v1/posts/{slug}/view`

- increment or record a page view event

## Response Conventions

- validation errors use a consistent error envelope
- successful writes return normalized resource payloads
- timestamps use ISO 8601 strings
- booleans remain booleans, not integer flags

## Auth Contract

- frontend authenticates through Supabase
- frontend sends bearer token to Laravel
- Laravel verifies the token, maps `sub` to `users.supabase_user_id`, and creates the local user record on first trusted bootstrap if needed
- frontend uses `GET /api/v1/session` for current-user identity and role-aware UI state
