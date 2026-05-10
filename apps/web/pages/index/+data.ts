import {
  fetchFeaturedPosts,
  fetchLatestPosts,
  fetchTags,
} from '@/features/blog/api/blogApi';
import type { HomePageData } from '@/features/blog/blogTypes';

export async function data(): Promise<HomePageData> {
  const [featuredPosts, latestPosts, tags] = await Promise.all([
    fetchFeaturedPosts(),
    fetchLatestPosts(),
    fetchTags(),
  ]);

  return { featuredPosts, latestPosts, tags };
}
