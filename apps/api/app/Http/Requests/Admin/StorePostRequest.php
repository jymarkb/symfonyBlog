<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:posts,slug'],
            'excerpt' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'reading_time' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'body' => ['required', 'array'],
            'body.*.type' => ['required', 'string'],
            'body.*.style' => ['required', 'array'],
            'body.*.children' => ['required', 'array'],
            'status' => ['required', 'string', 'in:draft,published,archived'],
            'is_featured' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'tag_ids' => ['sometimes', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ];
    }
}
