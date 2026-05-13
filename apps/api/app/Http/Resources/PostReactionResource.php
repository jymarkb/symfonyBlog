<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostReactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'reaction' => $this->resource['reaction'],
            'counts' => $this->resource['counts'],
        ];
    }
}
