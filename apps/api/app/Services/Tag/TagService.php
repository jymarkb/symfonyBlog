<?php

namespace App\Services\Tag;

use App\Models\Tag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TagService
{
    public function listAll(): LengthAwarePaginator
    {
        return Tag::query()
            ->withCount(['posts' => fn ($q) => $q->where('status', 'published')->whereNotNull('published_at')])
            ->orderBy('name')
            ->paginate(100);
    }
}
