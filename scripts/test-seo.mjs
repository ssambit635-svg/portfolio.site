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
assert.match(home, /DEVOPS ENGINEER · CLOUD · DESIGN/)
// The discarded clock should not return in the rendered hero.
assert.doesNotMatch(home, /desk-clock|dc-physical/)
assert.match(home, /<h1 class="hero-screen-title"><span>From code to cloud\.<\/span><span>From pixels to production\.<\/span><\/h1>/)
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
// The landing page's Certified grid shows the same credentials with live links.
assert.equal((home.match(/class="cert-link"/g) || []).length, 7, 'each credential should link to its issuer page')
assert.match(home, /cert-link" href="https:\/\/www\.netacad\.com\/courses\/python-essentials-1"/)

const canonical = home.match(/rel="canonical" href="([^"]+)"/)?.[1]
const data = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null')
assert.equal(data['@graph'][0].name, 'Sambit Swain')
assert.equal(data['@graph'][0].url, canonical)
assert.match(home, /rel="apple-touch-icon"[^>]*logo\.png/)

assert.match(dashboard, /Certificates &amp; achievements \| Sambit Swain/)
assert.match(dashboard, /Docker Basics/)
assert.match(dashboard, /Smart India Hackathon 2026/)
assert.equal((dashboard.match(/class="group /g) || []).length, 7)
assert.doesNotMatch(dashboard, /Scan not added yet/, 'every certificate tile should carry its scan')
assert.match(dashboard, /assets\/docker-basics-[\w-]+\.jpg/, 'the Docker certificate scan should ship')

// Every certificate tile links out to its issuer page, and no placeholder hrefs.
const certLinks = [...dashboard.matchAll(/<a href="(https:\/\/[^"]+)"[^>]*aria-label="([^"]+)"/g)]
assert.equal(certLinks.length, 7, 'each certificate should have an external link')
for (const [, href, label] of certLinks) {
  const url = new URL(href)
  assert.equal(url.protocol, 'https:')
  assert.ok(label.length > 8, `certificate link needs a descriptive label: ${label}`)
}
for (const href of [
  'https://www.simplilearn.com/learn-docker-basics-free-course-skillup',
  'https://www.simplilearn.com/introduction-to-cloud-computing-basics-skillup',
  'https://www.netacad.com/courses/linux-unhatched',
  'https://edl.excelr.com/'
]) {
  assert.ok(dashboard.includes(href), `Missing certificate link: ${href}`)
}
// The landing grid prints each credential's detail, including the SkillUp code.
assert.match(home, /certificate code 10821711/i)

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
assert.equal((sitemap.match(/<loc>/g) || []).length, 2)
assert.ok(sitemap.includes(`<loc>${canonical}</loc>`))
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${canonical}sitemap.xml`))

const assetFiles = await readdir('dist/assets')
const cssFiles = assetFiles.filter((file) => file.endsWith('.css'))
assert.ok(cssFiles.length)
const bundledCss = (await Promise.all(cssFiles.map((file) => readFile(`dist/assets/${file}`, 'utf8')))).join('\n')
assert.match(bundledCss, /prefers-reduced-motion:reduce/)
// The photo must start at the top of the hero, without a letterboxed header.
assert.match(bundledCss, /\.hero-frame\{[^}]*top:0(?:;|\})/, 'hero scene should be top-aligned')
