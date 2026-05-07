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
