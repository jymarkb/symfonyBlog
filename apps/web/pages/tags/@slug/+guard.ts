import { redirect } from 'vike/abort'
import type { GuardAsync } from 'vike/types'

export const guard: GuardAsync = async (pageContext) => {
  const { slug } = pageContext.routeParams
  throw redirect(`/archive?tag=${encodeURIComponent(slug)}`, 301)
}
