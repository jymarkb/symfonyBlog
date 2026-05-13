<?php

namespace App\Http\Requests;

use App\Services\Post\PostReactionService;
use Illuminate\Foundation\Http\FormRequest;

class StorePostReactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reaction' => ['required', 'string', 'in:' . implode(',', PostReactionService::VALID_REACTIONS)],
        ];
    }
}
