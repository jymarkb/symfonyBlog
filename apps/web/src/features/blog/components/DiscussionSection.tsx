import { useMemo, useRef, useState } from 'react';
import { postComment, deleteComment } from '../api/blogApi';
import type { Comment, CommentSortOrder } from '../blogTypes';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { useCurrentSession } from '@/features/auth/session/useCurrentSession';
import { ComposeBox } from './ComposeBox';
import { CommentSkeleton } from './CommentSkeleton';
import { DiscussionGate } from './DiscussionGate';
import { CommentItem } from './CommentItem';
import { useFetchComments } from '../hooks/useFetchComments';

type Props = {
  postSlug: string;
  initialCount: number;
  isAuthenticated: boolean;
  onOpenAuthGate: () => void;
};

const SORT_TABS: { label: string; value: CommentSortOrder }[] = [
  { label: 'Latest', value: 'new' },
  { label: 'Oldest', value: 'old' },
];

export function DiscussionSection({
  postSlug,
  initialCount,
  isAuthenticated,
  onOpenAuthGate,
}: Props) {
  const { user } = useCurrentSession();

  const { comments, setComments, meta, sort, loading, loadingMore, error, hasMore, remaining, handleSortChange, handleLoadMore, retry } = useFetchComments(postSlug);

  const [count, setCount] = useState(initialCount);
  const [composeBody, setComposeBody] = useState('');
  const [composeBusy, setComposeBusy] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const listRef = useRef<HTMLUListElement>(null);

  const avatarInitial = (user?.display_name?.[0] ?? user?.handle?.[0] ?? '?').toUpperCase();

  const participants = useMemo(() => {
    const ids = new Set<number>();
    comments.forEach(c => {
      ids.add(c.author.id);
      c.replies?.forEach(r => ids.add(r.author.id));
    });
    return ids.size;
  }, [comments]);

  async function handleCommentSubmit() {
    if (!composeBody.trim()) return;
    setComposeBusy(true);
    setComposeError(null);
    try {
      const token = await getAccessToken();
      const newComment = await postComment(postSlug, composeBody, token);
      setComments(prev => [newComment, ...prev]);
      setComposeBody('');
      setCount(c => c + 1);
      requestAnimationFrame(() => {
        document.getElementById(`comment-${newComment.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } catch {
      setComposeError('Failed to post comment. Please try again.');
    } finally {
      setComposeBusy(false);
    }
  }

  function handleReplyAdded(parentId: number, reply: Comment) {
    setComments(prev =>
      prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c),
    );
    setCount(c => c + 1);
  }

  function handleCommentEdited(id: number, newBody: string) {
    setComments(prev =>
      prev.map(c => {
        if (c.id === id) return { ...c, body: newBody };
        return { ...c, replies: c.replies?.map(r => r.id === id ? { ...r, body: newBody } : r) };
      }),
    );
  }

  async function handleDelete(id: number, parentId: number | null) {
    const isReply = parentId !== null;
    const snapshot = comments;
    if (isReply && parentId !== null) {
      setComments(prev =>
        prev.map(c => c.id === parentId ? { ...c, replies: c.replies?.filter(r => r.id !== id) } : c),
      );
    } else {
      setComments(prev => prev.filter(c => c.id !== id));
    }
    setCount(c => c - 1);
    try {
      const token = await getAccessToken();
      await deleteComment(postSlug, id, token);
    } catch {
      setComments(snapshot);
      setCount(c => c + 1);
    }
  }

  function handleReplyClick(id: number) {
    setActiveReplyId(prev => prev === id ? null : id);
  }

  const showSortTabs = !loading && (meta?.total ?? 0) > 1;

  return (
    <section className="discussion" aria-label="Comments">
      <div className="discussion-header">
        <div className="discussion-header-left">
          <p className="discussion-eyebrow">Discussion</p>
          <h2 className="discussion-title">{count} {count === 1 ? 'comment' : 'comments'}</h2>
          {participants > 0 && (
            <span className="discussion-count">{participants} {participants === 1 ? 'participant' : 'participants'}</span>
          )}
        </div>
        {showSortTabs && (
          <div className="discussion-sort" role="tablist">
            {SORT_TABS.map(tab => (
              <button
                key={tab.value}
                className={sort === tab.value ? 'active' : undefined}
                onClick={() => handleSortChange(tab.value)}
                role="tab"
                aria-selected={sort === tab.value}
                aria-label={`Sort by ${tab.label}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isAuthenticated && count > 0 && !loading && (
        <DiscussionGate onSignIn={onOpenAuthGate} />
      )}
      {isAuthenticated && (
        <ComposeBox
          showToolbar={true}
          value={composeBody}
          onChange={setComposeBody}
          onSubmit={handleCommentSubmit}
          busy={composeBusy}
          placeholder="Share your thoughts."
          avatarInitial={avatarInitial}
          error={composeError}
        />
      )}

      {loading && [0, 1, 2].map(i => <CommentSkeleton key={i} />)}

      {error && (
        <div className="load-error">
          <span>Couldn't load comments.</span>
          <button onClick={retry}>Try again</button>
        </div>
      )}

      {!loading && !error && (
        <ul className="comment-list" ref={listRef}>
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              isAuthenticated={isAuthenticated}
              currentUserId={user?.id ?? null}
              activeReplyId={activeReplyId}
              onReplyClick={handleReplyClick}
              onReplyAdded={handleReplyAdded}
              onCommentEdited={handleCommentEdited}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {!loading && !error && comments.length === 0 && (
        isAuthenticated ? (
          <div className="discussion-empty">
            <p className="discussion-empty-headline">No comments yet.</p>
            <p className="discussion-empty-sub">You're first. Go ahead.</p>
          </div>
        ) : (
          <DiscussionGate onSignIn={onOpenAuthGate} />
        )
      )}

      {hasMore && !loadingMore && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={() => void handleLoadMore()}
          >
            {remaining > 0 ? `Show ${remaining} more` : 'Load more'} →
          </button>
        </div>
      )}

      {loadingMore && [0, 1, 2].map(i => <CommentSkeleton key={i} />)}
    </section>
  );
}
