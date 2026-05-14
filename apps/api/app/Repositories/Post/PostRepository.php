<?php

namespace App\Repositories\Post;

use App\Models\Post;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class PostRepository
{
    public function getPublishedBySlug(string $slug): Post
    {
        return Cache::remember(
            "posts.slug.{$slug}",
            now()->addMinutes(10),
            fn () => Post::query()
                ->with(['user' => fn ($q) => $q->withCount('followers'), 'tags'])
                ->withCount([
                    'comments',
                    'reactions as stars_count'               => fn ($q) => $q->where('reaction', 'star'),
                    'reactions as star_reactions_count'      => fn ($q) => $q->where('reaction', 'star'),
                    'reactions as helpful_reactions_count'   => fn ($q) => $q->where('reaction', 'helpful'),
                    'reactions as fire_reactions_count'      => fn ($q) => $q->where('reaction', 'fire'),
                    'reactions as insightful_reactions_count' => fn ($q) => $q->where('reaction', 'insightful'),
                ])
                ->where('slug', $slug)
                ->where('status', 'published')
                ->whereNotNull('published_at')
                ->firstOrFail()
        );
    }

    public function getRelatedPosts(Post $post, int $limit = 2): Collection
    {
        $post->loadMissing('tags');
        $tagIds = $post->tags->pluck('id');

        if ($tagIds->isEmpty()) {
            return new Collection();
        }

        return Post::query()
            ->select('posts.*')
            ->selectRaw('COUNT(pt.tag_id) as shared_tag_count')
            ->join('post_tag as pt', function ($join) use ($tagIds) {
                $join->on('pt.post_id', '=', 'posts.id')
                     ->whereIn('pt.tag_id', $tagIds);
            })
            ->with(['user' => fn($q) => $q->withCount('followers'), 'tags'])
            ->withCount([
                'comments',
                'reactions as stars_count' => fn($q) => $q->where('reaction', 'star'),
            ])
            ->where('posts.status', 'published')
            ->whereNotNull('posts.published_at')
            ->where('posts.id', '!=', $post->id)
            ->groupBy('posts.id')
            ->orderByDesc('shared_tag_count')
            ->orderByDesc('posts.published_at')
            ->limit($limit)
            ->get();
    }

    public function forgetBySlug(string $slug): void
    {
        Cache::forget("posts.slug.{$slug}");
    }
}
