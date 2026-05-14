<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'body'           => $this->body,
            'parent_id'      => $this->parent_id,
            'created_at'     => $this->created_at?->toISOString(),
            'is_post_author' => $this->whenLoaded('post', fn () => $this->user_id === $this->post->user_id, false),
            'author'         => $this->whenLoaded('user', fn () => [
                'id'           => $this->user->id,
                'display_name' => $this->user->display_name,
                'handle'       => $this->user->handle,
                'avatar_url'   => $this->user->avatar_url,
            ]),
            'replies'        => CommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
