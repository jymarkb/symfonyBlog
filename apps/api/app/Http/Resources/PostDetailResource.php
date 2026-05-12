<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class PostDetailResource extends PostSummaryResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'body' => $this->body,
        ];
    }
}
