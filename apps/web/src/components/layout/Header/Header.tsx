import { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";

import {
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

  // initialUser === null means the server confirmed guest — no need to wait for INITIAL_SESSION.
  // initialUser === undefined means the server didn't resolve auth (shouldn't happen in practice).
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
                className="btn btn-ghost size-10 p-0"
                onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
                type="button"
              >
                <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold uppercase text-paper">
                  {avatarInitial}
                </span>
              </button>

              {isAccountMenuOpen ? (
                <div
                  aria-label="Account menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] min-w-56 rounded-brand-sm border border-rule bg-paper p-2 shadow-lg"
                  role="menu"
                >
                  <div className="border-b border-rule px-3 py-2">
                    <div className="text-sm font-semibold text-ink">
                      {accountName}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {accountHandle}
                    </div>
                  </div>

                  {actions.map((action) =>
                    action.type === "link" ? (
                      <a
                        key={action.href}
                        className="btn btn-ghost w-full justify-start"
                        href={action.href}
                        onClick={() => setIsAccountMenuOpen(false)}
                        role="menuitem"
                      >
                        {action.label}
                      </a>
                    ) : (
                      <button
                        key={action.label}
                        className="btn btn-ghost w-full justify-start"
                        disabled={action.disabled}
                        onClick={() => void action.onClick()}
                        role="menuitem"
                        type="button"
                      >
                        {action.label}
                      </button>
                    ),
                  )}
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
              className="btn btn-ghost size-10 p-0 md:hidden"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsMobileAccountMenuOpen((isOpen) => !isOpen);
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
              setIsMobileMenuOpen((isOpen) => !isOpen);
            }}
          />
        </div>
      </nav>

      {isMobileAccountMenuOpen ? (
        <div
          aria-label="Account menu"
          className="absolute left-0 top-full w-full border-t border-rule bg-paper shadow-lg md:hidden"
          role="menu"
        >
          <div className="shell py-3">
            <div className="border-b border-rule px-3 pb-3">
              <div className="text-sm font-semibold text-ink">
                {accountName}
              </div>
              <div className="mt-0.5 text-xs text-muted">{accountHandle}</div>
            </div>

            <div className="grid gap-1 pt-3">
              {actions.map((action) =>
                action.type === "link" ? (
                  <a
                    key={action.href}
                    className="btn btn-ghost justify-start"
                    href={action.href}
                    onClick={() => setIsMobileAccountMenuOpen(false)}
                    role="menuitem"
                  >
                    {action.label}
                  </a>
                ) : (
                  <button
                    key={action.label}
                    className="btn btn-ghost justify-start"
                    disabled={action.disabled}
                    onClick={() => void action.onClick()}
                    role="menuitem"
                    type="button"
                  >
                    {action.label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isMobileMenuOpen ? (
        <HeaderMobileMenuPanel
          actions={effectiveIsAuthenticated ? [] : actions}
          items={headerNavItems}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}
