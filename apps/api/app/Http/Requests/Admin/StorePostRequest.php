<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:posts,slug'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'cover_image' => ['nullable', 'url:https', 'max:2048'],
            'reading_time' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'body' => ['required', 'array', 'max:100'],
            'body.*.type' => ['required', 'string', 'max:80'],
            'body.*.style' => ['required', 'array', 'max:50'],
            'body.*.children' => ['required', 'array', 'max:200'],
            'body.*.children.*.text' => ['sometimes', 'string', 'max:20000'],
            'status' => ['required', 'string', 'in:draft,published,archived'],
            'is_featured' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'tag_ids' => ['sometimes', 'array', 'max:20'],
            'tag_ids.*' => ['integer', 'distinct', 'exists:tags,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('title') && ! $this->filled('slug')) {
            $this->merge([
                'slug' => Str::slug((string) $this->input('title')),
            ]);
        }
    }
}
