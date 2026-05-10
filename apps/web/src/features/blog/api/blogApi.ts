import { apiRequest } from "@/lib/api/apiClient";
import type {
  PostsResponse,
  TagsResponse,
  PostSummary,
  PostTag,
} from "@/features/blog/blogTypes";

export async function fetchFeaturedPosts(): Promise<PostSummary[]> {
  const response = await apiRequest<PostsResponse>("/api/v1/posts?featured=true");
  return response.data;
}

export async function fetchLatestPosts(): Promise<PostSummary[]> {
  const response = await apiRequest<PostsResponse>("/api/v1/posts?per_page=6");
  return response.data;
}

export async function fetchTags(): Promise<PostTag[]> {
  const response = await apiRequest<TagsResponse>("/api/v1/tags");
  return response.data;
}
