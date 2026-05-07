<?php

namespace App\Services\Profile;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ProfileService
{
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
}
