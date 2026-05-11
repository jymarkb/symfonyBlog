<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class PostResource extends PostSummaryResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'user_id' => $this->user_id,
            'status'  => $this->status,
            'body'    => $this->body,
        ];
    }
}
