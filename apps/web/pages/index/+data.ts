import { fetchFeaturedPosts, fetchLatestPosts, fetchTags } from '@/features/blog/api/blogApi';
import type { HomePageData } from '@/features/blog/blogTypes';

export async function data(): Promise<HomePageData> {
  const [featuredResult, latestResult, tagsResult] = await Promise.allSettled([
    fetchFeaturedPosts(),
    fetchLatestPosts(),
    fetchTags(),
  ]);

  return {
    featuredPosts: featuredResult.status === 'fulfilled' ? featuredResult.value : [],
    latestPosts: latestResult.status === 'fulfilled' ? latestResult.value : [],
    tags: tagsResult.status === 'fulfilled' ? tagsResult.value : [],
  };
}
