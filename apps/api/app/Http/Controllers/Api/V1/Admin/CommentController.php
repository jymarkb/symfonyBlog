<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([]);
    }

    public function update(string $comment): JsonResponse
    {
        return response()->json([
            'id' => $comment,
        ]);
    }

}
