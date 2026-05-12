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

        $tags = collect(['AI Agents', 'Infrastructure', 'Engineering', 'Testing', 'Workflow'])
            ->mapWithKeys(function (string $name) {
                $tag = Tag::query()->firstOrCreate(
                    ['slug' => Str::slug($name)],
                    ['name' => $name],
                );

                return [$tag->slug => $tag];
            });

        $featured = Post::query()->updateOrCreate(
            ['slug' => 'cost-of-context'],
            [
                'user_id' => $user->id,
                'title' => "The cost of context: what it actually takes to build agents that don't lie.",
                'excerpt' => 'Six months running an agent in production taught me that hallucinations are a downstream symptom, not the bug.',
                'cover_image' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
                'reading_time' => 18,
                'body' => $this->blogPostBlocks(),
                'status' => 'published',
                'is_featured' => true,
                'published_at' => '2026-04-30 00:00:00',
            ],
        );
        $featured->tags()->sync([
            $tags['ai-agents']->id,
            $tags['infrastructure']->id,
            $tags['engineering']->id,
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

    private function blogPostBlocks(): array
    {
        return [
            [
                'type' => 'row',
                'style' => [
                    'base' => [
                        'display' => 'flex',
                        'flexDirection' => 'column',
                        'width' => '100%',
                        'paddingTop' => '48px',
                        'paddingRight' => '20px',
                        'paddingBottom' => '40px',
                        'paddingLeft' => '20px',
                        'backgroundColor' => '#fafaf7',
                    ],
                ],
                'children' => [
                    [
                        'type' => 'column',
                        'style' => [
                            'base' => [
                                'flexGrow' => 100,
                                'display' => 'flex',
                                'flexDirection' => 'column',
                                'maxWidth' => '720px',
                                'marginLeft' => 'auto',
                                'marginRight' => 'auto',
                            ],
                        ],
                        'children' => [
                            [
                                'type' => 'paragraph',
                                'style' => [
                                    'base' => [
                                        'fontSize' => '11px',
                                        'fontWeight' => '700',
                                        'color' => '#6e7280',
                                        'letterSpacing' => '0.06em',
                                        'textTransform' => 'uppercase',
                                        'marginBottom' => '18px',
                                    ],
                                ],
                                'children' => [['text' => 'Long read · 18 min · Issue No. 47']],
                            ],
                            [
                                'type' => 'heading',
                                'level' => 'h1',
                                'style' => [
                                    'base' => [
                                        'fontSize' => '30px',
                                        'fontWeight' => '600',
                                        'color' => '#15161a',
                                        'lineHeight' => 1.06,
                                        'letterSpacing' => '-0.03em',
                                    ],
                                    'md' => ['fontSize' => '42px'],
                                    'lg' => ['fontSize' => '52px'],
                                ],
                                'children' => [['text' => "The cost of context: what it actually takes to build agents that don't lie."]],
                            ],
                            [
                                'type' => 'paragraph',
                                'style' => [
                                    'base' => [
                                        'fontSize' => '17px',
                                        'lineHeight' => 1.55,
                                        'color' => '#4a4d56',
                                        'fontStyle' => 'italic',
                                    ],
                                ],
                                'children' => [['text' => 'Six months running an agent in production taught me that hallucinations are a downstream symptom, not the bug.']],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'image',
                'url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
                'alt' => 'Abstract network of nodes representing context and data flow in an AI agent system',
                'style' => [
                    'base' => [
                        'width' => '100%',
                        'maxWidth' => '720px',
                        'marginLeft' => 'auto',
                        'marginRight' => 'auto',
                        'aspectRatio' => '16 / 7',
                        'minHeight' => '220px',
                        'objectFit' => 'cover',
                    ],
                    'md' => ['minHeight' => '320px'],
                ],
                'children' => [['text' => '']],
            ],
            [
                'type' => 'paragraph',
                'style' => [
                    'base' => [
                        'fontSize' => '18px',
                        'lineHeight' => 1.65,
                        'color' => '#2a2c33',
                        'marginBottom' => '20px',
                    ],
                ],
                'children' => [['text' => "For the last six months I've been the primary maintainer of a customer-facing agent. We launched expecting hallucinations to be the problem. They were not."]],
            ],
        ];
    }
}
