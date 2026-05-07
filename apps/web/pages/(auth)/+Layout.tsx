import type { ReactNode } from "react";
import { usePageContext } from "vike-react/usePageContext";

import { RequireGuest } from "@/features/auth/guards";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { urlPathname } = usePageContext();

  // Reset-password creates a Supabase session mid-flow (recovery token exchange).
  // RequireGuest would redirect the user away the moment that session is set,
  // so this route must bypass the guest guard.
  if (urlPathname === "/reset-password") return <>{children}</>;

  return <RequireGuest>{children}</RequireGuest>;
}
