export function CommentSkeleton() {
  return (
    <div className="comment-skeleton">
      <div className="skeleton-avatar shimmer" />
      <div className="skeleton-lines">
        <div className="skeleton-line short shimmer" />
        <div className="skeleton-line long shimmer" />
        <div className="skeleton-line medium shimmer" />
      </div>
    </div>
  );
}
