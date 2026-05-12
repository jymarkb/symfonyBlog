import { usePageContext } from 'vike-react/usePageContext'
import { AppShell } from '@/layouts/AppShell'

export default function Page() {
  const { routeParams } = usePageContext()
  return (
    <AppShell>
      <h1>{routeParams.slug}</h1>
    </AppShell>
  )
}
