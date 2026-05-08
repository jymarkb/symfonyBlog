<?php

namespace App\Http\Middleware;

use App\Services\Auth\UserPermissionService;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

class RequirePermission
{
    public function __construct(private UserPermissionService $permissions) {}

    public function handle(Request $request, Closure $next, string $permission): mixed
    {
        $user = $request->user();

        if (! $user) {
            throw new AuthenticationException('Authentication required.');
        }

        if (! ($this->permissions->permissionsFor($user)[$permission] ?? false)) {
            throw new AuthorizationException("Requires permission: {$permission}.");
        }

        return $next($request);
    }
}
