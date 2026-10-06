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
    {/* Page-relative so they resolve at any base (GitHub Pages project path,
        preview hosts, localhost) — the prerendered BASE_URL is root-absolute. */}
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <link rel="icon" type="image/png" sizes="512x512" href="logo.png" />
    <link rel="apple-touch-icon" href="logo.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sambit Swain — Portfolio" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={siteUrl} />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:image" content={`${siteUrl}sambit-swain.jpg`} />
    <meta property="og:image:width" content="1087" />
    <meta property="og:image:height" content="1446" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content="Sambit Swain, software developer and computer science student" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={`${siteUrl}sambit-swain.jpg`} />
    <meta name="twitter:image:alt" content="Sambit Swain - Software Developer" />
    {import.meta.env.VITE_GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION} />}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd }} />
  </>
}
