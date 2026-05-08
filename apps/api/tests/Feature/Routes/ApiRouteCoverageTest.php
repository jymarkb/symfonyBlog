<?php

use Illuminate\Support\Facades\Route;

it('keeps api v1 route test coverage explicit', function () {
    $documentedRoutes = [
        'GET api/v1/posts',
        'GET api/v1/posts/{slug}',
        'GET api/v1/tags',
        'POST api/v1/posts/{slug}/view',
        'GET api/v1/profiles/{handle}',

        'GET api/v1/session',
        'GET api/v1/profile/comments',
        'GET api/v1/profile/reading-history',
        'PATCH api/v1/profile/notifications',
        'GET api/v1/profile',
        'PATCH api/v1/profile',
        'DELETE api/v1/profile',

        'POST api/v1/posts/{slug}/stars',
        'DELETE api/v1/posts/{slug}/stars',

        'GET api/v1/admin/posts',
        'POST api/v1/admin/posts',
        'PATCH api/v1/admin/posts/{post}',
        'DELETE api/v1/admin/posts/{post}',

        'GET api/v1/admin/users',
        'PATCH api/v1/admin/users/{user}',

        'GET api/v1/admin/comments',
        'PATCH api/v1/admin/comments/{comment}',

        'GET api/v1/admin/tags',
        'POST api/v1/admin/tags',
        'PATCH api/v1/admin/tags/{tag}',
        'DELETE api/v1/admin/tags/{tag}',

        'POST api/v1/admin/uploads',
    ];

    $actualRoutes = collect(Route::getRoutes())
        ->filter(fn ($route) => str_starts_with($route->uri(), 'api/v1/'))
        ->flatMap(function ($route) {
            return collect($route->methods())
                ->reject(fn ($method) => $method === 'HEAD')
                ->map(fn ($method) => $method.' '.$route->uri());
        })
        ->sort()
        ->values()
        ->all();

    sort($documentedRoutes);

    expect($actualRoutes)->toBe($documentedRoutes);
});
