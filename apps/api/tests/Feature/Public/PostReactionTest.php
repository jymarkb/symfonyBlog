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
                'reaction' => 'helpful',
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
                'reaction' => null,
                'counts' => [
                    'helpful' => 0,
                    'fire' => 0,
                    'insightful' => 0,
                ],
            ],
        ]);

    expect(PostReaction::where('user_id', $user->id)->count())->toBe(0);
});

it('switches to a different reaction without creating a duplicate row', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'helpful']);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/test-post/reactions', ['reaction' => 'insightful'])
        ->assertOk()
        ->assertJson([
            'data' => [
                'reaction' => 'insightful',
                'counts' => [
                    'helpful' => 0,
                    'fire' => 0,
                    'insightful' => 1,
                ],
            ],
        ]);

    expect(PostReaction::where('user_id', $user->id)->count())->toBe(1);
});

it('returns 404 for non-published slug', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'draft-post', 'status' => 'draft', 'published_at' => null]);

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/posts/draft-post/reactions', ['reaction' => 'helpful'])
        ->assertNotFound();
});
