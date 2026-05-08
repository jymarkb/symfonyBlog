import type { ReactNode } from "react";

export function ProfilePlaceholder({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: "14px", color: "var(--ink-4)", margin: 0 }}>
      {children}
    </p>
  );
}
