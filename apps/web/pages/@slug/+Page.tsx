import { useData } from 'vike-react/useData';
import { BlockRenderer } from '@jymarkb/block-editor/render';
import { AppShell } from '@/layouts/AppShell';
import { PostRail } from '@/features/blog/components/PostRail';
import type { PostDetailPageData } from '@/features/blog/blogTypes';

export default function Page() {
  const { post } = useData<PostDetailPageData>();

  return (
    <AppShell>
      <div className="post-layout">
        <PostRail post={post} />
        <div className="post-content">
          <h1 className="block-title">{post.title}</h1>
          {post.excerpt != null && <p className="block-dek">{post.excerpt}</p>}
          {post.cover_image != null && (
            <img className="block-cover" src={post.cover_image} alt={post.title} />
          )}
          <div className="block-body">
            <BlockRenderer blocks={post.body} />
          </div>
          <footer className="post-footer">
            {/* Tags */}
            {(post.tags ?? []).length > 0 && (
              <div className="tags">
                {(post.tags ?? []).map((tag, i) => (
                  <a key={tag.id} href={`/archive?tag=${encodeURIComponent(tag.slug)}`}>
                    <span className={`tag t-${(i % 5) + 1}`}>{tag.name}</span>
                  </a>
                ))}
              </div>
            )}
            {/* Reactions stub — deferred */}
            <div className="react-row" aria-hidden="true">
              <span className="meta">Reactions</span>
              <button className="react-btn" disabled>👍 <span className="count">—</span></button>
              <button className="react-btn" disabled>🔥 <span className="count">—</span></button>
              <button className="react-btn" disabled>💡 <span className="count">—</span></button>
            </div>
            {/* Share row */}
            <div className="share-row">
              <div className="share-links">
                <a href={`https://twitter.com/intent/tweet?url=https://jymb.blog/${post.slug}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">X / Twitter</a>
                <a href={`https://news.ycombinator.com/submitlink?u=https://jymb.blog/${post.slug}&t=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">Hacker News</a>
                <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=https://jymb.blog/${post.slug}`}>Email</a>
              </div>
            </div>
            {/* Related essays stub — deferred */}
            <div className="related">
              <p className="related-label">Related essays</p>
            </div>
          </footer>
        </div>
      </div>
    </AppShell>
  );
}
