import { useEffect, useMemo, useState } from 'react';
import { fetchComments, postComment } from '../api/blogApi';
import type { Comment, CommentSortOrder, CommentsResponse } from '../blogTypes';
import { formatDate } from '../utils/formatDate';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { ComposeBox } from './ComposeBox';
import { CommentSkeleton } from './CommentSkeleton';
import { DiscussionGate } from './DiscussionGate';

type Props = {
  postSlug: string;
  postAuthorId: number;
  initialCount: number;
  isAuthenticated: boolean;
  onOpenAuthGate: () => void;
};

const SORT_TABS: { label: string; value: CommentSortOrder }[] = [
  { label: 'Top', value: 'top' },
  { label: 'Latest', value: 'new' },
  { label: 'Oldest', value: 'old' },
];

// ── Avatar helpers ────────────────────────────────────────────────────────────


const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, oklch(0.52 0.16 255), oklch(0.52 0.16 305))',
  'linear-gradient(135deg, oklch(0.52 0.12 145), oklch(0.52 0.12 75))',
  'linear-gradient(135deg, oklch(0.52 0.12 30), oklch(0.52 0.12 75))',
  'linear-gradient(135deg, oklch(0.52 0.12 305), oklch(0.52 0.12 255))',
  'linear-gradient(135deg, oklch(0.52 0.12 75), oklch(0.52 0.12 145))',
];

function avatarGradient(id: number): string {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

// ── Comment item ──────────────────────────────────────────────────────────────

type CommentItemProps = {
  comment: Comment;
  isReply?: boolean;
  isAuthenticated: boolean;
  activeReplyId: number | null;
  onReplyClick: (id: number) => void;
  onReplySubmit: (parentId: number, body: string) => Promise<void>;
  replyBusy: boolean;
};

function CommentItem({
  comment,
  isReply = false,
  isAuthenticated,
  activeReplyId,
  onReplyClick,
  onReplySubmit,
  replyBusy,
}: CommentItemProps) {
  const [replyBody, setReplyBody] = useState('');
  const isReplying = activeReplyId === comment.id;

  async function handleReplySubmit() {
    if (!replyBody.trim()) return;
    await onReplySubmit(comment.id, replyBody);
    setReplyBody('');
  }

  return (
    <li className={isReply ? 'reply-item' : 'comment-item'}>
      <div className="comment-head">
        <div
          className="comment-avatar"
          style={
            isReply
              ? { background: avatarGradient(comment.author.id), width: '26px', height: '26px', fontSize: '9px' }
              : { background: avatarGradient(comment.author.id) }
          }
        >
          {(comment.author.display_name?.[0] ?? comment.author.handle[0]).toUpperCase()}
        </div>
        <div className="comment-meta">
          <a
            href={`/@${comment.author.handle}`}
            className="comment-author"
            aria-label={comment.author.display_name ?? comment.author.handle}
          >
            {comment.author.display_name ?? comment.author.handle}
          </a>
          {comment.is_post_author && (
            <span className="comment-badge-author">Author</span>
          )}
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
      </div>

      <p className="comment-body">{comment.body}</p>

      {!isReply && (
        <div className="comment-actions">
          {isAuthenticated && (
            <button
              className={`comment-action-btn${isReplying ? ' active' : ''}`}
              aria-label={`Reply to ${comment.author.display_name ?? comment.author.handle}`}
              onClick={() => { onReplyClick(comment.id); }}
            >
              ↩ Reply
            </button>
          )}
        </div>
      )}

      {isReplying && (
        <ComposeBox
          showToolbar={false}
          value={replyBody}
          onChange={setReplyBody}
          onSubmit={() => void handleReplySubmit()}
          onCancel={() => { onReplyClick(comment.id); }}
          busy={replyBusy}
          placeholder="Write a reply…"
        />
      )}

      {comment.replies.length > 0 && (
        <ul className="replies-list">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              isAuthenticated={isAuthenticated}
              activeReplyId={activeReplyId}
              onReplyClick={onReplyClick}
              onReplySubmit={onReplySubmit}
              replyBusy={replyBusy}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ── Discussion section ────────────────────────────────────────────────────────

export function DiscussionSection({
  postSlug,
  postAuthorId,
  initialCount,
  isAuthenticated,
  onOpenAuthGate,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<CommentsResponse['meta'] | null>(null);
  const [sort, setSort] = useState<CommentSortOrder>('top');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [composeBody, setComposeBody] = useState('');
  const [composeBusy, setComposeBusy] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyBusy, setReplyBusy] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Suppress unused variable warning — postAuthorId may be used for future features
  void postAuthorId;

  const participants = useMemo(() => {
    const ids = new Set<number>();
    comments.forEach(c => {
      ids.add(c.author.id);
      c.replies.forEach(r => ids.add(r.author.id));
    });
    return ids.size;
  }, [comments]);

  // Initial load and re-fetch on sort change or retry
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPage(1);

    fetchComments(postSlug, { sort, page: 1 })
      .then((res) => {
        if (cancelled) return;
        setComments(res.data);
        setMeta(res.meta);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [postSlug, sort, retryKey]);

  function retryLoad() {
    setRetryKey(k => k + 1);
  }

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetchComments(postSlug, { sort, page: nextPage });
      setComments((prev) => [...prev, ...res.data]);
      setMeta(res.meta);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleCommentSubmit() {
    if (!composeBody.trim()) return;
    setComposeBusy(true);
    try {
      const token = await getAccessToken();
      const newComment = await postComment(postSlug, composeBody, token);
      setComments((prev) => [newComment, ...prev]);
      setComposeBody('');
      setCount((c) => c + 1);
    } finally {
      setComposeBusy(false);
    }
  }

  async function handleReplySubmit(parentId: number, body: string) {
    setReplyBusy(true);
    try {
      const token = await getAccessToken();
      const newReply = await postComment(postSlug, body, token, parentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...c.replies, newReply] }
            : c,
        ),
      );
      setActiveReplyId(null);
      setCount((c) => c + 1);
    } finally {
      setReplyBusy(false);
    }
  }

  function handleReplyClick(id: number) {
    setActiveReplyId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="discussion" aria-label="Comments">
      {/* Header */}
      <div className="discussion-header">
        <div className="discussion-header-left">
          <p className="discussion-eyebrow">Discussion</p>
          <h2 className="discussion-title">{count} {count === 1 ? 'comment' : 'comments'}</h2>
          {participants > 0 && (
            <span className="discussion-count">{participants} {participants === 1 ? 'participant' : 'participants'}</span>
          )}
        </div>
        {!loading && count > 0 && (
          <div className="discussion-sort" role="tablist">
            {SORT_TABS.map(tab => (
              <button
                key={tab.value}
                className={sort === tab.value ? 'active' : undefined}
                onClick={() => { setSort(tab.value); setPage(1); setComments([]); }}
                role="tab"
                aria-label={`Sort by ${tab.label.toLowerCase()}`}
                aria-selected={sort === tab.value}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auth gate / compose */}
      {!isAuthenticated && count > 0 && !loading && (
        <DiscussionGate variant="nudge" onSignIn={onOpenAuthGate} />
      )}
      {isAuthenticated && (
        <ComposeBox
          showToolbar={true}
          value={composeBody}
          onChange={setComposeBody}
          onSubmit={handleCommentSubmit}
          busy={composeBusy}
          placeholder="Share your thoughts — Markdown supported."
          avatarInitial="Y"
        />
      )}

      {/* Loading skeletons */}
      {loading && [0, 1, 2].map(i => <CommentSkeleton key={i} />)}

      {/* Error state */}
      {error && (
        <div className="load-error">
          <span>Couldn't load comments.</span>
          <button onClick={retryLoad} aria-label="Retry loading comments">Try again</button>
        </div>
      )}

      {/* Comment list */}
      {!loading && !error && (
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isAuthenticated={isAuthenticated}
              activeReplyId={activeReplyId}
              onReplyClick={handleReplyClick}
              onReplySubmit={handleReplySubmit}
              replyBusy={replyBusy}
            />
          ))}
        </ul>
      )}

      {/* Empty state */}
      {!loading && !error && comments.length === 0 && (
        <>
          {!isAuthenticated && <DiscussionGate variant="empty" onSignIn={onOpenAuthGate} />}
          <div className="discussion-empty">
            <p className="discussion-empty-headline">No comments yet.</p>
            {isAuthenticated ? (
              <p className="discussion-empty-sub">You're first. Go ahead.</p>
            ) : (
              <p className="discussion-empty-sub">
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); onOpenAuthGate(); }}
                  aria-label="Sign in to start the discussion"
                >
                  Be the first to start the discussion.
                </a>
              </p>
            )}
          </div>
        </>
      )}

      {/* Load more */}
      {meta && meta.current_page < meta.last_page && !loadingMore && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={() => void handleLoadMore()}
            aria-label={`Show ${meta.total - comments.length} more comments`}
          >
            Show {meta.total - comments.length} more →
          </button>
        </div>
      )}

      {loadingMore && <p aria-live="polite">Loading more…</p>}
    </section>
  );
}
