<?php

use App\Models\AuthorFollow;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

it('returns 401 for guest on store', function () {
    $author = User::factory()->create();
    $response = $this->postJson("/api/v1/authors/{$author->id}/follow");
    $response->assertStatus(401);
});

it('returns 401 for guest on destroy', function () {
    $author = User::factory()->create();
    $response = $this->deleteJson("/api/v1/authors/{$author->id}/follow");
    $response->assertStatus(401);
});

it('authenticated user can follow another user', function () {
    $follower = User::factory()->create();
    $author = User::factory()->create();
    $response = $this->actingAs($follower)->postJson("/api/v1/authors/{$author->id}/follow", ['author_id' => $author->id]);
    $response->assertStatus(201);
    $response->assertJsonStructure(['data' => ['follower_id', 'author_id', 'created_at', 'followers_count']]);
    $response->assertJsonMissingPath('data.supabase_user_id');
    $response->assertJsonMissingPath('data.role');
    $response->assertJsonMissingPath('data.email');
    $response->assertJsonMissingPath('data.password');
});

it('duplicate follow is idempotent', function () {
    $follower = User::factory()->create();
    $author = User::factory()->create();
    $this->actingAs($follower)->postJson("/api/v1/authors/{$author->id}/follow", ['author_id' => $author->id]);
    $response = $this->actingAs($follower)->postJson("/api/v1/authors/{$author->id}/follow", ['author_id' => $author->id]);
    $response->assertStatus(201);
});

it('authenticated user can unfollow', function () {
    $follower = User::factory()->create();
    $author = User::factory()->create();
    $this->actingAs($follower)->postJson("/api/v1/authors/{$author->id}/follow", ['author_id' => $author->id]);
    $response = $this->actingAs($follower)->deleteJson("/api/v1/authors/{$author->id}/follow");
    $response->assertStatus(204);
});

it('returns 422 for self-follow', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->postJson("/api/v1/authors/{$user->id}/follow", ['author_id' => $user->id]);
    $response->assertStatus(422);
});

it('returns 422 for non-existent author', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->postJson('/api/v1/authors/999999/follow', ['author_id' => 999999]);
    $response->assertStatus(422); // validation catches non-existent user via exists:users,id
});

it('cannot unfollow on behalf of another user', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $author = User::factory()->create();

    // User A follows the author directly
    AuthorFollow::create(['follower_id' => $userA->id, 'author_id' => $author->id]);

    // User B sends DELETE — should get 204 (no error), but User A's follow must survive
    $this->actingAs($userB)->deleteJson("/api/v1/authors/{$author->id}/follow")
        ->assertStatus(204);

    // User A's follow record must NOT have been deleted
    $this->assertDatabaseHas('author_follows', [
        'follower_id' => $userA->id,
        'author_id'   => $author->id,
    ]);
});

it('throttles follow requests', function () {
    $user = User::factory()->create();
    $author = User::factory()->create();

    $cacheKey = md5('profile-mutations' . $user->id);
    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user)
        ->postJson("/api/v1/authors/{$author->id}/follow", ['author_id' => $author->id])
        ->assertTooManyRequests();
});

it('returns 404 for non-integer author id on destroy', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->deleteJson('/api/v1/authors/not-a-number/follow');
    $response->assertStatus(404);
});

it('returns 204 for non-existent integer author id on destroy', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->deleteJson('/api/v1/authors/99999/follow');
    $response->assertStatus(204);
});

it('throttles unfollow requests', function () {
    $user = User::factory()->create();
    $author = User::factory()->create();

    AuthorFollow::create(['follower_id' => $user->id, 'author_id' => $author->id]);

    $cacheKey = md5('profile-mutations' . $user->id);
    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($user)
        ->deleteJson("/api/v1/authors/{$author->id}/follow")
        ->assertTooManyRequests();
});
