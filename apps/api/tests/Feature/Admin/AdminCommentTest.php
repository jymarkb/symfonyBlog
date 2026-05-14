<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// GET /api/v1/admin/comments
// ---------------------------------------------------------------------------

it('returns 401 for guest on admin comment list', function () {
    $this->getJson('/api/v1/admin/comments')
        ->assertUnauthorized()
        ->assertJson(['error' => 'unauthenticated']);
});

it('returns 403 for regular user on admin comment list', function () {
    $user = User::factory()->create(['role' => User::ROLE_USER]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/admin/comments')
        ->assertForbidden()
        ->assertJson(['error' => 'forbidden', 'message' => 'You do not have permission to access this resource.']);
});

it('returns 200 with paginated list for admin', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    Comment::factory()->count(3)->create();

    $this->actingAs($admin, 'api')
        ->getJson('/api/v1/admin/comments')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'body', 'parent_id', 'created_at', 'is_post_author', 'author'],
            ],
            'links',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ])
        ->assertJsonMissingPath('data.0.author.role')
        ->assertJsonMissingPath('data.0.author.email')
        ->assertJsonMissingPath('data.0.author.supabase_user_id')
        ->assertJsonMissingPath('data.0.user_id');
});

it('filters by post_id when provided', function () {
    $admin  = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $postA  = Post::factory()->create();
    $postB  = Post::factory()->create();

    Comment::factory()->count(2)->create(['post_id' => $postA->id]);
    Comment::factory()->count(3)->create(['post_id' => $postB->id]);

    $response = $this->actingAs($admin, 'api')
        ->getJson("/api/v1/admin/comments?post_id={$postA->id}")
        ->assertOk();

    expect($response->json('meta.total'))->toBe(2);
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/admin/comments/{comment}
// ---------------------------------------------------------------------------

it('returns 204 and deletes the comment as admin', function () {
    $admin   = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $comment = Comment::factory()->create();

    $this->actingAs($admin, 'api')
        ->deleteJson("/api/v1/admin/comments/{$comment->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
});

it('returns 403 for regular user on delete', function () {
    $user    = User::factory()->create(['role' => User::ROLE_USER]);
    $comment = Comment::factory()->create();

    $this->actingAs($user, 'api')
        ->deleteJson("/api/v1/admin/comments/{$comment->id}")
        ->assertForbidden()
        ->assertJson(['error' => 'forbidden', 'message' => 'You do not have permission to access this resource.']);
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/admin/comments/{comment}
// ---------------------------------------------------------------------------

it('returns 401 for guest on admin comment update', function () {
    $comment = Comment::factory()->create();

    $this->patchJson("/api/v1/admin/comments/{$comment->id}", ['body' => 'Updated body'])
        ->assertUnauthorized()
        ->assertJson(['error' => 'unauthenticated']);
});

it('returns 403 for regular user on admin comment update', function () {
    $user    = User::factory()->create(['role' => User::ROLE_USER]);
    $comment = Comment::factory()->create();

    $this->actingAs($user, 'api')
        ->patchJson("/api/v1/admin/comments/{$comment->id}", ['body' => 'Updated body'])
        ->assertForbidden()
        ->assertJson(['error' => 'forbidden', 'message' => 'You do not have permission to access this resource.']);
});

it('allows admin to update any comment and returns 200 with updated body', function () {
    $admin   = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $owner   = User::factory()->create(['role' => User::ROLE_USER]);
    $comment = Comment::factory()->create(['user_id' => $owner->id, 'body' => 'Original body']);

    $response = $this->actingAs($admin, 'api')
        ->patchJson("/api/v1/admin/comments/{$comment->id}", ['body' => 'Admin updated body'])
        ->assertOk()
        ->assertJsonMissingPath('data.author.role')
        ->assertJsonMissingPath('data.author.email')
        ->assertJsonMissingPath('data.author.supabase_user_id')
        ->assertJsonMissingPath('data.user_id');

    expect($response->json('data.body'))->toBe('Admin updated body');
    $this->assertDatabaseHas('comments', ['id' => $comment->id, 'body' => 'Admin updated body']);
});

it('returns 422 when body is empty on admin comment update', function () {
    $admin   = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $comment = Comment::factory()->create();

    $this->actingAs($admin, 'api')
        ->patchJson("/api/v1/admin/comments/{$comment->id}", ['body' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});

it('returns 422 when body exceeds 250 characters on admin comment update', function () {
    $admin   = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $comment = Comment::factory()->create();

    $this->actingAs($admin, 'api')
        ->patchJson("/api/v1/admin/comments/{$comment->id}", ['body' => str_repeat('a', 251)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});
