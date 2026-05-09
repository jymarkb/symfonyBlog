<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns public posts collection', function () {
    $this->getJson('/api/v1/posts')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

it('returns public tags collection', function () {
    $this->getJson('/api/v1/tags')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

it('accepts public post view tracking placeholder', function () {
    $this->postJson('/api/v1/posts/example-slug/view')
        ->assertAccepted()
        ->assertExactJson([]);
});

it('throttles excessive post view requests by IP', function () {
    $cacheKey = md5('post-view' . '127.0.0.1');
    for ($i = 0; $i < 30; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->postJson('/api/v1/posts/some-slug/view')
        ->assertTooManyRequests();
});

it('returns 429 when the public posts rate limit is exceeded', function () {
    $cacheKey = md5('public-api' . '127.0.0.1');
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson('/api/v1/posts')
        ->assertTooManyRequests();
});

it('returns 429 when the public tags rate limit is exceeded', function () {
    $cacheKey = md5('public-api' . '127.0.0.1');
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson('/api/v1/tags')
        ->assertTooManyRequests();
});

it('returns 429 when the public profile rate limit is exceeded', function () {
    $user = User::factory()->create([
        'handle' => '@rate_limit_test',
    ]);

    $cacheKey = md5('public-api' . '127.0.0.1');
    for ($i = 0; $i < 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson('/api/v1/profiles/rate_limit_test')
        ->assertTooManyRequests();
});
