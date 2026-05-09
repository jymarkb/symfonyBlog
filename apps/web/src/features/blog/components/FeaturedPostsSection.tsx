import type { PostSummary } from '@/features/blog/blogTypes';
import { FeaturedPostCard } from '@/features/blog/components/FeaturedPostCard';

type Props = {
  initialPosts?: PostSummary[];
};

export function FeaturedPostsSection({ initialPosts }: Props) {
  if (initialPosts !== undefined && initialPosts.length === 0) {
    return null;
  }

  const isLoading = initialPosts === undefined;
  const post = initialPosts?.[0];

  const monthYear = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <section>
      <div className="section-head">
        <h2>Featured</h2>
        <span className="count">{monthYear}</span>
      </div>
      {isLoading && <div className="featured img-placeholder" />}
      {!isLoading && post && <FeaturedPostCard post={post} />}
    </section>
  );
}
