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

export interface HeaderProps {
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
}

export interface HeaderThemeToggleProps {
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
}

export interface HeaderMobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface HeaderMobileMenuPanelProps {
  items: HeaderNavItem[];
  authCta: HeaderAuthCta;
  onClose: () => void;
}
