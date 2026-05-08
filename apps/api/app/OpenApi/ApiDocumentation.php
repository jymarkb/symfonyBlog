<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Symfony Blog Rebuild API',
    description: 'Laravel API for the Vike React rebuild.',
)]
#[OA\Server(
    url: '/api/v1',
    description: 'Local API v1',
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
)]
class ApiDocumentation
{
    #[OA\Get(
        path: '/session',
        operationId: 'getSession',
        summary: 'Return the current signed-in user and permissions.',
        security: [['bearerAuth' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Current session'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ],
    )]
    public function session(): void
    {
    }

    #[OA\Get(
        path: '/profiles/{handle}',
        operationId: 'getPublicProfile',
        summary: 'Return a public profile by handle.',
        tags: ['Profile'],
        parameters: [
            new OA\Parameter(
                name: 'handle',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string'),
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Public profile'),
            new OA\Response(response: 404, description: 'Profile not found'),
        ],
    )]
    public function publicProfile(): void
    {
    }

    #[OA\Get(
        path: '/posts',
        operationId: 'listPublicPosts',
        summary: 'List published posts.',
        tags: ['Posts'],
        parameters: [
            new OA\Parameter(
                name: 'tag',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string'),
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Published post list'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ],
    )]
    public function publicPosts(): void
    {
    }

    #[OA\Get(
        path: '/posts/{slug}',
        operationId: 'getPublicPost',
        summary: 'Return a published post with blog editor JSON body.',
        tags: ['Posts'],
        parameters: [
            new OA\Parameter(
                name: 'slug',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string'),
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Published post detail'),
            new OA\Response(response: 404, description: 'Post not found'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ],
    )]
    public function publicPost(): void
    {
    }

    #[OA\Get(
        path: '/tags',
        operationId: 'listPublicTags',
        summary: 'List tags.',
        tags: ['Tags'],
        responses: [
            new OA\Response(response: 200, description: 'Paginated tag list'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ],
    )]
    public function publicTags(): void
    {
    }

    #[OA\Post(
        path: '/posts/{slug}/stars',
        operationId: 'starPost',
        summary: 'Star a published post.',
        security: [['bearerAuth' => []]],
        tags: ['Posts'],
        parameters: [
            new OA\Parameter(
                name: 'slug',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string'),
            ),
        ],
        responses: [
            new OA\Response(response: 201, description: 'Post starred'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Post not found'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ],
    )]
    public function starPost(): void
    {
    }

    #[OA\Delete(
        path: '/posts/{slug}/stars',
        operationId: 'unstarPost',
        summary: 'Remove the current user star from a published post.',
        security: [['bearerAuth' => []]],
        tags: ['Posts'],
        parameters: [
            new OA\Parameter(
                name: 'slug',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string'),
            ),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Post unstarred'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Post not found'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ],
    )]
    public function unstarPost(): void
    {
    }

    #[OA\Get(
        path: '/admin/posts',
        operationId: 'listAdminPosts',
        summary: 'List admin posts.',
        security: [['bearerAuth' => []]],
        tags: ['Admin Posts'],
        responses: [
            new OA\Response(response: 200, description: 'Post list'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ],
    )]
    public function adminPosts(): void
    {
    }

    #[OA\Get(
        path: '/admin/tags',
        operationId: 'listAdminTags',
        summary: 'List admin tags.',
        security: [['bearerAuth' => []]],
        tags: ['Admin Tags'],
        responses: [
            new OA\Response(response: 200, description: 'Paginated tag list'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ],
    )]
    public function adminTags(): void
    {
    }

    #[OA\Post(
        path: '/admin/tags',
        operationId: 'createAdminTag',
        summary: 'Create a tag.',
        security: [['bearerAuth' => []]],
        tags: ['Admin Tags'],
        responses: [
            new OA\Response(response: 201, description: 'Tag created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ],
    )]
    public function createAdminTag(): void
    {
    }

}
