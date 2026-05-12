import {
  fetchArchivePosts,
  fetchTags,
  fetchPostYears,
} from '@/features/blog/api/blogApi';
import type { ArchivePageData } from '@/features/blog/blogTypes';

export async function data(): Promise<ArchivePageData> {
  const [{ posts, total, lastPage, currentPage }, tags, years] = await Promise.all([
    fetchArchivePosts({ per_page: 50 }),
    fetchTags(),
    fetchPostYears(),
  ]);
  return { posts, total, lastPage, currentPage, tags, years };
}
