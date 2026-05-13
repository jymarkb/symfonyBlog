<?php

namespace App\Services\Post;

use App\Models\Post;
use App\Models\PostReaction;
use App\Models\User;

class PostReactionService
{
    public const VALID_REACTIONS = ['star', 'helpful', 'fire', 'insightful'];

    /**
     * Toggle a reaction. If the user has the same reaction, remove it.
     * If the user has a different reaction, update it.
     * If no reaction, create it.
     * Returns ['reaction' => string|null, 'counts' => array].
     */
    public function toggle(Post $post, User $user, string $reactionType): array
    {
        $existing = PostReaction::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            if ($existing->reaction === $reactionType) {
                // Same reaction — remove it
                $existing->delete();
                $current = null;
            } else {
                // Different reaction — update it
                $existing->update(['reaction' => $reactionType]);
                $current = $reactionType;
            }
        } else {
            PostReaction::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'reaction' => $reactionType,
            ]);
            $current = $reactionType;
        }

        return [
            'reaction' => $current,
            'counts' => $this->getCounts($post),
        ];
    }

    public function getCounts(Post $post): array
    {
        $rows = PostReaction::where('post_id', $post->id)
            ->selectRaw('reaction, COUNT(*) as total')
            ->groupBy('reaction')
            ->pluck('total', 'reaction');

        return [
            'star' => (int) ($rows['star'] ?? 0),
            'helpful' => (int) ($rows['helpful'] ?? 0),
            'fire' => (int) ($rows['fire'] ?? 0),
            'insightful' => (int) ($rows['insightful'] ?? 0),
        ];
    }

    public function getUserReaction(Post $post, User $user): ?string
    {
        return PostReaction::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->value('reaction');
    }
}
