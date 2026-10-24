import { pages, safeCvJsonLd, safeDashboardJsonLd, safeJsonLd, siteUrl, type PageKey } from '../lib/seo'

const jsonLdFor: Record<PageKey, string> = {
  home: safeJsonLd,
  dashboard: safeDashboardJsonLd,
  cv: safeCvJsonLd
}

/** React 19 native metadata, rendered into the document head during the build. */
export default function Seo({ page = 'home' }: { page?: PageKey }) {
  const meta = pages[page]
  const url = siteUrl + meta.path
  const json = jsonLdFor[page]

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="author" content="Sambit Swain" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="theme-color" content="#060606" />
      <link rel="canonical" href={url} />
      {/* Page-relative so they resolve at any base (GitHub Pages project path,
          preview hosts, localhost) — canonicals and structured data stay absolute. */}
      <link rel="icon" type="image/svg+xml" href={`${meta.prefix}favicon.svg`} />
      <link rel="icon" type="image/png" sizes="512x512" href={`${meta.prefix}logo.png`} />
      <link rel="apple-touch-icon" href={`${meta.prefix}logo.png`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Sambit Swain — Portfolio" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:image" content={`${siteUrl}sambit-swain.jpg`} />
      <meta property="og:image:width" content="1087" />
      <meta property="og:image:height" content="1446" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta
        property="og:image:alt"
        content="Sambit Swain, a cloud and full-stack developer and computer science student"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={`${siteUrl}sambit-swain.jpg`} />
      <meta name="twitter:image:alt" content="Sambit Swain - Cloud & Full-stack Developer" />
      {import.meta.env.VITE_GOOGLE_SITE_VERIFICATION && (
        <meta name="google-site-verification" content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
    </>
  )
}
