<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([]);
    }

    public function update(string $user): JsonResponse
    {
        return response()->json([
            'id' => $user,
        ]);
    }
}
