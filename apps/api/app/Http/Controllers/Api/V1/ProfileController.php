<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return new ProfileResource($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validatedData = $request->validate([
            'display_name' => ['nullable', 'string', 'max:120'],
            'first_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'avatar_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $user->fill($validatedData)->save();

        return new ProfileResource($user->refresh());
    }

    public function destroy()
    {
        abort(501, 'Profile deletion is not implemented yet.');
    }
}