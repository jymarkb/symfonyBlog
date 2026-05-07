<?php

it('returns public posts placeholder', function () {
    $this->getJson('/api/v1/posts')
        ->assertOk()
        ->assertExactJson([]);
});

it('returns public categories placeholder', function () {
    $this->getJson('/api/v1/categories')
        ->assertOk()
        ->assertExactJson([]);
});

it('accepts public post view tracking placeholder', function () {
    $this->postJson('/api/v1/posts/example-slug/view')
        ->assertAccepted()
        ->assertExactJson([]);
});

it('throttles excessive post view requests by IP', function () {
    foreach (range(1, 30) as $_) {
        $this->postJson('/api/v1/posts/example-slug/view')->assertAccepted();
    }

    $this->postJson('/api/v1/posts/example-slug/view')->assertTooManyRequests();
});
