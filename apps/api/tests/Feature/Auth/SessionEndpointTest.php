<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('rejects guests from the session endpoint', function () {
    $this->getJson('/api/v1/session')
        ->assertUnauthorized();
});

it('returns the signed-in user and permissions', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_USER,
    ]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/session')
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonPath('data.permissions.admin', false)
        ->assertJsonPath('data.permissions.comment', true)
        ->assertJsonMissingPath('data.user.role')
        ->assertJsonMissingPath('data.user.supabase_user_id');
});

it('returns admin permissions for admins', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $this->actingAs($admin, 'api')
        ->getJson('/api/v1/session')
        ->assertOk()
        ->assertJsonPath('data.permissions.admin', true)
        ->assertJsonPath('data.permissions.manage_posts', true)
        ->assertJsonPath('data.permissions.manage_users', true)
        ->assertJsonPath('data.permissions.moderate_comments', true);
});

it('returns 429 when the session rate limit is exceeded', function () {
    $user = User::factory()->create();

    // ThrottleRequests hashes named limiter keys as md5($limiterName . $limitKey).
    // The session limiter keys by IP address, so pre-fill the bucket using the test IP.
    $cacheKey = md5('session' . '127.0.0.1');
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/session')
        ->assertTooManyRequests();
});
