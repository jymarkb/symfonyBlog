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

it('returns 404 for draft post detail', function () {
    Post::factory()->draft()->create(['slug' => 'draft-post']);

    $this->getJson('/api/v1/posts/draft-post')
        ->assertNotFound();
});
