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
  CommentSortOrder,
  CommentsResponse,
  Comment,
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

export async function followAuthor(authorId: number, accessToken: string): Promise<{ followers_count: number }> {
  const response = await apiRequest<{ data: { followers_count: number } }>(`/authors/${authorId}/follow`, {
    method: 'POST',
    accessToken,
    body: { author_id: authorId },
  });
  return { followers_count: response.data.followers_count };
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

export async function fetchComments(
  slug: string,
  opts?: { sort?: CommentSortOrder; page?: number; per_page?: number },
): Promise<CommentsResponse> {
  const params = new URLSearchParams();
  if (opts?.sort) params.set('sort', opts.sort);
  if (opts?.page != null) params.set('page', String(opts.page));
  if (opts?.per_page != null) params.set('per_page', String(opts.per_page));
  const qs = params.toString();
  const url = `/posts/${slug}/comments${qs ? `?${qs}` : ''}`;
  return await apiRequest<CommentsResponse>(url);
}

export async function postComment(
  slug: string,
  body: string,
  accessToken: string,
  parentId?: number,
): Promise<Comment> {
  const response = await apiRequest<{ data: Comment }>(`/posts/${slug}/comments`, {
    method: 'POST',
    accessToken,
    body: { body, parent_id: parentId ?? null },
  });
  return response.data;
}

export async function editComment(
  slug: string,
  commentId: number,
  body: string,
  accessToken: string,
): Promise<Comment> {
  const response = await apiRequest<{ data: Comment }>(`/posts/${slug}/comments/${commentId}`, {
    method: 'PATCH',
    accessToken,
    body: { body },
  });
  return response.data;
}

export async function deleteComment(
  slug: string,
  commentId: number,
  accessToken: string,
): Promise<void> {
  await apiRequest(`/posts/${slug}/comments/${commentId}`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function toggleReaction(slug: string, reaction: ReactionType, accessToken: string): Promise<ReactionToggleResponse> {
  const response = await apiRequest<{ data: ReactionToggleResponse }>(`/posts/${encodeURIComponent(slug)}/reactions`, {
    method: 'POST',
    accessToken,
    body: { reaction },
  });
  return response.data;
}
