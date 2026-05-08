<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'post_title' => $this->post?->title,
            'post_slug'  => $this->post?->slug,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}