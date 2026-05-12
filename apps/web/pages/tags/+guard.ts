import { redirect } from 'vike/abort'
import type { GuardAsync } from 'vike/types'

export const guard: GuardAsync = async () => {
  throw redirect('/archive', 301)
}
