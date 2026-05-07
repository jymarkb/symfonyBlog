<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('rejects guests from the private profile endpoint', function () {
    $this->getJson('/api/v1/profile')
        ->assertUnauthorized();
});

it('rejects guests from the patch profile endpoint', function () {
    $this->patchJson('/api/v1/profile', ['display_name' => 'Hacker'])
        ->assertUnauthorized();
});

it('returns the signed-in user private profile', function () {
    $user = User::factory()->create([
        'email' => 'reader@example.com',
        'display_name' => 'Reader One',
        'role' => User::ROLE_USER,
    ]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.display_name', 'Reader One')
        ->assertJsonPath('data.notify_comment_replies', 'none')
        ->assertJsonPath('data.notify_new_posts', 'none')
        ->assertJsonMissingPath('data.email')
        ->assertJsonMissingPath('data.avatar_url')
        ->assertJsonMissingPath('data.role')
        ->assertJsonMissingPath('data.supabase_user_id');
});

it('updates allowed private profile fields', function () {
    $user = User::factory()->create([
        'display_name' => 'Old Name',
        'first_name' => null,
        'last_name' => null,
    ]);

    $this->actingAs($user, 'api')
        ->patchJson('/api/v1/profile', [
            'display_name' => 'New Name',
            'first_name' => 'New',
            'last_name' => 'Reader',
        ])
        ->assertOk()
        ->assertJsonPath('data.display_name', 'New Name')
        ->assertJsonPath('data.first_name', 'New')
        ->assertJsonPath('data.last_name', 'Reader');

    expect($user->refresh())
        ->display_name->toBe('New Name')
        ->first_name->toBe('New')
        ->last_name->toBe('Reader');
});

it('does not update role from the private profile endpoint', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_USER,
    ]);

    $this->actingAs($user, 'api')
        ->patchJson('/api/v1/profile', [
            'display_name' => 'Still A User',
            'role' => User::ROLE_ADMIN,
        ])
        ->assertOk();

    expect($user->refresh()->role)->toBe(User::ROLE_USER);
});

it('rejects guests from deleting the private profile', function () {
    $this->deleteJson('/api/v1/profile')
        ->assertUnauthorized();
});

it('does not allow deleting another user account via the profile delete endpoint', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $this->actingAs($userA, 'api')
        ->deleteJson('/api/v1/profile')
        ->assertOk();

    expect(User::find($userB->id))->not->toBeNull();
    expect(User::find($userA->id))->toBeNull();
});

it('returns 429 when the profile patch rate limit is exceeded', function () {
    $user = User::factory()->create();

    $cacheKey = md5('profile-mutations' . $user->id);
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->patchJson('/api/v1/profile', ['display_name' => 'Test'])
        ->assertTooManyRequests();
});

it('returns 429 when the profile get rate limit is exceeded', function () {
    $user = User::factory()->create();

    $cacheKey = md5('auth-read' . $user->id);
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile')
        ->assertTooManyRequests();
});
