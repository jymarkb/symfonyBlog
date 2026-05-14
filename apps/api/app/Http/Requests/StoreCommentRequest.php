<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'parent_id' => ['nullable', 'integer', Rule::exists('comments', 'id')->where('parent_id', null)],
        ];
    }
}
