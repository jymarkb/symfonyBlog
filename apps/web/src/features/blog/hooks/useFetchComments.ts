import { useEffect, useState } from 'react';
import { fetchComments } from '../api/blogApi';
import type { Comment, CommentSortOrder, CommentsResponse } from '../blogTypes';

const PER_PAGE = 3;

function getSavedSort(slug: string): CommentSortOrder {
  try {
    const v = localStorage.getItem(`discussion-sort-${slug}`);
    return v === 'old' ? 'old' : 'new';
  } catch {
    return 'new';
  }
}

type UseFetchCommentsResult = {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  meta: CommentsResponse['meta'] | null;
  sort: CommentSortOrder;
  page: number;
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  remaining: number;
  handleSortChange: (newSort: CommentSortOrder) => void;
  handleLoadMore: () => Promise<void>;
  retry: () => void;
};

export function useFetchComments(postSlug: string): UseFetchCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<CommentsResponse['meta'] | null>(null);
  const [sort, setSort] = useState<CommentSortOrder>('new');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setSort(getSavedSort(postSlug));
  }, [postSlug]);

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

  const hasMore = meta ? page < meta.last_page : false;
  const remaining = meta ? meta.total - comments.length : 0;

  return {
    comments,
    setComments,
    meta,
    sort,
    page,
    loading,
    loadingMore,
    error,
    hasMore,
    remaining,
    handleSortChange,
    handleLoadMore,
    retry: () => setRetryKey(k => k + 1),
  };
}
