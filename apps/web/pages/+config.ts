import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'

export default {
  extends: vikeReact,
  prerender: true,
  passToClient: ['initialUser'],
  accessLevel: 'public',
  meta: {
    accessLevel: {
      env: { server: true, client: false },
    },
  },
} satisfies Config
