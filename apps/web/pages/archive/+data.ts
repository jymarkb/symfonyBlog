import {
  fetchArchivePosts,
  fetchTags,
  fetchPostYears,
} from '@/features/blog/api/blogApi';
import type { ArchivePageData } from '@/features/blog/blogTypes';
import type { PageContextServer } from 'vike/types';

export async function data(pageContext: PageContextServer): Promise<ArchivePageData> {
  const tag = pageContext.urlParsed.search['tag'] ?? undefined;

  const rawYear = pageContext.urlParsed.search['year'];
  const parsedYear = rawYear !== undefined ? parseInt(rawYear, 10) : NaN;
  const year = Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : undefined;

  const search = pageContext.urlParsed.search['search']
    ? pageContext.urlParsed.search['search'].toLowerCase()
    : undefined;

  const [{ posts, total, lastPage, currentPage }, tags, years] = await Promise.all([
    fetchArchivePosts({ per_page: 50, tag, year, search }),
    fetchTags(),
    fetchPostYears(),
  ]);
  return { posts, total, lastPage, currentPage, tags, years };
}
