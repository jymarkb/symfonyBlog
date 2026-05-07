import type { ReactNode } from "react";

type CommentSkeletonProps = {
  children: ReactNode;
};

export function CommentSkeleton({ children }: CommentSkeletonProps) {
  return (
    <p style={{ fontSize: "14px", color: "var(--ink-4)", margin: 0 }}>
      {children}
    </p>
  );
}
