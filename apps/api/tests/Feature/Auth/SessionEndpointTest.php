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
        ->assertJsonPath('data.permissions.manage_tags', true)
        ->assertJsonPath('data.permissions.moderate_comments', true);
});

it('returns only the signed-in user data, not another user', function () {
    $userA = User::factory()->create(['email' => 'a@example.com']);
    $userB = User::factory()->create(['email' => 'b@example.com']);

    $idFromA = $this->actingAs($userA, 'api')
        ->getJson('/api/v1/session')
        ->assertOk()
        ->json('data.user.id');

    $idFromB = $this->actingAs($userB, 'api')
        ->getJson('/api/v1/session')
        ->assertOk()
        ->json('data.user.id');

    expect($idFromA)->toBe($userA->id)
        ->and($idFromB)->toBe($userB->id)
        ->and($idFromA)->not->toBe($idFromB);
});

it('returns 429 when the session rate limit is exceeded', function () {
    $user = User::factory()->create();

    // ThrottleRequests hashes named limiter keys as md5($limiterName . $limitKey).
    // The session limiter keys by user ID when authenticated.
    $cacheKey = md5('session' . $user->getKey());
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/session')
        ->assertTooManyRequests();
});
