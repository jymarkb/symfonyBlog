import { useData } from 'vike-react/useData'
import type { PostDetailPageData } from '@/features/blog/blogTypes'

export default function Head() {
  const { post } = useData<PostDetailPageData>()

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    url: `https://jymb.blog/${post.slug}`,
    author: {
      '@type': 'Person',
      name: post.author.display_name,
      url: 'https://jymb.blog',
    },
  }

  if (post.cover_image != null) {
    schema.image = post.cover_image
  }

  return (
    <>
      <title>{post.title} — jymb.blog</title>
      <meta name="description" content={post.excerpt ?? ''} />
      <link rel="canonical" href={`https://jymb.blog/${post.slug}`} />

      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt ?? ''} />
      <meta property="og:url" content={`https://jymb.blog/${post.slug}`} />
      {post.cover_image != null && (
        <meta property="og:image" content={post.cover_image} />
      )}

      {post.published_at != null && (
        <meta property="article:published_time" content={post.published_at} />
      )}

      {(post.tags ?? []).map((tag) => (
        <meta key={tag.id} property="article:tag" content={tag.name} />
      ))}

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </>
  )
}
