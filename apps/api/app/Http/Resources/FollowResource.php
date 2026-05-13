<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FollowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'follower_id'     => $this->follower_id,
            'author_id'       => $this->author_id,
            'created_at'      => $this->created_at,
            'followers_count' => $this->author->followers_count,
        ];
    }
}
