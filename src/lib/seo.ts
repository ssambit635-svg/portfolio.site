import { profile } from './site'

// VITE_SITE_URL must include the deployment subpath, if any.
const configured = import.meta.env.VITE_SITE_URL || profile.site
const parsed = new URL(configured)
if (!['https:', 'http:'].includes(parsed.protocol) || parsed.search || parsed.hash || parsed.username || parsed.password) {
  throw new Error('VITE_SITE_URL must be an absolute HTTP(S) URL without credentials, query or fragment')
}
export const siteUrl = `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}/`
export const title = 'Sambit Swain | Software Developer Portfolio'
export const description = 'Meet Sambit Swain, a Software Developer exploring web development and cloud technology. Discover software projects, hackathon builds and ways to connect.'
export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person', '@id': `${siteUrl}#person`,
      name: profile.name, url: siteUrl, jobTitle: profile.role,
      description, image: `${siteUrl}portrait.png`,
      sameAs: [profile.github, profile.linkedin, profile.x, profile.hashnode, profile.avely]
    },
    {
      '@type': 'WebSite', '@id': `${siteUrl}#website`,
      name: 'Sambit Swain — Portfolio', url: siteUrl, description,
      inLanguage: 'en', publisher: { '@id': `${siteUrl}#person` }
    }
  ]
}
// Never let profile data terminate the JSON-LD script element.
export const safeJsonLd = JSON.stringify(structuredData).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
