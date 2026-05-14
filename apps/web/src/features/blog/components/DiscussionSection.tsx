import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchComments, postComment, editComment, deleteComment } from '../api/blogApi';
import type { Comment, CommentSortOrder, CommentsResponse } from '../blogTypes';
import { relativeDate } from '../utils/relativeDate';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { useCurrentSession } from '@/features/auth/session/useCurrentSession';
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
  { label: 'Latest', value: 'new' },
  { label: 'Oldest', value: 'old' },
];

const PER_PAGE = 3;

// ── Avatar ────────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, oklch(0.52 0.16 255), oklch(0.52 0.16 305))',
  'linear-gradient(135deg, oklch(0.52 0.12 145), oklch(0.52 0.12 75))',
  'linear-gradient(135deg, oklch(0.52 0.12 30), oklch(0.52 0.12 75))',
  'linear-gradient(135deg, oklch(0.52 0.12 305), oklch(0.52 0.12 255))',
  'linear-gradient(135deg, oklch(0.52 0.12 75), oklch(0.52 0.12 145))',
];

function avatarGradient(id: number) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

// ── Markdown ──────────────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>')
    .replace(/(@[a-z0-9_]+)/gi, '<a href="/profile/$1" class="comment-mention">$1</a>')
    .replace(/\n/g, '<br>');
}

// ── Comment item ──────────────────────────────────────────────────────────────

type CommentItemProps = {
  comment: Comment;
  isReply?: boolean;
  postSlug: string;
  isAuthenticated: boolean;
  currentUserId: number | null;
  activeReplyId: number | null;
  onReplyClick: (id: number) => void;
  onReplyAdded: (parentId: number, reply: Comment) => void;
  onCommentEdited: (id: number, newBody: string) => void;
  onDelete: (id: number, isReply: boolean, parentId: number | null) => Promise<void>;
};

function CommentItem({
  comment,
  isReply = false,
  postSlug,
  isAuthenticated,
  currentUserId,
  activeReplyId,
  onReplyClick,
  onReplyAdded,
  onCommentEdited,
  onDelete,
}: CommentItemProps) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [replyBody, setReplyBody] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const editRef = useRef<HTMLTextAreaElement>(null);

  const isReplying = activeReplyId === comment.id;
  const replyCount = comment.replies?.length ?? 0;
  const isOwn = currentUserId !== null && currentUserId === comment.author.id;
  const { relative, absolute } = relativeDate(comment.created_at);

  // Prefill @handle when reply box opens
  useEffect(() => {
    if (isReplying) setReplyBody(`${comment.author.handle} `);
    else setReplyBody('');
  }, [isReplying, comment.author.handle]);

  // Auto-resize edit textarea
  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [editBody]);

  // Focus edit textarea when editing starts
  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  async function handleReplySubmit() {
    if (!replyBody.trim()) return;
    setReplyBusy(true);
    setReplyError(null);
    try {
      const token = await getAccessToken();
      const newReply = await postComment(postSlug, replyBody, token, comment.id);
      onReplyAdded(comment.id, newReply);
      setReplyBody('');
      setRepliesOpen(true);
      onReplyClick(comment.id);
    } catch {
      setReplyError('Failed to post reply. Please try again.');
    } finally {
      setReplyBusy(false);
    }
  }

  async function handleEditSave() {
    if (!editBody.trim() || editBody === comment.body) {
      setIsEditing(false);
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      const token = await getAccessToken();
      await editComment(postSlug, comment.id, editBody, token);
      onCommentEdited(comment.id, editBody);
      setIsEditing(false);
    } catch {
      setEditError('Failed to save. Please try again.');
    } finally {
      setEditBusy(false);
    }
  }

  return (
    <li id={`comment-${comment.id}`} className={isReply ? 'reply-item' : 'comment-item'}>
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
          <a href={`/profile/${comment.author.handle}`} className="comment-author">
            {comment.author.display_name ?? comment.author.handle}
          </a>
          {comment.is_post_author && (
            <span className="comment-badge-author">Author</span>
          )}
          <a href={`#comment-${comment.id}`} className="comment-date" title={absolute}>
            {relative}
          </a>
        </div>
      </div>

      {isEditing ? (
        <div className="comment-edit">
          <textarea
            ref={editRef}
            className="comment-edit-textarea"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            disabled={editBusy}
            rows={3}
            maxLength={250}
          />
          {editError && <p className="compose-error-msg">{editError}</p>}
          <div className="comment-edit-actions">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => void handleEditSave()}
              disabled={editBusy || !editBody.trim()}
            >
              {editBusy ? 'Saving…' : 'Save'}
            </button>
            <button
              className="btn btn-sm"
              onClick={() => { setIsEditing(false); setEditBody(comment.body); setEditError(null); }}
              disabled={editBusy}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className="comment-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.body) }}
        />
      )}

      <div className="comment-actions">
        {!isReply && isAuthenticated && (
          <button
            className={`comment-action-btn${isReplying ? ' active' : ''}`}
            onClick={() => { onReplyClick(comment.id); setReplyError(null); }}
          >
            ↩ Reply
          </button>
        )}
        {!isReply && replyCount > 0 && (
          <button
            className="comment-action-btn"
            onClick={() => setRepliesOpen(o => !o)}
          >
            {repliesOpen
              ? `▾ ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
              : `▸ ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
          </button>
        )}
        {isOwn && !isEditing && (
          <>
            <button className="comment-action-btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            {deleteConfirm ? (
              <>
                <span className="comment-action-confirm">Delete?</span>
                <button
                  className="comment-action-btn danger"
                  onClick={() => void onDelete(comment.id, isReply, comment.parent_id)}
                >
                  Yes
                </button>
                <button className="comment-action-btn" onClick={() => setDeleteConfirm(false)}>
                  No
                </button>
              </>
            ) : (
              <button className="comment-action-btn danger" onClick={() => setDeleteConfirm(true)}>
                Delete
              </button>
            )}
          </>
        )}
      </div>

      {isReplying && (
        <ComposeBox
          showToolbar={false}
          value={replyBody}
          onChange={setReplyBody}
          onSubmit={() => void handleReplySubmit()}
          onCancel={() => { onReplyClick(comment.id); }}
          busy={replyBusy}
          placeholder={`Reply to ${comment.author.display_name ?? comment.author.handle}…`}
          error={replyError}
        />
      )}

      {replyCount > 0 && repliesOpen && (
        <ul className="replies-list">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              postSlug={postSlug}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
              activeReplyId={activeReplyId}
              onReplyClick={onReplyClick}
              onReplyAdded={onReplyAdded}
              onCommentEdited={onCommentEdited}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ── Discussion section ────────────────────────────────────────────────────────

function getSavedSort(slug: string): CommentSortOrder {
  try {
    const v = localStorage.getItem(`discussion-sort-${slug}`);
    return v === 'old' ? 'old' : 'new';
  } catch {
    return 'new';
  }
}

export function DiscussionSection({
  postSlug,
  postAuthorId,
  initialCount,
  isAuthenticated,
  onOpenAuthGate,
}: Props) {
  void postAuthorId;
  const { user } = useCurrentSession();

  const [comments, setComments] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<CommentsResponse['meta'] | null>(null);
  const [sort, setSort] = useState<CommentSortOrder>('new');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [composeBody, setComposeBody] = useState('');
  const [composeBusy, setComposeBusy] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const listRef = useRef<HTMLUListElement>(null);

  // Load persisted sort after mount (localStorage not available on SSR)
  useEffect(() => {
    setSort(getSavedSort(postSlug));
  }, [postSlug]);

  const avatarInitial = (user?.display_name?.[0] ?? user?.handle?.[0] ?? '?').toUpperCase();

  const participants = useMemo(() => {
    const ids = new Set<number>();
    comments.forEach(c => {
      ids.add(c.author.id);
      c.replies?.forEach(r => ids.add(r.author.id));
    });
    return ids.size;
  }, [comments]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPage(1);

    fetchComments(postSlug, { sort, page: 1, per_page: PER_PAGE })
      .then((res) => {
        if (cancelled) return;
        setComments(res.data);
        setMeta(res.meta);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [postSlug, sort, retryKey]);

  function handleSortChange(newSort: CommentSortOrder) {
    try { localStorage.setItem(`discussion-sort-${postSlug}`, newSort); } catch { /* ignore */ }
    setSort(newSort);
    setPage(1);
    setComments([]);
  }

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetchComments(postSlug, { sort, page: nextPage, per_page: PER_PAGE });
      setComments(prev => {
        const seen = new Set(prev.map(c => c.id));
        return [...prev, ...res.data.filter(c => !seen.has(c.id))];
      });
      setMeta(res.meta);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

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
      setTimeout(() => {
        document.getElementById(`comment-${newComment.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
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

  async function handleDelete(id: number, isReply: boolean, parentId: number | null) {
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
  const hasMore = meta ? page < meta.last_page : false;
  const remaining = meta ? meta.total - comments.length : 0;

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
          <button onClick={() => setRetryKey(k => k + 1)}>Try again</button>
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
            Show {remaining > 0 ? remaining : 'more'} more →
          </button>
        </div>
      )}

      {loadingMore && [0, 1, 2].map(i => <CommentSkeleton key={i} />)}
    </section>
  );
}
