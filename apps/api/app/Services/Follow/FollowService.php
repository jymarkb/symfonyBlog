<?php

namespace App\Services\Follow;

use App\Models\AuthorFollow;
use App\Models\User;

class FollowService
{
    public function follow(User $follower, int $authorId): AuthorFollow
    {
        $followerId = (int) $follower->getKey();

        if ($followerId === $authorId) {
            throw new \DomainException('cannot follow yourself');
        }

        User::findOrFail($authorId);

        return AuthorFollow::firstOrCreate([
            'follower_id' => $followerId,
            'author_id'   => $authorId,
        ]);
    }

    public function unfollow(User $follower, int $authorId): void
    {
        AuthorFollow::where([
            'follower_id' => (int) $follower->getKey(),
            'author_id'   => $authorId,
        ])->delete();
    }

    public function isFollowing(User $follower, int $authorId): bool
    {
        return AuthorFollow::where([
            'follower_id' => (int) $follower->getKey(),
            'author_id'   => $authorId,
        ])->exists();
    }
}
