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

assert.match(home, /Sambit Swain \| Cloud &amp; Full-stack Developer/)
/* The hero copy is laid on the panel's cylinder, so every word is its own inline-block.
   Pin the text of the two elements instead of their raw adjacency: still real, crawlable
   copy in the prerendered HTML, still nothing hiding behind an image. */
const visible = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const heroLabel = home.match(/<p class="hero-screen-label">([\s\S]*?)<\/p>/)?.[1] ?? ''
const heroTitle = home.match(/<h1 class="hero-screen-title">([\s\S]*?)<\/h1>/)?.[1] ?? ''
assert.equal(visible(heroLabel), 'CLOUD · FULL-STACK · CSE ’29')
assert.equal(visible(heroTitle), 'From code to cloud. From pixels to production.')
assert.equal((heroTitle.match(/class="hero-line"/g) || []).length, 2, 'the hero title should stay two lines')
assert.equal((heroTitle.match(/class="hero-word"/g) || []).length, 8, 'every word of the headline should be on the arc')
// The discarded clock should not return in the rendered hero.
assert.doesNotMatch(home, /desk-clock|dc-physical/)
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
const bundle = (glob) =>
  Promise.all(assetFiles.filter(glob).map((file) => readFile(`dist/assets/${file}`, 'utf8'))).then(parts => parts.join('\n'))
const bundledCss = await bundle((file) => file.endsWith('.css'))
const bundledJs = await bundle((file) => file.endsWith('.js') && !file.startsWith('entry-server'))
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
   keyboard. He is a live layer, so the checks are about alignment and honesty: he has
   to be in the rendered HTML at the measured spot, clickable only where he is, and
   drawn with blend modes rather than a plate over his face. */
assert.match(home, /class="emo"[^>]*data-face="curious"/, 'Emo should be in the rendered hero, not only after hydration')
assert.ok(home.indexOf('class="emo"') > home.indexOf('class="hero-screen"'), 'Emo should be layered after the monitor screen')
assert.match(home, /--emo-box-x:\s*\d+(?:\.\d+)?%/, 'Emo should sit on geometry measured from the photo')
assert.match(home, /--emo-eye-peak:\s*rgb\(/, 'his eyes should be his own measured colours, not a palette guess')
assert.match(home, /<span class="emo-clip emo-a"[^>]*aria-hidden="true"/, 'the erase layer is decoration, not content')
assert.match(home, /class="emo-hit"[^>]*aria-label="[^"]*Emo[^"]*"/, 'his tap target should say who it is')
// He is spoken, not captioned: the two pill switches and the caption chip are gone, and
// the one line he keeps is a live region that only becomes visible text when the browser
// cannot talk. Nothing here may put a box of UI over the photograph by default.
assert.doesNotMatch(bundledCss, /\.emo-senses|\.emo-chip|\.emo-hint|emo-chip\[/, 'the mic and tilt switches were removed — no chip should come back')
assert.match(bundledCss, /\.emo-line\{[^}]*clip-path:inset\(50%\)/, 'his line should be said, not stuck on the photo')
assert.match(bundledCss, /\.emo-line:empty\{display:none\}/, 'an empty caption chip is an empty box on the desk')
assert.match(bundledCss, /\[data-talk=text\] \.emo-line|\[data-talk=.text.\] \.emo-line/, 'with no speech engine the words have to be readable')
// His voice is a formant-babble synthesiser on WebAudio (src/lib/emoVoice.ts): the OS
// speech engine is deliberately gone — it was never him, and embedded browsers ship
// without it — but the rule the old checks guarded still stands: every sound he makes
// is oscillators and filters built at runtime, never a fetched or decoded asset.
assert.match(bundledJs, /AudioContext/, 'his voice should be synthesised live, not an audio file')
assert.match(bundledJs, /bandpass/, 'his voice should be his own formant babble, not a sample')
assert.match(bundledJs, /emo-muted/, 'escape has to hush him for the rest of the visit')
assert.doesNotMatch(bundledJs, /new Audio\(|\.mp3|data:audio/, 'nothing should be fetched or decoded to hear him')
assert.match(home, /role="status"[^>]*aria-live="polite"/, 'only his functional states should be announced')
assert.match(bundledCss, /\.emo\{[^}]*pointer-events:none/, 'Emo must not swallow clicks meant for the hero')
assert.match(bundledCss, /\.emo\{[^}]*font-size:1cqw/, 'Emo should scale with the photo he is painted on, not the viewport')
assert.match(bundledCss, /\.emo-hit\{[^}]*pointer-events:auto/, 'his tap target should be the one clickable thing in the hero')
// His face is two blend layers, and nothing else. A plate, a patch or a rectangle of
// "matching" dark glass is how he ends up looking like a second display on his head.
assert.match(bundledCss, /\.emo-clip\{[^}]*mix-blend-mode:darken/, 'his paint should be erased by clipping light, not by covering it')
assert.match(bundledCss, /\.emo-glow\{[^}]*mix-blend-mode:screen/, 'his glow should be added as light')
assert.match(bundledCss, /\.emo-orb\{[^}]*mix-blend-mode:screen/, 'his eyes should be added as light')
// Being poked roughly is a wince — not a wider surprise: the eyes squeeze flat and pinch
// toward the nose, using the same three measured layers (no chip, no pin).
assert.match(bundledCss, /\[data-face=pain\] \.emo-orb\{[^}]*--emo-face-sy: -\.6\d/, 'rapid tapping should squeeze his eyes shut, not just widen them')
assert.match(bundledCss, /\.emo-orb\{[^}]*var\(--emo-face-x[,)]/, 'the squeeze has to pull both eyes inward, toward the nose')
// And the wince says it out loud like everything else does: the line is written, then read.
assert.match(bundledJs, /that hurts/, 'the wince needs its line')
// The whole reason he looked like an overlay: any ancestor that forms a stacking context
// turns into a blend container, and the blending stops reaching the photograph.
const emoBlock = bundledCss.slice(bundledCss.indexOf('.emo{'), bundledCss.indexOf('.emo[data-off'))
assert.doesNotMatch(emoBlock, /z-index|opacity|filter|transform|animation|will-change|contain|isolation|perspective|backdrop-filter|mix-blend-mode/, 'nothing between his blend layers and the photo may form a blend container, or the blending stops reaching the photograph')
const emoHome = home.slice(home.indexOf('class="emo"'), home.indexOf('class="emo-hit"'))
assert.match(emoHome, /emo-clip emo-a[\s\S]*emo-clip emo-b[\s\S]*emo-glow emo-a[\s\S]*emo-glow emo-b[\s\S]*emo-orb emo-orb-a[\s\S]*emo-orb emo-orb-b/, 'paint order is blend order: both clips, then both halos, then both eyes')
assert.doesNotMatch(bundledCss, /emo-visor|\.emo-plate/, 'there should be no plate, and no overlay image, on his face')
// And nothing about him is drawn on hover: no ring, no box, no highlight.
assert.doesNotMatch(bundledCss, /\.emo-hit:hover|\.emo-hit:after/, 'hovering him should not draw a box around his head')
assert.match(bundledCss, /\.emo-hit:focus-visible\{outline/, 'the keyboard path to him still needs a focus ring')
assert.match(bundledCss, /@media\(prefers-reduced-motion:reduce\)\{[^@]*\.emo-glow/, 'reduced motion should still leave Emo his face, minus the twitching')
// And the geometry in the bundle must still be what the photo says it is.
execFileSync(process.execPath, ['scripts/emo-geometry.mjs', '--check'], { stdio: 'inherit' })
