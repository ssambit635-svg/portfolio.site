/**
 * Ribbon-cable geometry for the About-me pegboard.
 *
 * The cable is authored as two cubic béziers in *board-image space* (the
 * pegboard artwork is 928 × 1152, and every overlay is positioned as a
 * percentage of it, so image pixels and SVG user units are 1:1).
 *
 * Everything the cable is drawn from — the filled body, the conductor
 * stripes, the specular sheen, the contact shadow — is offset from that single
 * centreline, so the ribbon keeps an even width through every bend instead of
 * ballooning at the corners the way a stroked path does.
 *
 * The run is a shallow catenary: it leaves the ESP32's pin header almost
 * horizontally (a ribbon is stiff right where it is clamped), slackens into a
 * sag across the middle of the board, then climbs and disappears behind the
 * contact module. That slack is what reads as "hanging" rather than "floating".
 */

type Point = [number, number]

/** [start, control 1, control 2, end]. */
type Span = [Point, Point, Point, Point]

/**
 * Centreline — see the file comment for the reasoning behind the shape.
 * The sag hangs just clear of the bright fitting at x 400–508 so the ribbon
 * never looks like it is glued to the front of it.
 */
const SPANS: Span[] = [
  [[706, 316], [646, 348], [556, 418], [455, 432]],
  [[455, 432], [388, 442], [314, 428], [250, 366]],
]

const SAMPLES = 46

/** Half the ribbon's width, in image pixels. */
export const RIBBON_HALF = 8

function point([p0, c1, c2, p1]: Span, t: number): Point {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [
    a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0],
    a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1],
  ]
}

function derivative([p0, c1, c2, p1]: Span, t: number): Point {
  const u = 1 - t
  const a = 3 * u * u
  const b = 6 * u * t
  const c = 3 * t * t
  return [
    a * (c1[0] - p0[0]) + b * (c2[0] - c1[0]) + c * (p1[0] - c2[0]),
    a * (c1[1] - p0[1]) + b * (c2[1] - c1[1]) + c * (p1[1] - c2[1]),
  ]
}

const points: Point[] = []
const normals: Point[] = []

SPANS.forEach((span, index) => {
  // Skip the first sample of every span but the first: spans share endpoints.
  for (let step = index === 0 ? 0 : 1; step <= SAMPLES; step += 1) {
    const t = step / SAMPLES
    const [x, y] = point(span, t)
    const [tx, ty] = derivative(span, t)
    const length = Math.hypot(tx, ty) || 1
    points.push([x, y])
    normals.push([-ty / length, tx / length])
  }
})

const round = (value: number) => Math.round(value * 10) / 10

/** A line running the length of the cable, `offset` pixels off the centreline. */
function run(offset: number, reverse = false): string {
  const order = reverse ? points.map((_, i) => points.length - 1 - i) : points.map((_, i) => i)
  return order
    .map((i, n) => {
      const [x, y] = points[i]
      const [nx, ny] = normals[i]
      const px = round(x + nx * offset)
      const py = round(y + ny * offset)
      return `${n === 0 ? 'M' : 'L'}${px} ${py}`
    })
    .join('')
}

/** Closed shape of the whole ribbon: down one edge, back along the other. */
function body(half: number): string {
  return `${run(half)}${run(-half, true).replace('M', 'L')}Z`
}

let arcLength = 0
for (let i = 1; i < points.length; i += 1) {
  arcLength += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
}

/** Point and heading `distance` user units along the run from the ESP32 end. */
function along(distance: number) {
  let travelled = 0
  for (let i = 1; i < points.length; i += 1) {
    const step = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
    if (travelled + step >= distance) {
      // Heading is taken from the sampled segment so it always matches the
      // drawn run, then folded into ±90° so the plug's shading stays upright.
      const heading = (Math.atan2(points[i][1] - points[i - 1][1], points[i][0] - points[i - 1][0]) * 180) / Math.PI
      return {
        x: Math.round(points[i][0] * 10) / 10,
        y: Math.round(points[i][1] * 10) / 10,
        angle: Math.round((heading > 90 ? heading - 180 : heading < -90 ? heading + 180 : heading) * 10) / 10,
      }
    }
    travelled += step
  }
  const last = points[points.length - 1]
  return { x: last[0], y: last[1], angle: 0 }
}

/**
 * The IDC plug that clamps the ribbon onto the ESP32's pin header. It is placed
 * on the run itself and straddles the board's left edge (x ≈ 705) so the cable
 * reads as *plugged in* rather than hovering beside the module.
 */
const plug = along(5)

export const PLUG = { cx: plug.x, cy: plug.y, angle: plug.angle, width: 28, height: 23 }

export const CABLE = {
  /** Filled silhouette of the ribbon — used for the body, shadow and clip. */
  outline: body(RIBBON_HALF),
  /** Centreline: the data pulses travel along this. */
  centre: run(0),
  /** Conductor stripes, alternating light/dark across the width. */
  stripes: [-6.3, -4.7, -3.1, -1.6, 0, 1.6, 3.1, 4.7, 6.3].map((offset) => run(offset)),
  /** Soft specular streak. Positive offsets run to the *upper* edge of the
   *  ribbon — the side facing the key light — so the sheen sits there. */
  sheen: run(5.4),
  /** Occluded underside. */
  shade: run(-7),
  /** Crisp highlight along the very top edge. */
  edge: run(7.2),
  /** Length of the run in user units — drives the pulse dash animation. */
  length: Math.round(arcLength),
}
