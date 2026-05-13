<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\PostStar;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::where('email', 'dev.jymarkb@gmail.com')->first()
            ?? User::factory()->create([
                'email' => 'dev.jymarkb@gmail.com',
                'handle' => '@jymarkb',
                'display_name' => 'Jymark',
                'role' => User::ROLE_USER,
            ]);

        $user->update([
            'bio' => 'Engineer building tools in public. Writing about software, systems, and the craft of making things.',
        ]);

        $tags = collect(['AI Agents', 'Infrastructure', 'Engineering', 'Testing', 'Workflow'])
            ->mapWithKeys(function (string $name) {
                $tag = Tag::query()->firstOrCreate(
                    ['slug' => Str::slug($name)],
                    ['name' => $name],
                );

                return [$tag->slug => $tag];
            });

        $featured = Post::query()->updateOrCreate(
            ['slug' => 'building-the-editor'],
            [
                'user_id' => $user->id,
                'title' => 'Building the editor that powers this blog.',
                'excerpt' => 'I rebuilt this blog from Symfony to Laravel and React — and ended up writing a block editor along the way. Here\'s why I made that call, and what the architecture looks like.',
                'cover_image' => 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1600&q=80',
                'reading_time' => 10,
                'body' => $this->blogPostBlocks(),
                'status' => 'published',
                'is_featured' => true,
                'published_at' => '2026-05-01 00:00:00',
            ],
        );
        $featured->tags()->sync([
            $tags['engineering']->id,
            $tags['workflow']->id,
        ]);

        $posts = collect([$featured])->merge(
            collect([
                ['A field guide to flaky tests, and why your CI is lying to you.', 'testing'],
                ["I rewrote my note-taking system for the fifth time. Here's what stuck.", 'workflow'],
                ['Vector databases are a deployment problem, not a math problem.', 'infrastructure'],
                ['A short defense of boring stacks.', 'engineering'],
                ['The only diagram I ever draw before writing code.', 'engineering'],
            ])->map(function (array $sample) use ($tags, $user) {
                [$title, $tagSlug] = $sample;

                $post = Post::factory()->create([
                    'user_id' => $user->id,
                    'title' => $title,
                    'slug' => Str::slug($title),
                    'status' => 'published',
                    'published_at' => now()->subDays(fake()->numberBetween(1, 40)),
                ]);
                $post->tags()->sync([$tags[$tagSlug]->id]);

                return $post;
            }),
        );

        // Bulk posts spread across 3 years — enough to span multiple pagination pages
        $allTagIds = $tags->values()->pluck('id')->toArray();
        Post::factory()
            ->count(80)
            ->create([
                'user_id' => $user->id,
                'published_at' => fn() => fake()->dateTimeBetween('-3 years', 'now'),
            ])
            ->each(function (Post $post) use ($allTagIds) {
                $post->tags()->sync(
                    fake()->randomElements($allTagIds, fake()->numberBetween(1, 3)),
                );
            });

        Post::factory()
            ->count(2)
            ->draft()
            ->create(['user_id' => $user->id]);

        Comment::factory(4)->create([
            'user_id' => $user->id,
            'post_id' => fn() => $posts->random()->id,
        ]);

        User::factory(5)->create()->each(function (User $starUser) use ($featured) {
            PostStar::factory()->create([
                'post_id' => $featured->id,
                'user_id' => $starUser->id,
            ]);
        });
    }

    private function p(string $text): array
    {
        return [
            'type' => 'paragraph',
            'style' => ['base' => []],
            'children' => [['text' => $text]],
        ];
    }

    private function h(string $level, string $text): array
    {
        return [
            'type' => 'heading',
            'level' => $level,
            'style' => ['base' => []],
            'children' => [['text' => $text]],
        ];
    }

    private function blockquote(string $text): array
    {
        return [
            'type' => 'paragraph',
            'style' => [
                'base' => [
                    'borderLeft' => '3px solid #6e7280',
                    'paddingLeft' => '18px',
                    'fontStyle' => 'italic',
                    'color' => '#4a4d56',
                    'marginTop' => '24px',
                    'marginBottom' => '24px',
                ],
            ],
            'children' => [['text' => $text]],
        ];
    }

    private function code(string $text): array
    {
        return [
            'type' => 'paragraph',
            'style' => [
                'base' => [
                    'fontFamily' => 'monospace',
                    'fontSize' => '13px',
                    'lineHeight' => '1.6',
                    'background' => '#15161a',
                    'color' => '#d8dae0',
                    'borderRadius' => '8px',
                    'padding' => '16px 18px',
                    'overflowX' => 'auto',
                    'marginTop' => '24px',
                    'marginBottom' => '24px',
                    'whiteSpace' => 'pre',
                ],
            ],
            'children' => [['text' => $text]],
        ];
    }

    private function blogPostBlocks(): array
    {
        return [
            $this->p(
                'This blog ran on Symfony for four years. It worked fine — good routing, Doctrine for the ORM, Twig for templates. But the content editor was always the weak link. I\'d been writing posts in a custom textarea that stored raw HTML. No preview, no structure, no way to rearrange sections without hunting through angle brackets.'
            ),
            $this->p(
                'When I decided to rebuild the whole thing on Laravel and React, I had a choice: adopt an existing block editor — Tiptap, Editor.js, Notion-style clone — or build exactly the surface area I needed. I built my own. Here is why that was the right call, and what the architecture ended up looking like.'
            ),

            $this->h('h2', 'Why existing editors did not fit'),

            $this->p(
                'The editors I evaluated had one thing in common: their render layer was fused to their editing runtime. Slate.js, Tiptap, Lexical — all excellent tools, but if you want to render a saved document server-side without loading the full editor bundle, you are working against the grain. The typical workaround is to serialize the editor state to HTML at save time. That works until you need to change how a block type renders, at which point every post saved before the change looks different from every post saved after.'
            ),
            $this->blockquote(
                'Serializing to HTML at save time is a one-way door. You can get the HTML out, but you cannot get the structure back without a parser — and parsers drift from the original intent.'
            ),
            $this->p(
                'The other path — keeping the editor runtime on the server — meant shipping a browser-only dependency tree to a Node SSR process. That is technically possible but the bundle size and boot time made it a non-starter for a blog that needs to feel fast on first load.'
            ),

            $this->h('h2', 'The schema-first approach'),

            $this->p(
                'The insight that unlocked the design was this: the schema is the stable thing. The editor is a tool for producing a document that conforms to the schema. The renderer is a tool for displaying that document. Neither needs to know anything about the other — they just both need to agree on the shape.'
            ),
            $this->p(
                'So I designed the schema first. Every block has three required fields: a type discriminator, a responsive style object, and a children array. Leaf blocks hold text nodes; container blocks hold other blocks. The style object is always keyed by breakpoint so the renderer can apply responsive sizing without a stylesheet.'
            ),

            $this->h('h3', 'What a block looks like in practice'),

            $this->code(
                "// A heading block as stored in the database\n" .
                "{\n" .
                "  \"type\": \"heading\",\n" .
                "  \"level\": \"h2\",\n" .
                "  \"style\": {\n" .
                "    \"base\": { \"marginTop\": \"48px\" },\n" .
                "    \"md\":   { \"fontSize\": \"28px\" }\n" .
                "  },\n" .
                "  \"children\": [{ \"text\": \"The schema-first approach\" }]\n" .
                "}"
            ),
            $this->p(
                'That is the entire contract. The editor writes documents in this shape. The renderer reads them. There is no serialization step — the JSON that comes out of the editor goes directly into the database, and the JSON that comes out of the database goes directly into the renderer.'
            ),

            $this->h('h2', 'Splitting the bundle'),

            $this->p(
                'Once the schema was stable, splitting the implementation was straightforward. The editor package imports Slate and all its drag-and-drop, toolbar, and inspector code. The renderer imports none of it — just React and the block registry. The registry maps a type string to a React component, and the renderer walks the block tree calling into the registry.'
            ),
            $this->p(
                'The result is that the post detail page — this page — loads a render bundle that is roughly one-eighth the size of the editor bundle. The editor only loads on the admin dashboard, behind authentication, where the extra weight is acceptable.'
            ),

            $this->h('h3', 'Server-side rendering without the editor'),

            $this->p(
                'Because the renderer is pure React with no browser-only dependencies, it runs in the Vike SSR pass without any special configuration. The server renders the full post HTML on first request, including all block output. The client hydrates in place. There is no flash of unstyled content, no layout shift, no client-only data fetch.'
            ),

            $this->h('h2', 'What I would do differently'),

            $this->p(
                'The style object accepts arbitrary CSS properties. That was a mistake. A whitelist of twenty or so properties — font size, weight, color, spacing, line height — would have been enough. The escape hatch of arbitrary CSS meant that early drafts of the schema have blocks with properties like backgroundImage and borderRadius that the renderer now has to handle defensively. Narrowing the surface area upfront would have saved time.'
            ),
            $this->p(
                'The other thing I would do differently is version the schema from day one. The current schema is at version 1. When I eventually need to add a new block type or change a field name, I will need a migration path. A version field on the document root would make that path unambiguous. It is a small addition that costs nothing now and saves real pain later.'
            ),
            $this->p(
                'The editor is open-source. The schema is the stable surface. Everything built on top of it — the drag-and-drop, the toolbar, the renderer — is still evolving. If you are building something similar and want to skip the schema design phase, the contract described here is a reasonable starting point.'
            ),
        ];
    }
}
