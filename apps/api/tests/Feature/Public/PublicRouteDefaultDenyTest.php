<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Regression guard: verifies withoutMiddleware(Authenticate::using('api')) opt-outs
// are in place for all public routes. If a route is accidentally removed from the
// opt-out block it will start returning 401, and this test will catch it.

function publicRoutes(): array
{
    return [
        'GET posts'          => ['GET',  '/api/v1/posts'],
        'GET tags'           => ['GET',  '/api/v1/tags'],
        'GET public profile' => ['GET',  '/api/v1/profiles/@nobody'],
        'POST post view'     => ['POST', '/api/v1/posts/some-slug/view'],
    ];
}

it('does not return 401 on public routes without any auth token', function (string $method, string $uri) {
    $response = $this->json($method, $uri);

    expect($response->status())->not->toBe(401);
})->with(publicRoutes());

it('does not return 401 on public routes even when a malformed token is sent', function (string $method, string $uri) {
    $response = $this->json($method, $uri, [], ['Authorization' => 'Bearer invalid.token.here']);

    expect($response->status())->not->toBe(401);
})->with([
    'GET posts'      => ['GET',  '/api/v1/posts'],
    'GET tags'       => ['GET',  '/api/v1/tags'],
    'POST post view' => ['POST', '/api/v1/posts/any-slug/view'],
]);
