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
