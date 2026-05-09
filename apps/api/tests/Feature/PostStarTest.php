<?php

use App\Models\Post;
use App\Models\PostStar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows an authenticated user to star and unstar a published post once', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create([
        'slug' => 'starred-post',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/starred-post/stars')
        ->assertCreated();

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/starred-post/stars')
        ->assertCreated();

    expect(PostStar::query()->where('post_id', $post->id)->where('user_id', $user->id)->count())
        ->toBe(1);

    $this->actingAs($user, 'api')
        ->deleteJson('/api/v1/posts/starred-post/stars')
        ->assertNoContent();

    expect(PostStar::query()->where('post_id', $post->id)->where('user_id', $user->id)->count())
        ->toBe(0);
});

it('rejects guests from starring posts', function () {
    Post::factory()->create([
        'slug' => 'starred-post',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->postJson('/api/v1/posts/starred-post/stars')
        ->assertUnauthorized();
});
