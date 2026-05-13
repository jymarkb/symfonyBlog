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
            'reaction_counts' => [
                'star' => (int) ($this->star_reactions_count ?? 0),
                'helpful' => (int) ($this->helpful_reactions_count ?? 0),
                'fire' => (int) ($this->fire_reactions_count ?? 0),
                'insightful' => (int) ($this->insightful_reactions_count ?? 0),
            ],
        ];
    }
}
