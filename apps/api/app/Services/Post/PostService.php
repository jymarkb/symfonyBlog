<?php

namespace App\Services\Post;

use App\Models\Post;
use App\Repositories\Post\PostRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class PostService
{
    public function __construct(
        private readonly PostRepository $repository,
    ) {}

    public function listPublished(Request $request): LengthAwarePaginator
    {
        return Post::query()
            ->with(['user' => fn ($q) => $q->withCount('followers'), 'tags'])
            ->withCount([
                'comments',
                'reactions as stars_count' => fn ($q) => $q->where('reaction', 'star'),
            ])
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

    public function listForAdmin(): LengthAwarePaginator
    {
        return Post::query()
            ->with(['user' => fn ($q) => $q->withCount('followers'), 'tags'])
            ->withCount([
                'comments',
                'reactions as stars_count' => fn ($q) => $q->where('reaction', 'star'),
            ])
            ->latest()
            ->paginate(20);
    }

    public function findPublishedBySlug(string $slug): Post
    {
        return Post::query()
            ->with(['user' => fn ($q) => $q->withCount('followers'), 'tags'])
            ->withCount([
                'comments',
                'reactions as stars_count' => fn ($q) => $q->where('reaction', 'star'),
                'reactions as star_reactions_count' => fn ($q) => $q->where('reaction', 'star'),
                'reactions as helpful_reactions_count' => fn ($q) => $q->where('reaction', 'helpful'),
                'reactions as fire_reactions_count' => fn ($q) => $q->where('reaction', 'fire'),
                'reactions as insightful_reactions_count' => fn ($q) => $q->where('reaction', 'insightful'),
            ])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->firstOrFail();
    }

    public function create(array $validated, int $userId, array $tagIds): Post
    {
        $data = $this->postData($validated);

        $post = new Post($data);
        $post->user()->associate($userId);
        $post->save();
        $post->tags()->sync($tagIds);

        return $post->load(['user', 'tags'])->loadCount(['comments', 'reactions as stars_count' => fn ($q) => $q->where('reaction', 'star')]);
    }

    public function update(Post $post, array $validated, ?array $tagIds): Post
    {
        $oldSlug = $post->slug;
        $newSlug = $validated['slug'] ?? null;

        // Forget the old slug before updating so stale cache is evicted immediately
        $this->repository->forgetBySlug($oldSlug);

        $data = $this->postData($validated);
        $post->update($data);

        // If the slug changed, also evict any cached entry under the new slug
        if ($newSlug !== null && $newSlug !== $oldSlug) {
            $this->repository->forgetBySlug($newSlug);
        }

        if ($tagIds !== null) {
            $post->tags()->sync($tagIds);
        }

        return $post->load(['user', 'tags'])->loadCount(['comments', 'reactions as stars_count' => fn ($q) => $q->where('reaction', 'star')]);
    }

    public function delete(Post $post): void
    {
        $this->repository->forgetBySlug($post->slug);
        $post->delete();
    }

    public function getUserStateForPost(Post $post, \App\Models\User $user): array
    {
        $reactionService = app(\App\Services\Post\PostReactionService::class);
        $followService = app(\App\Services\Follow\FollowService::class);

        $isFollowing = $followService->isFollowing($user, (int) $post->user_id);
        $reaction = $reactionService->getUserReactions($post, $user);

        $post->loadMissing('user');
        if (! isset($post->user->followers_count)) {
            $post->user->loadCount('followers');
        }

        return [
            'is_following'    => $isFollowing,
            'reaction'        => $reaction,
            'followers_count' => (int) ($post->user->followers_count ?? 0),
        ];
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
