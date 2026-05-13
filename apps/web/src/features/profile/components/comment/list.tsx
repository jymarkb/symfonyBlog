import type { ProfileComment } from "@/features/profile/profileTypes";

export default function CommentList({ commentList }: { commentList: ProfileComment[] }) {
  return (
    <div className="comment-list">
      {commentList.map((comment) => {
        const date = new Date(comment.created_at);
        const formatted =
          date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) +
          " · " +
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

        return (
          <div className="comment-item" key={comment.id}>
            <div className="on">
              <span>
                On{" "}
                <a href={`/${comment.post_slug}`}>{comment.post_title}</a>
              </span>
              <span>{formatted}</span>
            </div>
            <p>{comment.body}</p>
          </div>
        );
      })}
    </div>
  );
}
