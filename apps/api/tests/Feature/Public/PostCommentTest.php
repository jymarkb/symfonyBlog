<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// GET /api/v1/posts/{slug}/comments
// ---------------------------------------------------------------------------

it('returns 200 with paginated shape for published post', function () {
    $post = Post::factory()->create(['status' => 'published']);
    Comment::factory()->create(['post_id' => $post->id]);

    $this->getJson("/api/v1/posts/{$post->slug}/comments")
        ->assertOk()
        ->assertJsonStructure([
            'data',
            'links' => ['first', 'last', 'prev', 'next'],
            'meta'  => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

it('returns comment items with correct shape', function () {
    $user    = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->getJson("/api/v1/posts/{$post->slug}/comments")
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'body',
                    'parent_id',
                    'created_at',
                    'is_post_author',
                    'author' => ['id', 'display_name', 'handle', 'avatar_url'],
                    'replies',
                ],
            ],
        ]);
});

it('returns 404 for non-existent slug', function () {
    $this->getJson('/api/v1/posts/slug-that-does-not-exist/comments')
        ->assertNotFound();
});

it('returns 404 for draft post', function () {
    $post = Post::factory()->draft()->create();

    $this->getJson("/api/v1/posts/{$post->slug}/comments")
        ->assertNotFound();
});

it('returns only top-level comments (no orphan replies in root)', function () {
    $post   = Post::factory()->create(['status' => 'published']);
    $parent = Comment::factory()->create(['post_id' => $post->id]);
    Comment::factory()->create(['post_id' => $post->id, 'parent_id' => $parent->id]);

    $response = $this->getJson("/api/v1/posts/{$post->slug}/comments")->assertOk();

    // Only one root comment expected
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.replies'))->toHaveCount(1);
});

it('returns replies nested inside parent comment', function () {
    $user   = User::factory()->create();
    $post   = Post::factory()->create(['status' => 'published']);
    $parent = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);
    Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id, 'parent_id' => $parent->id]);

    $response = $this->getJson("/api/v1/posts/{$post->slug}/comments")->assertOk();

    expect($response->json('data.0.replies.0'))->toHaveKeys(['id', 'body', 'parent_id', 'author']);
    expect($response->json('data.0.replies.0.parent_id'))->toBe($parent->id);
});

// ---------------------------------------------------------------------------
// POST /api/v1/posts/{slug}/comments
// ---------------------------------------------------------------------------

it('returns 401 for guest on store', function () {
    $post = Post::factory()->create(['status' => 'published']);

    $this->postJson("/api/v1/posts/{$post->slug}/comments", ['body' => 'Hello world'])
        ->assertUnauthorized();
});

it('creates a comment and returns 201 with resource shape', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", ['body' => 'Great post!'])
        ->assertCreated()
        ->assertJsonStructure([
            'data' => [
                'id',
                'body',
                'parent_id',
                'created_at',
                'is_post_author',
                'author' => ['id', 'display_name', 'handle', 'avatar_url'],
                'replies',
            ],
        ]);
});

it('returns 422 for empty body', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", ['body' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});

it('returns 422 for body exceeding 5000 characters', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", ['body' => str_repeat('a', 5001)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});

it('creates a reply with parent_id set in response', function () {
    $user   = User::factory()->create();
    $post   = Post::factory()->create(['status' => 'published']);
    $parent = Comment::factory()->create(['post_id' => $post->id]);

    $response = $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", [
            'body'      => 'This is a reply',
            'parent_id' => $parent->id,
        ])
        ->assertCreated();

    expect($response->json('data.parent_id'))->toBe($parent->id);
});

it('returns 422 when parent_id belongs to a reply (depth > 1 not allowed)', function () {
    $user   = User::factory()->create();
    $post   = Post::factory()->create(['status' => 'published']);
    $parent = Comment::factory()->create(['post_id' => $post->id]);
    $reply  = Comment::factory()->create(['post_id' => $post->id, 'parent_id' => $parent->id]);

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", [
            'body'      => 'Nested reply attempt',
            'parent_id' => $reply->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['parent_id']);
});
