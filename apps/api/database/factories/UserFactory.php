<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $handle = fake()->unique()->userName();

        return [
            'supabase_user_id' => fake()->uuid(),
            'email' => fake()->unique()->safeEmail(),
            'handle' => '@'.Str::of($handle)
                ->lower()
                ->replaceMatches('/[^a-z0-9_]+/', '_')
                ->trim('_')
                ->limit(19, ''),
            'display_name' => fake()->name(),
            'avatar_url' => fake()->optional()->imageUrl(),
            'role' => 'user',
        ];
    }
}
