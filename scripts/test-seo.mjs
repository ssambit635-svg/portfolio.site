import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'

const home = await readFile('dist/index.html', 'utf8')
const dashboard = await readFile('dist/dashboard/index.html', 'utf8')

/* ------------------------------------------------------------------ home */
assert.equal((home.match(/<h1\b/g) || []).length, 1, 'Homepage should have one H1')
assert.equal((home.match(/<title>/g) || []).length, 1, 'Homepage should have one title')
assert.match(home, /Sambit Swain \| Software Developer Portfolio/)
assert.match(home, /<html lang="en">/)
assert.match(home, /property="og:image" content="https:\/\/ssambit635-svg\.github\.io\/portfolio\.site\/sambit-swain\.jpg"/)
assert.match(home, /name="twitter:card" content="summary_large_image"/)
for (const bad of ['portrait.png', 'noindex', '<!--seo-head-->', 'scr-slot', 'Scramble']) {
  assert.doesNotMatch(home, new RegExp(bad, 'i'), `Homepage should not contain ${bad}`)
}

const canonical = home.match(/rel="canonical" href="([^"]+)"/)?.[1]
assert.ok(canonical && new URL(canonical), 'Canonical must be an absolute URL')
assert.ok(canonical.endsWith('/'))
assert.equal(
  (home.match(/rel="canonical"/g) || []).length,
  1,
  'Homepage should declare exactly one canonical'
)

const data = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null')
assert.equal(data['@graph'][0].name, 'Sambit Swain')
assert.equal(data['@graph'][0].url, canonical)
assert.equal(data['@graph'][0].image, `${canonical}sambit-swain.jpg`)
assert.equal(data['@graph'][1].publisher['@id'], data['@graph'][0]['@id'])
assert.equal(data['@graph'][1].logo, `${canonical}logo.png`, 'WebSite JSON-LD must expose the site logo for Google Search')
assert.match(home, /rel="apple-touch-icon"[^>]*href="[^"]*logo\.png"/, 'The logo must be linked as a touch icon')

for (const id of ['top', 'about', 'work', 'systems', 'toolbox', 'learning', 'contact', 'main-content', 'project-annadata-connect', 'project-shadow-quest']) {
  assert.ok(home.includes(`id="${id}"`), `Missing page target #${id}`)
}
assert.match(home, /href="#main-content"[^>]*class="skip-link"/)
assert.equal((home.match(/id="project-/g) || []).length, 7, 'All seven listed projects should be anchored')
assert.equal((home.match(/aria-label="Technologies used for /g) || []).length, 7, 'Every project should expose its stack')
assert.equal((home.match(/aria-label="View source code for /g) || []).length, 5, 'Repository links should be present where configured')

// every in-page anchor resolves to a real element
for (const match of home.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(home.includes(`id="${match[1]}"`), `Broken in-page link: #${match[1]}`)
}

// real copy, present in the static HTML
assert.match(home, /B\.Tech Computer Science student at NIST University/)
assert.match(home, /procurement centres with live queue tokens/)
assert.match(home, /samurai-inspired focus app/)
assert.match(home, /Certifications/)
assert.match(home, /aria-pressed="false"/, 'The learning list should expose pressable items')

// the certificate wall lives on /dashboard, not on the landing page
assert.match(home, /href="dashboard\/"/, 'The learning section should link to the dashboard')
assert.doesNotMatch(home, /Docker Basics/, 'The new certificate should not be on the landing page')

/* ------------------------------------------------------------- dashboard */
assert.equal((dashboard.match(/<h1\b/g) || []).length, 1, 'Dashboard should have one H1')
assert.equal((dashboard.match(/<title>/g) || []).length, 1, 'Dashboard should have one title')
assert.match(dashboard, /Certificates &amp; achievements \| Sambit Swain/)
assert.match(dashboard, /<html lang="en">/)
for (const bad of ['portrait.png', 'noindex', '<!--seo-head-->', 'scr-slot']) {
  assert.doesNotMatch(dashboard, new RegExp(bad, 'i'), `Dashboard should not contain ${bad}`)
}

const dashCanonical = dashboard.match(/rel="canonical" href="([^"]+)"/)?.[1]
assert.ok(dashCanonical && new URL(dashCanonical), 'Dashboard canonical must be an absolute URL')
assert.equal(dashCanonical, `${canonical}dashboard/`)

const dashData = JSON.parse(dashboard.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? 'null')
assert.equal(dashData['@graph'][0].name, 'Sambit Swain')
assert.equal(dashData['@graph'][1]['@type'], 'CollectionPage')
assert.equal(dashData['@graph'][1].mainEntity.numberOfItems, 7)

// every certificate + achievement is in the static HTML
assert.match(dashboard, /Docker Basics/)
assert.match(dashboard, /learn-docker-basics-free-course-skillup/)
assert.equal((dashboard.match(/class="group flex aspect-square/g) || []).length, 7, 'Seven square certificate tiles should render')
assert.match(dashboard, /Smart India Hackathon 2026/)
assert.equal((dashboard.match(/id="achievements-heading"/g) || []).length, 1)
// links back to the homepage and to the site root assets
assert.match(dashboard, /href="\.\.\/"/, 'The dashboard should link back to the portfolio')
assert.match(dashboard, /href="\.\.\/assets\//, 'Dashboard assets should resolve from the site root')

/* -------------------------------------------------------------- crawl files */
const sitemap = await readFile('dist/sitemap.xml', 'utf8')
assert.equal((sitemap.match(/<loc>/g) || []).length, 2)
assert.ok(sitemap.includes(`<loc>${canonical}</loc>`))
assert.ok(sitemap.includes(`<loc>${canonical}dashboard/</loc>`))
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${canonical}sitemap.xml`))

/* ------------------------------------------------------------------ assets */
const assetFiles = await readdir('dist/assets')
const jsFile = assetFiles.find((file) => file.endsWith('.js'))
const cssFile = assetFiles.find((file) => file.endsWith('.css'))
assert.ok(jsFile && cssFile, 'Production JavaScript and CSS bundles should exist')
const css = await readFile(`dist/assets/${cssFile}`, 'utf8')
assert.match(css, /prefers-reduced-motion:reduce/, 'Reduced-motion styles should be present')

// every local asset referenced by either page exists
for (const page of [
  { html: home, base: 'dist' },
  { html: dashboard, base: 'dist/dashboard' }
]) {
  for (const match of page.html.matchAll(/(?:src|href)="((?:\.\.\/|\.\/)?assets\/[^"#]+)"/g)) {
    await access(`${page.base}/${match[1]}`)
  }
}
await access('dist/favicon.svg')
await access('dist/logo.png')
await access('dist/sambit-swain.jpg')
await access('dist/dashboard/index.html')

console.log('Site checks passed: home + dashboard content, landmarks, anchors, certificates, dashboard routing, metadata, JSON-LD, reduced motion, social image and crawl files.')
