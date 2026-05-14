<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
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

    public function update(UpdateCommentRequest $request, string $slug, int $comment): JsonResponse
    {
        $post         = $this->postService->findPublishedBySlug($slug);
        $commentModel = $this->commentService->findForPost($comment, $post);

        if ($request->user()?->id !== $commentModel->user_id) {
            return response()->json([
                'error'   => 'forbidden',
                'message' => 'You do not have permission to access this resource.',
            ], 403);
        }

        $updated = $this->commentService->updateComment($commentModel, $post, $request->validated()['body']);

        return (new CommentResource($updated))->response();
    }

    public function destroy(Request $request, string $slug, int $comment): JsonResponse
    {
        $post         = $this->postService->findPublishedBySlug($slug);
        $commentModel = $this->commentService->findForPost($comment, $post);

        if ($request->user()?->id !== $commentModel->user_id) {
            return response()->json([
                'error'   => 'forbidden',
                'message' => 'You do not have permission to access this resource.',
            ], 403);
        }

        $this->commentService->deleteComment($commentModel);

        return response()->json(null, 204);
    }
}
