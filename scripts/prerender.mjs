import { build } from 'vite'
import { readFile, readdir, writeFile, cp, rm } from 'node:fs/promises'

/**
 * The entry sequence rasterises the name into a canvas atlas, so the display
 * face has to be on the canvas before the first frame is measured. Vite hashes
 * the font files, so find them rather than guessing a path — a preload starts
 * the fetch alongside the stylesheet instead of after it.
 */
async function fontPreloadHead() {
  const files = await readdir('dist/assets')
  const needed = ['big-shoulders-display-latin-500-normal', 'chakra-petch-latin-500-normal']
  const links = needed
    .map((stem) => files.find((file) => file.startsWith(stem) && file.endsWith('.woff2')))
    .filter(Boolean)
    .map((file) => `<link rel="preload" href="./assets/${file}" as="font" type="font/woff2" crossorigin />`)
  return links.length ? `${links.join('')}` : ''
}

// Render the actual React page, not a separate SEO-only copy. No server at runtime.
try {
  await build({ build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', ssrEmitAssets: true }, ssr: { noExternal: ['gsap'] } })
  const { render, siteUrl } = await import('../dist-ssr/entry-server.js')
  const { head, body } = render()
  const template = await readFile('dist/index.html', 'utf8')
  const preload = await fontPreloadHead()
  await writeFile('dist/index.html', template.replace('<!--seo-head-->', `${preload}${head}`).replace('<div id="root"></div>', `<div id="root">${body}</div>`))
  await cp('dist-ssr/assets', 'dist/assets', { recursive: true })
  const xml = siteUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${xml}</loc></url></urlset>\n`)
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`)
  console.log(`Prerendered portfolio and crawl files for ${siteUrl}`)
} finally {
  await rm('dist-ssr', { recursive: true, force: true })
}
