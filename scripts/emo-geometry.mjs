/**
 * Measures Emo off the hero photo and writes out the numbers the live face is
 * built from — plus the one image it is drawn onto.
 *
 * He is painted into src/assets/hero-monitor.jpg: two cyan squares glowing in the
 * dark glass of his head. A live face has to move, and a moving eye cannot sit on
 * top of a painted one, so the overlay is drawn on a *patch of his own glass* with
 * the paint inpainted out of it — a row-wise line fill that keeps the gradient of
 * the glass and the reflection across it. That means there is no rectangle of the
 * right colour to match and no seam to hide: the patch is his photo, feathered.
 *
 * Two artefacts come out of one measurement, so they can never disagree:
 *   src/lib/emoFace.ts        geometry, in percentages of the photo
 *   src/assets/emo-visor.png  the patch itself
 *
 * Run after any change to the hero photo:  node scripts/emo-geometry.mjs
 *
 * Everything is measured, not hand-picked: the plate, both eye boxes and how far a
 * pupil can travel come from pixel stats on the JPEG. The region is only a starting
 * point, and the script refuses to emit anything if that region stops holding two
 * cyan blobs — so a changed photo fails the build instead of quietly leaving the
 * eyes a few pixels off his face.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { PNG } from 'pngjs'
import jpeg from 'jpeg-js'

const PHOTO = new URL('../src/assets/hero-monitor.jpg', import.meta.url)
const OUT = new URL('../src/lib/emoFace.ts', import.meta.url)
const OUT_PATCH = new URL('../src/assets/emo-visor.png', import.meta.url)

/** Where his face is in the 1376 × 768 photo, as a search window for the glows. */
const BAND = { x: 440, y: 508, w: 104, h: 62 }
/** A pixel belongs to an eye when green/blue run well ahead of red, and it is lit. */
const CORE = (r, g, b) => g - r > 55 && b - r > 55 && g > 90
/** The plate is the dark glass the eyes live in: cores + this much room to roam. */
const MARGIN = { x: 15, y: 13 }
/** Each eye box, grown this far over its bloom, is the paint to remove. */
const ERASE_PAD = 8
/** The patch border is dissolved over this many pixels, so it cannot be seen. */
const FEATHER = 7
/** His shell and headphone cups — the pivot for tilts and the click target. */
const HEAD = { x: 412, y: 476, w: 141, h: 112 }

const { width: SW, height: SH, data } = jpeg.decode(await readFile(PHOTO), { useTArray: true })
const px = (x, y) => {
  const i = (SW * y + x) << 2
  return [data[i], data[i + 1], data[i + 2]]
}

/* ------------------------------ the two glows ----------------------------- */
const marks = []
for (let y = BAND.y; y < BAND.y + BAND.h; y++) {
  for (let x = BAND.x; x < BAND.x + BAND.w; x++) {
    const [r, g, b] = px(x, y)
    if (CORE(r, g, b)) marks.push([x, y])
  }
}
if (marks.length < 120) {
  throw new Error(`emo: only ${marks.length} cyan pixels in the band ${JSON.stringify(BAND)} — Emo's glows are no longer where this script looks. Re-measure the band; never fake the numbers.`)
}
const xs = marks.map(m => m[0])
const lo = Math.min(...xs)
const hi = Math.max(...xs)
let split = lo
let fewest = Infinity
for (let x = lo + 4; x < hi - 4; x++) {
  const n = xs.filter(v => v === x).length
  if (n < fewest) { fewest = n; split = x }
}
const halves = [marks.filter(m => m[0] <= split), marks.filter(m => m[0] > split)]
if (fewest > 6 || halves.some(h => h.length < 40)) {
  throw new Error('emo: could not separate two eye blobs in the band — check the photo')
}
const boxOf = pts => {
  const x = pts.map(p => p[0])
  const y = pts.map(p => p[1])
  return { x0: Math.min(...x), y0: Math.min(...y), x1: Math.max(...x), y1: Math.max(...y) }
}
const boxes = halves.map(boxOf).sort((a, b) => a.x0 - b.x0)

/* ------------------------------- his glass ------------------------------- */
const swatch = []
for (let y = BAND.y; y < BAND.y + BAND.h; y++) {
  for (let x = BAND.x; x < BAND.x + BAND.w; x++) {
    const [r, g, b] = px(x, y)
    if (g - r > 20 || g + b > 150) continue // the glows and the reflection are not glass
    swatch.push([r, g, b])
  }
}
if (swatch.length < 400) throw new Error('emo: no dark glass found in the band — is that still his face?')
const med = i => swatch.map(s => s[i]).sort((a, b) => a - b)[swatch.length >> 1]
const glass = `rgb(${med(0)}, ${med(1)}, ${med(2)})`

/* ------------------------------ the visor patch ---------------------------- */
const GX = Math.min(...boxes.map(b => b.x0)) - MARGIN.x
const GY = Math.min(...boxes.map(b => b.y0)) - MARGIN.y
const GW = Math.max(...boxes.map(b => b.x1)) + MARGIN.x - GX + 1
const GH = Math.max(...boxes.map(b => b.y1)) + MARGIN.y - GY + 1

/**
 * Paint, not glass. Much looser than CORE on purpose: inside an eye box, anything
 * brighter than the dark of his display is glow or highlight, and the halo has to go
 * with the core or it stays behind as a smudge the live eye drags around. His glass
 * itself sits near g=18 here, so 45 is far from any false positive.
 */
const paint = (x, y) => {
  const [r, g] = px(x, y)
  return g > 55 || (g - r > 14 && g > 45)
}
const hole = new Uint8Array(GW * GH)
for (const b of boxes) {
  for (let y = b.y0 - ERASE_PAD; y <= b.y1 + ERASE_PAD; y++) {
    for (let x = b.x0 - ERASE_PAD; x <= b.x1 + ERASE_PAD; x++) {
      if (x < GX || y < GY || x >= GX + GW || y >= GY + GH) continue
      if (paint(x, y)) hole[(y - GY) * GW + (x - GX)] = 1
    }
  }
}
let punched = hole.reduce((a, b) => a + b, 0)
if (punched < 400) throw new Error(`emo: only ${punched} paint pixels found — the eyes are not where the band says they are`)
for (let pass = 0; pass < 1; pass++) {
  const next = Uint8Array.from(hole)
  for (let y = 1; y < GH - 1; y++) {
    for (let x = 1; x < GW - 1; x++) {
      const p = y * GW + x
      if (hole[p]) continue
      if (hole[p - 1] || hole[p + 1] || hole[p - GW] || hole[p + GW]) next[p] = 1
    }
  }
  hole.set(next)
}
/** Line fill across the row, falling back down the column: keeps the glass gradient. */
const patch = Buffer.alloc(GW * GH * 4)
const edge = (x, y, dx, dy) => {
  for (let step = 1; step < GW + GH; step++) {
    const nx = x + dx * step
    const ny = y + dy * step
    if (nx < GX || ny < GY || nx >= GX + GW || ny >= GY + GH) return null
    if (!hole[(ny - GY) * GW + (nx - GX)]) return [nx, ny]
  }
  return null
}
const mix = (a, b, wa, wb) => [0, 1, 2].map(i => (a[i] * wa + b[i] * wb) / (wa + wb))
for (let y = 0; y < GH; y++) {
  for (let x = 0; x < GW; x++) {
    const o = (y * GW + x) * 4
    const src = px(GX + x, GY + y)
    patch[o] = src[0]
    patch[o + 1] = src[1]
    patch[o + 2] = src[2]
    patch[o + 3] = 255
    if (!hole[y * GW + x]) continue
    const left = edge(GX + x, GY + y, -1, 0)
    const right = edge(GX + x, GY + y, 1, 0)
    const up = edge(GX + x, GY + y, 0, -1)
    const down = edge(GX + x, GY + y, 0, 1)
    let filled = null
    if (left && right) filled = mix(px(left[0], left[1]), px(right[0], right[1]), GX + x - left[0], right[0] - GX - x)
    else if (up && down) filled = mix(px(up[0], up[1]), px(down[0], down[1]), GY + y - up[1], down[1] - GY - y)
    else if (left) filled = px(left[0], left[1])
    else if (right) filled = px(right[0], right[1])
    if (filled) {
      // The row neighbours can be lit by the very glow being removed, so the fill is
      // held down to the dark of his glass. Anything brighter there would read as a
      // pale rectangle the moment his live eyes look away.
      const ceiling = [med(0) + 6, med(1) + 6, med(2) + 6]
      patch[o] = Math.min(filled[0], ceiling[0])
      patch[o + 1] = Math.min(filled[1], ceiling[1])
      patch[o + 2] = Math.min(filled[2], ceiling[2])
    }
  }
}
for (let y = 0; y < GH; y++) {
  for (let x = 0; x < GW; x++) {
    const a = Math.max(0, Math.min(1, Math.min(x, y, GW - 1 - x, GH - 1 - y) / FEATHER))
    patch[(y * GW + x) * 4 + 3] = Math.round(a * 255)
  }
}
const png = new PNG({ width: GW, height: GH, colorType: 6, inputHasAlpha: true })
png.data = Buffer.from(patch)
// Prove the erase worked on the way out, not in the browser: after the fill, his
// glass has to be dark again right where each painted eye used to be.
for (const [i, b] of boxes.entries()) {
  let brightest = 0
  for (let y = b.y0; y <= b.y1; y++) {
    for (let x = b.x0; x <= b.x1; x++) {
      const p = ((y - GY) * GW + (x - GX)) * 4
      if (patch[p + 3] < 200) continue // feathered border: transparent, so it never shows
      brightest = Math.max(brightest, patch[p + 1])
    }
  }
  if (brightest > 80) throw new Error(`emo: eye ${i} still reads ${brightest} bright in the patch — the paint was not erased`)
}
const patchOut = PNG.sync.write(png, { colorType: 6, deflateLevel: 9 })

/* ------------------------------- percentages ------------------------------ */
const pct = (v, total) => +((v / total) * 100).toFixed(3)
/** His head is not level in the frame; the eye line gives the tilt the overlay wears. */
const turn = +((Math.atan2((boxes[1].y0 + boxes[1].y1) / 2 - (boxes[0].y0 + boxes[0].y1) / 2, (boxes[1].x0 + boxes[1].x1) / 2 - (boxes[0].x0 + boxes[0].x1) / 2) * 180) / Math.PI).toFixed(2)
const plate = {
  x: pct(GX, SW),
  y: pct(GY, SH),
  w: pct(GW, SW),
  h: pct(GH, SH),
}
const eyes = boxes.map(b => ({
  cx: pct((b.x0 + b.x1) / 2, SW),
  cy: pct((b.y0 + b.y1) / 2, SH),
  w: pct(b.x1 - b.x0 + 1, SW),
  h: pct(b.y1 - b.y0 + 1, SH),
  // A pupil may drift this far and still be covered by the painted glow around it,
  // which is what keeps a live eye from ever showing the edge of its own socket.
  roam: pct(Math.min(b.x1 - b.x0, b.y1 - b.y0) / 2 + ERASE_PAD, SW),
}))
const head = {
  x: pct(HEAD.x, SW),
  y: pct(HEAD.y, SH),
  w: pct(HEAD.w, SW),
  h: pct(HEAD.h, SH),
}

const source = `/**
 * Generated by scripts/emo-geometry.mjs — measured off hero-monitor.jpg, in
 * percentages of the ${SW} × ${SH} photo so the overlay rides the hero crop at every
 * viewport. Do not hand-edit: change the script, or re-run it after the photo.
 */
export const emoFace = {
  photo: { width: ${SW}, height: ${SH} },
  /** His own glass, painted eyes removed — src/assets/emo-visor.png, ${GW}×${GH}. */
  plate: ${JSON.stringify(plate)},
  /** Degrees, measured off the eye line: the overlay wears his head tilt. */
  turn: ${turn},
  /** The dark of his display, sampled from the photo. */
  glass: '${glass}',
  /** His shell + headphone cups — the pivot for tilts, and the click target. */
  head: ${JSON.stringify(head)},
  eyes: [
${eyes.map(e => `    ${JSON.stringify(e)}`).join(',\n')}
  ],
} as const
`

/**
 * `--check` measures everything and writes nothing: the build can then prove the
 * committed geometry is still what the photo says. Without it, a re-cropped hero
 * image would leave Emo's live eyes a few pixels from where his painted ones were.
 */
if (process.argv.includes('--check')) {
  const [committed, committedPatch] = await Promise.all([
    readFile(OUT, 'utf8').catch(() => ''),
    readFile(OUT_PATCH).catch(() => null),
  ])
  if (committed !== source) throw new Error('emo: src/lib/emoFace.ts is stale — run node scripts/emo-geometry.mjs')
  if (!committedPatch || !committedPatch.equals(Buffer.from(patchOut))) {
    throw new Error('emo: src/assets/emo-visor.png is stale — run node scripts/emo-geometry.mjs')
  }
  console.log(`emo: ${marks.length} cyan px, split at x=${split} — geometry and the visor patch still match hero-monitor.jpg`)
} else {
  await writeFile(OUT_PATCH, patchOut)
  await writeFile(OUT, source)
  console.log(`emo: wrote src/lib/emoFace.ts + src/assets/emo-visor.png ← ${marks.length} cyan px, split at x=${split}`)
  console.log(`  plate ${JSON.stringify(plate)}  tilt ${turn}deg  glass ${glass}`)
  console.log(`  patch ${GW}×${GH} at (${GX}, ${GY}), ${punched} paint px removed`)
  for (const [i, e] of eyes.entries()) {
    console.log(`  eye ${i} iris ${e.w}%×${e.h}% at (${e.cx}%, ${e.cy}%) · roam ${e.roam}%`)
  }
}
