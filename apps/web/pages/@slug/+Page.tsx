import { useRef, useEffect, useState, useMemo } from 'react';
import { useData } from 'vike-react/useData';
import { BlockRenderer } from '@jymarkb/block-editor/render';
import type { BlockElement } from '@jymarkb/block-editor/render';
import { AppShell } from '@/layouts/AppShell';
import { PostRail } from '@/features/blog/components/PostRail';
import type { TocHeading } from '@/features/blog/components/PostRail';
import { AuthorCard } from '@/features/blog/components/AuthorCard';
import { ReactionButton } from '@/features/blog/components/ReactionButton';
import type { PostDetailPageData, PostDetail } from '@/features/blog/blogTypes';
import { fetchPostUserState, followAuthor } from '@/features/blog/api/blogApi';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { useCurrentSession } from '@/features/auth/session/useCurrentSession';
import { AuthGateModal } from '@/features/auth/components/AuthGateModal';
import { usePendingReaction } from '@/features/blog/hooks/usePendingReaction';
import { siteUrl } from '@/lib/env/siteUrl';
import { RelatedPosts } from '@/features/blog/components/RelatedPosts';
import { DiscussionSection } from '@/features/blog/components/DiscussionSection';
import { formatDate } from '@/features/blog/utils/formatDate';

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

type StarButtonProps = {
  count: number | null;
  starred: boolean;
  busy: boolean;
  onClick: () => void;
};

function StarButton({ count, starred, busy, onClick }: StarButtonProps) {
  return (
    <div className="star-cta-wrap">
      <button
        className={`star-cta${starred ? ' star-cta--active' : ''}`}
        onClick={onClick}
        disabled={busy}
        aria-label={starred ? 'Unstar this post' : 'Star this post'}
        aria-pressed={starred}
      >
        <span className="star-cta-icon">{starred ? '★' : '☆'}</span>
        <span className="star-cta-label">{starred ? 'Starred' : 'Star'}</span>
        <span className="star-cta-count">{count !== null ? count.toLocaleString() : '—'}</span>
      </button>
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

function ShareChip({ label, slug }: { label: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${siteUrl}/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button className="share-chip" onClick={() => void handleCopy()} aria-label={`Copy link to share on ${label}`}>
      {copied ? '✓ Copied' : label}
    </button>
  );
}

export default function Page() {
  const { post, userState: initialUserState } = useData<PostDetailPageData>();
  const [userState, setUserState] = useState(initialUserState);
  const [isFollowing, setIsFollowing] = useState(initialUserState?.is_following ?? false);
  const [followersCount, setFollowersCount] = useState(
    initialUserState?.followers_count ?? post.author.followers_count ?? 0,
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const mobileMaxPct = useRef(0);
  const headings = extractHeadings(post.body);
  const [activeId, setActiveId] = useState('');
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const { isAuthenticated } = useCurrentSession();

  const stableInitialReactions = useMemo(() => userState?.reaction ?? [], [userState]);

  const {
    activeReactions,
    reactionCounts,
    busy: reactionBusy,
    handleReaction,
  } = usePendingReaction({
    postSlug: post.slug,
    initialActiveReaction: stableInitialReactions,
    initialCounts: post.reaction_counts,
    onOpenAuthGate: () => setAuthGateOpen(true),
  });

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

  useEffect(() => {
    if (!isAuthenticated || userState !== null) return;
    async function load() {
      try {
        const token = await getAccessToken();
        const state = await fetchPostUserState(post.slug, token);
        setUserState(state);
      } catch {}
    }
    void load();
  }, [isAuthenticated, post.slug]);

  useEffect(() => {
    if (userState === null) return;
    setIsFollowing(userState.is_following);
    setFollowersCount(userState.followers_count);
  }, [userState]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = sessionStorage.getItem('pending_follow_author_id');
    if (!pending || parseInt(pending) !== post.author.id) return;
    sessionStorage.removeItem('pending_follow_author_id');
    async function applyFollow() {
      try {
        const token = await getAccessToken();
        const result = await followAuthor(post.author.id, token);
        // State is only updated on success — no optimistic updates were made before
        // the try block, so no rollback is needed on failure.
        setIsFollowing(true);
        setFollowersCount(result.followers_count);
      } catch {
        // API failure after auth: pending key was already removed above, so the
        // follow intent is lost. No stale optimistic state to roll back.
      }
    }
    void applyFollow();
  }, [isAuthenticated]);

  return (
    <AppShell>
      <div className="mobile-reading-bar" aria-hidden="true">
        <div className="mobile-reading-bar-fill" ref={mobileBarRef} />
      </div>
      <div className="post-layout">
        <PostRail
          post={post}
          headings={headings}
          activeId={activeId}
          bodyRef={bodyRef}
          initialFollowing={isFollowing}
          initialFollowersCount={followersCount}
          onFollowChange={(following, count) => { setIsFollowing(following); setFollowersCount(count); }}
        />
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
                    count={reactionCounts.star}
                    starred={activeReactions.includes('star')}
                    busy={reactionBusy}
                    onClick={() => void handleReaction('star')}
                  />
                  <ReactionButton
                    emoji="👍"
                    label="Helpful"
                    reactionType="helpful"
                    count={reactionCounts.helpful}
                    isActive={activeReactions.includes('helpful')}
                    busy={reactionBusy}
                    onClick={() => void handleReaction('helpful')}
                  />
                  <ReactionButton
                    emoji="🔥"
                    label="Fire"
                    reactionType="fire"
                    count={reactionCounts.fire}
                    isActive={activeReactions.includes('fire')}
                    busy={reactionBusy}
                    onClick={() => void handleReaction('fire')}
                  />
                  <ReactionButton
                    emoji="💡"
                    label="Insightful"
                    reactionType="insightful"
                    count={reactionCounts.insightful}
                    isActive={activeReactions.includes('insightful')}
                    busy={reactionBusy}
                    onClick={() => void handleReaction('insightful')}
                  />
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
                <ShareChip label="𝕏 X" slug={post.slug} />
                <ShareChip label="LinkedIn" slug={post.slug} />
                <ShareChip label="Reddit" slug={post.slug} />
                <ShareChip label="🔗 Copy link" slug={post.slug} />
              </div>
            </div>
            <AuthorCard
              post={post}
              variant="footer"
              initialFollowing={isFollowing}
              initialFollowersCount={followersCount}
              onFollowChange={(following, count) => { setIsFollowing(following); setFollowersCount(count); }}
            />
            <RelatedPosts posts={post.related} />
          </footer>
          <DiscussionSection
            postSlug={post.slug}
            initialCount={post.comments_count ?? 0}
            isAuthenticated={isAuthenticated}
            onOpenAuthGate={() => { setAuthGateOpen(true); }}
          />
        </div>
      </div>
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        onSuccess={() => setAuthGateOpen(false)}
      />
    </AppShell>
  );
}
