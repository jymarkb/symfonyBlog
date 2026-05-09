import type { PostTag } from "@/features/blog/blogTypes";

type Props = {
  tags?: PostTag[];
};

export function TagsSection({ tags }: Props) {
  if (tags !== undefined && tags.length === 0) {
    return null;
  }

  return (
    <div className="side-block">
      <h4>Tags</h4>
      <div className="tag-cloud">
        {tags === undefined ? (
          <span>Loading tags…</span>
        ) : (
          tags.map((tag, index) => (
            <a key={tag.id} href={`/blog?tag=${tag.slug}`}>
              <span className={`tag t-${(index % 5) + 1}`}>{tag.name}</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
