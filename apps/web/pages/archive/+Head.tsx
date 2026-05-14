import { usePageContext } from 'vike-react/usePageContext'
import { siteUrl, siteName } from '@/lib/env/siteUrl'

export default function Head() {
  const { urlParsed } = usePageContext()
  const rawYear = urlParsed.search['year'] ?? null;
  const year = rawYear && /^\d{4}$/.test(rawYear) && parseInt(rawYear) >= 2000 && parseInt(rawYear) <= 2099
    ? rawYear
    : null;
  const rawTag = urlParsed.search['tag'] ?? null;
  const tag = rawTag ? rawTag.replace(/[<>]/g, '').slice(0, 100) : null;
  const rawSearch = urlParsed.search['search'] ?? null;
  const search = rawSearch ? rawSearch.replace(/[<>]/g, '').toLowerCase().slice(0, 100) : null;

  let title = 'Archive'
  if (tag && year) title = `${tag} · ${year} · Archive`
  else if (tag) title = `${tag} · Archive`
  else if (year) title = `${year} · Archive`
  else if (search) title = `Search: ${search} · Archive`

  const fullTitle = `${title} · ${siteName}`

  const description = tag && year
    ? `Essays tagged ${tag} from ${year}.`
    : tag
    ? `Essays tagged ${tag}.`
    : year
    ? `Essays published in ${year}.`
    : search
    ? `Posts matching "${search}" on ${siteName}.`
    : 'All essays, sorted by date.'

  const params = new URLSearchParams();
  if (tag) params.set('tag', tag);
  if (year) params.set('year', year);
  if (search) params.set('search', search.toLowerCase());
  const qs = params.toString();
  const canonical = `${siteUrl}/archive${qs ? '?' + qs : ''}`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      {search && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": fullTitle,
          }) }}
        />
      )}
    </>
  )
}
