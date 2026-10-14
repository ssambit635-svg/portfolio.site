import { credentials, profile } from './site'

// VITE_SITE_URL must include the deployment subpath, if any.
const configured = import.meta.env.VITE_SITE_URL || profile.site
const parsed = new URL(configured)
if (!['https:', 'http:'].includes(parsed.protocol) || parsed.search || parsed.hash || parsed.username || parsed.password) {
  throw new Error('VITE_SITE_URL must be an absolute HTTP(S) URL without credentials, query or fragment')
}
export const siteUrl = `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}/`

export type PageKey = 'home' | 'dashboard'

export type PageMeta = {
  /** path relative to siteUrl, '' for the homepage */
  path: string
  /** relative path back to the site root, for page-relative asset links */
  prefix: string
  title: string
  description: string
}

/**
 * Both pages are real files in the build (index.html and dashboard/index.html),
 * so links between them stay relative and work under any base path.
 */
export const pages: Record<PageKey, PageMeta> = {
  home: {
    path: '',
    prefix: '',
    title: 'Sambit Swain | Cloud & Full-stack Developer',
    description:
      'Sambit Swain is a B.Tech Computer Science student and cloud & full-stack developer in Berhampur, India. Explore web apps, cloud experiments and hackathon projects.'
  },
  dashboard: {
    path: 'dashboard/',
    prefix: '../',
    title: 'Certificates & achievements | Sambit Swain',
    description:
      'Course certificates and achievements from Sambit Swain — AWS, Cisco NetAcad, Simplilearn, ExcelR and the hackathon builds behind them.'
  }
}

export const pageUrl = (page: PageKey) => siteUrl + pages[page].path

/** Relative link used by the landing page's "more" button. */
export const dashboardHref = pages.dashboard.path

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person', '@id': `${siteUrl}#person`,
      name: profile.name, url: siteUrl, jobTitle: profile.role,
      description: pages.home.description, image: `${siteUrl}sambit-swain.jpg`,
      sameAs: [profile.github, profile.linkedin, profile.x, profile.hashnode, profile.avely]
    },
    {
      '@type': 'WebSite', '@id': `${siteUrl}#website`,
      name: 'Sambit Swain — Portfolio', url: siteUrl, description: pages.home.description,
      // The site's own logo icon — this is what Google Search pulls for the
      // site-name result / knowledge card.
      logo: `${siteUrl}logo.png`,
      inLanguage: 'en', publisher: { '@id': `${siteUrl}#person` }
    }
  ]
}

export const dashboardStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person', '@id': `${siteUrl}#person`,
      name: profile.name, url: siteUrl, jobTitle: profile.role,
      image: `${siteUrl}sambit-swain.jpg`
    },
    {
      '@type': 'CollectionPage', '@id': `${siteUrl}dashboard/#page`,
      name: 'Certificates and achievements', url: pageUrl('dashboard'),
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': `${siteUrl}#person` },
      inLanguage: 'en',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: credentials.length,
        itemListElement: credentials.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${c.issuer} — ${c.title}`
        }))
      }
    }
  ]
}

const safe = (data: unknown) =>
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

// Never let profile data terminate the JSON-LD script element.
export const safeJsonLd = safe(structuredData)
export const safeDashboardJsonLd = safe(dashboardStructuredData)
