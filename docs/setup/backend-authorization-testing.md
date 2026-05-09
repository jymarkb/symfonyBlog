# Backend Authorization Testing

## Purpose

This tutorial explains how to manually verify the Laravel authorization scaffold before the frontend guard layer is wired.

The backend should prove these boundaries:

- guests receive `401` on signed-in routes
- normal users receive `403` on admin routes
- admins can reach `/api/v1/admin/*` route handlers
- private profile data stays behind `auth:api`
- public profile data never exposes private account fields

## What Exists

Current protected areas:

```text
GET    /api/v1/session
GET    /api/v1/profile
PATCH  /api/v1/profile
DELETE /api/v1/profile

GET    /api/v1/admin/posts
POST   /api/v1/admin/posts
PATCH  /api/v1/admin/posts/{post}
DELETE /api/v1/admin/posts/{post}
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/{user}
GET    /api/v1/admin/comments
PATCH  /api/v1/admin/comments/{comment}
GET    /api/v1/admin/tags
POST   /api/v1/admin/tags
PATCH  /api/v1/admin/tags/{tag}
DELETE /api/v1/admin/tags/{tag}
POST   /api/v1/admin/uploads
```

Current public profile route:

```text
GET /api/v1/profiles/{handle}
```

## Before Testing

Start the API app:

```bash
cd apps/api
php artisan serve
```

Use an API base URL such as:

```text
http://127.0.0.1:8000/api/v1
```

To test authenticated routes, sign in through the frontend or Supabase and copy the Supabase access token. Use it as:

```text
Authorization: Bearer <access-token>
```

## Syntax Checks

Run these after route/controller edits:

```bash
cd apps/api
php -l routes/api.php
find app/Http/Controllers/Api/V1 app/Http/Resources app/Services -type f -name '*.php' -exec php -l {} \;
```

Expected result:

```text
No syntax errors detected
```

## Route Check

List the admin routes:

```bash
cd apps/api
php artisan route:list --path=api/v1/admin
```

Confirm every admin route shows both middleware layers:

```text
api
Illuminate\Auth\Middleware\Authenticate:api
permission:admin
```

The `auth:api` alias is no longer used — the `Authenticate` middleware is appended globally to the `api` group via `bootstrap/app.php`. The `admin` alias is no longer used — admin routes use `permission:admin` via the `RequirePermission` middleware.

Also confirm there is no `/api/v1/me` route:

```bash
php artisan route:list --path=api/v1/me
```

Expected result: no matching app route.

## Manual Curl Tests

Guest session check:

```bash
curl -i http://127.0.0.1:8000/api/v1/session
```

Expected:

```text
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error":"unauthenticated","message":"A valid authentication token is required."}
```

Signed-in session check:

```bash
curl -i \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <user-token>" \
  http://127.0.0.1:8000/api/v1/session
```

Expected:

```text
200 OK
```

Response should include:

```json
{
  "data": {
    "user": {},
    "permissions": {}
  }
}
```

Guest private profile check:

```bash
curl -i http://127.0.0.1:8000/api/v1/profile
```

Expected:

```text
401 Unauthorized
```

Signed-in private profile check:

```bash
curl -i \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <user-token>" \
  http://127.0.0.1:8000/api/v1/profile
```

Expected:

```text
200 OK
```

Public profile check:

```bash
curl -i http://127.0.0.1:8000/api/v1/profiles/jymb
```

Expected:

```text
200 OK
```

or:

```text
404 Not Found
```

if the handle does not exist.

The public profile response must not include:

```text
email
role
supabase_user_id
first_name
last_name
```

Normal user admin check:

```bash
curl -i \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <user-token>" \
  http://127.0.0.1:8000/api/v1/admin/posts
```

Expected:

```text
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error":"forbidden","message":"You do not have permission to access this resource."}
```

Admin route check:

```bash
curl -i \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  http://127.0.0.1:8000/api/v1/admin/posts
```

Expected:

```text
200 OK
```

## Automated Test Plan

Create feature tests later under:

```text
apps/api/tests/Feature/Auth/SessionEndpointTest.php
apps/api/tests/Feature/Profile/ProfileEndpointTest.php
apps/api/tests/Feature/Profile/PublicProfileEndpointTest.php
apps/api/tests/Feature/Admin/AdminAuthorizationTest.php
```

Minimum cases:

```text
SessionEndpointTest
- guest cannot access /api/v1/session
- signed-in user receives user and permissions
- admin receives admin permissions

ProfileEndpointTest
- guest cannot access /api/v1/profile
- signed-in user can view private profile
- signed-in user can update allowed profile fields
- signed-in user cannot update role

PublicProfileEndpointTest
- guest can view /api/v1/profiles/{handle}
- public profile does not expose email
- public profile does not expose role
- public profile does not expose supabase_user_id
- missing handle returns 404

AdminAuthorizationTest
- guest receives 401 on admin routes
- normal user receives 403 on admin routes
- admin reaches admin placeholder handlers
```

## Done Criteria

Backend authorization is ready for frontend guard work when:

- `/api/v1/session` is the only current-user endpoint
- `/api/v1/profile` requires auth
- `/api/v1/profiles/{handle}` is public and safe
- every `/api/v1/admin/*` route requires global auth (`Authenticate:api`) and `permission:admin`
- placeholder admin controllers use `index`, `store`, `show`, `update`, or `destroy`
- syntax and route-list checks pass
