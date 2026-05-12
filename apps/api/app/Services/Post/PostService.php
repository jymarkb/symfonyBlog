<?php

namespace App\Services\Post;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class PostService
{
    public function listPublished(Request $request): LengthAwarePaginator
    {
        return Post::query()
            ->with(['user', 'tags'])
            ->withCount(['comments', 'stars'])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->when($request->filled('tag'), function ($query) use ($request) {
                $query->whereHas('tags', fn($tagQuery) => $tagQuery
                    ->where('slug', $request->string('tag')->toString()));
            })
            ->when($request->has('featured'), function ($query) use ($request) {
                $query->where('is_featured', filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN));
            })
            ->when($request->filled('year'), function ($query) use ($request) {
                $query->whereRaw('EXTRACT(YEAR FROM published_at)::int = ?', [(int) $request->integer('year')]);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = strtolower(substr($request->string('search')->toString(), 0, 100));
                $search = '%' . addcslashes($term, '%_') . '%';

                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->whereRaw('LOWER(title) LIKE ?', [$search])
                        ->orWhereRaw('LOWER(excerpt) LIKE ?', [$search]);
                });
            })
            ->latest('published_at')
            ->paginate(min(max((int) $request->integer('per_page', 12), 1), 50));
    }

    public function availableYears(): array
    {
        return Post::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->selectRaw('EXTRACT(YEAR FROM published_at)::int AS year, COUNT(*) AS count')
            ->groupBy('year')
            ->orderByDesc('year')
            ->get()
            ->map(fn ($row) => ['year' => (int) $row->year, 'count' => (int) $row->count])
            ->all();
    }

    public function findPublishedBySlug(string $slug): Post
    {
        return Post::query()
            ->with(['user', 'tags'])
            ->withCount(['comments', 'stars'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();
    }
}