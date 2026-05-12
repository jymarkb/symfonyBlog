<?php

use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

it('returns 200 with correct data structure and field shape', function () {
    $tag = Tag::factory()->create([
        'name' => 'Laravel',
        'slug' => 'laravel',
    ]);

    $post = \App\Models\Post::factory()->create([
        'status' => 'published',
        'published_at' => now(),
    ]);
    $post->tags()->attach($tag);

    $this->getJson('/api/v1/tags')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'slug', 'posts_count'],
            ],
        ])
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Laravel')
        ->assertJsonPath('data.0.slug', 'laravel')
        ->assertJsonPath('data.0.posts_count', 1)
        ->assertJsonMissingPath('data.0.role')
        ->assertJsonMissingPath('data.0.supabase_user_id');
});

it('posts_count reflects only published posts', function () {
    $tag = Tag::factory()->create(['slug' => 'engineering']);

    $published = \App\Models\Post::factory()->create(['status' => 'published', 'published_at' => now()]);
    $draft = \App\Models\Post::factory()->draft()->create();
    $published->tags()->attach($tag);
    $draft->tags()->attach($tag);

    $this->getJson('/api/v1/tags')
        ->assertOk()
        ->assertJsonPath('data.0.posts_count', 1);
});

it('returns tags ordered alphabetically by name', function () {
    Tag::factory()->create(['name' => 'Zebra', 'slug' => 'zebra']);
    Tag::factory()->create(['name' => 'Apple', 'slug' => 'apple']);
    Tag::factory()->create(['name' => 'Mango', 'slug' => 'mango']);

    $response = $this->getJson('/api/v1/tags')->assertOk();

    $names = collect($response->json('data'))->pluck('name')->all();

    expect($names)->toBe(['Apple', 'Mango', 'Zebra']);
});

it('returns 429 when the public-api rate limit is exceeded', function () {
    $cacheKey = md5('public-api' . '127.0.0.1');

    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson('/api/v1/tags')
        ->assertTooManyRequests();
});
