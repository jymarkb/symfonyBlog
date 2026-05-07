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
            'body' => fake()->paragraphs(4, true),
            'excerpt' => fake()->paragraph(),
            'status' => 'published',
            'published_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}