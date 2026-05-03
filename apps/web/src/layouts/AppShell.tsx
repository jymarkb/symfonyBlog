import type { ReactNode } from 'react'

import { Header } from '@/components/layout/Header/Header'
import '@/styles/global.css'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main>{children}</main>
    </div>
  )
}
