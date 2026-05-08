<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostSummaryResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $posts = Post::query()
            ->with(['user', 'tags'])
            ->withCount(['comments', 'stars'])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->when($request->filled('tag'), function ($query) use ($request) {
                $query->whereHas('tags', fn ($tagQuery) => $tagQuery
                    ->where('slug', $request->string('tag')->toString()));
            })
            ->when($request->has('featured'), function ($query) use ($request) {
                $query->where('is_featured', filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('title', 'like', '%'.$search.'%')
                        ->orWhere('excerpt', 'like', '%'.$search.'%');
                });
            })
            ->latest('published_at')
            ->paginate(min(max((int) $request->integer('per_page', 12), 1), 50));

        return PostSummaryResource::collection($posts);
    }

    public function show(string $slug): PostResource
    {
        $post = Post::query()
            ->with(['user', 'tags'])
            ->withCount(['comments', 'stars'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();

        return new PostResource($post);
    }
}
