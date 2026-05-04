<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Services\Auth\SupabaseTokenVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::viaRequest('supabase', function (Request $request) {
            $token = $request->bearerToken();

            if (!$token) {
                return null;
            }

            try {
                $claims = app(SupabaseTokenVerifier::class)->verify($token);
            } catch (\Throwable) {
                return null;
            }

            $userMetadata = $claims->user_metadata ?? null;

            return User::firstOrCreate(
                ['supabase_user_id' => $claims->sub],
                [
                    'email' => $claims->email ?? '',
                    'display_name' => $userMetadata->display_name ?? null,
                    'avatar_url' => $userMetadata->avatar_url ?? null,
                    'role' => 'user',
                ]
            );
        });
    }

}
