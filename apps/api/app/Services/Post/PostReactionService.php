<?php

namespace App\Services\Post;

use App\Models\Post;
use App\Models\PostReaction;
use App\Models\User;

class PostReactionService
{
    public const VALID_REACTIONS = ['star', 'helpful', 'fire', 'insightful'];

    /**
     * Toggle a reaction per type. If the user already has THIS reaction type, remove it.
     * Otherwise create it. Multiple simultaneous reaction types are allowed.
     * Returns ['reaction' => string[], 'counts' => array].
     */
    public function toggle(Post $post, User $user, string $reactionType): array
    {
        $existing = PostReaction::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->where('reaction', $reactionType)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            PostReaction::create([
                'post_id'  => $post->id,
                'user_id'  => $user->id,
                'reaction' => $reactionType,
            ]);
        }

        return [
            'reaction' => $this->getUserReactions($post, $user),
            'counts'   => $this->getCounts($post),
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

    public function getUserReactions(Post $post, User $user): array
    {
        return PostReaction::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->pluck('reaction')
            ->all();
    }

    /**
     * @deprecated Use getUserReactions() instead.
     */
    public function getUserReaction(Post $post, User $user): ?string
    {
        $reactions = $this->getUserReactions($post, $user);

        return $reactions[0] ?? null;
    }
}
