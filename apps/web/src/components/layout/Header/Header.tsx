import { useState } from "react";
import { ArrowRight, LayoutDashboard, LogOut, User } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";

import {
  HeaderMobileAccountPanel,
  HeaderMobileMenuButton,
  HeaderMobileMenuPanel,
} from "@/components/layout/Header/HeaderMobileMenu";
import { HeaderThemeToggle } from "@/components/layout/Header/HeaderThemeToggle";
import {
  headerAccountLinks,
  headerAuthButtons,
  headerNavItems,
} from "@/components/layout/Header/headerNavItem";
import type { HeaderActionItem } from "@/components/layout/Header/headerTypes";

import { Brand } from "@/components/ui/Brand";
import { useCurrentSession } from "@/features/auth/session/useCurrentSession";
import { useThemeMode } from "@/lib/theme/useThemeMode";

export function Header() {
  const { themeMode, toggleThemeMode } = useThemeMode();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileAccountMenuOpen, setIsMobileAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pageContext = usePageContext();
  const pathname = pageContext.urlPathname;
  const initialUser = pageContext.initialUser ?? null;

  const { isLoading: sessionLoading, isAuthenticated, isAdmin, user, signOut } =
    useCurrentSession();

  const isLoading = sessionLoading && initialUser === undefined;

  const guestCta =
    pathname === headerAuthButtons.signIn.href
      ? headerAuthButtons.signUp
      : headerAuthButtons.signIn;
  const accountName = user?.display_name ?? initialUser?.displayName ?? "Account";
  const accountHandle = user?.handle ?? initialUser?.handle ?? "Signed in";
  const avatarInitial =
    user?.display_name?.charAt(0) ??
    user?.handle?.replace(/^@/, "").charAt(0) ??
    initialUser?.displayName?.charAt(0) ??
    initialUser?.handle?.replace(/^@/, "").charAt(0) ??
    "U";

  async function handleSignOut() {
    setIsAccountMenuOpen(false);
    setIsMobileAccountMenuOpen(false);
    await signOut();

    if (pathname.startsWith("/dashboard") || pathname === "/profile") {
      window.location.replace("/signin");
    }
  }

  const effectiveIsAuthenticated = isAuthenticated || (!!initialUser && sessionLoading);
  const effectiveIsAdmin = isAdmin || (!!initialUser?.isAdmin && sessionLoading);

  const actions: HeaderActionItem[] = isLoading
    ? []
    : effectiveIsAuthenticated
      ? [
          ...(effectiveIsAdmin
            ? [
                {
                  type: "link",
                  label: headerAccountLinks.dashboard.label,
                  href: headerAccountLinks.dashboard.href,
                } as const,
              ]
            : []),
          {
            type: "link",
            label: headerAccountLinks.profile.label,
            href: headerAccountLinks.profile.href,
          },
          {
            type: "button",
            label: "Sign out",
            onClick: handleSignOut,
          },
        ]
      : [
          {
            type: "link",
            label: guestCta.label,
            href: guestCta.href,
            variant: "primary",
          },
        ];

  return (
    <header className="surface-nav sticky top-0 z-50 relative">
      <nav
        aria-label="Primary"
        className="shell flex h-16 items-center justify-between gap-8"
      >
        <Brand href="/" />

        <div className="flex items-center gap-2">
          {headerNavItems.map((item) => (
            <a
              key={item.href}
              className={`nav-link hidden md:inline-flex ${pathname === item.href ? "active" : ""}`}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <HeaderThemeToggle
            themeMode={themeMode}
            onToggleThemeMode={toggleThemeMode}
          />

          {isLoading ? (
            <span
              aria-hidden="true"
              className="hidden h-10 w-24 md:inline-flex"
            />
          ) : effectiveIsAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className="btn btn-ghost size-10 border-0 p-0"
                onClick={() => setIsAccountMenuOpen((v) => !v)}
                type="button"
              >
                <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold uppercase text-paper">
                  {avatarInitial}
                </span>
              </button>

              {isAccountMenuOpen ? (
                <div
                  aria-label="Account menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] min-w-52 overflow-hidden rounded-brand bg-paper-2 shadow-xl"
                  role="menu"
                >
                  <div className="h-0.5 bg-accent" />

                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold uppercase text-paper">
                      {avatarInitial}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">
                        {accountName}
                      </div>
                      <div className="truncate text-xs text-ink-4">
                        {accountHandle}
                      </div>
                    </div>
                  </div>

                  <div className="px-1.5 pb-1.5">
                    {actions.map((action) => {
                      const Icon =
                        action.label === "Dashboard"
                          ? LayoutDashboard
                          : action.label === "Profile"
                            ? User
                            : LogOut;
                      const isDestructive = action.label === "Sign out";

                      return action.type === "link" ? (
                        <a
                          key={action.href}
                          className="group flex w-full items-center gap-2.5 rounded-brand-sm px-3 py-2.5 text-sm text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink"
                          href={action.href}
                          onClick={() => setIsAccountMenuOpen(false)}
                          role="menuitem"
                        >
                          <Icon
                            aria-hidden="true"
                            className="size-3.5 shrink-0 transition-colors group-hover:text-accent-ink"
                          />
                          <span className="flex-1">{action.label}</span>
                          <ArrowRight
                            aria-hidden="true"
                            className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-50"
                          />
                        </a>
                      ) : (
                        <button
                          key={action.label}
                          className={`group flex w-full items-center gap-2.5 rounded-brand-sm px-3 py-2.5 text-sm transition-colors disabled:opacity-50 ${
                            isDestructive
                              ? "text-ink-3 hover:bg-red-500/10 hover:text-red-400"
                              : "text-ink-3 hover:bg-paper-3 hover:text-ink"
                          }`}
                          disabled={action.disabled}
                          onClick={() => void action.onClick()}
                          role="menuitem"
                          type="button"
                        >
                          <Icon
                            aria-hidden="true"
                            className={`size-3.5 shrink-0 transition-colors ${
                              isDestructive ? "group-hover:text-red-400" : "group-hover:text-accent-ink"
                            }`}
                          />
                          <span className="flex-1 text-left">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            actions.map((action) =>
              action.type === "link" ? (
                <a
                  key={action.href}
                  className={`btn hidden md:inline-flex ${
                    action.variant === "primary" ? "btn-primary" : "btn-ghost"
                  }`}
                  href={action.href}
                >
                  {action.label}
                </a>
              ) : null,
            )
          )}

          {!isLoading && effectiveIsAuthenticated ? (
            <button
              aria-expanded={isMobileAccountMenuOpen}
              aria-haspopup="menu"
              aria-label="Open account menu"
              className="btn btn-ghost size-10 border-0 p-0 md:hidden"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsMobileAccountMenuOpen((v) => !v);
              }}
              type="button"
            >
              <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold uppercase text-paper">
                {avatarInitial}
              </span>
            </button>
          ) : null}

          <HeaderMobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={() => {
              setIsMobileAccountMenuOpen(false);
              setIsMobileMenuOpen((v) => !v);
            }}
          />
        </div>
      </nav>

      {isMobileAccountMenuOpen ? (
        <HeaderMobileAccountPanel
          accountHandle={accountHandle}
          accountName={accountName}
          actions={actions}
          avatarInitial={avatarInitial}
          onClose={() => setIsMobileAccountMenuOpen(false)}
          onToggleThemeMode={toggleThemeMode}
          themeMode={themeMode}
        />
      ) : null}

      {isMobileMenuOpen ? (
        <HeaderMobileMenuPanel
          actions={effectiveIsAuthenticated ? [] : actions}
          items={headerNavItems}
          onClose={() => setIsMobileMenuOpen(false)}
          onToggleThemeMode={toggleThemeMode}
          pathname={pathname}
          themeMode={themeMode}
        />
      ) : null}
    </header>
  );
}
