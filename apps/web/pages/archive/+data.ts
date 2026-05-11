import {
  fetchArchivePosts,
  fetchTags,
} from '@/features/blog/api/blogApi';
import type { ArchivePageData } from '@/features/blog/blogTypes';

export async function data(): Promise<ArchivePageData> {
  const [{ posts, total, lastPage, currentPage }, tags] = await Promise.all([
    fetchArchivePosts({ per_page: 50 }),
    fetchTags(),
  ]);
  return { posts, total, lastPage, currentPage, tags };
}
