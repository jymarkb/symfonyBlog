# Per-Page SEO

Each public page gets its own `+Head.tsx` with title, description, canonical, and Open Graph tags.
Global defaults (og:site_name, og:image, twitter:card) are set in `pages/+Head.tsx` and do not
need to be repeated here.

---

## Page status

| Page | UI status | SEO status | Notes |
|------|-----------|------------|-------|
| `/` (home) | Working | Pending | Full landing page with data |
| `/archive` | Working | Pending | Dynamic — title/canonical change with `?tag=` / `?year=` |
| `/terms` | Working | Pending | Static content |
| `/privacy` | Working | Pending | Static content |
| `/about` | Stub | Pending | Add SEO when UI is built |
| `/contact` | Stub | Pending | Add SEO when UI is built |
| `/blog` | Stub | — | Purpose unclear — may be removed |
| `/blog/@slug` | Stub | Blocked | No data layer yet; SEO blocked |
| `/tags/@slug` | Stub | N/A | Redirect to `/archive?tag=slug`, no SEO needed |

---

## `/` — Home

File: `pages/index/+Head.tsx` (new)

```tsx
export default function Head() {
  return (
    <>
      <title>jymb.blog</title>
      <meta name="description" content="Personal blog — essays on software, design, and the web." />
      <link rel="canonical" href="https://jymb.blog/" />
      <meta property="og:title" content="jymb.blog" />
      <meta property="og:description" content="Personal blog — essays on software, design, and the web." />
      <meta property="og:url" content="https://jymb.blog/" />
      <meta property="og:type" content="website" />
    </>
  )
}
```

---

## `/archive` — Archive (dynamic)

File: `pages/archive/+Head.tsx` (new)

Title, description, and canonical URL all change based on active `?tag=` and `?year=` params.
Canonical is self-referencing (includes active params) — filtered views are distinct content.

```tsx
import { usePageContext } from 'vike-react/usePageContext'

export default function Head() {
  const { urlParsed } = usePageContext()
  const tag = urlParsed.search['tag'] ?? null
  const year = urlParsed.search['year'] ?? null

  let title = 'Archive'
  if (tag && year) title = `${tag} · ${year} · Archive`
  else if (tag) title = `${tag} · Archive`
  else if (year) title = `${year} · Archive`

  const description = tag && year
    ? `Essays tagged ${tag} from ${year}.`
    : tag
    ? `Essays tagged ${tag}.`
    : year
    ? `Essays published in ${year}.`
    : 'All essays, sorted by date.'

  const canonical = `https://jymb.blog/archive${urlParsed.searchOriginal ?? ''}`

  return (
    <>
      <title>{title} · jymb.blog</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={`${title} · jymb.blog`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
    </>
  )
}
```

Note: `?search=` is intentionally excluded from the URL and canonical — search results
are thin/dynamic content not worth indexing.

---

## `/terms` — Community Guidelines

File: `pages/terms/+Head.tsx` (new)

```tsx
export default function Head() {
  return (
    <>
      <title>Community Guidelines · jymb.blog</title>
      <meta name="description" content="Comment policy for jymb.blog — be kind, stay on topic, no illegal content." />
      <link rel="canonical" href="https://jymb.blog/terms" />
      <meta property="og:title" content="Community Guidelines · jymb.blog" />
      <meta property="og:description" content="Comment policy for jymb.blog." />
      <meta property="og:url" content="https://jymb.blog/terms" />
      <meta property="og:type" content="website" />
    </>
  )
}
```

---

## `/privacy` — Privacy Notice

File: `pages/privacy/+Head.tsx` (new)

```tsx
export default function Head() {
  return (
    <>
      <title>Privacy Notice · jymb.blog</title>
      <meta name="description" content="What data jymb.blog collects, why, and how it is handled." />
      <link rel="canonical" href="https://jymb.blog/privacy" />
      <meta property="og:title" content="Privacy Notice · jymb.blog" />
      <meta property="og:description" content="What data jymb.blog collects, why, and how it is handled." />
      <meta property="og:url" content="https://jymb.blog/privacy" />
      <meta property="og:type" content="website" />
    </>
  )
}
```

---

## `/about` and `/contact` — Stubs

Add SEO once the page content is built. Placeholder files can be created now with
the minimum required, but description should reflect actual content once available.

File: `pages/about/+Head.tsx`
```tsx
export default function Head() {
  return (
    <>
      <title>About · jymb.blog</title>
      <meta name="description" content="About the author of jymb.blog." />
      <link rel="canonical" href="https://jymb.blog/about" />
      <meta property="og:title" content="About · jymb.blog" />
      <meta property="og:url" content="https://jymb.blog/about" />
      <meta property="og:type" content="website" />
    </>
  )
}
```

File: `pages/contact/+Head.tsx`
```tsx
export default function Head() {
  return (
    <>
      <title>Contact · jymb.blog</title>
      <meta name="description" content="Get in touch with the author of jymb.blog." />
      <link rel="canonical" href="https://jymb.blog/contact" />
      <meta property="og:title" content="Contact · jymb.blog" />
      <meta property="og:url" content="https://jymb.blog/contact" />
      <meta property="og:type" content="website" />
    </>
  )
}
```

---

## `/blog/@slug` — Post Detail (blocked)

Blocked until the page has a data layer (`+data.ts`) and real content.
When ready, see `docs/roadmap/06-seo-roadmap.md` Phase 2 for full spec.

---

## `/tags/@slug` — Tag Page (redirect, no SEO needed)

Implement as a route guard that 301-redirects to `/archive?tag=slug`.
The canonical on `/archive?tag=slug` carries all SEO value.

File: `pages/tags/@slug/+guard.ts`
```ts
import type { GuardAsync } from 'vike/types'
import { redirect } from 'vike/abort'

export const guard: GuardAsync = async (pageContext) => {
  const { slug } = pageContext.routeParams
  throw redirect(`/archive?tag=${encodeURIComponent(slug)}`, 301)
}
```

---

## Checklist

### Working pages (implement now)
- [ ] `pages/index/+Head.tsx`
- [ ] `pages/archive/+Head.tsx` (dynamic — requires URL params done first)
- [ ] `pages/terms/+Head.tsx`
- [ ] `pages/privacy/+Head.tsx`

### Stub pages (implement when UI is ready)
- [ ] `pages/about/+Head.tsx`
- [ ] `pages/contact/+Head.tsx`

### Redirect (implement with URL params)
- [ ] `pages/tags/@slug/+guard.ts` → redirect to `/archive?tag=slug`

### Blocked
- [ ] `pages/blog/@slug/+Head.tsx` — blocked on post detail page stub
