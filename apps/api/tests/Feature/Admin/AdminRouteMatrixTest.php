<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function adminRoutes(): array
{
    return [
        'GET admin posts' => ['GET', '/api/v1/admin/posts', 200],
        'POST admin posts' => ['POST', '/api/v1/admin/posts', 201],
        'PATCH admin posts' => ['PATCH', '/api/v1/admin/posts/123', 200],
        'DELETE admin posts' => ['DELETE', '/api/v1/admin/posts/123', 204],

        'GET admin users' => ['GET', '/api/v1/admin/users', 200],
        'PATCH admin users' => ['PATCH', '/api/v1/admin/users/123', 200],

        'GET admin comments' => ['GET', '/api/v1/admin/comments', 200],
        'PATCH admin comments' => ['PATCH', '/api/v1/admin/comments/123', 200],
        'DELETE admin comments' => ['DELETE', '/api/v1/admin/comments/123', 204],

        'GET admin tags' => ['GET', '/api/v1/admin/tags', 200],
        'POST admin tags' => ['POST', '/api/v1/admin/tags', 201],
        'PATCH admin tags' => ['PATCH', '/api/v1/admin/tags/123', 200],
        'DELETE admin tags' => ['DELETE', '/api/v1/admin/tags/123', 204],

        'POST admin uploads' => ['POST', '/api/v1/admin/uploads', 201],
    ];
}

it('rejects guests from every admin route', function (string $method, string $uri) {
    $this->json($method, resolvedAdminRoute($method, $uri))
        ->assertUnauthorized();
})->with(adminRoutes());

it('forbids normal users from every admin route', function (string $method, string $uri) {
    $user = User::factory()->create([
        'role' => User::ROLE_USER,
    ]);

    $this->actingAs($user, 'api')
        ->json($method, resolvedAdminRoute($method, $uri))
        ->assertForbidden();
})->with(adminRoutes());

it('allows admins through every admin placeholder route', function (
    string $method,
    string $uri,
    int $expectedStatus,
) {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $this->actingAs($admin, 'api')
        ->json($method, resolvedAdminRoute($method, $uri), adminRoutePayload($method, $uri))
        ->assertStatus($expectedStatus);
})->with(adminRoutes());

it('returns 429 when the admin read rate limit is exceeded', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $cacheKey = md5('admin-read' . $admin->id);
    for ($i = 0; $i <= 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($admin, 'api')
        ->getJson('/api/v1/admin/posts')
        ->assertTooManyRequests();
});

it('returns 429 when the admin mutations rate limit is exceeded', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $cacheKey = md5('admin-mutations' . $admin->id);
    for ($i = 0; $i <= 60; $i++) {
        \Illuminate\Support\Facades\RateLimiter::hit($cacheKey, 60);
    }

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts')
        ->assertTooManyRequests();
});

it('returns validation errors for generated post slug collisions', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    Post::factory()->create([
        'slug' => 'duplicate-title',
    ]);

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts', adminPostPayload([
            'title' => 'Duplicate Title',
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['slug']);
});

it('keeps post slugs stable when updating titles without an explicit slug', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $post = Post::factory()->create([
        'title' => 'Original Title',
        'slug' => 'original-title',
    ]);

    $this->actingAs($admin, 'api')
        ->patchJson("/api/v1/admin/posts/{$post->id}", [
            'title' => 'Renamed Title',
        ])
        ->assertOk()
        ->assertJsonPath('data.slug', 'original-title');

    expect($post->refresh()->slug)->toBe('original-title');
});

it('validates admin post payload shape and safe public media URLs', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts', adminPostPayload([
            'cover_image' => 'http://example.com/insecure.jpg',
            'excerpt' => str_repeat('x', 501),
            'body' => [
                [
                    'type' => 'paragraph',
                    'style' => ['base' => []],
                    'children' => [
                        ['text' => str_repeat('x', 20001)],
                    ],
                ],
            ],
            'tag_ids' => [999999],
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'cover_image',
            'excerpt',
            'body.0.children.0.text',
            'tag_ids.0',
        ]);
});

it('assigns new admin posts to the authenticated admin instead of request user_id', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);
    $otherUser = User::factory()->create();

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/posts', adminPostPayload([
            'user_id' => $otherUser->id,
            'slug' => 'owned-by-admin',
        ]))
        ->assertCreated()
        ->assertJsonPath('data.user_id', $admin->id);

    $this->assertDatabaseHas('posts', [
        'slug' => 'owned-by-admin',
        'user_id' => $admin->id,
    ]);
});

it('returns validation errors for generated tag slug collisions', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    Tag::factory()->create([
        'slug' => 'duplicate-tag',
    ]);

    $this->actingAs($admin, 'api')
        ->postJson('/api/v1/admin/tags', [
            'name' => 'Duplicate Tag',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['slug']);
});

function resolvedAdminRoute(string $method, string $uri): string
{
    if (str_contains($uri, '/admin/posts/123')) {
        $post = Post::factory()->create();

        return str_replace('123', (string) $post->id, $uri);
    }

    if (str_contains($uri, '/admin/tags/123')) {
        $tag = Tag::factory()->create();

        return str_replace('123', (string) $tag->id, $uri);
    }

    if (str_contains($uri, '/admin/comments/123')) {
        $comment = Comment::factory()->create();

        return str_replace('123', (string) $comment->id, $uri);
    }

    return $uri;
}

function adminPostPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Admin matrix post',
        'body' => [
            [
                'type' => 'paragraph',
                'style' => ['base' => ['fontSize' => '18px']],
                'children' => [['text' => 'Admin matrix body']],
            ],
        ],
        'status' => 'draft',
    ], $overrides);
}

function adminRoutePayload(string $method, string $uri): array
{
    if ($method === 'POST' && $uri === '/api/v1/admin/posts') {
        return adminPostPayload();
    }

    if ($method === 'POST' && $uri === '/api/v1/admin/tags') {
        return [
            'name' => 'Admin Matrix',
        ];
    }

    if ($method === 'PATCH' && str_contains($uri, '/admin/tags/')) {
        return [
            'name' => 'Admin Matrix Updated',
        ];
    }

    if ($method === 'PATCH' && str_contains($uri, '/admin/comments/')) {
        return [
            'body' => 'Admin matrix updated comment body.',
        ];
    }

    return [];
}
