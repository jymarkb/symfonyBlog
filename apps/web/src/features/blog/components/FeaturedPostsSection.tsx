import type { PostSummary } from '@/features/blog/blogTypes';
import { FeaturedPostCard } from '@/features/blog/components/FeaturedPostCard';

type Props = {
  initialPosts?: PostSummary[];
};

export function FeaturedPostsSection({ initialPosts }: Props) {
  const isLoading = initialPosts === undefined;
  const post = initialPosts?.[0];

  return (
    <section>
      <div className="section-head">
        <h2>Featured</h2>
      </div>
      {(isLoading || !post) && (
        <article className="featured">
          <div className="featured-img img-placeholder" />
          <div className="featured-body">
            <div style={{ height: 11, width: '32%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 16 }} />
            <div style={{ height: 26, width: '96%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 8 }} />
            <div style={{ height: 26, width: '72%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 20 }} />
            <div style={{ height: 14, width: '88%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 6 }} />
            <div style={{ height: 14, width: '76%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 6 }} />
            <div style={{ height: 14, width: '60%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 24 }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              <div style={{ height: 22, width: 72, background: 'var(--paper-3)', borderRadius: 999 }} />
              <div style={{ height: 22, width: 90, background: 'var(--paper-3)', borderRadius: 999 }} />
            </div>
            <div style={{ height: 11, width: '48%', background: 'var(--paper-3)', borderRadius: 3 }} />
          </div>
        </article>
      )}
      {!isLoading && post && <FeaturedPostCard post={post} />}
    </section>
  );
}
