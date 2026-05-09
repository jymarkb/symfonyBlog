import type { PostTag } from '@/features/blog/blogTypes';

type Props = {
  initialTags?: PostTag[];
};

export function TagsSection({ initialTags }: Props) {
  const isLoading = initialTags === undefined;
  const tags = initialTags ?? [];

  return (
    <section className="shell py-12" id="tags">
      <p className="section-eyebrow mb-4">Topics</p>
      <h2 className="h-display mb-6 text-3xl text-ink">Browse by tag</h2>

      {isLoading && (
        <p className="text-sm text-ink-4">Loading tags…</p>
      )}

      {!isLoading && tags.length === 0 && (
        <p className="text-sm text-ink-4">No tags yet.</p>
      )}

      {!isLoading && tags.length > 0 && (
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
          {tags.map((tag, index) => (
            <a
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className={`tag t-${(index % 5) + 1} flex-shrink-0`}
            >
              {tag.name}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
