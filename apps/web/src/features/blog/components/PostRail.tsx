import { useEffect, useRef, useState } from 'react';
import type { PostDetail } from '../blogTypes';
import { AuthorCard } from './AuthorCard';
import { siteUrl } from '@/lib/env/siteUrl';

function RailShareChip({ label, slug }: { label: string; slug: string }) {
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

export type TocHeading = { id: string; text: string; level: 'h2' | 'h3' };

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: 'smooth' });
}

type Props = {
  post: PostDetail;
  headings: TocHeading[];
  activeId?: string;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  initialFollowing?: boolean;
  initialFollowersCount?: number;
  onFollowChange?: (following: boolean, count: number) => void;
};

export function PostRail({ post, headings, activeId = '', bodyRef, initialFollowing, initialFollowersCount, onFollowChange }: Props) {
  const progressRef = useRef<HTMLElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const maxPct = useRef(0);
  const readingTime = post.reading_time ?? 0;

  useEffect(() => {
    function setReadout(pct: number) {
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;
      if (readoutRef.current) {
        const rounded = Math.round(pct);
        const minsLeft = readingTime > 0
          ? Math.max(0, Math.ceil((1 - pct / 100) * readingTime))
          : null;
        readoutRef.current.textContent = minsLeft !== null && rounded < 100
          ? `${rounded}% · ${minsLeft} min left`
          : `${rounded}%`;
      }
    }

    function update() {
      const body = bodyRef.current;
      if (!body) return;
      const bodyTop = body.getBoundingClientRect().top + window.scrollY;
      const bodyHeight = body.offsetHeight;
      const scrolled = Math.max(0, window.scrollY - bodyTop);
      const range = Math.max(1, (bodyHeight - window.innerHeight) * 1.2);
      const pct = Math.min(100, (scrolled / range) * 100);
      if (pct > maxPct.current) {
        maxPct.current = pct;
        setReadout(pct);
      }
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <aside className="post-rail">

      {/* Author card */}
      <AuthorCard post={post} variant="rail" initialFollowing={initialFollowing} initialFollowersCount={initialFollowersCount} onFollowChange={onFollowChange} />

      {/* TOC + progress */}
      {headings.length > 0 && (
        <div className="rail-toc-section">
          <nav className="rail-toc" aria-label="On this page">
            <div className="rail-toc-header">
              <span className="rail-toc-label">On this page</span>
            </div>
            <ul className="toc-list">
              <li className="toc-title">
                <a
                  href="#post-title"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo('post-title');
                  }}
                >
                  {post.title}
                </a>
              </li>
              {headings.map((h) => (
                <li key={h.id} className={h.level === 'h3' ? 'toc-h3' : undefined}>
                  <a
                    href={`#${h.id}`}
                    className={activeId === h.id ? 'active' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(h.id);
                    }}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="rail-progress">
            <div className="progress-bar"><i ref={progressRef} /></div>
            <span className="rail-readout" ref={readoutRef}>0%</span>
          </div>
        </div>
      )}

      {/* Tags — desktop only (rail is hidden on mobile) */}
      {(post.tags ?? []).length > 0 && (
        <div className="rail-tags">
          <span className="rail-tags-label">Tags</span>
          <div className="rail-tags-list">
            {(post.tags ?? []).map((tag, i) => (
              <a key={tag.id} className={`tag t-${(i % 5) + 1}`} href={`/archive?tag=${encodeURIComponent(tag.slug)}`}>
                {tag.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Share — desktop only */}
      <div className="rail-share">
        <span className="rail-share-label">Share</span>
        <div className="rail-share-links">
          <RailShareChip label="𝕏 X" slug={post.slug} />
          <RailShareChip label="in LinkedIn" slug={post.slug} />
          <RailShareChip label="↑ Reddit" slug={post.slug} />
        </div>
      </div>

    </aside>
  );
}
