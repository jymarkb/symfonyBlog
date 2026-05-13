<?php

use App\Models\Post;
use App\Models\PostReaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns 401 for guest', function () {
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'helpful'])
        ->assertUnauthorized();
});

it('returns 422 for invalid reaction value', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'invalid-reaction'])
        ->assertUnprocessable();
});

it('creates a reaction on first use and returns counts', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'helpful'])
        ->assertOk()
        ->assertJson([
            'data' => [
                'reaction' => ['helpful'],
                'counts' => [
                    'helpful' => 1,
                    'fire' => 0,
                    'insightful' => 0,
                ],
            ],
        ]);
});

it('toggles the reaction off when the same reaction is sent twice', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'fire']);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'fire'])
        ->assertOk()
        ->assertJson([
            'data' => [
                'reaction' => [],
                'counts' => [
                    'helpful' => 0,
                    'fire' => 0,
                    'insightful' => 0,
                ],
            ],
        ]);

    expect(PostReaction::where('user_id', $user->id)->count())->toBe(0);
});

it('adds a second reaction type without removing the first', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'helpful']);

    $response = $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'fire'])
        ->assertOk();

    $reactions = $response->json('data.reaction');
    sort($reactions);
    expect($reactions)->toBe(['fire', 'helpful']);

    expect($response->json('data.counts.helpful'))->toBe(1);
    expect($response->json('data.counts.fire'))->toBe(1);

    expect(PostReaction::where('user_id', $user->id)->count())->toBe(2);
});

it('toggling one reaction does not affect another active reaction', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'star']);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'fire']);

    // Now toggle fire off
    $response = $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'fire'])
        ->assertOk();

    expect($response->json('data.reaction'))->toBe(['star']);
    expect($response->json('data.counts.star'))->toBe(1);
    expect($response->json('data.counts.fire'))->toBe(0);

    expect(PostReaction::where('user_id', $user->id)->count())->toBe(1);
});

it('allows all four reaction types to be active simultaneously', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    foreach (['star', 'helpful', 'fire', 'insightful'] as $type) {
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => $type])
            ->assertOk();
    }

    $response = $this->actingAs($user, 'api')
        ->getJson('/api/v1/posts/test-post/me')
        ->assertOk();

    $reactions = $response->json('data.reaction');
    sort($reactions);
    expect($reactions)->toBe(['fire', 'helpful', 'insightful', 'star']);

    expect(PostReaction::where('user_id', $user->id)->count())->toBe(4);
});

it('returns 404 for non-published slug', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'draft-post', 'status' => 'draft', 'published_at' => null]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/draft-post/reactions', ['reaction' => 'helpful'])
        ->assertNotFound();
});
