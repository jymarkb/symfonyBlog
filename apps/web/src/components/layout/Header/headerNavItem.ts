import type {
  HeaderAuthButtons,
  HeaderNavItem,
} from "@/components/layout/Header/headerTypes";

export const headerNavItems: HeaderNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "Tags", href: "/tags" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const headerAuthButtons: HeaderAuthButtons = {
  signIn: { label: "Sign in", href: "/signin" },
  signUp: { label: "Create account", href: "/signup" },
};

export const headerAccountLinks = {
  profile: { label: "Profile", href: "/profile" },
  dashboard: { label: "Dashboard", href: "/dashboard" },
};
