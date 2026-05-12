import { render } from 'vike/abort'
import type { PageContextServer } from 'vike/types'
import { fetchPostBySlug } from '@/features/blog/api/blogApi'
import { ApiError } from '@/lib/api/apiClient'
import type { PostDetailPageData } from '@/features/blog/blogTypes'

export async function data(pageContext: PageContextServer): Promise<PostDetailPageData> {
  const { slug } = pageContext.routeParams
  try {
    const post = await fetchPostBySlug(slug)
    return { post }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      throw render(404)
    }
    throw render(500)
  }
}
