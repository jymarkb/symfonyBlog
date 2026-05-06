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


}
