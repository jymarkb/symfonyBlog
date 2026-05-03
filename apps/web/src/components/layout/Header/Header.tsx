import { useState } from "react";

import {
  HeaderMobileMenuButton,
  HeaderMobileMenuPanel,
} from "@/components/layout/Header/HeaderMobileMenu";
import { HeaderThemeToggle } from "@/components/layout/Header/HeaderThemeToggle";
import { headerNavItems } from "@/components/layout/Header/headerNavItem";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="surface-nav sticky top-0 z-50 relative">
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
            <a
              key={item.href}
              className="btn btn-ghost hidden md:inline-flex"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <HeaderThemeToggle />

          <a className="btn btn-primary hidden md:inline-flex" href="/login">
            Sign in
          </a>

          <HeaderMobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          />
        </div>
      </nav>

      {isMobileMenuOpen ? (
        <HeaderMobileMenuPanel
          items={headerNavItems}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}
