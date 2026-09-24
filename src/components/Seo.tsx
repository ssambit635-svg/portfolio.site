import { description, safeJsonLd, siteUrl, title } from '../lib/seo'

/** React 19 native metadata, rendered into the document head during the build. */
export default function Seo() {
  return <>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="author" content="Sambit Swain" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#060606" />
    <link rel="canonical" href={siteUrl} />
    <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sambit Swain — Portfolio" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={siteUrl} />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:image" content={`${siteUrl}portrait.png`} />
    <meta property="og:image:width" content="720" />
    <meta property="og:image:height" content="1024" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="Sambit Swain - Software Developer" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={`${siteUrl}portrait.png`} />
    <meta name="twitter:image:alt" content="Sambit Swain - Software Developer" />
    {import.meta.env.VITE_GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION} />}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd }} />
  </>
}
