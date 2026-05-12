<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePostRequest;
use App\Http\Requests\Admin\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\Post\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function __construct(
        private readonly PostService $service,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $posts = Post::query()
            ->with(['user', 'tags'])
            ->withCount(['comments', 'stars'])
            ->latest()
            ->paginate(20);

        return PostResource::collection($posts);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $this->service->create(
            $request->validated(),
            $request->user()->id,
            $request->validated('tag_ids', []),
        );

        return (new PostResource($post))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdatePostRequest $request, Post $post): PostResource
    {
        $post = $this->service->update(
            $post,
            $request->validated(),
            $request->has('tag_ids') ? $request->validated('tag_ids', []) : null,
        );

        return new PostResource($post);
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->service->delete($post);

        return response()->json([], 204);
    }
}
