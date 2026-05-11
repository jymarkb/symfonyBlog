import type { FooterLinkGroup } from "@/components/layout/Footer/footerTypes";

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Read",
    links: [
      { label: "Archive", href: "/archive" },
      { label: "Tags", href: "/tags" },
    ],
  },
  {
    title: "Site",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Sign in", href: "/signin" },
      { label: "Create account", href: "/signup" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "GitHub", href: "#" },
      { label: "X / Twitter", href: "#" },
      { label: "Mastodon", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];
