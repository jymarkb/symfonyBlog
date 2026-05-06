<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function adminRoutes(): array
{
    return [
        'GET admin posts' => ['GET', '/api/v1/admin/posts', 200],
        'POST admin posts' => ['POST', '/api/v1/admin/posts', 201],
        'PATCH admin posts' => ['PATCH', '/api/v1/admin/posts/123', 200],
        'DELETE admin posts' => ['DELETE', '/api/v1/admin/posts/123', 204],

        'GET admin users' => ['GET', '/api/v1/admin/users', 200],
        'PATCH admin users' => ['PATCH', '/api/v1/admin/users/123', 200],

        'GET admin comments' => ['GET', '/api/v1/admin/comments', 200],
        'PATCH admin comments' => ['PATCH', '/api/v1/admin/comments/123', 200],

        'GET admin categories' => ['GET', '/api/v1/admin/categories', 200],
        'POST admin categories' => ['POST', '/api/v1/admin/categories', 201],
        'PATCH admin categories' => ['PATCH', '/api/v1/admin/categories/123', 200],
        'DELETE admin categories' => ['DELETE', '/api/v1/admin/categories/123', 204],

        'POST admin uploads' => ['POST', '/api/v1/admin/uploads', 201],
    ];
}

it('rejects guests from every admin route', function (string $method, string $uri) {
    $this->json($method, $uri)
        ->assertUnauthorized();
})->with(adminRoutes());

it('forbids normal users from every admin route', function (string $method, string $uri) {
    $user = User::factory()->create([
        'role' => User::ROLE_USER,
    ]);

    $this->actingAs($user, 'api')
        ->json($method, $uri)
        ->assertForbidden();
})->with(adminRoutes());

it('allows admins through every admin placeholder route', function (
    string $method,
    string $uri,
    int $expectedStatus,
) {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $this->actingAs($admin, 'api')
        ->json($method, $uri)
        ->assertStatus($expectedStatus);
})->with(adminRoutes());
