<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function protectedRoutes(): array
{
    return [
        'GET session'                  => ['GET',   '/api/v1/session'],
        'GET profile'                  => ['GET',   '/api/v1/profile'],
        'PATCH profile'                => ['PATCH', '/api/v1/profile'],
        'DELETE profile'               => ['DELETE','/api/v1/profile'],
        'GET profile comments'         => ['GET',   '/api/v1/profile/comments'],
        'GET profile reading-history'  => ['GET',   '/api/v1/profile/reading-history'],
        'PATCH profile notifications'  => ['PATCH', '/api/v1/profile/notifications'],
    ];
}

function adminOnlyRoutes(): array
{
    return [
        'GET admin posts'       => ['GET',  '/api/v1/admin/posts'],
        'POST admin posts'      => ['POST', '/api/v1/admin/posts'],
        'GET admin users'       => ['GET',  '/api/v1/admin/users'],
        'GET admin comments'    => ['GET',  '/api/v1/admin/comments'],
        'GET admin categories'  => ['GET',  '/api/v1/admin/categories'],
        'POST admin uploads'    => ['POST', '/api/v1/admin/uploads'],
    ];
}

// 401 canonical shape
it('returns the canonical unauthenticated error shape', function () {
    $this->getJson('/api/v1/session')
        ->assertUnauthorized()
        ->assertExactJson([
            'error'   => 'unauthenticated',
            'message' => 'A valid authentication token is required.',
        ]);
});

it('returns the unauthenticated error shape on every protected route', function (string $method, string $uri) {
    $this->json($method, $uri)
        ->assertUnauthorized()
        ->assertJsonPath('error', 'unauthenticated');
})->with(protectedRoutes());

it('returns the unauthenticated error shape on every admin route when guest', function (string $method, string $uri) {
    $this->json($method, $uri)
        ->assertUnauthorized()
        ->assertJsonPath('error', 'unauthenticated');
})->with(adminOnlyRoutes());

// 403 canonical shape
it('returns the canonical forbidden error shape', function () {
    $user = User::factory()->create(['role' => User::ROLE_USER]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/admin/posts')
        ->assertForbidden()
        ->assertExactJson([
            'error'   => 'forbidden',
            'message' => 'You do not have permission to access this resource.',
        ]);
});

it('returns the forbidden error shape on every admin route for normal users', function (string $method, string $uri) {
    $user = User::factory()->create(['role' => User::ROLE_USER]);

    $this->actingAs($user, 'api')
        ->json($method, $uri)
        ->assertForbidden()
        ->assertJsonPath('error', 'forbidden');
})->with(adminOnlyRoutes());
