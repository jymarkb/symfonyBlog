<?php

namespace App\Http\Middleware;

use App\Services\Auth\UserPermissionService;
use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || ! app(UserPermissionService::class)->isAdmin($user)) {
            abort(403, 'Admin access is required.');
        }

        return $next($request);
    }
}
