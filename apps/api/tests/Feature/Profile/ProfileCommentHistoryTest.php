<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('rejects guests from the profile comment history endpoint', function () {
    $this->getJson('/api/v1/profile/comments')
        ->assertUnauthorized();
});

it('returns an empty data array when the authenticated user has no comments', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile/comments')
        ->assertOk()
        ->assertJsonPath('data', []);
});

it('returns comments belonging to the authenticated user with the expected keys', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $comment = Comment::factory()->create([
        'user_id' => $user->id,
        'post_id' => $post->id,
    ]);

    $response = $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile/comments')
        ->assertOk();

    $data = $response->json('data');

    expect($data)->toHaveCount(1);

    $item = $data[0];

    expect($item)
        ->toHaveKey('id', $comment->id)
        ->toHaveKey('body', $comment->body)
        ->toHaveKey('post_title', $post->title)
        ->toHaveKey('post_slug', $post->slug)
        ->toHaveKey('created_at');
});

it('returns 429 when the comments rate limit is exceeded', function () {
    $user = User::factory()->create();

    $cacheKey = md5('auth-read' . $user->id);
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile/comments')
        ->assertTooManyRequests();
});

it('does not return comments belonging to another user', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $post = Post::factory()->create();

    Comment::factory()->create([
        'user_id' => $userB->id,
        'post_id' => $post->id,
    ]);

    $this->actingAs($userA, 'api')
        ->getJson('/api/v1/profile/comments')
        ->assertOk()
        ->assertJsonPath('data', []);
});
