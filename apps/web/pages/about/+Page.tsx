import { AppShell } from '@/layouts/AppShell'
import { SiteHeader } from '@/components/common/SiteHeader'

export default function Page() {
  return (
    <AppShell>
      <main>
        <SiteHeader />
        <h1>About page</h1>
      </main>
    </AppShell>
  )
}
