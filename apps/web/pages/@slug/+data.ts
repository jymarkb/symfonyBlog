import { render } from 'vike/abort'
import type { PageContextServer } from 'vike/types'
import { fetchPostBySlug, fetchPostUserState } from '@/features/blog/api/blogApi'
import { ApiError } from '@/lib/api/apiClient'
import type { PostDetailPageData, PostUserState } from '@/features/blog/blogTypes'
import { resolveServerAuth } from '@/lib/auth/serverAuth'

export async function data(pageContext: PageContextServer): Promise<PostDetailPageData> {
  const { slug } = pageContext.routeParams
  const auth = await resolveServerAuth(pageContext)

  try {
    if (auth) {
      const [post, userState] = await Promise.all([
        fetchPostBySlug(slug),
        fetchPostUserState(slug, auth.accessToken).catch((): PostUserState | null => null),
      ])
      return { post, userState }
    }

    const post = await fetchPostBySlug(slug)
    return { post, userState: null }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      throw render(404)
    }
    throw render(500)
  }
}
