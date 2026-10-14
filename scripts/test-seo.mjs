import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
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
// The hero scene must bleed edge to edge: the frame is sized off the larger of
// "viewport width × the photo ratio" and "viewport height", so a letterbox (the
// black bezels that made the desk look like a photo inside a box) cannot appear.
const heroFrame = bundledCss.match(/\.hero-frame\{[^}]*\}/)?.[0] ?? ''
assert.ok(heroFrame, 'hero scene should ship a .hero-frame rule')
assert.match(heroFrame, /--hero-h:\s*max\(/, 'hero scene should cover the viewport on both axes')
assert.match(heroFrame, /100vw/, 'hero scene should always be at least viewport-wide')
assert.match(heroFrame, /100vh/, 'hero scene should always be at least viewport-tall')
// The surplus is cropped above the monitor, so the desk stays on screen.
assert.match(heroFrame, /top:\s*calc\(\(100vh\s*-\s*var\(--hero-h\)\)\s*\*\s*\.65\)/, 'hero scene should crop mostly above the monitor')

/* Emo — the little robot painted into the hero photo, on the desk left of the
   keyboard. He is a live layer, so the checks are about alignment and honesty:
   he has to be in the rendered HTML at the measured spot, clickable only where he
   is, and silent about anything the page cannot actually do. */
assert.match(home, /class="emo"[^>]*data-face="curious"/, 'Emo should be in the rendered hero, not only after hydration')
assert.ok(home.indexOf('class="emo"') > home.indexOf('class="hero-screen"'), 'Emo should be layered after the monitor screen')
assert.match(home, /--emo-plate-x:\s*\d+(?:\.\d+)?%/, 'Emo should sit on geometry measured from the photo')
assert.match(home, /<span class="emo-plate" aria-hidden="true"/, 'the visor patch is decoration, not content')
assert.match(home, /class="emo-hit"[^>]*aria-label="[^"]*Emo[^"]*"/, 'his tap target should say who it is')
assert.match(home, /class="emo-chip"[^>]*data-live="0"/, 'the microphone starts off and stays opt-in')
assert.match(home, /role="status"[^>]*aria-live="polite"/, 'only his functional states should be announced')
assert.match(bundledCss, /\.emo\{[^}]*pointer-events:none/, 'Emo must not swallow clicks meant for the hero')
assert.match(bundledCss, /\.emo\{[^}]*font-size:1cqw/, 'Emo should scale with the photo he is painted on, not the viewport')
assert.match(bundledCss, /\.emo-hit\{[^}]*pointer-events:auto/, 'his tap target should be the one clickable thing in the hero')
// The patch of glass he is drawn on is his own photo, cut by the generator. It has to
// be referenced relatively: an absolute /assets/… url 404s under the project subpath.
const visor = bundledCss.match(/\.emo-plate\{[^}]*url\(\.\/([^)]*emo-visor[^)]*\.png)\)/)?.[1] ?? ''
assert.ok(visor, "Emo's visor patch should be the background of .emo-plate")
assert.ok(assetFiles.includes(visor), `Emo's visor patch (${visor}) should ship next to the stylesheet`)
assert.match(bundledCss, /@media\(prefers-reduced-motion:reduce\)\{[^@]*\.emo-orb/, 'reduced motion should still leave Emo his face, minus the twitching')
// And the geometry in the bundle must still be what the photo says it is.
execFileSync(process.execPath, ['scripts/emo-geometry.mjs', '--check'], { stdio: 'inherit' })
