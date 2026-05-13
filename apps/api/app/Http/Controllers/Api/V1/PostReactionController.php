<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostReactionRequest;
use App\Http\Resources\PostReactionResource;
use App\Services\Post\PostReactionService;
use App\Services\Post\PostService;
use Illuminate\Http\JsonResponse;

class PostReactionController extends Controller
{
    public function __construct(
        private readonly PostReactionService $reactionService,
        private readonly PostService $postService,
    ) {}

    public function store(StorePostReactionRequest $request, string $slug): JsonResponse
    {
        $post = $this->postService->findPublishedBySlug($slug);

        $result = $this->reactionService->toggle($post, $request->user(), $request->validated('reaction'));

        return (new PostReactionResource($result))->response()->setStatusCode(200);
    }
}
