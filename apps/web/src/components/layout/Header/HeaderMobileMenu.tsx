import { Menu, X } from "lucide-react";

import type {
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
      className="btn btn-ghost size-10 p-0 md:hidden"
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
  authCta,
  items,
  onClose,
}: HeaderMobileMenuPanelProps) {
  return (
    <div className="absolute left-0 top-full w-full border-t border-rule bg-paper shadow-lg md:hidden">
      <div className="shell py-3">
        <div className="grid gap-1">
          {items.map((item) => (
            <a
              key={item.href}
              className="btn btn-ghost justify-start"
              href={item.href}
              onClick={onClose}
            >
              {item.label}
            </a>
          ))}
          <a
            className="btn btn-primary justify-start"
            href={authCta.href}
            onClick={onClose}
          >
            {authCta.label}
          </a>
        </div>
      </div>
    </div>
  );
}
