import { useData } from 'vike-react/useData'
import type { PostDetailPageData } from '@/features/blog/blogTypes'
import { siteUrl, siteName } from '@/lib/env/siteUrl'

export default function Head() {
  const { post } = useData<PostDetailPageData>()

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    datePublished: post.published_at,
    url: `${siteUrl}/${encodeURIComponent(post.slug)}`,
    author: {
      '@type': 'Person',
      name: post.author.display_name,
      url: siteUrl,
    },
  }

  if (post.cover_image != null) {
    schema.image = post.cover_image
  }

  return (
    <>
      <title>{post.title} — {siteName}</title>
      <meta name="description" content={post.excerpt ?? ''} />
      <link rel="canonical" href={`${siteUrl}/${encodeURIComponent(post.slug)}`} />
      <meta property="og:site_name" content={siteName} />

      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt ?? ''} />
      <meta property="og:url" content={`${siteUrl}/${encodeURIComponent(post.slug)}`} />
      {post.cover_image != null && (
        <meta property="og:image" content={post.cover_image} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.excerpt ?? ''} />
      {post.cover_image != null && (
        <meta name="twitter:image" content={post.cover_image} />
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
