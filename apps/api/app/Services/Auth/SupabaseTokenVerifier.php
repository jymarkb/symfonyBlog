<?php

namespace App\Services\Auth;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabaseTokenVerifier
{
    public function verify(string $token): object
    {
        $jwks = Cache::remember('supabase.jwks', now()->addMinutes(10), function () {
            $response = Http::get(config('services.supabase.jwks_url'));

            if (! $response->successful()) {
                throw new RuntimeException('Unable to fetch Supabase JWKS.');
            }

            return $response->json();
        });

        $keys = JWK::parseKeySet($jwks);
        JWT::$leeway = 5;
        $claims = JWT::decode($token, $keys);

        if (($claims->iss ?? null) !== config('services.supabase.issuer')) {
            throw new RuntimeException('Invalid token issuer.');
        }

        $expectedAudience = config('services.supabase.audience');
        $actualAudience = $claims->aud ?? null;

        $validAudience = is_array($actualAudience)
            ? in_array($expectedAudience, $actualAudience, true)
            : $actualAudience === $expectedAudience;

        if (! $validAudience) {
            throw new RuntimeException('Invalid token audience.');
        }

        if (empty($claims->sub)) {
            throw new RuntimeException('Missing token subject.');
        }

        return $claims;
    }
}
