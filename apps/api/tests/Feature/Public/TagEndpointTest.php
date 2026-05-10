<?php

use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

it('returns 200 with correct data structure and field shape', function () {
    Tag::factory()->create([
        'name' => 'Laravel',
        'slug' => 'laravel',
    ]);

    $this->getJson('/api/v1/tags')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'slug'],
            ],
        ])
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Laravel')
        ->assertJsonPath('data.0.slug', 'laravel');
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
