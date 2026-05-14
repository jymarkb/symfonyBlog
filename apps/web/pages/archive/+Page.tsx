import { useCallback, useEffect, useRef, useState } from 'react';
import { useData } from 'vike-react/useData';
import { useConfig } from 'vike-react/useConfig';
import type { ArchivePageData } from '@/features/blog/blogTypes';
import { fetchArchivePosts } from '@/features/blog/api/blogApi';
import { AppShell } from '@/layouts/AppShell';
import { ArchiveFilterBar } from '@/features/blog/components/ArchiveFilterBar';
import ArchiveSection from '@/features/blog/components/ArchiveSection';
import ArchiveStatsStrip from '@/features/blog/components/ArchiveStatsStrip';
import { siteName } from '@/lib/env/siteUrl';

const PER_PAGE = 50;

function getInitialTag(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('tag');
}

function getInitialYear(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('year');
  if (raw == null) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getInitialSearch(): string {
  if (typeof window === 'undefined') return '';
  return (new URLSearchParams(window.location.search).get('search') ?? '').toLowerCase();
}

export default function Page() {
  const data = useData<ArchivePageData>();

  const [posts, setPosts] = useState(data.posts);
  const [total, setTotal] = useState(data.total);
  const [currentPage, setCurrentPage] = useState(data.currentPage);
  const [lastPage, setLastPage] = useState(data.lastPage);
  const [activeTag, setActiveTag] = useState<string | null>(getInitialTag);
  const [activeYear, setActiveYear] = useState<number | null>(getInitialYear);
  const [search, setSearch] = useState(getInitialSearch);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = useConfig();
  config({
    Head: search && !isLoading && total < 3
      ? <meta name="robots" content="noindex, follow" />
      : null,
  });

  const suggestedTags = search.trim()
    ? data.tags.filter(t =>
        t.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const hasMounted = useRef(false);
  const hasParamsMounted = useRef(false);

  const load = useCallback(
    async (params: { search?: string; tag?: string; year?: number; page?: number }, append = false) => {
      append ? setIsLoadingMore(true) : setIsLoading(true);
      try {
        const result = await fetchArchivePosts({ ...params, per_page: PER_PAGE });
        setPosts((prev) => append ? [...prev, ...result.posts] : result.posts);
        setTotal(result.total);
        setCurrentPage(result.currentPage);
        setLastPage(result.lastPage);
        setError(null);
      } catch {
        setError('Failed to load posts. Please try again.');
      } finally {
        append ? setIsLoadingMore(false) : setIsLoading(false);
      }
    },
    [],
  );

  // Filter/search changes reset to page 1 and replace posts
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    void load({ search: search.toLowerCase(), tag: activeTag ?? undefined, year: activeYear ?? undefined, page: 1 });
  }, [search, activeTag, activeYear, load]);

  // Push ?tag and ?year to URL when filters change (skip first mount)
  useEffect(() => {
    if (!hasParamsMounted.current) {
      hasParamsMounted.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (activeTag !== null) params.set('tag', activeTag);
    if (activeYear !== null) params.set('year', String(activeYear));
    if (search.trim()) params.set('search', search.trim().toLowerCase());
    const qs = params.toString();
    history.pushState(null, '', '/archive' + (qs ? '?' + qs : ''));
  }, [activeTag, activeYear, search]);

  // Update document.title reactively on filter changes
  useEffect(() => {
    if (activeTag && activeYear) document.title = `${activeTag} · ${activeYear} · Archive · ${siteName}`;
    else if (activeTag) document.title = `${activeTag} · Archive · ${siteName}`;
    else if (activeYear) document.title = `${activeYear} · Archive · ${siteName}`;
    else if (search.trim()) document.title = `Search: ${search.trim()} · Archive · ${siteName}`;
    else document.title = 'Archive · ${siteName}';
  }, [activeTag, activeYear, search]);

  const handleTagChange = useCallback((slug: string | null) => {
    setActiveTag(slug);
    setSearch('');
  }, []);

  const handleLoadMore = useCallback(() => {
    void load(
      { search: search.toLowerCase(), tag: activeTag ?? undefined, year: activeYear ?? undefined, page: currentPage + 1 },
      true,
    );
  }, [load, search, activeTag, activeYear, currentPage]);

  const hasMore = currentPage < lastPage;

  return (
    <AppShell>
      <section className="page-head">
        <div className="shell">
          <div className="hero-inner">
            <div className="hero-text">
              <span className="eyebrow">Archive</span>
              <h1>Every essay, <em>every idea</em></h1>
              <p className="lede">A complete index of everything published here — searchable, filterable, and grouped by year.</p>
            </div>
            <ArchiveStatsStrip posts={posts} total={total} isLoading={isLoading} />
          </div>
          <ArchiveFilterBar
            tags={data.tags}
            years={data.years}
            activeTag={activeTag}
            activeYear={activeYear}
            searchValue={search}
            onTagChange={handleTagChange}
            onYearChange={setActiveYear}
            onSearchChange={setSearch}
            suggestedTags={suggestedTags}
          />
        </div>
      </section>
      <div className="shell">
        {error != null && (
          <div className="load-error" role="alert" aria-live="assertive">
            <span>{error}</span>
            <button onClick={() => void load({ search: search.toLowerCase(), tag: activeTag ?? undefined, year: activeYear ?? undefined, page: 1 })}>Retry</button>
          </div>
        )}
        <ArchiveSection posts={posts} isLoading={isLoading} onTagChange={handleTagChange} />

        {!isLoading && hasMore && (
          <div className="load-more-row">
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading…' : `Load more · ${total - posts.length} remaining`}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
