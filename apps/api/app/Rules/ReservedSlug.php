<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ReservedSlug implements ValidationRule
{
    private const RESERVED = [
        'archive', 'about', 'contact', 'signin', 'signup',
        'forgot-password', 'reset-password', 'auth', 'profile',
        'dashboard', 'editor', 'terms', 'privacy',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (in_array(strtolower((string) $value), self::RESERVED, true)) {
            $fail('The :attribute is a reserved slug and cannot be used.');
        }
    }
}
