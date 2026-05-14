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
        ->assertUnauthorized();
});

it('returns 403 for regular user on admin comment list', function () {
    $user = User::factory()->create(['role' => User::ROLE_USER]);

    $this->actingAs($user, 'api')
        ->getJson('/api/v1/admin/comments')
        ->assertForbidden();
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
        ]);
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
        ->assertForbidden();
});
