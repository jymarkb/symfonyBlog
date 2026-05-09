<?php

namespace App\Services\Auth;

use App\Models\User;

class UserPermissionService
{
    public function isAdmin(User $user): bool
    {
        return $user->role === User::ROLE_ADMIN;
    }

    public function canComment(User $user): bool
    {
        return in_array($user->role, [
            User::ROLE_USER,
            User::ROLE_ADMIN,
        ], true);
    }

    public function canManagePosts(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function canManageUsers(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function canModerateComments(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function canManageTags(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function canUploadMedia(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function permissionsFor(User $user): array
    {
        return [
            'admin' => $this->isAdmin($user),
            'comment' => $this->canComment($user),
            'manage_posts' => $this->canManagePosts($user),
            'manage_users' => $this->canManageUsers($user),
            'moderate_comments' => $this->canModerateComments($user),
            'manage_tags' => $this->canManageTags($user),
            'upload_media' => $this->canUploadMedia($user),
        ];
    }
}
