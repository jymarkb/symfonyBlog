import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'

export default {
  extends: vikeReact,
  prerender: true,
  passToClient: ['initialUser'],
} satisfies Config
