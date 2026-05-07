import type { ReactNode } from "react";

interface Props {
  title?: string;
  children: ReactNode;
}

export function ProfileSection({ title, children }: Props) {
  return (
    <div className="profile-section">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
}
