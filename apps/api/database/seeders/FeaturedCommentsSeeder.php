<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class FeaturedCommentsSeeder extends Seeder
{
    public function run(): void
    {
        $featured = Post::where('slug', 'building-the-editor')->firstOrFail();
        $author   = User::where('email', 'dev.jymarkb@gmail.com')->firstOrFail();

        // Skip if already seeded
        if (Comment::where('post_id', $featured->id)->exists()) {
            $this->command->info('Featured comments already seeded — skipping.');
            return;
        }

        $sarah = User::firstOrCreate(
            ['email' => 'sarah.r@example.dev'],
            ['handle' => '@sarahrcodes', 'display_name' => 'Sarah R.', 'supabase_user_id' => '00000000-0000-0001-0000-000000000001'],
        );
        $alexei = User::firstOrCreate(
            ['email' => 'alexei.k@example.dev'],
            ['handle' => '@alexeik', 'display_name' => 'Alexei K.', 'supabase_user_id' => '00000000-0000-0001-0000-000000000002'],
        );
        $priya = User::firstOrCreate(
            ['email' => 'priya.m@example.dev'],
            ['handle' => '@priyam', 'display_name' => 'Priya M.', 'supabase_user_id' => '00000000-0000-0001-0000-000000000003'],
        );
        $tom = User::firstOrCreate(
            ['email' => 'tom.d@example.dev'],
            ['handle' => '@tomd', 'display_name' => 'Tom D.', 'supabase_user_id' => '00000000-0000-0001-0000-000000000004'],
        );

        // ── Top-level comments — spread over ~two weeks for sort testing ──────

        $c1 = Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $sarah->id,
            'body'       => "The schema-first approach is exactly what I needed to read today. I've been fighting with Tiptap's serialization for three weeks — every time we tweak a renderer, half the old posts look wrong. The \"one-way door\" framing is exactly right and I'm going to use it in our next architecture review.",
            'created_at' => '2026-05-02 09:14:00',
            'updated_at' => '2026-05-02 09:14:00',
        ]);

        $c2 = Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $alexei->id,
            'body'       => "The bundle-splitting insight is the one that hit hardest. We've been shipping the full editor runtime to every visitor because we couldn't figure out how to decouple the renderer. Turns out we just hadn't made the schema the stable surface — we'd made the editor the stable surface. Completely inverted.",
            'created_at' => '2026-05-03 14:22:00',
            'updated_at' => '2026-05-03 14:22:00',
        ]);

        $c3 = Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $priya->id,
            'body'       => "I'd push back slightly on the 'build your own' conclusion. Tiptap has a headless mode and its output is JSON — you can build a renderer against that schema without shipping the editor. But I take your point that most teams don't set it up that way, and the default path leads you exactly where you described.",
            'created_at' => '2026-05-05 11:07:00',
            'updated_at' => '2026-05-05 11:07:00',
        ]);

        $c4 = Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $tom->id,
            'body'       => "Shipped something very similar last year. The versioning point is real — add a version field to the document root on day one. We didn't, and migrating 4,000 posts when we needed to rename a field type was not fun.",
            'created_at' => '2026-05-07 08:55:00',
            'updated_at' => '2026-05-07 08:55:00',
        ]);

        // ── Replies ────────────────────────────────────────────────────────────

        // Author replies to Sarah (exercises AUTHOR badge on reply)
        Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $author->id,
            'parent_id'  => $c1->id,
            'body'       => "Glad the framing landed. The \"one-way door\" is something I adapted from Bezos's reversible vs irreversible decisions memo — turns out it applies equally well to content serialization.",
            'created_at' => '2026-05-02 16:30:00',
            'updated_at' => '2026-05-02 16:30:00',
        ]);

        Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $alexei->id,
            'parent_id'  => $c1->id,
            'body'       => "Same here. We're mid-migration right now and this post is basically the post-mortem I wish I'd written six months ago.",
            'created_at' => '2026-05-03 10:05:00',
            'updated_at' => '2026-05-03 10:05:00',
        ]);

        // Author replies to Alexei
        Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $author->id,
            'parent_id'  => $c2->id,
            'body'       => "That's a good way to put it. The editor isn't the thing you're versioning — the document is. Once that clicked the architecture almost drew itself.",
            'created_at' => '2026-05-04 09:18:00',
            'updated_at' => '2026-05-04 09:18:00',
        ]);

        // Priya follow-up on her own comment
        Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $priya->id,
            'parent_id'  => $c3->id,
            'body'       => "Worth noting: Tiptap's default JSON schema has changed between major versions, so you still end up with a migration problem eventually. Probably a wash unless you're already deep in the Tiptap ecosystem.",
            'created_at' => '2026-05-06 13:44:00',
            'updated_at' => '2026-05-06 13:44:00',
        ]);

        // Sarah replies to Tom
        Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $sarah->id,
            'parent_id'  => $c4->id,
            'body'       => "4,000 post migration with no version field sounds like a nightmare. We're at 300 and already dreading it.",
            'created_at' => '2026-05-07 11:20:00',
            'updated_at' => '2026-05-07 11:20:00',
        ]);

        // ── Author top-level comment (exercises AUTHOR badge on a root comment) ──

        Comment::create([
            'post_id'    => $featured->id,
            'user_id'    => $author->id,
            'body'       => "Quick update three months in: the schema has been stable. The only addition was a 'callout' block type, which slotted in cleanly. The versioning regret is real though — I've stubbed in a version field but not yet written the migration path for old documents.",
            'created_at' => '2026-05-10 19:02:00',
            'updated_at' => '2026-05-10 19:02:00',
        ]);

        $this->command->info('Seeded 10 comments (5 top-level + 5 replies) on the featured post.');
    }
}
