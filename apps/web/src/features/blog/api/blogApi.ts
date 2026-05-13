import { apiRequest } from "@/lib/api/apiClient";
import type {
  PostsResponse,
  TagsResponse,
  PostSummary,
  PostTag,
  PostYear,
  PostDetail,
  PostUserState,
  ReactionType,
  ReactionToggleResponse,
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

export async function fetchArchivePosts(params?: {
  search?: string;
  tag?: string;
  year?: number;
  page?: number;
  per_page?: number;
}): Promise<{ posts: PostSummary[]; total: number; lastPage: number; currentPage: number }> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.year != null) qs.set("year", String(params.year));
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.per_page !== undefined) qs.set("per_page", String(params.per_page));
  const response = await apiRequest<PostsResponse>("/posts?" + qs.toString());
  return {
    posts: response.data,
    total: response.meta.total,
    lastPage: response.meta.last_page,
    currentPage: response.meta.current_page,
  };
}

export async function fetchPostYears(): Promise<PostYear[]> {
  const response = await apiRequest<{ data: PostYear[] }>("/posts/years");
  return response.data;
}

export async function fetchPostBySlug(slug: string): Promise<PostDetail> {
  const response = await apiRequest<{ data: PostDetail }>(`/posts/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function starPost(slug: string, accessToken: string): Promise<void> {
  await apiRequest(`/posts/${encodeURIComponent(slug)}/stars`, {
    method: 'POST',
    accessToken,
  });
}

export async function unstarPost(slug: string, accessToken: string): Promise<void> {
  await apiRequest(`/posts/${encodeURIComponent(slug)}/stars`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function followAuthor(authorId: number, accessToken: string): Promise<void> {
  await apiRequest(`/authors/${authorId}/follow`, {
    method: 'POST',
    accessToken,
    body: { author_id: authorId },
  });
}

export async function unfollowAuthor(authorId: number, accessToken: string): Promise<void> {
  await apiRequest(`/authors/${authorId}/follow`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function fetchPostUserState(slug: string, accessToken: string): Promise<PostUserState> {
  const response = await apiRequest<{ data: PostUserState }>(`/posts/${encodeURIComponent(slug)}/me`, {
    accessToken,
  });
  return response.data;
}

export async function toggleReaction(slug: string, reaction: ReactionType, accessToken: string): Promise<ReactionToggleResponse> {
  const response = await apiRequest<{ data: ReactionToggleResponse }>(`/posts/${encodeURIComponent(slug)}/reactions`, {
    method: 'POST',
    accessToken,
    body: { reaction },
  });
  return response.data;
}
