import type { ReactNode } from "react";

import { ProfilePlaceholder } from "@/features/profile/components/ProfilePlaceholder";
import { ProfileSection } from "@/features/profile/components/ProfileSection";

interface Props {
  title: string;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}

export function ProfileDataSection({ title, isLoading, error, isEmpty, emptyMessage, children }: Props) {
  if (isLoading) {
    return <ProfileSection title={title}><ProfilePlaceholder>Loading…</ProfilePlaceholder></ProfileSection>;
  }
  if (error) {
    return <ProfileSection title={title}><ProfilePlaceholder>{error}</ProfilePlaceholder></ProfileSection>;
  }
  if (isEmpty) {
    return <ProfileSection title={title}><ProfilePlaceholder>{emptyMessage}</ProfilePlaceholder></ProfileSection>;
  }
  return <ProfileSection title={title}>{children}</ProfileSection>;
}
