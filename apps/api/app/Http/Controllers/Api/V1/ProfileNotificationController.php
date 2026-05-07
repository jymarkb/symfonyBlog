<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileResource;
use App\Services\Profile\ProfileService;
use Illuminate\Http\Request;

class ProfileNotificationController extends Controller
{
    public function update(Request $request, ProfileService $profiles): ProfileResource
    {
        $data = $request->validate([
            'notify_comment_replies' => ['nullable', 'string', 'in:immediate,digest,none'],
            'notify_new_posts'       => ['nullable', 'string', 'in:immediate,digest,none'],
        ]);

        $user = $profiles->updateNotifications($request->user(), array_filter($data, fn($v) => $v !== null));

        return new ProfileResource($user);
    }
}
