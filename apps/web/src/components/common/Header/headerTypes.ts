export interface HeaderNavItem {
  label: string;
  href: string;
}

export type ThemeMode = "light" | "dark";

export interface HeaderMobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface HeaderMobileMenuPanelProps {
  items: HeaderNavItem[];
  onClose: () => void;
}

