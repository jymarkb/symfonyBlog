<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(6, true);

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'excerpt' => fake()->paragraph(),
            'cover_image' => fake()->optional()->imageUrl(1600, 900),
            'reading_time' => fake()->numberBetween(3, 18),
            'body' => $this->minimalBlocks($title),
            'status' => 'published',
            'is_featured' => false,
            'published_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => 'draft',
            'is_featured' => false,
            'published_at' => null,
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn () => [
            'status' => 'published',
            'is_featured' => true,
            'published_at' => now(),
        ]);
    }

    private function minimalBlocks(string $title): array
    {
        return [
            [
                'type' => 'heading',
                'level' => 'h1',
                'style' => [
                    'base' => [
                        'fontSize' => '36px',
                        'fontWeight' => '700',
                        'lineHeight' => 1.1,
                    ],
                ],
                'children' => [
                    ['text' => $title],
                ],
            ],
            [
                'type' => 'paragraph',
                'style' => [
                    'base' => [
                        'fontSize' => '18px',
                        'lineHeight' => 1.65,
                    ],
                ],
                'children' => [
                    ['text' => fake()->paragraph()],
                ],
            ],
        ];
    }
}
