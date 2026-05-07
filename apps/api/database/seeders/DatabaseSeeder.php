<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first()
            ?? User::factory()->create([
                'email' => 'test@example.com',
                'display_name' => 'Test User',
            ]);

        $posts = Post::factory(5)->create();

        Comment::factory(4)->create([
            'user_id' => $user->id,
            'post_id' => fn() => $posts->random()->id,
        ]);
    }
}
