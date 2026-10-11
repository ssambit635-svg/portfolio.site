import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const home = await readFile('dist/index.html', 'utf8')
const dashboard = await readFile('dist/dashboard/index.html', 'utf8')

for (const [name, html] of [['Homepage', home], ['Dashboard', dashboard]]) {
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${name} should have one H1`)
  assert.equal((html.match(/<title>/g) || []).length, 1, `${name} should have one title`)
  assert.match(html, /<html lang="en">/)
  assert.doesNotMatch(html, /noindex/i)
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1]
  assert.ok(canonical && new URL(canonical), `${name} canonical must be absolute`)
}

assert.match(home, /Sambit Swain \| Software Developer Portfolio/)
assert.match(home, /I ship full-stack products and the infrastructure/)
assert.match(home, /property="og:image" content="https:\/\/ssambit635-svg\.github\.io\/portfolio\.site\/sambit-swain\.jpg"/)
assert.match(home, /name="twitter:card" content="summary_large_image"/)
for (const id of ['home', 'works', 'certified', 'about', 'contact', 'project-annadata-connect', 'project-shadow-quest']) {
  assert.ok(home.includes(`id="${id}"`), `Missing page target #${id}`)
}
for (const match of home.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(home.includes(`id="${match[1]}"`), `Broken in-page link: #${match[1]}`)
}
assert.match(home, /class="skip-link"[^>]*href="#works"/)
assert.equal((home.match(/id="project-/g) || []).length, 8, 'All projects should be anchored')
assert.match(home, /procurement centres with live queue tokens/)
assert.match(home, /samurai-inspired focus app/)
assert.match(home, /href="dashboard\/"/)

const canonical = home.match(/rel="canonical" href="([^"]+)"/)?.[1]
const data = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null')
assert.equal(data['@graph'][0].name, 'Sambit Swain')
assert.equal(data['@graph'][0].url, canonical)
assert.match(home, /rel="apple-touch-icon"[^>]*logo\.png/)

assert.match(dashboard, /Certificates &amp; achievements \| Sambit Swain/)
assert.match(dashboard, /Docker Basics/)
assert.match(dashboard, /Smart India Hackathon 2026/)
assert.equal((dashboard.match(/class="group flex aspect-square/g) || []).length, 7)

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
assert.equal((sitemap.match(/<loc>/g) || []).length, 2)
assert.ok(sitemap.includes(`<loc>${canonical}</loc>`))
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${canonical}sitemap.xml`))

const assetFiles = await readdir('dist/assets')
const cssFiles = assetFiles.filter((file) => file.endsWith('.css'))
assert.ok(cssFiles.length)
const bundledCss = (await Promise.all(cssFiles.map((file) => readFile(`dist/assets/${file}`, 'utf8')))).join('\n')
assert.match(bundledCss, /prefers-reduced-motion:reduce/)
