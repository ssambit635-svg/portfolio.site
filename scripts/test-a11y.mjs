// Accessibility assertions: run axe-core against the built pages in a real
// browser. Fails on any WCAG 2.x A/AA violation on either page at a desktop and
// a phone width.
//
// Browser: set CHROME_PATH to a Chrome/Chromium binary, or run
// `npx playwright install chromium` once and leave CHROME_PATH unset.

import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { chromium } from 'playwright-core'

const root = fileURLToPath(new URL('../dist/', import.meta.url))
const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const pages = ['/', '/dashboard/']
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 }
]
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.woff2': 'font/woff2' }

function serve() {
  return new Promise(resolve => {
    const server = createServer((req, res) => {
      let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
      let file = join(root, path)
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
      if (!existsSync(file)) { res.writeHead(404); res.end(); return }
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
      createReadStream(file).pipe(res)
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

if (!existsSync(join(root, 'index.html'))) {
  console.error('test:a11y: dist/ is missing. Run `npm run build` first.')
  process.exit(1)
}

const server = await serve()
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox']
})

const failures = []
let checks = 0
try {
  for (const viewport of viewports) {
    for (const path of pages) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' })
      const page = await context.newPage()
      await page.goto(base + path, { waitUntil: 'load' })
      await page.waitForTimeout(1500)
      await page.addScriptTag({ content: axeSource })
      const result = await page.evaluate(async () => {
        return await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
      })
      checks++
      for (const v of result.violations) {
        failures.push(`${viewport.name} ${path} — ${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 4).map(n => `${n.target.join(' ')}  [${(n.failureSummary ?? '').split('\n').slice(1, 2).join(' ').trim()}]`).join('\n    ')}`)
      }
      console.log(`  ${result.violations.length === 0 ? 'ok  ' : 'FAIL'} ${viewport.name.padEnd(7)} ${path.padEnd(12)} ${result.violations.length} violation(s), ${result.passes.length} rules passed`)
      await context.close()
    }
  }
} finally {
  await browser.close()
  server.close()
}

if (failures.length) {
  console.error(`\naxe found ${failures.length} violation(s):\n${failures.join('\n')}`)
  process.exit(1)
}
console.log(`\nAccessibility: ${checks} page audits passed (WCAG 2.x A/AA).`)
