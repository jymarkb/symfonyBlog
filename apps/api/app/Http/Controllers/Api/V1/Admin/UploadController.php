<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    public function store(): JsonResponse
    {
        return response()->json([], 201);
    }
}
