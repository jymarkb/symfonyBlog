<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Services\Auth\SupabaseTokenVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
            } catch (\Throwable $exception) {
                Log::warning('Supabase token verification failed.', [
                    'message' => $exception->getMessage(),
                    'exception' => $exception::class,
                ]);

                return null;
            }

            $userMetadata = $claims->user_metadata ?? null;
            $email = $claims->email ?? '';

            $user = User::where('supabase_user_id', $claims->sub)->first()
                ?? User::where('email', $email)->first();

            if ($user) {
                $user->fill([
                    'supabase_user_id' => $user->supabase_user_id ?? $claims->sub,
                    'handle' => $user->handle ?? $this->resolveHandle($userMetadata, $email, $user),
                    'display_name' => $user->display_name ?? $userMetadata->display_name ?? $userMetadata->full_name ?? null,
                    'avatar_url' => $user->avatar_url ?? $userMetadata->avatar_url ?? $userMetadata->picture ?? null,
                ])->save();

                return $user;
            }

            return User::create([
                'supabase_user_id' => $claims->sub,
                'email' => $email,
                'handle' => $this->resolveHandle($userMetadata, $email),
                'display_name' => $userMetadata->display_name ?? $userMetadata->full_name ?? null,
                'avatar_url' => $userMetadata->avatar_url ?? $userMetadata->picture ?? null,
                'role' => 'user',
            ]);
        });
    }

    private function resolveHandle(?object $userMetadata, string $email, ?User $currentUser = null): string
    {
        $source = $userMetadata->handle
            ?? $userMetadata->user_name
            ?? $userMetadata->preferred_username
            ?? $userMetadata->full_name
            ?? $userMetadata->name
            ?? Str::before($email, '@')
            ?? 'user';

        $base = $this->normalizeHandleBase((string) $source);
        $candidate = '@'.$base;
        $suffix = 2;

        while ($this->handleExists($candidate, $currentUser)) {
            $suffixText = (string) $suffix;
            $candidate = '@'.substr($base, 0, 19 - strlen($suffixText)).$suffixText;
            $suffix++;
        }

        return $candidate;
    }

    private function normalizeHandleBase(string $source): string
    {
        $base = Str::of($source)
            ->lower()
            ->replaceMatches('/^@/', '')
            ->replaceMatches('/[^a-z0-9_]+/', '_')
            ->trim('_')
            ->limit(19, '')
            ->toString();

        return $base !== '' && strlen($base) >= 2 ? $base : 'user';
    }

    private function handleExists(string $handle, ?User $currentUser = null): bool
    {
        return User::where('handle', $handle)
            ->when($currentUser, fn ($query) => $query->whereKeyNot($currentUser->getKey()))
            ->exists();
    }

}
