/**
 * The civic layer of Skill City: the things a city has that are not buildings
 * and not traffic. Bus shelters, hoardings, a crane over a half-finished
 * tower, manhole covers, gully grates and the puddled tarmac after rain.
 *
 * Everything is merged into a handful of meshes — one per material — so the
 * whole layer costs a few draw calls and nothing at all per frame. Nothing in
 * here is pickable or animated: it is set dressing, drawn sharply, at the same
 * scale as the rest of the diorama.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
  PLOT_HEIGHT,
  ROAD,
  cityBuildings,
  districts,
  parkedCars,
  type CityBuilding,
} from '../lib/skillCity'

type Tools = {
  /** Registers anything with a dispose so the scene can be torn down. */
  track: <T extends { dispose: () => void }>(item: T) => T
}

/* ——— textures ——————————————————————————————————————————————————————————— */

/** A hoarding: cream board, green rule, the site's own mono, one line. */
function hoardingTexture(lines: string[], accent: string): THREE.CanvasTexture {
  const W = 220
  const H = 120
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#efe6d2'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, W, 10)
    ctx.fillStyle = 'rgba(30, 32, 28, 0.16)'
    ctx.fillRect(0, H - 6, W, 6)
    ctx.fillStyle = '#23261f'
    ctx.font = '700 30px ui-monospace, monospace'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    // Two short lines, set big: a board has to read from across the plate.
    const step = 38
    let y = H / 2 - ((lines.length - 1) * step) / 2 + 4
    for (const line of lines) {
      ctx.fillText(line, W / 2, y)
      y += step
    }
    ctx.strokeStyle = 'rgba(30, 32, 28, 0.25)'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, W - 2, H - 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** A gully grate: dark iron, slots across it. */
function grateTexture(): THREE.CanvasTexture {
  const S = 32
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#2a2d28'
    ctx.fillRect(0, 0, S, S)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
    for (let i = 4; i < S - 2; i += 6) ctx.fillRect(3, i, S - 6, 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ——— geometry helpers ————————————————————————————————————————————————— */

const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
  new THREE.BoxGeometry(w, h, d).translate(x, y, z)

const slab = (w: number, h: number, d: number, x: number, y: number, z: number, ry: number) =>
  new THREE.BoxGeometry(w, h, d).rotateY(ry).translate(x, y, z)

/**
 * Draws the civic layer into the scene. Returns nothing: the caller only ever
 * needs the meshes to exist and to disappear with the scene.
 */
export function addCityProps(scene: THREE.Scene, { track }: Tools): void {
  /* ——— paint: parking bays, manholes, gullies ——————————————————————————— */

  const paint: THREE.BufferGeometry[] = []
  for (const car of parkedCars) {
    const along = Math.abs(Math.sin(car.ry)) > 0.5
    for (const side of [-1, 1]) {
      const dx = along ? 0 : side * 0.74
      const dz = along ? side * 0.74 : 0
      paint.push(box(along ? 0.08 : 1.5, 0.02, along ? 1.5 : 0.08, car.x + dx, 0.05, car.z + dz))
    }
  }
  const paintMesh = new THREE.Mesh(
    track(mergeGeometries(paint)),
    track(new THREE.MeshBasicMaterial({ color: 0xd7ccb3 })),
  )
  scene.add(paintMesh)
  for (const geometry of paint) geometry.dispose()

  // Manhole covers and their iron rims, set on the carriageway.
  const manholes = track(
    mergeGeometries(
      MANHOLES.map((spot) =>
        mergeGeometries([
          new THREE.CylinderGeometry(0.17, 0.17, 0.012, 12).translate(spot.x, 0.052, spot.z),
        ]),
      ),
    ),
  )
  const manholeMesh = new THREE.Mesh(
    manholes,
    track(new THREE.MeshLambertMaterial({ color: 0x4a4c44 })),
  )
  manholeMesh.receiveShadow = true
  scene.add(manholeMesh)

  // Gullies along the kerbs, each with a grating in it.
  const gullies = track(
    mergeGeometries(
      GULLIES.map((spot) =>
        new THREE.PlaneGeometry(0.36, 0.2).rotateX(-Math.PI / 2).translate(spot.x, 0.056, spot.z),
      ),
    ),
  )
  const gullyMesh = new THREE.Mesh(
    gullies,
    track(
      new THREE.MeshLambertMaterial({
        map: track(grateTexture()),
      }),
    ),
  )
  gullyMesh.receiveShadow = false
  scene.add(gullyMesh)

  // Rain left in the low spots: a little darker than the tarmac, a little
  // bluer, and flat enough to read as standing water at this scale.
  const puddles = track(
    mergeGeometries(
      PUDDLES.map((puddle) =>
        new THREE.CircleGeometry(puddle.r, 12)
          .scale(puddle.sx, puddle.sz, 1)
          .rotateX(-Math.PI / 2)
          .translate(puddle.x, 0.058, puddle.z),
      ),
    ),
  )
  const puddleMesh = new THREE.Mesh(
    puddles,
    track(
      new THREE.MeshBasicMaterial({
        color: 0x5d7280,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      }),
    ),
  )
  puddleMesh.renderOrder = 1
  scene.add(puddleMesh)

  /* ——— bus shelters ————————————————————————————————————————————————————— */

  const shelterFrames: THREE.BufferGeometry[] = []
  const shelterGlass: THREE.BufferGeometry[] = []
  for (const shelter of SHELTERS) {
    const { x, z, ry } = shelter
    // Two posts, a canopy, a back panel and a bench under it.
    for (const side of [-1, 1]) {
      shelterFrames.push(
        slab(
          0.06,
          0.78,
          0.06,
          x + Math.cos(ry) * side * 0.62,
          0.39,
          z - Math.sin(ry) * side * 0.62,
          ry,
        ),
      )
    }
    shelterFrames.push(slab(1.6, 0.05, 0.55, x, 0.8, z, ry))
    shelterFrames.push(slab(1.5, 0.04, 0.2, x, 0.36, z, ry))
    shelterGlass.push(slab(1.5, 0.5, 0.03, x, 0.56, z, ry))
    // The bus stop flag: a pole and a plate, with the route on it.
    shelterFrames.push(
      slab(0.04, 1.1, 0.04, x + Math.cos(ry) * 0.86, 0.55, z - Math.sin(ry) * 0.86, ry),
    )
    shelterGlass.push(
      slab(0.3, 0.22, 0.02, x + Math.cos(ry) * 0.86, 1.16, z - Math.sin(ry) * 0.86, ry),
    )
  }

  const shelterMesh = new THREE.Mesh(
    track(mergeGeometries(shelterFrames)),
    track(new THREE.MeshLambertMaterial({ color: 0x3c423b })),
  )
  shelterMesh.castShadow = true
  shelterMesh.receiveShadow = true
  scene.add(shelterMesh)

  const glassMesh = new THREE.Mesh(
    track(mergeGeometries(shelterGlass)),
    track(
      new THREE.MeshLambertMaterial({
        color: 0xdfe7e2,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
      }),
    ),
  )
  scene.add(glassMesh)

  /* ——— hoardings ————————————————————————————————————————————————————————— */

  // Boards on the plate's own rim, outside the beltway — the ground nobody
  // builds on. They face the default camera, so the city greets you with its
  // own advertising instead of a blank edge, and nothing on the street moves.
  BOARDS.forEach((board) => {
    const texture = track(hoardingTexture(board.lines, board.accent))
    const nx = Math.sin(board.ry)
    const nz = Math.cos(board.ry)
    const legs: THREE.BufferGeometry[] = [-0.6, 0.6].map((offset) =>
      box(0.07, 1.5, 0.07, board.x - nx * offset, 0.77, board.z - nz * offset),
    )
    const legMesh = new THREE.Mesh(
      track(mergeGeometries(legs)),
      track(new THREE.MeshLambertMaterial({ color: 0x2f342e })),
    )
    legMesh.castShadow = true
    scene.add(legMesh)
    for (const geometry of legs) geometry.dispose()

    // Lit boards: at dusk the city's advertising is a light box, which reads
    // from across the plate and is the honest thing for a billboard to be.
    const panel = new THREE.Mesh(
      track(new THREE.PlaneGeometry(2.5, 1.35)),
      track(new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })),
    )
    panel.position.set(board.x, 2.2, board.z)
    panel.rotation.y = board.ry
    scene.add(panel)
  })

  /* ——— a tower under construction ——————————————————————————————————————— */

  const build = constructionTower()
  if (build) {
    const { building } = build
    const frame: THREE.BufferGeometry[] = []
    const step = 0.34
    const w = building.w + 0.22
    const d = building.d + 0.22
    // Standards at the four corners and the bays between them, all the way up.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        frame.push(
          new THREE.CylinderGeometry(0.022, 0.022, building.h + 0.24, 5).translate(
            building.x + (sx * w) / 2,
            PLOT_HEIGHT + (building.h + 0.24) / 2,
            building.z + (sz * d) / 2,
          ),
        )
      }
    }
    for (let y = 0.3; y < building.h; y += step) {
      frame.push(box(w, 0.018, 0.018, building.x, PLOT_HEIGHT + y, building.z - d / 2))
      frame.push(box(w, 0.018, 0.018, building.x, PLOT_HEIGHT + y, building.z + d / 2))
      frame.push(box(0.018, 0.018, d, building.x - w / 2, PLOT_HEIGHT + y, building.z))
      frame.push(box(0.018, 0.018, d, building.x + w / 2, PLOT_HEIGHT + y, building.z))
    }
    const frameMesh = new THREE.Mesh(
      track(mergeGeometries(frame)),
      track(new THREE.MeshLambertMaterial({ color: 0x8d8f84 })),
    )
    frameMesh.castShadow = true
    scene.add(frameMesh)
    for (const geometry of frame) geometry.dispose()

    // A net over two faces: the cheapest way to say "still going up".
    const net = new THREE.Mesh(
      track(new THREE.PlaneGeometry(w, building.h)),
      track(
        new THREE.MeshLambertMaterial({
          color: 0xd8d2c0,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      ),
    )
    net.position.set(building.x, PLOT_HEIGHT + building.h / 2, building.z + d / 2 + 0.02)
    scene.add(net)
  }

  /* ——— neon on two towers ——————————————————————————————————————————————— */

  const neon: THREE.BufferGeometry[] = []
  for (const sign of NEON) {
    // A vertical blade sign on the corner of a tower: a border and two bars.
    neon.push(box(0.05, 0.62, 0.16, sign.x, sign.y, sign.z))
  }
  if (neon.length > 0) {
    const neonMesh = new THREE.Mesh(
      track(mergeGeometries(neon)),
      track(new THREE.MeshBasicMaterial({ color: 0x63f0a8, toneMapped: false })),
    )
    scene.add(neonMesh)
    for (const geometry of neon) geometry.dispose()
  }
}

/* ——— where the civic layer goes ————————————————————————————————————————— */

const MANHOLES = [
  { x: -4.2, z: 0.5 },
  { x: 2.6, z: -0.6 },
  { x: 6.8, z: 4.6 },
  { x: -6.8, z: -5.2 },
  { x: 0.4, z: 13.2 },
  { x: -18.2, z: 0 },
]

const GULLIES = [
  { x: -8.4, z: 1.62 },
  { x: -5.2, z: -1.62 },
  { x: 5.2, z: 1.62 },
  { x: 8.6, z: -1.62 },
  { x: 8.05, z: 6.4 },
  { x: -8.05, z: -6.4 },
  { x: -13.6, z: 1.62 },
  { x: 15.8, z: -1.62 },
]

/** Circles of rain, as (x, z), radius and the two axes of the puddle. */
const PUDDLES = [
  { x: -3.1, z: 2.4, r: 0.5, sx: 1.5, sz: 0.7 },
  { x: 4.4, z: -1.9, r: 0.42, sx: 1.2, sz: 0.8 },
  { x: 9.2, z: 1.4, r: 0.34, sx: 0.9, sz: 1.4 },
  { x: -10.6, z: -1.5, r: 0.46, sx: 1.3, sz: 0.6 },
  { x: -17.4, z: 13.1, r: 0.52, sx: 1.6, sz: 0.55 },
]

// Shelters stand on the footway, which is the outer quarter of the road width.
const SHELTERS = [
  { x: -11.9, z: ROAD / 2 - 0.26, ry: Math.PI },
  { x: 13.4, z: -ROAD / 2 + 0.26, ry: 0 },
]

const BOARDS = [
  { x: -14.5, z: 14.5, ry: 0, lines: ['OPEN', 'TO WORK'], accent: '#00f083' },
  { x: 8.5, z: 14.5, ry: 0, lines: ['SHIPPED', 'NINE'], accent: '#e2833f' },
  { x: 21.3, z: -6.2, ry: Math.PI / 2, lines: ['SC-29', '2026'], accent: '#4a90e2' },
]

const NEON: Array<{ x: number; y: number; z: number }> = []

/** The first tower that is still going up, if the data says there is one. */
function constructionTower(): { building: CityBuilding } | null {
  const building = cityBuildings.find((b) => b.shape === 'construction')
  if (building) return { building }
  // Nothing in progress: the tallest block carries the crane instead, so the
  // composition still gets its vertical.
  const tallest = [...cityBuildings].sort((a, b) => b.h - a.h)[0]
  return tallest ? { building: tallest } : null
}

// Neon goes on the two towers that sit nearest the front of the plate, where a
// blade sign is actually visible from the default camera.
districts.forEach((district, index) => {
  const towers = cityBuildings.filter((b) => b.district.id === district.id && b.h > 2.6)
  const tower = towers[0]
  if (!tower || index % 3 !== 0) return
  NEON.push({
    x: tower.x + tower.w / 2 + 0.03,
    y: PLOT_HEIGHT + tower.h * 0.62,
    z: tower.z,
  })
})
