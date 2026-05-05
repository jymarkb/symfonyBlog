<?php

namespace App\Services\Profile;

use App\Models\User;

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

}
