<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionResource;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function show(Request $request): SessionResource
    {
        return new SessionResource($request->user());
    }
}
