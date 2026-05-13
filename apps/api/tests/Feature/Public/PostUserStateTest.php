<?php

use App\Models\AuthorFollow;
use App\Models\Post;
use App\Models\PostReaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns 401 for guest', function () {
    Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->getJson('/api/v1/posts/test-post/me')->assertUnauthorized();
});

it('returns default false state for authenticated user with no interactions', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['slug' => 'test-post', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/posts/test-post/me')
        ->assertOk()
        ->assertJson([
            'data' => [
                'is_following' => false,
                'reaction' => [],
            ],
        ])
        ->assertJsonMissingPath('data.supabase_user_id')
        ->assertJsonMissingPath('data.role')
        ->assertJsonMissingPath('data.email');
});

it('returns reaction star when user has starred the post via reactions', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['slug' => 'starred-post', 'status' => 'published', 'published_at' => now()]);

    PostReaction::create(['post_id' => $post->id, 'user_id' => $user->id, 'reaction' => 'star']);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/posts/starred-post/me')
        ->assertOk()
        ->assertJson([
            'data' => [
                'reaction' => ['star'],
                'is_following' => false,
            ],
        ]);
});

it('returns is_following true when user follows the post author', function () {
    $user = User::factory()->create();
    $author = User::factory()->create();
    $post = Post::factory()->create(['slug' => 'followed-post', 'status' => 'published', 'published_at' => now()]);
    $post->user()->associate($author->id);
    $post->save();

    AuthorFollow::create(['follower_id' => $user->id, 'author_id' => $author->id]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/posts/followed-post/me')
        ->assertOk()
        ->assertJson([
            'data' => [
                'is_following' => true,
                'reaction' => [],
            ],
        ]);
});

it('returns the reaction type when user has reacted to the post', function () {
    $user = User::factory()->create();
    $author = User::factory()->create();
    $post = Post::factory()->create(['slug' => 'reacted-post', 'status' => 'published', 'published_at' => now()]);
    $post->user()->associate($author->id);
    $post->save();

    PostReaction::create(['post_id' => $post->id, 'user_id' => $user->id, 'reaction' => 'helpful']);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/posts/reacted-post/me')
        ->assertOk()
        ->assertJson([
            'data' => [
                'reaction' => ['helpful'],
                'is_following' => false,
            ],
        ]);
});

it('returns multiple active reactions when user has applied several reaction types', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['slug' => 'multi-react-post', 'status' => 'published', 'published_at' => now()]);

    PostReaction::create(['post_id' => $post->id, 'user_id' => $user->id, 'reaction' => 'star']);
    PostReaction::create(['post_id' => $post->id, 'user_id' => $user->id, 'reaction' => 'fire']);

    $response = $this->actingAs($user, 'api')
        ->getJson('/api/v1/posts/multi-react-post/me')
        ->assertOk();

    $reactions = $response->json('data.reaction');
    sort($reactions);
    expect($reactions)->toBe(['fire', 'star']);
});

it('returns 404 for non-published slug', function () {
    $user = User::factory()->create();
    Post::factory()->create(['slug' => 'draft-post', 'status' => 'draft', 'published_at' => null]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/posts/draft-post/me')
        ->assertNotFound();
});
