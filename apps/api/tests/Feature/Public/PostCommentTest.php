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
        ])
        ->assertJsonMissingPath('data.0.author.role')
        ->assertJsonMissingPath('data.0.author.email')
        ->assertJsonMissingPath('data.0.author.supabase_user_id')
        ->assertJsonMissingPath('data.0.user_id');
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
        ->assertUnauthorized()
        ->assertJson(['error' => 'unauthenticated']);
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
        ])
        ->assertJsonMissingPath('data.author.role')
        ->assertJsonMissingPath('data.author.email')
        ->assertJsonMissingPath('data.author.supabase_user_id')
        ->assertJsonMissingPath('data.user_id');
});

it('returns 422 for empty body', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", ['body' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});

it('returns 422 for body exceeding 250 characters', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", ['body' => str_repeat('a', 251)])
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

it('returns 422 when parent_id belongs to a comment on a different post', function () {
    $user    = User::factory()->create();
    $postA   = Post::factory()->create(['status' => 'published']);
    $postB   = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $postA->id]);

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$postB->slug}/comments", [
            'body'      => 'Cross-post reply attempt',
            'parent_id' => $comment->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['parent_id']);
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/posts/{slug}/comments/{comment}
// ---------------------------------------------------------------------------

it('returns 401 for guest on update', function () {
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id]);

    $this->patchJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}", ['body' => 'Updated body'])
        ->assertUnauthorized()
        ->assertJson(['error' => 'unauthenticated']);
});

it('owner can update their comment and returns 200 with resource shape', function () {
    $user    = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'api')
        ->patchJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}", ['body' => 'Updated body'])
        ->assertOk()
        ->assertJsonStructure([
            'data' => ['id', 'body', 'author'],
        ])
        ->assertJsonMissingPath('data.author.role')
        ->assertJsonMissingPath('data.author.email')
        ->assertJsonMissingPath('data.author.supabase_user_id')
        ->assertJsonMissingPath('data.user_id');
});

it('returns 403 when non-owner tries to update a comment', function () {
    $owner   = User::factory()->create();
    $other   = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($other, 'api')
        ->patchJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}", ['body' => 'Attempted update'])
        ->assertForbidden()
        ->assertJson([
            'error'   => 'forbidden',
            'message' => 'You do not have permission to access this resource.',
        ]);
});

it('returns 422 when update body is empty', function () {
    $user    = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'api')
        ->patchJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}", ['body' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});

it('returns 422 when update body exceeds 250 characters', function () {
    $user    = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'api')
        ->patchJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}", ['body' => str_repeat('a', 251)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});

it('returns 404 when comment does not exist on update', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $this->actingAs($user, 'api')
        ->patchJson("/api/v1/posts/{$post->slug}/comments/99999", ['body' => 'Some body'])
        ->assertNotFound();
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/posts/{slug}/comments/{comment}
// ---------------------------------------------------------------------------

it('returns 401 for guest on destroy', function () {
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id]);

    $this->deleteJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}")
        ->assertUnauthorized()
        ->assertJson(['error' => 'unauthenticated']);
});

it('owner can delete their comment and returns 204', function () {
    $user    = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'api')
        ->deleteJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}")
        ->assertNoContent();
});

it('returns 403 when non-owner tries to delete a comment', function () {
    $owner   = User::factory()->create();
    $other   = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($other, 'api')
        ->deleteJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}")
        ->assertForbidden()
        ->assertJson([
            'error'   => 'forbidden',
            'message' => 'You do not have permission to access this resource.',
        ]);
});

it('returns 404 when comment does not exist on destroy', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $this->actingAs($user, 'api')
        ->deleteJson("/api/v1/posts/{$post->slug}/comments/99999")
        ->assertNotFound();
});

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

it('returns 429 when the comment list rate limit is exceeded', function () {
    $post = Post::factory()->create(['status' => 'published']);

    $cacheKey = md5('public-api' . '127.0.0.1');
    for ($i = 0; $i <= 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson("/api/v1/posts/{$post->slug}/comments")
        ->assertTooManyRequests();
});

it('returns 429 when comment-create rate limit is exceeded', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['status' => 'published']);

    $cacheKey = md5('comment-create' . $user->id);
    for ($i = 0; $i <= 10; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->postJson("/api/v1/posts/{$post->slug}/comments", ['body' => 'Over the limit'])
        ->assertTooManyRequests();
});

it('returns 429 when profile-mutations rate limit is exceeded for update', function () {
    $user    = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $cacheKey = md5('profile-mutations' . $user->id);
    for ($i = 0; $i <= 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->patchJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}", ['body' => 'Updated'])
        ->assertTooManyRequests();
});

it('returns 429 when profile-mutations rate limit is exceeded for delete', function () {
    $user    = User::factory()->create();
    $post    = Post::factory()->create(['status' => 'published']);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $cacheKey = md5('profile-mutations' . $user->id);
    for ($i = 0; $i <= 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->deleteJson("/api/v1/posts/{$post->slug}/comments/{$comment->id}")
        ->assertTooManyRequests();
});
