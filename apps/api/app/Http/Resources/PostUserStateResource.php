<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostUserStateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'is_starred' => $this->resource['is_starred'],
            'is_following' => $this->resource['is_following'],
            'reaction' => $this->resource['reaction'],
        ];
    }
}
