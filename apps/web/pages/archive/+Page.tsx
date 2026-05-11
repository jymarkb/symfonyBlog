import { useCallback, useEffect, useRef, useState } from 'react';
import { useData } from 'vike-react/useData';
import type { ArchivePageData } from '@/features/blog/blogTypes';
import { fetchArchivePosts } from '@/features/blog/api/blogApi';
import { AppShell } from '@/layouts/AppShell';
import { ArchiveFilterBar } from '@/features/blog/components/ArchiveFilterBar';
import ArchiveSection from '@/features/blog/components/ArchiveSection';
import ArchiveStatsStrip from '@/features/blog/components/ArchiveStatsStrip';

export default function Page() {
  const data = useData<ArchivePageData>();

  const [posts, setPosts] = useState(data.posts);
  const [total, setTotal] = useState(data.total);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMounted = useRef(false);

  const load = useCallback(
    async (params: { search?: string; tag?: string; per_page?: number }) => {
      setIsLoading(true);
      try {
        const result = await fetchArchivePosts(params);
        setPosts(result.posts);
        setTotal(result.total);
        setError(null);
      } catch {
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    void load({ search, tag: activeTag ?? undefined, per_page: 50 });
  }, [search, activeTag, load]);

  return (
    <AppShell>
      <section className="page-head">
        <div className="shell">
          <span className="eyebrow">Archive</span>
          <h1>Every essay, <em>every idea</em></h1>
          <p className="lede">A complete index of everything published here — searchable, filterable, and grouped by year.</p>
          <ArchiveFilterBar
            tags={data.tags}
            activeTag={activeTag}
            searchValue={search}
            onTagChange={setActiveTag}
            onSearchChange={setSearch}
          />
        </div>
      </section>
      <div className="shell">
        {error != null && (
          <div className="load-error" role="status" aria-live="polite">
            <span>{error}</span>
            <button onClick={() => void load({ search, tag: activeTag ?? undefined, per_page: 50 })}>Retry</button>
          </div>
        )}
        <ArchiveStatsStrip posts={posts} total={total} isLoading={isLoading} />
        <ArchiveSection posts={posts} isLoading={isLoading} />
      </div>
    </AppShell>
  );
}
