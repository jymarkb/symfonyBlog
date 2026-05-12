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
            ->when($request->filled('featured'), function ($query) use ($request) {
                $query->where('is_featured', filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN));
            })
            ->when($request->filled('year'), function ($query) use ($request) {
                $year = (int) $request->integer('year');
                if ($year >= 2000 && $year <= 2099) {
                    $query->whereRaw('EXTRACT(YEAR FROM published_at)::int = ?', [$year]);
                }
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $raw = $request->string('search')->toString();
                $term = strtolower(substr(trim($raw), 0, 100));
                if (strlen($term) < 2) return;
                $search = '%' . addcslashes($term, '%_\\') . '%';

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
            ->groupByRaw('EXTRACT(YEAR FROM published_at)::int')
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