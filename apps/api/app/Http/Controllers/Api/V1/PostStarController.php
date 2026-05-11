<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostStarController extends Controller
{
    public function store(Request $request, string $slug): JsonResponse
    {
        $post = $this->publishedPost($slug);

        $existing = $post->stars()->where('user_id', $request->user()->id)->first();

        if (! $existing) {
            $star = $post->stars()->make();
            $star->user_id = $request->user()->id;
            $star->save();
        }

        return response()->json([], 201);
    }

    public function destroy(Request $request, string $slug): JsonResponse
    {
        $post = $this->publishedPost($slug);

        $post->stars()
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([], 204);
    }

    private function publishedPost(string $slug): Post
    {
        return Post::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();
    }
}
