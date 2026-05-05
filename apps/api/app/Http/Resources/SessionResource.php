<?php

namespace App\Http\Resources;

use App\Services\Auth\UserPermissionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => [
                'id' => $this->id,
                'email' => $this->email,
                'handle' => $this->handle,
                'display_name' => $this->display_name,
                'avatar_url' => $this->avatar_url,
                'role' => $this->role,
            ],
            'permissions' => app(UserPermissionService::class)->permissionsFor($this->resource),
        ];
    }
}
