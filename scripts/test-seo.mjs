import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
const html = await readFile('dist/index.html', 'utf8')
assert.equal((html.match(/<h1\b/g) || []).length, 1)
assert.equal((html.match(/<title>/g) || []).length, 1)
assert.match(html, /Sambit Swain \| Software Developer Portfolio/)
assert.match(html, /<html lang="en">/)
assert.doesNotMatch(html, /noindex|<!--seo-head-->/)
const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1]
assert.ok(canonical && new URL(canonical))
assert.ok(canonical.endsWith('/'))
const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])
assert.equal(data['@graph'][0].name, 'Sambit Swain')
assert.equal(data['@graph'][0].url, canonical)
assert.equal(data['@graph'][1].publisher['@id'], data['@graph'][0]['@id'])
for (const id of ['about', 'work', 'contact', 'project-annadata-connect', 'project-shadow-quest']) assert.ok(html.includes(`id="${id}"`))
assert.equal((html.match(/id="project-/g) || []).length, 8)
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(html.includes(`id="${match[1]}"`), `Broken section link: ${match[1]}`)
}
assert.match(html, /farmer procurement platform/)
assert.match(html, /samurai-themed deep-work OS/)
assert.equal((await readFile('dist/sitemap.xml', 'utf8')).match(/<loc>/g).length, 1)
assert.ok((await readFile('dist/sitemap.xml', 'utf8')).includes(`<loc>${canonical}</loc>`))
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${canonical}sitemap.xml`))
for (const m of html.matchAll(/(?:src|href)="\.\/(assets\/[^"#]+)"/g)) await access(`dist/${m[1]}`)
await access('dist/favicon.svg')
console.log('SEO checks passed: static content, headings, metadata, canonical, JSON-LD, sitemap, robots and bundled assets.')
