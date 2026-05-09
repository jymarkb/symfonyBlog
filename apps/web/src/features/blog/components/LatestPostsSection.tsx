import type { PostSummary } from '@/features/blog/blogTypes';
import { PostCard } from '@/components/common/PostCard';

type Props = {
  initialPosts?: PostSummary[];
};

function LatestSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="card h-52 animate-pulse bg-paper-2"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function LatestPostsSection({ initialPosts }: Props) {
  const isLoading = initialPosts === undefined;
  const posts = initialPosts ?? [];

  return (
    <section className="shell py-16">
      <p className="section-eyebrow mb-4">Latest</p>
      <h2 className="h-display mb-8 text-3xl text-ink">Recent posts</h2>

      {isLoading && <LatestSkeleton />}

      {!isLoading && posts.length === 0 && (
        <p className="text-sm text-ink-4">No posts published yet. Check back soon.</p>
      )}

      {!isLoading && posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="/blog" className="btn btn-ghost">
              View all posts
            </a>
          </div>
        </>
      )}
    </section>
  );
}
