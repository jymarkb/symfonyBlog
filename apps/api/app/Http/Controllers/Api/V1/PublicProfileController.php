<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProfileResource;
use App\Services\Profile\ProfileService;

class PublicProfileController extends Controller
{
    public function show(
        string $handle,
        ProfileService $profiles,
    ): PublicProfileResource {
        return new PublicProfileResource(
            $profiles->findPublicProfileByHandle($handle)
        );
    }
}
