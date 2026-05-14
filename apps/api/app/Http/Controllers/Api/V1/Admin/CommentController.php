<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Services\Post\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CommentController extends Controller
{
    public function __construct(private readonly CommentService $commentService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $postId  = (int) $request->query('post_id');
        $perPage = min((int) $request->query('per_page', 20), 100);

        $filters = [];
        if ($postId !== 0) {
            $filters['post_id'] = $postId;
        }

        $paginator = $this->commentService->listForAdmin($filters, $perPage);

        return CommentResource::collection($paginator);
    }

    public function update(string $comment): JsonResponse
    {
        return response()->json(['id' => $comment]);
    }

    public function destroy(Comment $comment): Response
    {
        $this->commentService->deleteComment($comment);

        return response()->noContent();
    }
}
