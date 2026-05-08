<?php

use App\Models\User;
use App\Models\Post;
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
    $post = Post::factory()->create();

    $this->actingAs($admin, 'api')
        ->getJson('/api/v1/admin/posts')
        ->assertOk();

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts', [
            'title' => 'Admin authorization post',
            'body' => [
                [
                    'type' => 'paragraph',
                    'style' => ['base' => ['fontSize' => '18px']],
                    'children' => [['text' => 'Admin authorization body']],
                ],
            ],
            'status' => 'draft',
        ])
        ->assertCreated();

    $this->actingAs($admin, 'api')
        ->patchJson('/api/v1/admin/posts/'.$post->id, [
            'title' => 'Updated admin authorization post',
        ])
        ->assertOk()
        ->assertJsonPath('data.id', $post->id);

    $this->actingAs($admin, 'api')
        ->deleteJson('/api/v1/admin/posts/'.$post->id)
        ->assertNoContent();
});
