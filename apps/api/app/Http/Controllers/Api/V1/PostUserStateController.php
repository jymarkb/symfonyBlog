<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostUserStateResource;
use App\Models\Post;
use App\Services\Post\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostUserStateController extends Controller
{
    public function __construct(private readonly PostService $postService) {}

    public function show(Request $request, string $slug): JsonResponse
    {
        $post = Post::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();

        $state = $this->postService->getUserStateForPost($post, $request->user());

        return (new PostUserStateResource($state))->response();
    }
}
