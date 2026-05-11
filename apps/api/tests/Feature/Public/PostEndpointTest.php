<?php

use App\Models\Post;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;

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
        ->assertJsonMissingPath('data.content_js');
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
                'user_id',
                'title',
                'slug',
                'excerpt',
                'cover_image',
                'reading_time',
                'is_featured',
                'status',
                'published_at',
                'created_at',
                'updated_at',
                'author' => [
                    'id',
                    'display_name',
                    'handle',
                    'avatar_url',
                ],
                'tags',
            ],
        ],
    ]);

    $response
        ->assertJsonMissingPath('data.0.role')
        ->assertJsonMissingPath('data.0.supabase_user_id')
        ->assertJsonMissingPath('data.0.author.role')
        ->assertJsonMissingPath('data.0.author.supabase_user_id')
        ->assertJsonMissingPath('data.0.body');
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

it('returns correct response shape and excludes sensitive fields for featured posts', function () {
    Post::factory()->featured()->create();

    $response = $this->getJson('/api/v1/posts?featured=true')
        ->assertOk();

    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'user_id',
                'title',
                'slug',
                'excerpt',
                'cover_image',
                'reading_time',
                'is_featured',
                'status',
                'published_at',
                'created_at',
                'updated_at',
                'author' => [
                    'id',
                    'display_name',
                    'handle',
                    'avatar_url',
                ],
                'tags',
            ],
        ],
    ]);

    $response
        ->assertJsonMissingPath('data.0.role')
        ->assertJsonMissingPath('data.0.supabase_user_id')
        ->assertJsonMissingPath('data.0.author.role')
        ->assertJsonMissingPath('data.0.author.supabase_user_id')
        ->assertJsonMissingPath('data.0.body');
});

