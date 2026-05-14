import { useEffect, useState } from 'react';
import { postComment, editComment } from '../api/blogApi';
import type { Comment } from '../blogTypes';
import { relativeDate } from '../utils/relativeDate';
import { renderMarkdown } from '../utils/renderMarkdown';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { ComposeBox } from './ComposeBox';

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

// ── Types ─────────────────────────────────────────────────────────────────────

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
  onDelete: (id: number, parentId: number | null) => Promise<void>;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CommentItem({
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

  const editRef = useAutoResizeTextarea(editBody);

  const isReplying = activeReplyId === comment.id;
  const replyCount = comment.replies?.length ?? 0;
  const isOwn = currentUserId !== null && currentUserId === comment.author.id;
  const { relative, absolute } = relativeDate(comment.created_at);

  // Prefill @handle when reply box opens
  useEffect(() => {
    if (isReplying) setReplyBody(`${comment.author.handle} `);
    else setReplyBody('');
  }, [isReplying, comment.id]);

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
            aria-label="Edit comment"
            aria-describedby={`edit-counter-${comment.id}`}
          />
          {editError && <p className="compose-error-msg" role="alert">{editError}</p>}
          <div className="comment-edit-actions">
            {(() => {
              const remaining = 250 - editBody.length;
              const overLimit = remaining < 0;
              const nearLimit = remaining <= 50;
              const cls = overLimit ? ' over' : nearLimit ? ' warn' : '';
              return (
                <span id={`edit-counter-${comment.id}`} className={`compose-count${cls}`}>
                  {overLimit
                    ? `${Math.abs(remaining)} character${Math.abs(remaining) === 1 ? '' : 's'} over the limit`
                    : `${remaining} character${remaining === 1 ? '' : 's'} remaining`}
                </span>
              );
            })()}
            <button
              className="btn btn-sm btn-primary"
              aria-label="Save edit"
              onClick={() => void handleEditSave()}
              disabled={editBusy || !editBody.trim() || editBody.length > 250}
            >
              {editBusy ? 'Saving…' : 'Save'}
            </button>
            <button
              className="btn btn-sm"
              aria-label="Cancel edit"
              onClick={() => { setIsEditing(false); setEditBody(comment.body); setEditError(null); }}
              disabled={editBusy}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* renderMarkdown escapes HTML entities before applying regex — output is safe */
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
            aria-label={isReplying ? 'Cancel reply' : 'Reply to comment'}
          >
            ↩ Reply
          </button>
        )}
        {!isReply && replyCount > 0 && (
          <button
            className="comment-action-btn"
            onClick={() => setRepliesOpen(o => !o)}
            aria-label={repliesOpen ? 'Hide replies' : 'Show replies'}
          >
            {repliesOpen
              ? `▾ ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
              : `▸ ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
          </button>
        )}
        {isOwn && !isEditing && (
          <>
            <button
              className="comment-action-btn"
              onClick={() => setIsEditing(true)}
              aria-label="Edit comment"
            >
              Edit
            </button>
            {deleteConfirm ? (
              <>
                <span className="comment-action-confirm">Delete?</span>
                <button
                  className="comment-action-btn danger"
                  onClick={() => void onDelete(comment.id, comment.parent_id)}
                  aria-label="Confirm delete"
                >
                  Yes
                </button>
                <button
                  className="comment-action-btn"
                  onClick={() => setDeleteConfirm(false)}
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </>
            ) : (
              <button
                className="comment-action-btn danger"
                onClick={() => setDeleteConfirm(true)}
                aria-label="Delete comment"
              >
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
          counterId={`reply-counter-${comment.id}`}
        />
      )}

      {replyCount > 0 && repliesOpen && (
        <ul className="replies-list">
          {comment.replies?.map((reply) => (
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
