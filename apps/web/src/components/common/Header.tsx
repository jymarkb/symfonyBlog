import { headerNavItems } from "@/lib/static/headerStatic";

export function Header() {
  return (
    <header className="surface-nav sticky top-0 z-50">
      <nav
        aria-label="Primary"
        className="shell flex h-16 items-center justify-between gap-8"
      >
        <a
          className="flex items-center gap-2 font-mono text-sm font-semibold"
          href="/"
        >
          <span className="grid size-[22px] place-items-center rounded-brand-sm bg-ink text-xs font-bold text-paper">
            J
          </span>
          <span>
            jymb<span className="text-accent-ink">.</span>blog
          </span>
        </a>

        <div className="flex items-center gap-2">
            {headerNavItems.map((item) => (
                <a key={item.href} className="btn btn-ghost hidden sm:inline-flex" href={item.href}>
                    {item.label}
                </a>
            ))}
        </div>

        <div>
            <a className="btn btn-primary" href="/sign-in">
              Sign in
            </a>
        </div>
      </nav>
    </header>
  );
}
