import { AppShell } from '@/layouts/AppShell'
// import { SiteHeader } from '@/components/common/SiteHeader'
import { Header } from '@/components/common/Header'

export default function Page() {
  return (
    <AppShell>
      <main className="min-h-screen bg-paper text-ink">
        <Header />
        <section className="shell py-16 md:py-24">
          <p className="eyebrow">
            Frontend foundation
          </p>
          <h1 className="h-display mt-4 max-w-3xl text-5xl md:text-7xl">
            Theme tokens are ready for the design port.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-3">
            The design CSS now has a Tailwind-friendly theme layer for colors,
            typography, shell width, cards, buttons, tags, and common surfaces.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="/blog">
              View blog
            </a>
            <a className="btn" href="/dashboard">
              Dashboard
            </a>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
