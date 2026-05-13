<?php

namespace App\Services\Admin;

use App\Models\Tag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TagService
{
    public function list(): LengthAwarePaginator
    {
        return Tag::query()->orderBy('name')->paginate(100);
    }

    public function create(array $data): Tag
    {
        return Tag::query()->create([
            'name' => $data['name'],
            'slug' => $data['slug'],
        ]);
    }

    public function update(Tag $tag, array $data): Tag
    {
        if (array_key_exists('name', $data)) {
            $tag->name = $data['name'];
        }

        if (array_key_exists('slug', $data)) {
            $tag->slug = $data['slug'];
        }

        $tag->save();

        return $tag;
    }

    public function delete(Tag $tag): void
    {
        $tag->delete();
    }
}
