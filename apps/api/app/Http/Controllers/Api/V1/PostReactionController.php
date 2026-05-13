<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostReactionRequest;
use App\Http\Resources\PostReactionResource;
use App\Models\Post;
use App\Services\Post\PostReactionService;
use Illuminate\Http\JsonResponse;

class PostReactionController extends Controller
{
    public function __construct(private readonly PostReactionService $reactionService) {}

    public function store(StorePostReactionRequest $request, string $slug): JsonResponse
    {
        $post = Post::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();

        $result = $this->reactionService->toggle($post, $request->user(), $request->validated('reaction'));

        return (new PostReactionResource($result))->response()->setStatusCode(200);
    }
}
