<?php

namespace App\Repositories\Post;

use App\Models\Post;
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

    public function forgetBySlug(string $slug): void
    {
        Cache::forget("posts.slug.{$slug}");
    }
}
