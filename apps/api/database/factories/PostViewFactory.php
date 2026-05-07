<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostViewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'post_id' => Post::factory(),
            'read_progress' => fake()->numberBetween(0, 100),
            'last_viewed_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
