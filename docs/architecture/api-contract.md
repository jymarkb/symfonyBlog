# API Contract

## General Rules

- Base prefix: `/api/v1`
- JSON-only responses
- Authenticated requests use a Supabase JWT bearer token
- Laravel resolves the caller into a local app user record
- List endpoints return paginated payloads by default

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

## Authenticated Endpoints

### `GET /api/v1/me`

Purpose:

- return the current app user and resolved permissions

### `GET /api/v1/admin/posts`

- dashboard post listing

### `POST /api/v1/admin/posts`

- create a new post

### `PUT /api/v1/admin/posts/{id}`

- update an existing post

### `DELETE /api/v1/admin/posts/{id}`

- delete a post

### `POST /api/v1/admin/uploads`

- create or broker upload flow for media assets

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

