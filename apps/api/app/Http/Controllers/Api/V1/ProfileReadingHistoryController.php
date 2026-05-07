<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileReadingHistoryResource;
use App\Services\Profile\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProfileReadingHistoryController extends Controller
{
    public function __construct(private readonly ProfileService $profiles) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $history = $this->profiles->getReadingHistory($request->user());

        return ProfileReadingHistoryResource::collection($history);
    }
}
