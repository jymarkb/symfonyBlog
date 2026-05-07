<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileResource;
use App\Services\Profile\ProfileService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): ProfileResource
    {
        return new ProfileResource($request->user()->loadCount(['posts', 'comments', 'postViews']));
    }

    public function update(Request $request, ProfileService $profiles): ProfileResource
    {
        $validatedData = $request->validate([
            'display_name' => ['nullable', 'string', 'max:120'],
            'first_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'avatar_url' => ['nullable', 'url:https', 'max:2048'],
        ]);

        return new ProfileResource(
            $profiles->updatePrivateProfile($request->user(), $validatedData)
        );
    }

    public function destroy(Request $request, ProfileService $profiles): \Illuminate\Http\JsonResponse
    {
        $profiles->deleteAccount($request->user());

        return response()->json(['message' => 'Account deleted.']);
    }
}
