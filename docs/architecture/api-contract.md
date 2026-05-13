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
- `excerpt`
- `cover_image`
- `is_featured`
- `published_at`
- `tags`
- `comments_count`
- `stars_count`
- `author`

Suggested query parameters:

- `page`
- `per_page`
- `tag`
- `featured`
- `search`

### `GET /api/v1/posts/{slug}`

Purpose:

- fetch a single public post by slug

Payload includes:

- list fields
- `body` as a blogEditor `BlockElement[]` JSON array

Rendering note:

- Laravel stores and returns editor block JSON only.
- The web app renders post detail content through the blogEditor public renderer.

### `GET /api/v1/tags`

Purpose:

- list available blog tags

### `GET /api/v1/posts/{slug}/me`

Purpose:

- return the authenticated user's interaction state for a post

Response shape (`data`):

- `is_following` — boolean, whether the user follows the post's author
- `reaction` — `"star" | "helpful" | "fire" | "insightful" | null`
- `followers_count` — current follower count for the post's author (loaded fresh, not from post cache)

Auth: required (`auth:api`). Returns 401 for guests.

### `POST /api/v1/posts/{slug}/reactions`

Purpose:

- toggle a reaction on a post (idempotent — posting the same reaction removes it)

Request body:

- `reaction` — required, one of `star | helpful | fire | insightful`

Response shape (`data`):

- `reaction` — the active reaction after toggle, or `null` if removed
- `counts` — object with keys `star`, `helpful`, `fire`, `insightful` (integer each)

Auth: required (`auth:api`). Returns 401 for guests.

### `POST /api/v1/authors/{authorId}/follow`

Purpose:

- follow an author as the authenticated user (idempotent via `firstOrCreate`)

Route constraint: `authorId` must match `[0-9]+` — non-integer segments return 404.

Request body:

- `author_id` — required integer, must exist in `users` table

Response shape (`data`):

- `follower_id`, `author_id`, `created_at`, `followers_count`

Returns 201. Returns 422 for self-follow or non-existent author.
Auth: required (`auth:api`). Rate-limited: `throttle:profile-mutations`.

### `DELETE /api/v1/authors/{authorId}/follow`

Purpose:

- unfollow an author as the authenticated user

Route constraint: `authorId` must match `[0-9]+` — non-integer segments return 404.

Returns 204 No Content. Idempotent — unfollowing a non-followed author also returns 204.
Auth: required (`auth:api`). Rate-limited: `throttle:profile-mutations`.

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

- posts: draft, create, edit, publish, unpublish, archive, delete, slug/SEO/tag/media fields
- users: list, view, role changes, suspend/restore, activity review
- comments: list, approve, hide, mark spam, delete, review reports
- tags: create, rename, reorder, merge, delete
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

### `GET /api/v1/admin/tags`

- dashboard tag listing

### `POST /api/v1/admin/tags`

- create a tag

### `PATCH /api/v1/admin/tags/{id}`

- update a tag

### `DELETE /api/v1/admin/tags/{id}`

- delete or archive a tag

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
