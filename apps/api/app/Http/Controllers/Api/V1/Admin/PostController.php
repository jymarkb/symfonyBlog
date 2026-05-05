<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PostController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([]);
    }

    public function store(): JsonResponse
    {
        return response()->json([], 201);
    }

    public function update(string $post): JsonResponse
    {
        return response()->json([
            'id' => $post,
        ]);
    }

    public function destroy(string $post): JsonResponse
    {
        return response()->json([], 204);
    }
}
