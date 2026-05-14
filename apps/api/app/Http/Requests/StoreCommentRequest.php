<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body'      => ['required', 'string', 'min:1', 'max:250'],
            // Depth constraint (top-level only) enforced in CommentService::createComment()
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ];
    }
}
