import { useRef, useEffect, useState } from 'react';
import { useData } from 'vike-react/useData';
import { BlockRenderer } from '@jymarkb/block-editor/render';
import type { BlockElement } from '@jymarkb/block-editor/render';
import { AppShell } from '@/layouts/AppShell';
import { PostRail } from '@/features/blog/components/PostRail';
import type { TocHeading } from '@/features/blog/components/PostRail';
import { AuthorCard } from '@/features/blog/components/AuthorCard';
import type { PostDetailPageData, PostDetail } from '@/features/blog/blogTypes';
import { starPost, unstarPost } from '@/features/blog/api/blogApi';
import { ApiError } from '@/lib/api/apiClient';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { useCurrentSession } from '@/features/auth/session/useCurrentSession';
import { AuthGateModal } from '@/features/auth/components/AuthGateModal';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractHeadings(blocks: BlockElement[]): TocHeading[] {
  const seen = new Map<string, number>();
  const headings: TocHeading[] = [];
  for (const block of blocks) {
    if (block.type !== 'heading') continue;
    const b = block as { type: string; level?: string; children: { text: string }[] };
    if (b.level !== 'h2' && b.level !== 'h3') continue;
    const text = b.children.map((c) => c.text).join('').trim();
    if (!text) continue;
    const base = slugify(text) || 'heading';
    const count = seen.get(base) ?? 0;
    const id = count === 0 ? base : `${base}-${count}`;
    seen.set(base, count + 1);
    headings.push({ id, text, level: b.level as 'h2' | 'h3' });
  }
  return headings;
}

type ReactionButtonProps = {
  emoji: string;
  label: string;
  postSlug: string;
  openAuthGate: (callback: () => void) => void;
};

function ReactionButton({ emoji, label, postSlug, openAuthGate }: ReactionButtonProps) {
  const { isAuthenticated } = useCurrentSession();

  function handleClick() {
    if (!isAuthenticated) {
      openAuthGate(() => { window.location.replace(`/${postSlug}`); });
      return;
    }
  }

  return (
    <button
      className="react-btn"
      onClick={handleClick}
      aria-label={label}
    >
      {emoji} <span className="count">—</span>
    </button>
  );
}

type StarButtonProps = {
  slug: string;
  initialCount: number | null;
  openAuthGate: (callback: () => void) => void;
};

function StarButton({ slug, initialCount, openAuthGate }: StarButtonProps) {
  const [count, setCount] = useState<number | null>(initialCount);
  const [starred, setStarred] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const { isAuthenticated } = useCurrentSession();

  async function toggle() {
    if (busy) return;
    if (!isAuthenticated) {
      openAuthGate(() => void toggle());
      return;
    }
    setBusy(true);
    setError(false);
    const next = !starred;
    setStarred(next);
    setCount((c) => (c ?? 0) + (next ? 1 : -1));
    try {
      const accessToken = await getAccessToken();
      if (next) {
        await starPost(slug, accessToken);
      } else {
        await unstarPost(slug, accessToken);
      }
    } catch (err) {
      setStarred(!next);
      setCount((c) => (c ?? 0) + (next ? -1 : 1));
      if (err instanceof ApiError && err.status === 401) {
        openAuthGate(() => void toggle());
      } else if (!(err instanceof Error && err.message === 'Session expired.')) {
        setError(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="star-cta-wrap">
      <button
        className={`star-cta${starred ? ' star-cta--active' : ''}`}
        onClick={toggle}
        disabled={busy}
        aria-label={starred ? 'Unstar this post' : 'Star this post'}
        aria-pressed={starred}
      >
        <span className="star-cta-icon">{starred ? '★' : '☆'}</span>
        <span className="star-cta-label">{starred ? 'Starred' : 'Star'}</span>
        <span className="star-cta-count">{count !== null ? count.toLocaleString() : '—'}</span>
      </button>
      {error && <span className="star-cta-error" role="alert">Something went wrong. Try again.</span>}
    </div>
  );
}

function MobileToc({ headings, post }: { headings: TocHeading[]; post: PostDetail }) {
  const [open, setOpen] = useState(false);

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
  }

  if (headings.length === 0) return null;

  return (
    <div className="mobile-toc-accordion">
      <button className="mobile-toc-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className="mobile-toc-trigger-left">
          <span className="mobile-toc-label">On this page</span>
          <span className="mobile-toc-count">{headings.length} sections</span>
        </div>
        <span className="mobile-toc-chevron" aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="mobile-toc-body">
          <ul className="mobile-toc-list">
            <li className="mobile-toc-title">
              <a href="#post-title" onClick={(e) => { e.preventDefault(); scrollToId('post-title'); setOpen(false); }}>
                {post.title}
              </a>
            </li>
            {headings.map((h) => (
              <li key={h.id} className={h.level === 'h3' ? 'mobile-toc-h3' : undefined}>
                <a href={`#${h.id}`} onClick={(e) => { e.preventDefault(); scrollToId(h.id); setOpen(false); }}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type PostMetaBarProps = {
  post: PostDetail;
};

function PostMetaBar({ post }: PostMetaBarProps) {
  const date = formatDate(post.published_at);
  return (
    <div className="pmb">
      {date && <time dateTime={post.published_at ?? ''}>{date}</time>}
      {date && post.reading_time != null && <span className="pmb-sep" aria-hidden="true">·</span>}
      {post.reading_time != null && <span>{post.reading_time} min read</span>}
    </div>
  );
}

export default function Page() {
  const { post } = useData<PostDetailPageData>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const mobileMaxPct = useRef(0);
  const headings = extractHeadings(post.body);
  const [activeId, setActiveId] = useState('');
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const pendingStarRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    function update() {
      const body = bodyRef.current;
      const bar = mobileBarRef.current;
      if (!body || !bar) return;
      const bodyTop = body.getBoundingClientRect().top + window.scrollY;
      const scrolled = Math.max(0, window.scrollY - bodyTop);
      const range = Math.max(1, (body.offsetHeight - window.innerHeight) * 1.2);
      const pct = Math.min(100, (scrolled / range) * 100);
      if (pct > mobileMaxPct.current) {
        mobileMaxPct.current = pct;
        bar.style.width = `${pct}%`;
      }
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const container = bodyRef.current;
    if (!container || headings.length === 0) return;

    const domHeadings = container.querySelectorAll<HTMLElement>('h2, h3');
    domHeadings.forEach((el, i) => {
      if (i < headings.length) el.id = headings[i].id;
    });

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const hit = headings.find((h) => visible.has(h.id));
        setActiveId(hit?.id ?? '');
      },
      { rootMargin: '-80px 0px -55% 0px' },
    );

    domHeadings.forEach((el) => { if (el.id) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <AppShell>
      <div className="mobile-reading-bar" aria-hidden="true">
        <div className="mobile-reading-bar-fill" ref={mobileBarRef} />
      </div>
      <div className="post-layout">
        <PostRail post={post} headings={headings} activeId={activeId} bodyRef={bodyRef} />
        <div className="post-content">
          <PostMetaBar post={post} />
          <h1 id="post-title" className="block-title">{post.title}</h1>
          {post.excerpt != null && <p className="block-dek">{post.excerpt}</p>}
          <MobileToc headings={headings} post={post} />
          {post.cover_image != null && (
            <img className="block-cover" src={post.cover_image} alt={post.title} />
          )}
          <div className="block-body" ref={bodyRef}>
            <BlockRenderer blocks={post.body} />
          </div>
          <footer className="post-footer">
            <div className="post-engage">
              <div className="pe-top">
                <p className="pe-heading">Was this post helpful?</p>
                <p className="pe-prompt">Found this useful?</p>
                <div className="pe-btns">
                  <StarButton
                    slug={post.slug}
                    initialCount={post.stars_count ?? null}
                    openAuthGate={(cb) => {
                      pendingStarRef.current = cb;
                      setAuthGateOpen(true);
                    }}
                  />
                  <ReactionButton emoji="👍" label="Helpful" postSlug={post.slug} openAuthGate={(cb) => { pendingStarRef.current = cb; setAuthGateOpen(true); }} />
                  <ReactionButton emoji="🔥" label="Fire" postSlug={post.slug} openAuthGate={(cb) => { pendingStarRef.current = cb; setAuthGateOpen(true); }} />
                  <ReactionButton emoji="💡" label="Insightful" postSlug={post.slug} openAuthGate={(cb) => { pendingStarRef.current = cb; setAuthGateOpen(true); }} />
                </div>
              </div>
              <div className="pe-tags">
                <span className="pe-tags-label">Tags</span>
                {(post.tags ?? []).map((tag, i) => (
                  <a key={tag.id} className={`tag t-${(i % 5) + 1}`} href={`/archive?tag=${encodeURIComponent(tag.slug)}`}>
                    {tag.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="share-row">
              <span className="share-label">Share</span>
              <div className="share-links">
                <a className="share-chip" href={`https://twitter.com/intent/tweet?url=https://jymb.blog/${encodeURIComponent(post.slug)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">𝕏 X</a>
                <a className="share-chip" href={`https://www.linkedin.com/sharing/share-offsite/?url=https://jymb.blog/${encodeURIComponent(post.slug)}`} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
                <a className="share-chip" href={`https://reddit.com/submit?url=https://jymb.blog/${encodeURIComponent(post.slug)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">↑ Reddit</a>
              </div>
            </div>
            <AuthorCard post={post} variant="footer" />
            <div className="related">
              <h4 className="related-label">Related essays</h4>
              <p className="related-empty">Similar posts will appear here once more content is published.</p>
            </div>
            <div className="discussion">
              <div className="discussion-header">
                <h4 className="discussion-title">Discussion</h4>
                <span className="discussion-count">{post.comments_count != null ? `${post.comments_count} ${post.comments_count === 1 ? 'comment' : 'comments'}` : '—'}</span>
              </div>
              <div className="discussion-gate">
                <div className="discussion-gate-avatar" aria-hidden="true">?</div>
                <div className="discussion-gate-body">
                  <p className="discussion-gate-msg">Sign in to join the discussion</p>
                  <a href="/signin" className="discussion-gate-btn">Sign in</a>
                </div>
              </div>
              <div className="discussion-empty">
                <p>No comments yet. Be the first to start the discussion.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        onSuccess={() => {
          setAuthGateOpen(false);
          pendingStarRef.current?.();
          pendingStarRef.current = null;
        }}
      />
    </AppShell>
  );
}
