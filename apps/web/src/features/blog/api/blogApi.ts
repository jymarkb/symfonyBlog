import { apiRequest } from "@/lib/api/apiClient";
import type {
  PostsResponse,
  TagsResponse,
  PostSummary,
  PostTag,
} from "@/features/blog/blogTypes";

export async function fetchFeaturedPosts(): Promise<PostSummary[]> {
  const response = await apiRequest<PostsResponse>("/posts?featured=true");
  return response.data;
}

export async function fetchLatestPosts(): Promise<{ posts: PostSummary[]; total: number }> {
  const response = await apiRequest<PostsResponse>("/posts?per_page=6");
  return { posts: response.data, total: response.meta.total };
}

export async function fetchTags(): Promise<PostTag[]> {
  const response = await apiRequest<TagsResponse>("/tags");
  return response.data;
}
