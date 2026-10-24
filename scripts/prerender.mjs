import { build } from 'vite'
import { readFile, readdir, writeFile, cp, rm } from 'node:fs/promises'

/**
 * The display face (Cormorant Garamond) and the body face (Inter) are on screen at
 * first paint. Preloading them starts the font fetch alongside the stylesheet
 * instead of after it. Vite hashes the font files, so find them rather than guessing
 * a path.
 *
 * `prefix` is the relative path back to the site root for the page being
 * rendered ('' → './', dashboard/ → '../'), so preloads resolve at any base.
 */
async function fontPreloadHead(prefix) {
  const files = await readdir('dist/assets')
  const needed = ['cormorant-garamond-latin-400-normal', 'inter-latin-400-normal']
  const links = needed
    .map((stem) => files.find((file) => file.startsWith(stem) && file.endsWith('.woff2')))
    .filter(Boolean)
    .map((file) => `<link rel="preload" href="${prefix}assets/${file}" as="font" type="font/woff2" crossorigin />`)
  return links.length ? `${links.join('')}` : ''
}

/**
 * The SSR pass resolves asset imports against the site root (`/assets/…`),
 * which 404s under a project subpath such as /portfolio.site/. Rewrite them to
 * the page-relative prefix so the static HTML is self-sufficient with JS off.
 */
const relativise = (html, prefix) =>
  html.replace(/(src|href)="\/(assets\/|sambit-swain\.jpg|favicon\.svg|logo\.png)/g, `$1="${prefix}$2`)

/** Real pages, rendered from the same React tree the browser mounts. No server at runtime. */
const pages = [
  { name: 'home', entry: 'src/entry-server.tsx', outDir: 'dist-ssr-home', bundle: 'entry-server.js', html: 'dist/index.html', prefix: './' },
  { name: 'dashboard', entry: 'src/entry-dashboard.tsx', outDir: 'dist-ssr-dashboard', bundle: 'entry-dashboard.js', html: 'dist/dashboard/index.html', prefix: '../' },
  { name: 'cv', entry: 'src/entry-cv.tsx', outDir: 'dist-ssr-cv', bundle: 'entry-cv.js', html: 'dist/cv/index.html', prefix: '../' }
]

/** Every page that is in the sitemap. Keep in step with `pages` above and in seo.ts. */
const sitemapPaths = ['', 'dashboard/', 'cv/']

let siteUrl = ''
try {
  for (const page of pages) {
    await build({ build: { ssr: page.entry, outDir: page.outDir, ssrEmitAssets: true }, ssr: { noExternal: ['gsap'] } })
    const mod = await import(`../${page.outDir}/${page.bundle}`)
    if (mod.siteUrl) siteUrl = mod.siteUrl
    const { head, body } = mod.render()
    const template = await readFile(page.html, 'utf8')
    const preload = await fontPreloadHead(page.prefix)
    await writeFile(
      page.html,
      template
        .replace('<!--seo-head-->', `${preload}${head}`)
        .replace('<div id="root"></div>', `<div id="root">${relativise(body, page.prefix)}</div>`)
    )
    await cp(`${page.outDir}/assets`, 'dist/assets', { recursive: true })
    console.log(`Prerendered ${page.name} → ${page.html}`)
  }

  const xml = siteUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  await writeFile(
    'dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPaths.map((path) => `<url><loc>${xml}${path}</loc></url>`).join('')}</urlset>\n`
  )
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`)
  console.log(`Prerendered portfolio and crawl files for ${siteUrl}`)
} finally {
  await rm('dist-ssr-home', { recursive: true, force: true })
  await rm('dist-ssr-dashboard', { recursive: true, force: true })
  await rm('dist-ssr-cv', { recursive: true, force: true })
}
