/**
 * Measures Emo off the hero photo and writes out the numbers the live face is built
 * from: src/lib/emoFace.ts, in percentages of the photo.
 *
 * He is painted into src/assets/hero-monitor.jpg: two cyan glows in the dark glass of
 * his head. A moving eye cannot simply be laid over a painted one, and pasting a
 * rectangle of "matching" dark glass over the pair gives him a second display inside
 * his head. So nothing is painted over him at all. Two blend layers do the work:
 *
 *   darken  clips whatever is brighter than his glass back down to his glass, which
 *           erases the paint where it is, and does literally nothing to pixels that
 *           are already dark. The highlight across his screen survives it.
 *   screen  adds his own measured eye colours back as light, which is how a lit
 *           display behaves on glass — including over that highlight, where it
 *           saturates instead of smearing.
 *
 * Both layers need real numbers, and guessing them is how an overlay ends up looking
 * like an overlay, so every value here is measured: the two cores (cyan pixels in a
 * band over his face, split at the emptiest column), how far each glow's foot
 * reaches, the exact colour of the paint at its hot centre, mid body and halo, and the
 * dark of the glass around each eye. The script then refuses to emit anything if the
 * photo stops matching, so a re-crop moves his eyes or breaks the build.
 *
 * Run after any change to the hero photo:  node scripts/emo-geometry.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import jpeg from 'jpeg-js'

const PHOTO = new URL('../src/assets/hero-monitor.jpg', import.meta.url)
const OUT = new URL('../src/lib/emoFace.ts', import.meta.url)

/** Where his face is in the 1376 × 768 photo, as a search window for the glows. */
const BAND = { x: 440, y: 508, w: 104, h: 62 }
/** The dark glass of his display, measured once and then only trusted. */
const SCREEN = { x: 442, y: 498, w: 102, h: 84 }
/** A pixel is eye paint when green/blue run well ahead of red, and it is lit. */
const CORE = (r, g, b) => g - r > 55 && b - r > 55 && g > 90
/** A pixel is his glass, not paint, when it is barely above the black of the display. */
const GLASS = (g, ceiling) => g <= ceiling
/** How far the erase layer may reach past a core, in px: enough for the halo's foot. */
const FOOT_MAX = 16
/** Travel caps: his display is small, and an eye that crosses it looks like a
 *  screensaver rather than a face. These are ceilings, the geometry is the real limit. */
const ROAM_MAX_X = 10
const ROAM_MAX_Y = 4
/** His shell + headphone cups — the pivot for tilts, and the tap target. */
const HEAD = { x: 412, y: 476, w: 141, h: 112 }

const { width: SW, height: SH, data } = jpeg.decode(await readFile(PHOTO), { useTArray: true })
const px = (x, y) => {
  const i = (SW * y + x) << 2
  return [data[i], data[i + 1], data[i + 2]]
}

const inScreen = (x, y) => x >= SCREEN.x && y >= SCREEN.y && x < SCREEN.x + SCREEN.w && y < SCREEN.y + SCREEN.h

/* -------------------------------- the cores ------------------------------- */
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
  return { x0: Math.min(...x), y0: Math.min(...y), x1: Math.max(...x), y1: Math.max(...y), pts }
}
const cores = halves.map(boxOf).sort((a, b) => a.x0 - b.x0)

/** The dark of the display, so "brighter than this" means paint or reflection. */
const glassSamples = []
for (let y = BAND.y; y < BAND.y + BAND.h; y++) {
  for (let x = BAND.x; x < BAND.x + BAND.w; x++) {
    const [r, g, b] = px(x, y)
    if (g - r > 20 || g + b > 150) continue
    glassSamples.push(g)
  }
}
if (glassSamples.length < 400) throw new Error('emo: no dark glass found in the band — is that still his face?')
const GLASS_CEILING = Math.round(glassSamples.sort((a, b) => a - b)[glassSamples.length >> 1]) + 8

/* ---------------------------- per-eye measurement ------------------------- */
const median = (list, pick) => {
  const v = list.map(pick).sort((a, b) => a - b)
  return v.length ? Math.round(v[v.length >> 1]) : 0
}
const rgb = list => `rgb(${median(list, p => p[0])}, ${median(list, p => p[1])}, ${median(list, p => p[2])})`

/**
 * How far this glow reaches in one direction: walk out while the pixel is still lit,
 * and stop the moment it starts climbing again — that climb is the reflection across
 * his screen, and an erase layer that grows into it would eat his highlight instead.
 */
const walk = (x, y, dx, dy) => {
  let reach = 0
  let prev = -1
  for (let step = 1; step <= FOOT_MAX; step++) {
    const nx = x + dx * step
    const ny = y + dy * step
    if (!inScreen(nx, ny)) break
    const [, g] = px(nx, ny)
    if (g <= GLASS_CEILING) break
    if (prev >= 0 && g > prev + 4) break // climbing again: that is the reflection, not his glow
    prev = g
    reach = step
  }
  return reach
}
/**
 * How far this glow reaches in one direction, measured along every edge pixel of the
 * core and medianaed — one row is noisy, and the walk has to stop at the foot of the
 * halo rather than following the bright reflection across his screen.
 */
const foot = (core, dx, dy) => {
  const reach = []
  if (dx) {
    const x = dx < 0 ? core.x0 : core.x1
    for (let y = core.y0; y <= core.y1; y++) reach.push(walk(x, y, dx, 0))
  } else {
    const y = dy < 0 ? core.y0 : core.y1
    for (let x = core.x0; x <= core.x1; x++) reach.push(walk(x, y, 0, dy))
  }
  reach.sort((a, b) => a - b)
  return Math.max(3, reach[reach.length >> 1])
}

/** The gap between his two eyes: an eye may never cross into the other one's. */
const gapPx = cores[1].x0 - cores[0].x1
const eyes = cores.map(core => {
  const left = foot(core, -1, 0)
  const right = foot(core, 1, 0)
  const up = foot(core, 0, -1)
  const down = foot(core, 0, 1)
  const socket = { x0: core.x0 - left, x1: core.x1 + right, y0: core.y0 - up, y1: core.y1 + down }

  /** His glass, sampled in a ring around this eye — the ceiling the erase uses. */
  const ring = []
  for (let y = socket.y0 - 9; y <= socket.y1 + 9; y++) {
    for (let x = socket.x0 - 9; x <= socket.x1 + 9; x++) {
      if (!inScreen(x, y)) continue
      const inside = x >= socket.x0 && x <= socket.x1 && y >= socket.y0 && y <= socket.y1
      if (inside) continue
      const [r, g, b] = px(x, y)
      if (!GLASS(g, GLASS_CEILING + 14) || g - r > 20 || b - r > 20) continue
      ring.push([r, g, b])
    }
  }
  if (ring.length < 120) throw new Error('emo: not enough dark glass around his eyes to erase them into')

  /** The paint itself, in three tones: the hot centre, the body, the halo's edge. */
  const hot = core.pts.map(([x, y]) => px(x, y)).sort((a, b) => b[1] - a[1]).slice(0, Math.max(6, core.pts.length >> 3))
  const body = core.pts.map(([x, y]) => px(x, y))
  const halo = []
  for (let y = socket.y0; y <= socket.y1; y++) {
    for (let x = socket.x0; x <= socket.x1; x++) {
      const inside = x >= core.x0 && x <= core.x1 && y >= core.y0 && y <= core.y1
      if (inside || !inScreen(x, y)) continue
      const [r, g, b] = px(x, y)
      if (g > GLASS_CEILING && g - r > 12) halo.push([r, g, b])
    }
  }
  return {
    core,
    socket,
    glass: rgb(ring),
    peak: rgb(hot),
    mid: rgb(body),
    glow: halo.length > 24 ? rgb(halo) : rgb(body),
    /** How far this eye may travel: inside his display, never into the other one's. */
    roam: {
      x: Math.max(2, Math.min(ROAM_MAX_X, core.x0 - SCREEN.x - 1, SCREEN.x + SCREEN.w - 1 - core.x1, Math.floor(gapPx / 2) - 1)),
      y: Math.max(2, Math.min(ROAM_MAX_Y, core.y0 - SCREEN.y - 1, SCREEN.y + SCREEN.h - 1 - core.y1)),
    },
    halo: { left, right, up, down },
  }
})

/* --------------------------------- guards --------------------------------- */
for (const [i, e] of eyes.entries()) {
  const w = e.socket.x1 - e.socket.x0 + 1
  const h = e.socket.y1 - e.socket.y0 + 1
  if (w < 20 || h < 16) throw new Error(`emo: eye ${i}'s glow footprint is only ${w}×${h} — too small to erase him into`)
  if (!inScreen(e.socket.x0, e.socket.y0) || !inScreen(e.socket.x1, e.socket.y1)) {
    throw new Error(`emo: eye ${i}'s glow reaches outside his display ${JSON.stringify(SCREEN)} — the band or the screen rect is wrong`)
  }
  const size = (e.core.x1 - e.core.x0 + 1) * (e.core.y1 - e.core.y0 + 1)
  if (e.core.pts.length < size * 0.45) {
    throw new Error(`emo: eye ${i} is not a filled square (${e.core.pts.length}/${size} lit px) — that is not his eye`)
  }
}
if (gapPx < 6) throw new Error(`emo: his eyes are only ${gapPx}px apart — the split found the wrong blobs`)

/* ------------------------------- percentages ------------------------------ */
const pct = (v, total) => +((v / total) * 100).toFixed(3)
const box = b => ({ x: pct(b.x0, SW), y: pct(b.y0, SH), w: pct(b.x1 - b.x0 + 1, SW), h: pct(b.y1 - b.y0 + 1, SH) })
const rect = { x: pct(SCREEN.x, SW), y: pct(SCREEN.y, SH), w: pct(SCREEN.w, SW), h: pct(SCREEN.h, SH) }
const head = { x: pct(HEAD.x, SW), y: pct(HEAD.y, SH), w: pct(HEAD.w, SW), h: pct(HEAD.h, SH) }
const emit = eyes.map(e => ({
  /** Where his eye sits, and how far the dark of the display reaches around it. */
  core: box(e.core),
  socket: box(e.socket),
  /** How far the glow's foot reaches past the core, per side, in photo px. */
  foot: e.halo,
  /** Travel limits, as % of the photo's *width*: 1em in CSS is 1% of the hero frame's
   *  width, and a distance is a distance on both axes. */
  roam: { x: pct(e.roam.x, SW), y: pct(e.roam.y, SW) },
  glass: e.glass,
  peak: e.peak,
  mid: e.mid,
  glow: e.glow,
}))

const source = `/**
 * Generated by scripts/emo-geometry.mjs — measured off hero-monitor.jpg, in
 * percentages of the ${SW} × ${SH} photo so the overlay rides the hero crop at every
 * viewport, and colours sampled from his pixels so a live eye cannot be told from the
 * painted one it replaces. Do not hand-edit: change the script, or re-run it after
 * the photo.
 */
export const emoFace = {
  photo: { width: ${SW}, height: ${SH} },
  /** The dark glass of his display — everything on him stays inside it. */
  screen: ${JSON.stringify(rect)},
  /** His shell + headphone cups: the pivot for tilts, and the tap target. */
  head: ${JSON.stringify(head)},
  /** How bright a pixel has to be before it counts as paint, not glass. */
  ceiling: ${GLASS_CEILING},
  eyes: [
${emit.map(e => `    ${JSON.stringify(e)}`).join(',\n')}
  ],
} as const
`

/**
 * `--check` measures everything and writes nothing, so the build can prove the
 * committed numbers are still what the photo says.
 */
if (process.argv.includes('--check')) {
  const committed = await readFile(OUT, 'utf8').catch(() => '')
  if (committed !== source) throw new Error('emo: src/lib/emoFace.ts is stale — run node scripts/emo-geometry.mjs')
  console.log(`emo: ${marks.length} cyan px, split at x=${split} — geometry still matches hero-monitor.jpg`)
} else {
  await writeFile(OUT, source)
  console.log(`emo: wrote src/lib/emoFace.ts ← ${marks.length} cyan px, split at x=${split}, glass ceiling g=${GLASS_CEILING}`)
  for (const [i, e] of emit.entries()) {
    console.log(`  eye ${i} core ${e.core.w}%×${e.core.h}% at (${e.core.x}%, ${e.core.y}%) · foot l${eyes[i].halo.left} r${eyes[i].halo.right} u${eyes[i].halo.up} d${eyes[i].halo.down} · roam ${e.roam.x}%/${e.roam.y}%`)
    console.log(`        glass ${e.glass} · peak ${e.peak} · body ${e.mid} · halo ${e.glow}`)
  }
}
