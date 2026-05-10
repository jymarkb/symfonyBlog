<?php

namespace App\Services\Tag;

use App\Models\Tag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TagService
{
    public function listAll(): LengthAwarePaginator
    {
        return Tag::query()
            ->orderBy('name')
            ->paginate(100);
    }
}
