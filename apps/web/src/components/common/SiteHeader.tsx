import { PenSquare } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4"
      >
        <PenSquare className="h-5 w-5 text-amber-600" strokeWidth={2.25} />
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
          symfonyBlog rebuild
        </span>
      </nav>
    </header>
  )
}
