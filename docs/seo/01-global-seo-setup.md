# Global SEO Setup

These are applied once and affect every page in the app.
Files touched: `pages/+config.ts`, `pages/+Head.tsx`, private layout `+Head.tsx` files, `apps/web/public/robots.txt`.

---

## 1. `pages/+config.ts` — site-wide defaults

Vike-react reads `title`, `description`, and `lang` from config. Per-page `+config.ts` or `+Head.tsx`
overrides these. Set fallback values here so no page is ever completely blank.

```ts
export default {
  extends: vikeReact,
  lang: 'en',
  title: 'jymb.blog',
  description: 'Personal blog — essays on software, design, and the web.',
  // ... rest of existing config
} satisfies Config
```

---

## 2. `pages/+Head.tsx` — global head tags

Add once. Applies to every page alongside whatever per-page `+Head.tsx` provides.

```tsx
export default function Head() {
  return (
    <>
      {/* Theme script (already present) */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />

      {/* Default Open Graph — per-page +Head.tsx overrides og:title, og:description, og:url */}
      <meta property="og:site_name" content="jymb.blog" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content="https://jymb.blog/og-default.png" />

      {/* Default Twitter/X Card — per-page overrides twitter:title, twitter:description, twitter:image */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://jymb.blog/og-default.png" />
    </>
  )
}
```

Default OG image: place a 1200×630px static image at `apps/web/public/og-default.png`.
Per-post images come later when the blog detail page is built.

---

## 3. `noindex` on private layouts

Private pages (auth, admin, profile) must not appear in search results.
Add a `+Head.tsx` alongside each private `+Layout.tsx`.

### `pages/(auth)/+Head.tsx` (new file)
```tsx
export default function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
```
Covers: `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`

### `pages/(admin)/+Head.tsx` (new file)
```tsx
export default function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
```
Covers: `/dashboard`, `/dashboard/posts`, `/dashboard/profile`

### `pages/(user)/+Head.tsx` (new file)
```tsx
export default function Head() {
  return <meta name="robots" content="noindex, nofollow" />
}
```
Covers: `/profile`

> `robots.txt` alone is not enough — if a blocked page is externally linked, Google can still
> index it. The `noindex` meta tag is the reliable way to keep pages out of search results.

---

## 4. `apps/web/public/robots.txt` (new file)

Block crawling of private routes as a secondary layer of protection.
`robots.txt` blocks crawling; `noindex` blocks indexing. Both are needed.

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

Sitemap: https://jymb.blog/sitemap.xml
```

The `Sitemap:` line is included now as a placeholder. It will return 404 until the sitemap
route is implemented (see `docs/roadmap/06-seo-roadmap.md` Phase 3).

---

## What vike-react already handles (do not duplicate)

| Tag | Auto-injected |
|-----|--------------|
| `<meta charset="UTF-8">` | Yes |
| `<meta name="viewport" content="width=device-width,initial-scale=1">` | Yes |
| `<title>` from `title` config | Yes |
| `<meta name="description">` from `description` config | Yes |

---

## Checklist

- [ ] Add `lang`, `title`, `description` to `pages/+config.ts`
- [ ] Add OG and Twitter defaults to `pages/+Head.tsx`
- [ ] Add `og-default.png` (1200×630) to `apps/web/public/`
- [ ] Create `pages/(auth)/+Head.tsx` with noindex
- [ ] Create `pages/(admin)/+Head.tsx` with noindex
- [ ] Create `pages/(user)/+Head.tsx` with noindex
- [ ] Create `apps/web/public/robots.txt`
