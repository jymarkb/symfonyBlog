import type { ReactNode } from 'react'

import '@/styles/global.css'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return <>{children}</>
}
