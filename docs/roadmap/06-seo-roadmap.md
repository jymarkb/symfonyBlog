# SEO Roadmap

Audited: 2026-05-12. Based on Google Search Central, web.dev, and current industry standards.

---

## Current State (as of audit)

Zero SEO infrastructure exists across the frontend:

- No `<title>` tags on any page
- No `<meta name="description">` anywhere
- No Open Graph or Twitter Card tags
- No `<link rel="canonical">`
- No `robots.txt` — auth/admin pages are crawlable
- No `sitemap.xml`
- `/blog/@slug` page is a complete stub (no data, no content)
- `/tags/@slug` page shows raw slug as `<h1>`
- Archive filter state (`?tag=`, `?year=`) not reflected in URL

Vike-react auto-handles: `<meta charset="UTF-8">`, `<meta name="viewport">`.
`<meta name="keywords">` is obsolete (Google dropped in 2009) — do not add.

---

## Phase 1 — Do Now (no blocked dependencies)

### 1. URL params on archive (`?tag=&year=`)

Read `?tag` and `?year` from URL on page load. Push new URL when filters change (no reload).
Prerequisite for canonical on filtered archive views.

- Self-referencing canonical on filtered pages: `/archive?tag=javascript` → canonical to itself
- Do NOT canonicalize filtered pages back to `/archive` base — filtered views are distinct content
- Exclude `?search=` from URL (thin/duplicate content; not worth indexing)

### 2. `robots.txt`

Location: `apps/web/public/robots.txt`

```
User-agent: *
Disallow: /signin
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /auth/
Disallow: /dashboard/
Disallow: /editor
Disallow: /profile

Sitemap: https://yourdomain.com/sitemap.xml
```

Note: `robots.txt` only blocks crawling, not indexing. If a disallowed page is externally linked,
Google can still index it. Use `<meta name="robots" content="noindex">` to prevent indexing.

### 3. `<html lang="en">` global

Set via Vike-react `lang` config in `pages/+config.ts`. One line.

### 4. Global fallback `title` + `description`

Set in `pages/+config.ts` via Vike-react config. Overridden per-page.

- Title: 45-65 characters, front-load the keyword
- Description: ~155 characters, unique per page

### 5. Per-page `title`, `description`, `canonical` via `+Head.tsx`

Pages to cover: home (`/`), archive (`/archive`), about, contact, terms, privacy.

Canonical: self-referencing on all pages. For archive with active filters, canonical = current URL
(including params).

### 6. Open Graph tags (all public pages)

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://yourdomain.com/page" />
<meta property="og:type" content="website" />         <!-- "article" on post detail -->
<meta property="og:site_name" content="Blog Name" />
<meta property="og:image" content="https://yourdomain.com/og-default.png" />
<meta property="og:locale" content="en_US" />
```

OG image: 1200×630px. Use a static default image until per-post images are available.
Posts with optimized OG images see ~40-60% higher social CTR.

### 7. Twitter/X Card tags (all public pages)

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

Twitter also falls back to OG tags if these are absent, but explicit tags are preferred.

---

## Phase 2 — Blocked on Blog Post Detail Page

The `/blog/@slug` page is a stub. All items below are blocked until it has real content.

### 8. Post detail `+Head.tsx`

- `<title>`: Post title + site name
- `<meta name="description">`: Post excerpt
- `<link rel="canonical">`: `/blog/{slug}`
- `og:type`: `article`
- `og:title`, `og:description`, `og:image` (post cover or default)
- `<meta name="author">`: Author name

### 9. JSON-LD Article schema (post detail)

Required for Google rich results (date, author, headline in search).

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post Title",
  "description": "Post excerpt",
  "image": "https://yourdomain.com/post-image.jpg",
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-20",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  }
}
```

### 10. BreadcrumbList JSON-LD (post detail)

Improves rich result display in search (shows `Home > Blog > Post Title` in SERPs).

### 11. JSON-LD WebSite + Organization (homepage)

Low priority alone but standard complement to Article schema once post detail is done.

---

## Phase 3 — Infrastructure (requires server-side work)

### 12. `sitemap.xml` dynamic route

Archive and blog pages use `prerender: false`, so a static sitemap is not sufficient.
Needs a server-side API route (Laravel) that returns all published post slugs + lastmod dates.

Format requirements:
- Max 50,000 URLs per file (use sitemap index for larger)
- Include `<lastmod>` when content meaningfully changed (not server timestamps)
- Google ignores `<priority>` and `<changefreq>` — omit them
- Include only canonical, indexable URLs
- Submit in Google Search Console after deploying

### 13. RSS feed

Standard for blogs. Expose published posts as an Atom/RSS feed at `/feed.xml` or `/rss`.
Blocked until post detail page works end-to-end.

---

## Phase 4 — Nice to Have

### 14. OG image per post

Auto-generate a 1200×630 image from post title + author. Significant CTR boost.
Options: server-side image generation (e.g. Satori), or manual cover images per post.

### 15. Image optimization (when blog images exist)

- `loading="lazy"` on all images except the LCP image above the fold
- Explicit `width` and `height` attributes to prevent layout shift (CLS)
- WebP/AVIF format with JPEG fallback
- Descriptive `alt` text on all images

### 16. `/tags/@slug` proper implementation

Currently shows raw slug as `<h1>`. Redirect to `/archive?tag=slug` (301) or implement
as a proper filtered archive view. If redirected, the canonical on `/archive?tag=slug`
handles the SEO value.

---

## What Is Already Standard (do not skip)

| Item | Standard | Priority |
|------|----------|----------|
| title + description | Universal | Critical |
| canonical | Google + Bing | Critical |
| robots.txt | Universal | Critical |
| Open Graph | Social + AI crawlers | Recommended |
| Twitter Card | Twitter/Slack | Recommended |
| sitemap.xml | Universal | Critical |
| JSON-LD Article | Google rich results | Recommended |
| html lang | Universal | Critical |
| Image alt text | Universal + a11y | Recommended |
| RSS | Blogs standard | Recommended |

## What Is Obsolete (skip)

| Item | Reason |
|------|--------|
| `<meta name="keywords">` | Google dropped in 2009 |
| NOODP meta tag | DMOZ shut down 2017 |
| Revisit-After meta | No effect on crawl frequency |
| HTTP-Equiv Refresh | Use 301/302 redirect instead |
