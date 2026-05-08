<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $postId = $this->route('post')?->id;

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('posts', 'slug')->ignore($postId)],
            'excerpt' => ['sometimes', 'nullable', 'string', 'max:500'],
            'cover_image' => ['sometimes', 'nullable', 'url:https', 'max:2048'],
            'reading_time' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:65535'],
            'body' => ['sometimes', 'required', 'array', 'max:100'],
            'body.*.type' => ['required_with:body', 'string', 'max:80'],
            'body.*.style' => ['required_with:body', 'array', 'max:50'],
            'body.*.children' => ['required_with:body', 'array', 'max:200'],
            'body.*.children.*.text' => ['sometimes', 'string', 'max:20000'],
            'status' => ['sometimes', 'required', 'string', 'in:draft,published,archived'],
            'is_featured' => ['sometimes', 'boolean'],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'tag_ids' => ['sometimes', 'array', 'max:20'],
            'tag_ids.*' => ['integer', 'distinct', 'exists:tags,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('slug') || $this->filled('slug')) {
            return;
        }

        $post = $this->route('post');
        $title = $this->input('title', $post?->title);

        $this->merge([
            'slug' => Str::slug((string) $title),
        ]);
    }
}
