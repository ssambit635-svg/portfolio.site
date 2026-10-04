import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'

const html = await readFile('dist/index.html', 'utf8')
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Homepage should have one H1')
assert.equal((html.match(/<title>/g) || []).length, 1, 'Homepage should have one title')
assert.match(html, /Sambit Swain \| Software Developer Portfolio/)
assert.match(html, /<html lang="en">/)
assert.match(html, /property="og:image" content="https:\/\/ssambit635-svg\.github\.io\/portfolio\.site\/sambit-swain\.jpg"/)
assert.match(html, /name="twitter:card" content="summary_large_image"/)
assert.doesNotMatch(html, /portrait\.png|noindex|<!--seo-head-->/)

const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1]
assert.ok(canonical && new URL(canonical), 'Canonical must be an absolute URL')
assert.ok(canonical.endsWith('/'))

const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null')
assert.equal(data['@graph'][0].name, 'Sambit Swain')
assert.equal(data['@graph'][0].url, canonical)
assert.equal(data['@graph'][0].image, `${canonical}sambit-swain.jpg`)
assert.equal(data['@graph'][1].publisher['@id'], data['@graph'][0]['@id'])

for (const id of ['top', 'about', 'work', 'contact', 'main-content', 'project-annadata-connect', 'project-shadow-quest']) {
  assert.ok(html.includes(`id="${id}"`), `Missing page target #${id}`)
}
assert.match(html, /href="#main-content"[^>]*class="skip-link"/)
assert.equal((html.match(/id="project-/g) || []).length, 8, 'All eight project cards should render')
assert.equal((html.match(/aria-label="Technologies used for /g) || []).length, 8, 'Every project should expose its stack')
assert.equal((html.match(/aria-label="View source code for /g) || []).length, 5, 'Repository links should be present where configured')
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(html.includes(`id="${match[1]}"`), `Broken in-page link: #${match[1]}`)
}
assert.match(html, /B\.Tech Computer Science student at NIST University/)
assert.match(html, /procurement centres with live queue tokens/)
assert.match(html, /samurai-inspired focus app/)
assert.match(html, /Projects listed/)
assert.match(html, /aria-pressed="false"/)

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
assert.equal((sitemap.match(/<loc>/g) || []).length, 1)
assert.ok(sitemap.includes(`<loc>${canonical}</loc>`))
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${canonical}sitemap.xml`))

const assetFiles = await readdir('dist/assets')
const jsFile = assetFiles.find((file) => file.endsWith('.js'))
const cssFile = assetFiles.find((file) => file.endsWith('.css'))
assert.ok(jsFile && cssFile, 'Production JavaScript and CSS bundles should exist')
const js = await readFile(`dist/assets/${jsFile}`, 'utf8')
const css = await readFile(`dist/assets/${cssFile}`, 'utf8')
assert.match(js, /SIGNING IN/, 'Player-card entry sequence should be in the client bundle')
assert.match(js, /The portrait, local type and one hand-signed card/)
assert.match(js, /Skip intro/, 'The entry sequence needs a keyboard-reachable way out')
assert.match(css, /boot__sign-name/, 'Signature strip styling should be bundled')
assert.match(css, /Mrs Saint Delafield/, 'The handwriting face should be bundled with the loader')
assert.match(css, /prefers-reduced-motion:reduce/, 'Reduced-motion styles should be present')
for (const match of html.matchAll(/(?:src|href)="\.\/(assets\/[^"#]+)"/g)) await access(`dist/${match[1]}`)
await access('dist/favicon.svg')
await access('dist/sambit-swain.jpg')
console.log('Site checks passed: content, landmarks, anchors, project links/stacks, metadata, JSON-LD, loader bundles, reduced motion, social image and crawl files.')
