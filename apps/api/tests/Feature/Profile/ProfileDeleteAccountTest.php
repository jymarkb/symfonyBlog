<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\PostView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('rejects guests from the delete account endpoint', function () {
    $this->deleteJson('/api/v1/profile')
        ->assertUnauthorized();
});

it('returns 200 with account deleted message for authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->deleteJson('/api/v1/profile')
        ->assertOk()
        ->assertJsonPath('message', 'Account deleted.');
});

it('deletes the user row from the database', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->deleteJson('/api/v1/profile')
        ->assertOk();

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

it('anonymises the user comments by setting user_id to null', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    $comment = Comment::factory()->create(['user_id' => $user->id, 'post_id' => $post->id]);

    $this->actingAs($user, 'api')
        ->deleteJson('/api/v1/profile')
        ->assertOk();

    $this->assertDatabaseHas('comments', ['id' => $comment->id, 'user_id' => null]);
});

it('deletes all post views belonging to the user', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    PostView::factory()->create(['user_id' => $user->id, 'post_id' => $post->id]);

    $this->actingAs($user, 'api')
        ->deleteJson('/api/v1/profile')
        ->assertOk();

    $this->assertDatabaseMissing('post_views', ['user_id' => $user->id]);
});

it('does not anonymise comments belonging to other users', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $post = Post::factory()->create();
    $comment = Comment::factory()->create(['user_id' => $userB->id, 'post_id' => $post->id]);

    $this->actingAs($userA, 'api')
        ->deleteJson('/api/v1/profile')
        ->assertOk();

    $this->assertDatabaseHas('comments', ['id' => $comment->id, 'user_id' => $userB->id]);
});

it('returns 429 when the profile delete rate limit is exceeded', function () {
    $user = User::factory()->create();

    // ThrottleRequests hashes named limiter keys as md5($limiterName . $limitKey).
    // The profile-delete limiter keys by user ID, so pre-fill the bucket directly.
    $cacheKey = md5('profile-delete' . $user->id);
    for ($i = 0; $i < 5; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user, 'api')
        ->deleteJson('/api/v1/profile')
        ->assertTooManyRequests();
});
