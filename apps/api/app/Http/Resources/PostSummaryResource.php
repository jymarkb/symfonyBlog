<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'cover_image' => $this->cover_image,
            'reading_time' => $this->reading_time,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->toISOString(),
            'author' => [
                'display_name' => $this->user?->display_name,
                'handle' => $this->user?->handle,
                'avatar_url' => $this->user?->avatar_url,
                'bio' => $this->user?->bio,
                'followers_count' => $this->user?->followers_count ?? 0,
            ],
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'comments_count' => $this->whenCounted('comments'),
            'stars_count' => $this->whenCounted('stars'),
        ];
    }
}
