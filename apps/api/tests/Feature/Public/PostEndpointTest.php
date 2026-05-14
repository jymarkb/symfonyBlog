<?php

use App\Models\Post;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

it('lists only published posts without block bodies', function () {
    Post::factory()->create([
        'title' => 'Published post',
        'slug' => 'published-post',
        'status' => 'published',
        'published_at' => now(),
    ]);

    Post::factory()->draft()->create([
        'title' => 'Draft post',
        'slug' => 'draft-post',
    ]);

    $this->getJson('/api/v1/posts')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'published-post')
        ->assertJsonMissingPath('data.0.body')
        ->assertJsonMissingPath('data.0.content_html')
        ->assertJsonMissingPath('data.0.content_css')
        ->assertJsonMissingPath('data.0.content_js');
});

it('returns a published post detail with blog editor block body', function () {
    $post = Post::factory()->create([
        'slug' => 'cost-of-context',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->getJson('/api/v1/posts/cost-of-context')
        ->assertOk()
        ->assertJsonPath('data.id', $post->id)
        ->assertJsonPath('data.body.0.type', 'heading')
        ->assertJsonPath('data.body.0.style.base.fontSize', '36px')
        ->assertJsonMissingPath('data.content_html')
        ->assertJsonMissingPath('data.content_css')
        ->assertJsonMissingPath('data.content_js')
        ->assertJsonMissingPath('data.user_id')
        ->assertJsonMissingPath('data.status')
        ->assertJsonMissingPath('data.created_at')
        ->assertJsonMissingPath('data.updated_at')
        ->assertJsonMissingPath('data.author.email');
});

it('filters published posts by tag slug', function () {
    $tag = Tag::factory()->create(['slug' => 'ai-agents']);
    $matching = Post::factory()->create([
        'slug' => 'matching-post',
        'status' => 'published',
        'published_at' => now(),
    ]);
    $matching->tags()->attach($tag);

    Post::factory()->create([
        'slug' => 'other-post',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->getJson('/api/v1/posts?tag=ai-agents')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'matching-post')
        ->assertJsonPath('data.0.tags.0.slug', 'ai-agents');
});

it('filters published posts by featured flag', function () {
    Post::factory()->featured()->create([
        'slug' => 'featured-post',
    ]);

    Post::factory()->create([
        'slug' => 'regular-post',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->getJson('/api/v1/posts?featured=true')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'featured-post')
        ->assertJsonPath('data.0.is_featured', true);
});

it('returns 404 for draft post detail', function () {
    Post::factory()->draft()->create(['slug' => 'draft-post']);

    $this->getJson('/api/v1/posts/draft-post')
        ->assertNotFound();
});

it('returns correct response shape and excludes sensitive fields for post listing', function () {
    Post::factory()->create([
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/posts')
        ->assertOk();

    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'title',
                'slug',
                'excerpt',
                'cover_image',
                'reading_time',
                'is_featured',
                'published_at',
                'author' => [
                    'display_name',
                    'handle',
                    'avatar_url',
                ],
                'tags',
                'comments_count',
                'stars_count',
            ],
        ],
    ]);

    $response
        ->assertJsonMissingPath('data.0.user_id')
        ->assertJsonMissingPath('data.0.status')
        ->assertJsonMissingPath('data.0.role')
        ->assertJsonMissingPath('data.0.supabase_user_id')
        ->assertJsonMissingPath('data.0.author.role')
        ->assertJsonMissingPath('data.0.author.supabase_user_id')
        ->assertJsonMissingPath('data.0.body')
        ->assertJsonMissingPath('data.0.author.email')
        ->assertJsonMissingPath('data.0.created_at')
        ->assertJsonMissingPath('data.0.updated_at');
});

it('returns paginated response with meta and links envelope', function () {
    // Default per_page is 12; seed 14 posts to span at least 2 pages
    Post::factory()->count(14)->create([
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/posts')
        ->assertOk();

    $response->assertJsonStructure([
        'meta' => ['current_page', 'per_page', 'total', 'last_page'],
        'links' => ['first', 'last', 'prev', 'next'],
    ]);

    $meta = $response->json('meta');
    expect($meta['total'])->toBeGreaterThanOrEqual(14);
    expect($meta['last_page'])->toBeGreaterThanOrEqual(2);
});

it('filters posts by search term matching title case-insensitively', function () {
    Post::factory()->create([
        'title' => 'VectorSearch Fundamentals',
        'slug' => 'vector-search-fundamentals',
        'excerpt' => 'A normal excerpt without special terms.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    Post::factory()->create([
        'title' => 'An entirely different post title',
        'slug' => 'different-post-title',
        'excerpt' => 'Another normal excerpt.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/posts?search=vector')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $response->assertJsonPath('data.0.slug', 'vector-search-fundamentals');
});

it('filters posts by search term matching excerpt', function () {
    Post::factory()->create([
        'title' => 'A normal post title',
        'slug' => 'normal-post-title',
        'excerpt' => 'unique-zephyr-excerpt-xyz is the excerpt here.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    Post::factory()->create([
        'title' => 'Another post title',
        'slug' => 'another-post-title',
        'excerpt' => 'This excerpt has nothing special in it.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/posts?search=unique-zephyr-excerpt-xyz')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $response->assertJsonPath('data.0.slug', 'normal-post-title');
});

it('returns empty data array when search matches no posts', function () {
    Post::factory()->create([
        'title' => 'A published post about Laravel',
        'slug' => 'published-laravel-post',
        'excerpt' => 'Some excerpt here.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->getJson('/api/v1/posts?search=xyzzy-nomatch-term')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('filters posts by featured=false', function () {
    Post::factory()->featured()->create([
        'slug' => 'featured-post',
    ]);

    Post::factory()->create([
        'slug' => 'non-featured-post',
        'status' => 'published',
        'published_at' => now(),
        'is_featured' => false,
    ]);

    $this->getJson('/api/v1/posts?featured=false')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'non-featured-post')
        ->assertJsonPath('data.0.is_featured', false);
});

it('clamps per_page to minimum of 1 when given zero', function () {
    Post::factory()->count(2)->create([
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/posts?per_page=0')
        ->assertOk();

    expect($response->json('meta.per_page'))->toBe(1);
});

it('returns 200 for guest access to post listing', function () {
    $this->getJson('/api/v1/posts')
        ->assertOk();
});

it('returns correct response shape and excludes sensitive fields for featured posts', function () {
    Post::factory()->featured()->create();

    $response = $this->getJson('/api/v1/posts?featured=true')
        ->assertOk();

    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'title',
                'slug',
                'excerpt',
                'cover_image',
                'reading_time',
                'is_featured',
                'published_at',
                'author' => [
                    'display_name',
                    'handle',
                    'avatar_url',
                ],
                'tags',
                'comments_count',
                'stars_count',
            ],
        ],
    ]);

    $response
        ->assertJsonMissingPath('data.0.user_id')
        ->assertJsonMissingPath('data.0.status')
        ->assertJsonMissingPath('data.0.role')
        ->assertJsonMissingPath('data.0.supabase_user_id')
        ->assertJsonMissingPath('data.0.author.role')
        ->assertJsonMissingPath('data.0.author.supabase_user_id')
        ->assertJsonMissingPath('data.0.body')
        ->assertJsonMissingPath('data.0.author.email')
        ->assertJsonMissingPath('data.0.created_at')
        ->assertJsonMissingPath('data.0.updated_at');
});


it('filters published posts by year', function () {
    Post::factory()->create([
        'slug' => 'old-post',
        'status' => 'published',
        'published_at' => '2023-06-15 00:00:00',
    ]);

    Post::factory()->create([
        'slug' => 'new-post',
        'status' => 'published',
        'published_at' => '2026-01-10 00:00:00',
    ]);

    $this->getJson('/api/v1/posts?year=2023')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'old-post');
});

it('returns available years for published posts only', function () {
    Post::factory()->create(['status' => 'published', 'published_at' => '2024-03-01 00:00:00']);
    Post::factory()->create(['status' => 'published', 'published_at' => '2023-11-01 00:00:00']);
    Post::factory()->draft()->create();

    $response = $this->getJson('/api/v1/posts/years')->assertOk();

    $data = $response->json('data');

    // Each entry must be an object with year and count keys
    expect($data)->toBeArray();
    expect($data)->not->toBeEmpty();

    $yearValues = array_column($data, 'year');
    $countValues = array_column($data, 'count');

    expect($yearValues)->toContain(2024)->toContain(2023);

    // Drafts must be excluded — only 2 published posts, so exactly 2 entries
    expect($data)->toHaveCount(2);

    // count values must be positive integers
    foreach ($countValues as $count) {
        expect($count)->toBeInt()->toBeGreaterThan(0);
    }

    // Years must be in descending order (full sorted-order assertion)
    $sorted = $yearValues;
    rsort($sorted);
    expect($yearValues)->toBe($sorted);
});

it('clamps per_page to maximum of 50 when given 999', function () {
    $response = $this->getJson('/api/v1/posts?per_page=999')
        ->assertOk();

    expect($response->json('meta.per_page'))->toBe(50);
});

it('filters published posts by year and tag combined', function () {
    $tag = Tag::factory()->create(['slug' => 'php']);

    $matching = Post::factory()->create([
        'slug' => 'php-2023-post',
        'status' => 'published',
        'published_at' => '2023-05-01 00:00:00',
    ]);
    $matching->tags()->attach($tag);

    // Same year, different tag
    Post::factory()->create([
        'slug' => 'other-2023-post',
        'status' => 'published',
        'published_at' => '2023-07-01 00:00:00',
    ]);

    // Same tag, different year
    $other = Post::factory()->create([
        'slug' => 'php-2024-post',
        'status' => 'published',
        'published_at' => '2024-03-01 00:00:00',
    ]);
    $other->tags()->attach($tag);

    $this->getJson('/api/v1/posts?year=2023&tag=php')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'php-2023-post');
});

it('filters published posts by year and search combined', function () {
    Post::factory()->create([
        'title' => 'Laravel Tips 2023',
        'slug' => 'laravel-tips-2023',
        'excerpt' => 'Some excerpt.',
        'status' => 'published',
        'published_at' => '2023-06-01 00:00:00',
    ]);

    // Same year, no search match
    Post::factory()->create([
        'title' => 'Unrelated 2023 post',
        'slug' => 'unrelated-2023',
        'excerpt' => 'Nothing here.',
        'status' => 'published',
        'published_at' => '2023-08-01 00:00:00',
    ]);

    // Search match, wrong year
    Post::factory()->create([
        'title' => 'Laravel Tips 2024',
        'slug' => 'laravel-tips-2024',
        'excerpt' => 'Some excerpt.',
        'status' => 'published',
        'published_at' => '2024-02-01 00:00:00',
    ]);

    $this->getJson('/api/v1/posts?year=2023&search=laravel')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'laravel-tips-2023');
});

it('returns 200 with unfiltered data for non-numeric year value', function () {
    Post::factory()->create([
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->getJson('/api/v1/posts?year=abc')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('returns 200 with unfiltered data for negative year value', function () {
    Post::factory()->create([
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->getJson('/api/v1/posts?year=-1')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('returns 429 when years rate limit is exceeded', function () {
    $cacheKey = md5('public-api' . '127.0.0.1');

    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson('/api/v1/posts/years')
        ->assertTooManyRequests();
});

it('returns 429 when posts index rate limit is exceeded', function () {
    $cacheKey = md5('public-api' . '127.0.0.1');

    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson('/api/v1/posts')
        ->assertTooManyRequests();
});

it('returns 429 when posts show rate limit is exceeded', function () {
    $post = Post::factory()->create();

    $cacheKey = md5('public-api' . '127.0.0.1');

    for ($i = 0; $i < 60; $i++) {
        RateLimiter::hit($cacheKey, 60);
    }

    $this->getJson("/api/v1/posts/{$post->slug}")
        ->assertTooManyRequests();
});

it('filters by tag and search combined', function () {
    $tag = Tag::factory()->create(['name' => 'PHP', 'slug' => 'php']);
    $matching = Post::factory()->create(['title' => 'PHP arrays guide', 'status' => 'published', 'published_at' => now()]);
    $matching->tags()->attach($tag);
    $nonMatchingTag = Post::factory()->create(['title' => 'PHP loops', 'status' => 'published', 'published_at' => now()]);
    // has tag but title does not match search
    $nonMatchingTag->tags()->attach($tag);
    $noTag = Post::factory()->create(['title' => 'PHP arrays deep dive', 'status' => 'published', 'published_at' => now()]);
    // matches search but has no tag

    $response = $this->getJson('/api/v1/posts?tag=php&search=arrays');
    $response->assertStatus(200);
    $data = $response->json('data');
    $slugs = collect($data)->pluck('slug')->all();
    expect($slugs)->toContain($matching->slug);
    expect($slugs)->not->toContain($nonMatchingTag->slug);
    expect($slugs)->not->toContain($noTag->slug);
});

it('ignores single character search and returns unfiltered results', function () {
    Post::factory()->count(3)->create(['status' => 'published', 'published_at' => now()]);
    $all = $this->getJson('/api/v1/posts')->json('meta.total');
    $response = $this->getJson('/api/v1/posts?search=a');
    $response->assertStatus(200);
    expect($response->json('meta.total'))->toBe($all);
});

it('returns correct response shape and excludes sensitive fields for post detail', function () {
    $post = Post::factory()->create([
        'slug' => 'shape-test-post',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/posts/shape-test-post')
        ->assertOk();

    $response->assertJsonStructure([
        'data' => [
            'id',
            'title',
            'slug',
            'excerpt',
            'cover_image',
            'reading_time',
            'is_featured',
            'published_at',
            'author' => [
                'id',
                'display_name',
                'handle',
                'avatar_url',
            ],
            'tags',
            'comments_count',
            'stars_count',
            'reaction_counts' => ['helpful', 'fire', 'insightful'],
            'body',
        ],
    ]);

    $response
        ->assertJsonMissingPath('data.user_id')
        ->assertJsonMissingPath('data.status')
        ->assertJsonMissingPath('data.role')
        ->assertJsonMissingPath('data.supabase_user_id')
        ->assertJsonMissingPath('data.author.role')
        ->assertJsonMissingPath('data.author.supabase_user_id');
});

it('returns 404 for non-existent post slug', function () {
    $this->getJson('/api/v1/posts/this-slug-does-not-exist')
        ->assertNotFound();
});

it('returns 404 for archived post detail', function () {
    Post::factory()->create([
        'slug' => 'archived-post',
        'status' => 'archived',
        'published_at' => null,
    ]);

    $this->getJson('/api/v1/posts/archived-post')
        ->assertNotFound();
});

it('related key is always present in post detail response as an array', function () {
    $post = Post::factory()->create([
        'slug' => 'related-always-present',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson("/api/v1/posts/{$post->slug}")->assertOk();

    expect($response->json('data.related'))->toBeArray();
});

it('related posts are ordered by shared tag count descending', function () {
    $tagA = Tag::factory()->create(['slug' => 'tag-a']);
    $tagB = Tag::factory()->create(['slug' => 'tag-b']);

    $main = Post::factory()->create([
        'slug' => 'main-post',
        'status' => 'published',
        'published_at' => now(),
    ]);
    $main->tags()->attach([$tagA->id, $tagB->id]);

    // Shares both tags — should appear first
    $first = Post::factory()->create([
        'slug' => 'two-tag-post',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);
    $first->tags()->attach([$tagA->id, $tagB->id]);

    // Shares one tag — should appear second
    $second = Post::factory()->create([
        'slug' => 'one-tag-post',
        'status' => 'published',
        'published_at' => now()->subDays(2),
    ]);
    $second->tags()->attach([$tagA->id]);

    // Shares no tags — should be excluded
    $third = Post::factory()->create([
        'slug' => 'no-tag-post',
        'status' => 'published',
        'published_at' => now()->subDays(3),
    ]);

    $response = $this->getJson('/api/v1/posts/main-post')->assertOk();
    $related = $response->json('data.related');

    $slugs = collect($related)->pluck('slug')->all();

    expect($slugs[0])->toBe('two-tag-post');
    expect($slugs[1])->toBe('one-tag-post');
    expect($slugs)->not->toContain('no-tag-post');
});

it('current post does not appear in related', function () {
    $tag = Tag::factory()->create(['slug' => 'self-tag']);

    $post = Post::factory()->create([
        'slug' => 'self-post',
        'status' => 'published',
        'published_at' => now(),
    ]);
    $post->tags()->attach($tag);

    $response = $this->getJson('/api/v1/posts/self-post')->assertOk();
    $related = $response->json('data.related');

    $slugs = collect($related)->pluck('slug')->all();

    expect($slugs)->not->toContain('self-post');
});

it('post with no tags returns related as empty array', function () {
    Post::factory()->create([
        'slug' => 'no-tags-post',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $response = $this->getJson('/api/v1/posts/no-tags-post')->assertOk();

    expect($response->json('data.related'))->toBe([]);
});

it('related contains at most 2 items', function () {
    $tag = Tag::factory()->create(['slug' => 'limit-tag']);

    $main = Post::factory()->create([
        'slug' => 'limit-main-post',
        'status' => 'published',
        'published_at' => now(),
    ]);
    $main->tags()->attach($tag);

    Post::factory()->count(5)->create([
        'status' => 'published',
        'published_at' => now()->subDay(),
    ])->each(fn ($p) => $p->tags()->attach($tag));

    $response = $this->getJson('/api/v1/posts/limit-main-post')->assertOk();
    $related = $response->json('data.related');

    expect(count($related))->toBeLessThanOrEqual(2);
});
