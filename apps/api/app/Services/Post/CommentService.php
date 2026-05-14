<?php

namespace App\Services\Post;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class CommentService
{
    public function listForPost(Post $post, string $sort = 'top', int $perPage = 20): LengthAwarePaginator
    {
        $query = Comment::query()
            ->where('post_id', $post->id)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user']);

        match ($sort) {
            'new'   => $query->latest(),
            'old'   => $query->oldest(),
            default => $query->latest(), // 'top' — votes not implemented yet, fall back to newest
        };

        $paginator = $query->paginate($perPage);

        foreach ($paginator as $comment) {
            $comment->setRelation('post', $post);
            foreach ($comment->replies as $reply) {
                $reply->setRelation('post', $post);
            }
        }

        return $paginator;
    }

    public function createComment(Post $post, User $user, string $body, ?int $parentId = null): Comment
    {
        if ($parentId !== null) {
            $parent = Comment::where('id', $parentId)
                ->where('post_id', $post->id)
                ->whereNull('parent_id')
                ->first();

            if (!$parent) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Invalid parent comment.'],
                ]);
            }
        }

        $comment = Comment::create([
            'post_id'   => $post->id,
            'user_id'   => $user->id,
            'body'      => $body,
            'parent_id' => $parentId,
        ]);

        $comment->load(['user', 'replies.user']);
        $comment->setRelation('post', $post);

        return $comment;
    }

    public function deleteComment(Comment $comment): void
    {
        $comment->delete();
    }

    public function listForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Comment::query()
            ->with(['user', 'post'])
            ->when(isset($filters['post_id']), fn ($q) => $q->where('post_id', $filters['post_id']))
            ->latest()
            ->paginate($perPage);
    }
}
