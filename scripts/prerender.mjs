import { build } from 'vite'
import { readFile, writeFile, cp, rm } from 'node:fs/promises'

// Render the actual React page, not a separate SEO-only copy. No server at runtime.
try {
  await build({ build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', ssrEmitAssets: true }, ssr: { noExternal: ['gsap'] } })
  const { render, siteUrl } = await import('../dist-ssr/entry-server.js')
  const { head, body } = render()
  const template = await readFile('dist/index.html', 'utf8')
  await writeFile('dist/index.html', template.replace('<!--seo-head-->', head).replace('<div id="root"></div>', `<div id="root">${body}</div>`))
  await cp('dist-ssr/assets', 'dist/assets', { recursive: true })
  const xml = siteUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${xml}</loc></url></urlset>\n`)
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`)
  console.log(`Prerendered portfolio and crawl files for ${siteUrl}`)
} finally {
  await rm('dist-ssr', { recursive: true, force: true })
}
