<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function validPostPayload(string $slug): array
{
    return [
        'title' => 'Test Post Title',
        'slug' => $slug,
        'status' => 'draft',
        'body' => [
            [
                'type' => 'paragraph',
                'style' => ['base' => ['fontSize' => '18px', 'lineHeight' => 1.65]],
                'children' => [['text' => 'Hello world']],
            ],
        ],
    ];
}

it('rejects a reserved slug on post store', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts', validPostPayload('about'))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['slug']);
});

it('rejects a reserved slug on post update', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $post = Post::factory()->create(['user_id' => $admin->id, 'slug' => 'original-slug']);

    $this->actingAs($admin, 'api')
        ->patchJson("/api/v1/admin/posts/{$post->id}", ['slug' => 'signin'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['slug']);
});

it('rejects reserved slug case-insensitively on store', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts', validPostPayload('DASHBOARD'))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['slug']);
});

it('accepts a valid non-reserved slug on post store', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts', validPostPayload('my-valid-post-slug'))
        ->assertCreated();
});

it('accepts a valid non-reserved slug on post update', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $post = Post::factory()->create(['user_id' => $admin->id, 'slug' => 'original-slug']);

    $this->actingAs($admin, 'api')
        ->patchJson("/api/v1/admin/posts/{$post->id}", ['slug' => 'my-updated-slug'])
        ->assertOk();
});
