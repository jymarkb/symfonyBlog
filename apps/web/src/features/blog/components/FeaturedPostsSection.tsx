import type { PostSummary } from '@/features/blog/blogTypes';
import { FeaturedPostCard } from '@/features/blog/components/FeaturedPostCard';

type Props = {
  initialPosts?: PostSummary[];
};

function FeaturedSkeleton() {
  return (
    <div className="grid gap-6">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="card h-64 animate-pulse bg-paper-2"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function FeaturedPostsSection({ initialPosts }: Props) {
  const isLoading = initialPosts === undefined;
  const posts = initialPosts ?? [];

  return (
    <section className="shell py-16">
      <p className="section-eyebrow mb-4">Featured</p>
      <h2 className="h-display mb-8 text-3xl text-ink">Staff picks</h2>

      {isLoading && <FeaturedSkeleton />}

      {!isLoading && posts.length === 0 && (
        <p className="text-sm text-ink-4">No featured posts yet.</p>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="grid gap-6">
          {posts.map((post) => (
            <FeaturedPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
