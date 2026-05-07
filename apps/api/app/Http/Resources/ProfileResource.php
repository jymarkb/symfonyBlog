<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'handle' => $this->handle,
            'display_name' => $this->display_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'avatar_url' => $this->avatar_url,
            'role' => $this->role,
            'created_at' => $this->created_at?->toISOString(),
            'comments_count' => $this->comments_count ?? 0,
            'posts_read_count' => $this->post_views_count ?? 0,
            'notify_comment_replies' => $this->notify_comment_replies,
            'notify_new_posts' => $this->notify_new_posts,
        ];
    }
}