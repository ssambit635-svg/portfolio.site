/**
 * Headless smoke test: bundles the app with esbuild, renders it into jsdom and
 * fails on any console error or thrown exception. Catches broken imports,
 * bad hooks and tree-level crashes without needing a real browser.
 *
 *   node scripts/smoke.mjs
 */
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outfile = resolve(root, 'node_modules/.smoke/app.cjs')

/* --------------------------------------------------------------- jsdom ---- */

const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="root"></div></body></html>`, {
  pretendToBeVisual: true,
  url: 'https://ssambit635-svg.github.io/portfolio.site/'
})

const { window } = dom

window.matchMedia = (query) => ({
  matches: /min-width: 1024px/.test(query) || /hover: hover/.test(query) || /pointer: fine/.test(query),
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false
})

/**
 * IntersectionObserver stub that immediately reports everything as visible so
 * the lazy WebGL sections actually mount and get exercised.
 */
class Observer {
  constructor(callback) {
    this.callback = callback
  }
  observe(target) {
    this.callback([{ isIntersecting: true, target, intersectionRatio: 1 }], this)
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
window.IntersectionObserver = Observer
window.ResizeObserver = Observer
window.PerformanceObserver = Observer

// No WebGL in jsdom: the canvas error boundary should catch this and render
// the static fallback instead of taking the page down.
window.HTMLCanvasElement.prototype.getContext = () => null

window.requestAnimationFrame = (cb) => window.setTimeout(() => cb(performance.now()), 16)
window.cancelAnimationFrame = (id) => window.clearTimeout(id)

const IGNORED = [
  /Not implemented: Window's scrollTo/,
  /Not implemented: window.scrollTo/,
  /Not implemented: HTMLCanvasElement/
]

const errors = []
const originalError = console.error
console.error = (...args) => {
  const message = args.map(String).join(' ')
  if (!IGNORED.some((pattern) => pattern.test(message))) errors.push(message)
  originalError(...args)
}
window.addEventListener('error', (event) => errors.push(`window error: ${event.message}`))
window.addEventListener('unhandledrejection', (event) => errors.push(`unhandled rejection: ${event.reason}`))

for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLCanvasElement',
  'Element',
  'Node',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'IntersectionObserver',
  'ResizeObserver',
  'MutationObserver',
  'matchMedia',
  'localStorage',
  'CustomEvent',
  'Event',
  'DOMRect',
  'Window',
  'Document',
  'HTMLDivElement'
]) {
  if (!(key in window)) continue
  try {
    Object.defineProperty(globalThis, key, { value: window[key], configurable: true, writable: true })
  } catch {
    /* read-only globals (navigator) are fine to skip */
  }
}
globalThis.self = window
globalThis.IS_REACT_ACT_ENVIRONMENT = false

/* -------------------------------------------------------------- bundle ---- */

await build({
  entryPoints: [resolve(root, 'src/main.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  outfile,
  jsx: 'automatic',
  define: { 'import.meta.env.DEV': 'true', 'import.meta.env.PROD': 'false' },
  logLevel: 'error',
  plugins: [
    {
      name: 'asset-stubs',
      setup(build) {
        build.onLoad({ filter: /\.css$/ }, () => ({ contents: 'module.exports = {}', loader: 'js' }))
        build.onLoad({ filter: /\.(glb|jpg|png|woff2?)($|\?)/ }, () => ({
          contents: 'module.exports = "stub-asset"',
          loader: 'js'
        }))
      }
    }
  ]
})

globalThis.process.env.NODE_ENV = 'development'

await import(pathToFileURL(outfile).href)

await new Promise((resolvePromise) => setTimeout(resolvePromise, 4200))

const rootEl = window.document.getElementById('root')
const html = rootEl?.innerHTML ?? ''
const text = (rootEl?.textContent ?? '').replace(/\s+/g, ' ').trim()

const expected = ['Sambit', 'Building calm', 'CivicReport', 'Weather Sense', 'Certificates', 'Python Essentials 1']

const missing = expected.filter((needle) => !text.includes(needle))
const sections = ['hero', 'work', 'about', 'skills', 'certificates', 'process', 'contact'].filter(
  (id) => !window.document.getElementById(id)
)

const report = {
  renderedChars: html.length,
  visibleText: text.length,
  missingSections: sections,
  missingCopy: missing,
  canvases: window.document.querySelectorAll('canvas').length,
  canvasFallbacks: window.document.querySelectorAll('[data-canvas-fallback]').length,
  consoleErrors: errors
}

writeFileSync(resolve(root, 'node_modules/.smoke/report.json'), JSON.stringify(report, null, 2))

originalError('\n--- smoke report ---')
originalError(JSON.stringify(report, null, 2))

if (sections.length || missing.length || errors.length || html.length < 5000) {
  originalError('\nSMOKE TEST FAILED')
  process.exit(1)
}

originalError('\nSMOKE TEST PASSED')
process.exit(0)
