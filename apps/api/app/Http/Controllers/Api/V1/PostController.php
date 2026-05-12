<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostSummaryResource;
use App\Services\Post\PostService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function __construct(private PostService $postService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return PostSummaryResource::collection(
            $this->postService->listPublished($request)
        );
    }

    public function years(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $this->postService->availableYears()]);
    }

    public function show(string $slug): PostResource
    {
        return new PostResource(
            $this->postService->findPublishedBySlug($slug)
        );
    }
}
