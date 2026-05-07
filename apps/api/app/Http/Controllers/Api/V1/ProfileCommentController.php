<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileCommentResource;
use App\Services\Profile\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProfileCommentController extends Controller
{
    public function index(Request $request, ProfileService $profiles): AnonymousResourceCollection
    {
        $comments = $profiles->getCommentHistory($request->user());

        return ProfileCommentResource::collection($comments);
    }
}