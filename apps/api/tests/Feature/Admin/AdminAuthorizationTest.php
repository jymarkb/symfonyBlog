<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('rejects guests from admin routes', function () {
    $this->getJson('/api/v1/admin/posts')
        ->assertUnauthorized();
});

it('forbids normal users from admin routes', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_USER,
    ]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/admin/posts')
        ->assertForbidden();
});

it('allows admins to access admin placeholder routes', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $this->actingAs($admin, 'api')
        ->getJson('/api/v1/admin/posts')
        ->assertOk();

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts')
        ->assertCreated();

    $this->actingAs($admin, 'api')
        ->patchJson('/api/v1/admin/posts/123')
        ->assertOk()
        ->assertJsonPath('id', '123');

    $this->actingAs($admin, 'api')
        ->deleteJson('/api/v1/admin/posts/123')
        ->assertNoContent();
});
