import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Menu, X } from "lucide-react";

import { Brand } from "@/components/ui/Brand";
import { HeaderThemeToggle } from "@/components/layout/Header/HeaderThemeToggle";
import type {
  HeaderMobileAccountPanelProps,
  HeaderMobileMenuButtonProps,
  HeaderMobileMenuPanelProps,
} from "@/components/layout/Header/headerTypes";

export function HeaderMobileMenuButton({
  isOpen,
  onToggle,
}: HeaderMobileMenuButtonProps) {
  return (
    <button
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="btn btn-ghost size-10 border-0 p-0 md:hidden"
      onClick={onToggle}
      type="button"
    >
      {isOpen ? (
        <X aria-hidden="true" className="size-4" />
      ) : (
        <Menu aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}

export function HeaderMobileMenuPanel({
  items,
  actions,
  onClose,
  pathname,
  themeMode,
  onToggleThemeMode,
}: HeaderMobileMenuPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="animate-mobileMenuIn fixed inset-0 z-[60] flex flex-col bg-paper/[0.97] backdrop-blur-xl">
      {/* grid backdrop */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      {/* top bar */}
      <header className="relative flex items-center justify-between border-b border-rule px-5 py-3">
        <Brand />
        <div className="flex items-center gap-1">
          <HeaderThemeToggle
            themeMode={themeMode}
            onToggleThemeMode={onToggleThemeMode}
          />
          <button
            aria-label="Close menu"
            className="btn btn-ghost size-10 border-0 p-0"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      </header>

      {/* nav */}
      <div className="relative flex-1 overflow-y-auto px-5 py-5">
        <p className="section-eyebrow mb-3">Navigation</p>

        <ul className="flex flex-col">
          {items.map((item, index) => {
            const active = pathname === item.href;
            return (
              <li
                key={item.href}
                className="mobile-menu-item border-b border-rule last:border-b-0"
                style={{ animationDelay: `${60 + index * 35}ms` }}
              >
                <a
                  className={`group flex items-center gap-3 py-3 text-[15px] font-medium transition-colors ${
                    active
                      ? "text-accent-ink"
                      : "text-ink-2 hover:text-ink"
                  }`}
                  href={item.href}
                  onClick={onClose}
                >
                  <span className="flex-1">{item.label}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 opacity-30 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {actions.length > 0 ? (
          <div className="mt-5 border-t border-rule pt-5">
            <p className="section-eyebrow mb-3">Get started</p>
            <div className="grid gap-2">
              {actions.map((action) =>
                action.type === "link" ? (
                  <a
                    key={action.href}
                    className={`btn justify-center ${
                      action.variant === "primary" ? "btn-primary" : "btn-ghost"
                    }`}
                    href={action.href}
                    onClick={onClose}
                  >
                    {action.label}
                  </a>
                ) : null,
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function HeaderMobileAccountPanel({
  actions,
  onClose,
  accountName,
  accountHandle,
  avatarInitial,
  themeMode,
  onToggleThemeMode,
}: HeaderMobileAccountPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="animate-mobileMenuIn fixed inset-0 z-[60] flex flex-col bg-paper/[0.97] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      {/* top bar */}
      <header className="relative flex items-center justify-between border-b border-rule px-5 py-3">
        <Brand />
        <div className="flex items-center gap-1">
          <HeaderThemeToggle
            themeMode={themeMode}
            onToggleThemeMode={onToggleThemeMode}
          />
          <button
            aria-label="Close menu"
            className="btn btn-ghost size-10 border-0 p-0"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      </header>

      {/* account body */}
      <div className="relative flex-1 overflow-y-auto px-5 py-5">
        <p className="section-eyebrow mb-4">Account</p>

        {/* user card */}
        <div className="mb-5 flex items-center gap-3 rounded-brand bg-paper-2 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold uppercase text-paper">
            {avatarInitial}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">
              {accountName}
            </div>
            <div className="truncate text-xs text-ink-4">{accountHandle}</div>
          </div>
        </div>

        {/* account links styled like nav items */}
        <ul className="flex flex-col">
          {actions.map((action, index) => (
            <li
              key={action.type === "link" ? action.href : action.label}
              className="mobile-menu-item border-b border-rule last:border-b-0"
              style={{ animationDelay: `${60 + index * 35}ms` }}
            >
              {action.type === "link" ? (
                <a
                  className="group flex items-center gap-3 py-3 text-[15px] font-medium text-ink-2 transition-colors hover:text-ink"
                  href={action.href}
                  onClick={onClose}
                >
                  <span className="flex-1">{action.label}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 opacity-30 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
                  />
                </a>
              ) : (
                <button
                  className="group flex w-full items-center gap-3 py-3 text-[15px] font-medium text-ink-2 transition-colors hover:text-ink"
                  disabled={action.disabled}
                  onClick={() => {
                    onClose();
                    void action.onClick();
                  }}
                  type="button"
                >
                  <span className="flex-1 text-left">{action.label}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 opacity-30 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
                  />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
