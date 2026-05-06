<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'handle' => $this->handle,
            'display_name' => $this->display_name,
            'avatar_url' => $this->avatar_url,
        ];
    }
}
