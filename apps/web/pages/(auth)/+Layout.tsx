import type { ReactNode } from "react";

import { RequireGuest } from "@/features/auth/guards";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <RequireGuest>{children}</RequireGuest>;
}
