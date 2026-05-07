<?php

use App\Models\Post;
use App\Models\PostView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('rejects guests from the profile reading history endpoint', function () {
    $this->getJson('/api/v1/profile/reading-history')
        ->assertUnauthorized();
});

it('returns an empty data array when the authenticated user has no views', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile/reading-history')
        ->assertOk()
        ->assertJsonPath('data', []);
});

it('returns reading history belonging to the authenticated user with correct values', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $view = PostView::factory()->create([
        'user_id'       => $user->id,
        'post_id'       => $post->id,
        'read_progress' => 75,
        'last_viewed_at' => '2026-01-15 10:30:00',
    ]);

    $response = $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile/reading-history')
        ->assertOk();

    $data = $response->json('data');

    expect($data)->toHaveCount(1);

    $item = $data[0];

    expect($item)
        ->toHaveKey('post_id', $post->id)
        ->toHaveKey('post_title', $post->title)
        ->toHaveKey('post_slug', $post->slug)
        ->toHaveKey('read_progress', 75)
        ->toHaveKey('last_viewed_at', $view->last_viewed_at->toISOString());
});

it('returns 429 when the reading history rate limit is exceeded', function () {
    $user = User::factory()->create();

    $cacheKey = md5('auth-read' . $user->id);
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/profile/reading-history')
        ->assertTooManyRequests();
});

it('does not return reading history belonging to another user', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $post = Post::factory()->create();

    PostView::factory()->create([
        'user_id' => $userB->id,
        'post_id' => $post->id,
    ]);

    $this->actingAs($userA, 'api')
        ->getJson('/api/v1/profile/reading-history')
        ->assertOk()
        ->assertJsonPath('data', []);
});
