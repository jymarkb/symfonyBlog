<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrackExperimentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'experiment' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'variant'    => ['required', 'string', 'max:50', 'in:modal,redirect'],
            'event'      => ['required', 'string', 'in:triggered,converted,dismissed'],
        ];
    }
}
