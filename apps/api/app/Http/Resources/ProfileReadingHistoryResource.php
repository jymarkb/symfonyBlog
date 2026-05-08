<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileReadingHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'post_id'        => $this->post_id,
            'post_title'     => $this->post?->title,
            'post_slug'      => $this->post?->slug,
            'read_progress'  => $this->read_progress,
            'last_viewed_at' => $this->last_viewed_at?->toISOString(),
        ];
    }
}
