import { AppShell } from '@/layouts/AppShell'
import { SiteHeader } from '@/components/common/SiteHeader'

export default function Page() {
  return (
    <AppShell>
      <main className="min-h-screen">
        <SiteHeader />
        <section className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-700">
            Frontend foundation
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-slate-900">
            Home page
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Tailwind CSS and Lucide are now wired into the new Vite, React, and
            Vike frontend baseline.
          </p>
        </section>
      </main>
    </AppShell>
  )
}
