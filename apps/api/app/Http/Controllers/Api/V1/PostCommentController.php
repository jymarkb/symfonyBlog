<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Services\Post\CommentService;
use App\Services\Post\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostCommentController extends Controller
{
    public function __construct(
        private readonly CommentService $commentService,
        private readonly PostService $postService,
    ) {}

    public function index(Request $request, string $slug): AnonymousResourceCollection
    {
        $post = $this->postService->findPublishedBySlug($slug);

        $sort    = $request->query('sort', 'top');
        $perPage = min((int) $request->query('per_page', 15), 50);

        $paginator = $this->commentService->listForPost($post, $sort, $perPage);

        return CommentResource::collection($paginator);
    }

    public function store(StoreCommentRequest $request, string $slug): JsonResponse
    {
        if ($request->user() === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $post = $this->postService->findPublishedBySlug($slug);

        $validated = $request->validated();

        $comment = $this->commentService->createComment(
            $post,
            $request->user(),
            $validated['body'],
            $validated['parent_id'] ?? null,
        );

        return (new CommentResource($comment))->response()->setStatusCode(201);
    }
}
