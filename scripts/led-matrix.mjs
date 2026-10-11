import { Resvg } from '@resvg/resvg-js'
import { PNG } from 'pngjs'
import { siGithub, siX } from 'simple-icons'
import { writeFile } from 'node:fs/promises'

/**
 * Rasterises brand marks into LED dot-matrix bitmaps for the pegboard contact
 * strip. X + GitHub use official simple-icons paths — GitHub's ships as a
 * circle-badge with the octocat as negative space, so we subtract the badge
 * fill from its disc to recover the solid official silhouette. LinkedIn
 * (dropped from simple-icons) and the mail envelope are drawn here as
 * official-style glyphs. Run: node scripts/led-matrix.mjs
 */
const SCALE = 8
const filled = (d, i) => d[i] > 128 && d[i + 3] > 128

const render = (svg, cols) => {
  const res = new Resvg(svg, { fitTo: { mode: 'width', value: cols * SCALE } })
  return PNG.sync.read(Buffer.from(res.render().asPng()))
}

function samplePng(png, cols, rows, threshold) {
  const cw = png.width / cols, ch = png.height / rows
  const grid = []
  for (let r = 0; r < rows; r++) {
    let row = ''
    for (let c = 0; c < cols; c++) {
      let on = 0, tot = 0
      for (let y = Math.floor(r * ch); y < (r + 1) * ch; y += 2) {
        for (let x = Math.floor(c * cw); x < (c + 1) * cw; x += 2) {
          on += filled(png.data, (png.width * y + x) << 2) ? 1 : 0
          tot++
        }
      }
      row += on / tot > threshold ? '1' : '0'
    }
    grid.push(row)
  }
  return grid
}

const wrap = (inner, vb = '0 0 24 24') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`

const COLS = 14

// The official X mark's double strokes alias below ~20px, so render its
// silhouette as bold strokes — the shape an LED matrix can actually hold.
const xBits = samplePng(
  render(wrap(`<path d="M3.2 2.2L20.8 21.8M20.8 2.2L3.2 21.8" stroke="#fff" stroke-width="4.8" stroke-linecap="square"/>`), COLS),
  COLS,
  14,
  0.3,
)

// GitHub: disc minus badge-fill = solid octocat silhouette
const disc = samplePng(render(wrap(`<circle cx="12" cy="12" r="11.85" fill="#fff"/>`), COLS), COLS, 14, 0.35)
const badge = samplePng(render(wrap(`<path d="${siGithub.path}" fill="#fff"/>`), COLS), COLS, 14, 0.35)
const githubBits = disc.map((row, r) =>
  row.split('').map((ch, c) => (ch === '1' && badge[r][c] === '0' ? '1' : '0')).join(''),
)

const linkedinBits = samplePng(
  render(
    wrap(
      `<rect width="24" height="24" rx="4" fill="#fff"/><g fill="#000"><rect x="6" y="5" width="2.4" height="2.4"/><rect x="6" y="9" width="2.4" height="10"/><path d="M11 9h2.3v1.4c.5-.9 1.6-1.6 3.2-1.6 2.4 0 3.5 1.4 3.5 4.2V19h-2.4v-5.6c0-1.6-.6-2.4-1.9-2.4-1.4 0-2.3 1-2.3 2.4V19H11z"/></g>`,
    ),
    COLS,
  ),
  COLS,
  14,
  0.35,
)

const mailBits = samplePng(
  render(
    wrap(
      `<rect x="1.5" y="2.5" width="21" height="15" rx="2" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M2.5 3.5l9.5 7.5 9.5-7.5" fill="none" stroke="#fff" stroke-width="2.2"/>`,
      '0 0 24 20',
    ),
    COLS,
  ),
  COLS,
  10,
  0.3,
)

const logos = { x: xBits, github: githubBits, linkedin: linkedinBits, mail: mailBits }

// tidy: attach floating ear-tip row to the head, square off the envelope base
{
  const g = logos.github
  const head = g.findIndex((r) => (r.match(/1/g) || []).length >= 4)
  if (head > 1) {
    const ears = g[0]
    g[head - 1] = g[head - 1].split('').map((ch, c) => (ch === '1' || ears[c] === '1' ? '1' : '0')).join('')
    g[0] = '0'.repeat(14)
  }
  logos.mail[9] = '1'.repeat(14)
}

for (const [name, rows] of Object.entries(logos)) {
  console.log('== ' + name)
  rows.forEach((r) => console.log(r.replace(/0/g, '.').replace(/1/g, 'O')))
}

const ts = `/** Brand marks rasterised to LED dot-matrix by scripts/led-matrix.mjs (X + GitHub: official simple-icons paths) */\nexport const ledLogos = ${JSON.stringify(logos, null, 2)}\n`
await writeFile(new URL('../src/lib/ledLogos.ts', import.meta.url), ts)
console.log('Wrote src/lib/ledLogos.ts')
