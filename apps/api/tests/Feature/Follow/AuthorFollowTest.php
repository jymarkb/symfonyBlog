<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

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
    $response->assertJsonStructure(['data' => ['follower_id', 'author_id', 'created_at']]);
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
