<?php

namespace App\Services\Profile;

use App\Models\Comment;
use App\Models\PostView;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;

class ProfileService
{
    public function getAuthenticatedProfile(User $user): User
    {
        return $user->loadCount(['comments', 'postViews']);
    }

    public function findPublicProfileByHandle(string $handle): User
    {
        $normalizedHandle = $this->normalizeHandle($handle);

        return User::query()
            ->where('handle', $normalizedHandle)
            ->firstOrFail();
    }

    private function normalizeHandle(string $handle): string
    {
        return str_starts_with($handle, '@')
            ? $handle
            : '@' . $handle;
    }

    public function updatePrivateProfile(User $user, array $data): User
    {
        $user->fill($data)->save();

        return $user->refresh();
    }

    public function getCommentHistory(User $user, int $limit = 10): Collection
    {
        return $user->comments()
            ->with('post')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getReadingHistory(User $user, int $limit = 10): \Illuminate\Support\Collection
    {
        return $user->postViews()
            ->with('post')
            ->orderBy('last_viewed_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function updateNotifications(User $user, array $data): User
    {
        $user->fill($data)->save();
        return $user->refresh();
    }

    public function deleteAccount(User $user): void
    {
        DB::transaction(function () use ($user) {
            Comment::where('user_id', $user->id)->update(['user_id' => null]);
            PostView::where('user_id', $user->id)->delete();
            $user->delete();
        });
    }
}
