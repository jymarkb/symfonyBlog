<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFollowRequest;
use App\Http\Resources\FollowResource;
use App\Services\Follow\FollowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthorFollowController extends Controller
{
    public function __construct(private readonly FollowService $followService) {}

    public function store(StoreFollowRequest $request): JsonResponse
    {
        try {
            $follow = $this->followService->follow(
                $request->user(),
                $request->validated('author_id'),
            );

            $resource = new FollowResource($follow);

            return $resource->response()->setStatusCode(201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, int $authorId): Response
    {
        $this->followService->unfollow($request->user(), $authorId);

        return response()->noContent();
    }
}
