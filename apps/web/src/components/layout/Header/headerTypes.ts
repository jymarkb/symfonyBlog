import type { ThemeMode } from "@/lib/theme/themeTypes";

export interface HeaderNavItem {
  label: string;
  href: string;
}

export type HeaderAuthCta = HeaderNavItem;

export interface HeaderAuthButtons {
  signIn: HeaderAuthCta;
  signUp: HeaderAuthCta;
}

export interface HeaderThemeToggleProps {
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
}

export interface HeaderMobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export type HeaderActionItem =
  | {
      type: "link";
      label: string;
      href: string;
      variant?: "ghost" | "primary";
    }
  | {
      type: "button";
      label: string;
      onClick: () => void;
      variant?: "ghost" | "primary";
      disabled?: boolean;
    };

export interface HeaderMobileMenuPanelProps {
  items: HeaderNavItem[];
  actions: HeaderActionItem[];
  onClose: () => void;
  pathname: string;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
}

export interface HeaderMobileAccountPanelProps {
  actions: HeaderActionItem[];
  onClose: () => void;
  accountName: string;
  accountHandle: string;
  avatarInitial: string;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
}
