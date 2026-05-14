<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostDetailResource;
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

    public function show(string $slug): PostDetailResource
    {
        $post = $this->postService->findPublishedBySlug($slug);
        $related = $this->postService->findRelatedPosts($post);
        $post->setRelation('related', $related);

        return new PostDetailResource($post);
    }
}
