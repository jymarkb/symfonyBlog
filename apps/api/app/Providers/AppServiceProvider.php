<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Services\Auth\SupabaseTokenVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\UniqueConstraintViolationException;
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
        RateLimiter::for('profile-mutations', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('profile-delete', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('post-view', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('session', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth-read', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('admin-mutations', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('admin-read', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('comment-create', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

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

            $meta  = (array) ($claims->user_metadata ?? []);
            $email = $claims->email ?? '';

            return DB::transaction(function () use ($claims, $email, $meta) {
                $user = User::where('supabase_user_id', $claims->sub)->lockForUpdate()->first()
                    ?? User::where('email', $email)->lockForUpdate()->first();

                if ($user) {
                    $user->supabase_user_id = $user->supabase_user_id ?? $claims->sub;
                    $user->handle           = $user->handle ?? $this->resolveHandle($meta, $email, $user);
                    $user->display_name     = $user->display_name ?? substr((string) ($meta['display_name'] ?? $meta['full_name'] ?? ''), 0, 120) ?: null;
                    $user->save();

                    return $user;
                }

                $user = new User();
                $user->supabase_user_id = $claims->sub;
                $user->email            = $email;
                $user->handle           = $this->resolveHandle($meta, $email);
                $user->display_name     = substr((string) ($meta['display_name'] ?? $meta['full_name'] ?? ''), 0, 120) ?: null;
                $user->role             = 'user';
                try {
                    $user->save();
                } catch (UniqueConstraintViolationException $e) {
                    $msg = $e->getMessage();
                    if (str_contains($msg, 'users_email') || str_contains($msg, 'users_supabase_user_id')) {
                        $user = User::where('supabase_user_id', $claims->sub)->first()
                            ?? User::where('email', $email)->firstOrFail();
                    } else {
                        $user->handle = $this->resolveHandle($meta, $email);
                        try {
                            $user->save();
                        } catch (UniqueConstraintViolationException) {
                            $user->handle = '@'.substr('user', 0, 13).'_'.substr(str_replace('-', '', Str::uuid()), 0, 6);
                            $user->save();
                        }
                    }
                }

                return $user;
            });
        });
    }

    private function resolveHandle(array $meta, string $email, ?User $currentUser = null): string
    {
        $source = $meta['handle']
            ?? $meta['user_name']
            ?? $meta['preferred_username']
            ?? $meta['full_name']
            ?? $meta['name']
            ?? Str::before($email, '@')
            ?? 'user';

        $base = $this->normalizeHandleBase((string) $source);
        $candidate = '@'.$base;
        $suffix = 2;
        $attempts = 0;

        while ($this->handleExists($candidate, $currentUser)) {
            $attempts++;
            if ($attempts >= 10) {
                $candidate = '@'.substr($base, 0, 13).'_'.substr(str_replace('-', '', Str::uuid()), 0, 6);
                break;
            }
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
