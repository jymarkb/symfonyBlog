<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePostRequest;
use App\Http\Requests\Admin\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

class PostController extends Controller
{
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
        $data = $this->postData($request->validated());

        $post = new Post($data);
        $post->user()->associate($request->user());
        $post->save();
        $post->tags()->sync($request->validated('tag_ids', []));

        return (new PostResource($post->load(['user', 'tags'])->loadCount(['comments', 'stars'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdatePostRequest $request, Post $post): PostResource
    {
        $data = $this->postData($request->validated());

        $post->update($data);

        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->validated('tag_ids', []));
        }

        return new PostResource($post->load(['user', 'tags'])->loadCount(['comments', 'stars']));
    }

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json([], 204);
    }

    private function postData(array $validated): array
    {
        $data = Arr::except($validated, ['tag_ids']);

        if (($data['status'] ?? null) === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return $data;
    }
}
