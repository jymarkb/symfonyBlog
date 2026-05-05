<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([]);
    }

    public function store(): JsonResponse
    {
        return response()->json([], 201);
    }

    public function update(string $category): JsonResponse
    {
        return response()->json([
            'id' => $category,
        ]);
    }

    public function destroy(string $category): JsonResponse
    {
        return response()->json([], 204);
    }
}
