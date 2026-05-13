<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\PostReaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostReactionFactory extends Factory
{
    protected $model = PostReaction::class;

    public function definition(): array
    {
        return [
            'post_id' => Post::factory(),
            'user_id' => User::factory(),
            'reaction' => $this->faker->randomElement(['helpful', 'fire', 'insightful']),
        ];
    }
}
