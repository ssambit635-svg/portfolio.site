/**
 * The Skill City scene: a miniature diorama, built with three.js and drawn into
 * the monitor screen.
 *
 * Everything is a hard-edged solid: cream resin buildings, flat green road
 * lanes, no bloom, no halos. The only light is one warm sun with real shadow
 * maps, so depth comes from geometry and cast shadows rather than glow.
 *
 * The module is imported lazily by SkillCity.tsx; nothing here runs during the
 * pre-render, and the whole scene is disposed when the section unmounts.
 */
import * as THREE from 'three'
import { techLogos, type TechLogo } from '../lib/techLogos'
import {
  PLATE,
  PLOT,
  PLOT_HEIGHT,
  cityBuildings,
  cityFabric,
  cityVehicles,
  districts,
  greenRoads,
  plateRim,
  plotRect,
  roadDashes,
  buildingParts,
  type CityBuilding,
  type DistrictId,
  type Rect,
} from '../lib/skillCity'

export type HoverPoint = { x: number; y: number }

export type SceneOptions = {
  reducedMotion: boolean
  /** Called with a skill id, or null when the pointer leaves a tower. */
  onHover: (id: string | null, at: HoverPoint | null) => void
  /** A tower was clicked. null means empty plate. */
  onSelect: (id: string | null) => void
  /** A city block was clicked. null means empty plate. */
  onDistrict: (id: DistrictId | null) => void
}

export type SkillCityController = {
  focusSkill: (id: string) => void
  focusDistrict: (id: DistrictId) => void
  clearFocus: () => void
  zoomBy: (factor: number) => void
  dispose: () => void
}

const HOT = 0x00f083
const FIT_HEIGHT = 41
const FIT_WIDTH = 55
const DEFAULT_ELEVATION = THREE.MathUtils.degToRad(34)
const DEFAULT_AZIMUTH = THREE.MathUtils.degToRad(38)
const DISTANCE = 90
const MIN_ELEVATION = THREE.MathUtils.degToRad(19)
const MAX_ELEVATION = THREE.MathUtils.degToRad(68)
const MIN_ZOOM = 0.82
const MAX_ZOOM = 2.9

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Rounded rectangle shape for the diorama plate. */
function plateShape(width: number, depth: number, radius: number) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -depth / 2
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + depth - radius)
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth)
  shape.lineTo(x + radius, y + depth)
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

/**
 * Scale a box's per-face UVs to its real size so one facade texture keeps the
 * same rib pitch on a six-unit tower and a one-unit back building.
 */
function scaleBoxUv(geo: THREE.BoxGeometry, w: number, h: number, d: number, unit: number) {
  const uv = geo.attributes.uv as THREE.BufferAttribute
  const faces: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ]
  for (let face = 0; face < 6; face += 1) {
    const [fw, fh] = faces[face]
    for (let i = 0; i < 4; i += 1) {
      const index = face * 4 + i
      uv.setXY(index, (uv.getX(index) * fw) / unit, (uv.getY(index) * fh) / unit)
    }
  }
  uv.needsUpdate = true
}

/**
 * The facade: poured cream stone with real windows in it. One tile is 1.15
 * world units square and holds four openings on two floors, so the same tile
 * windows a two-unit tower and a nine-unit one at the same scale: the UVs are
 * scaled to world space when each box is built.
 *
 * Every window is a recessed opening with a frame, a glass gradient that goes
 * lighter towards the sky, a mullion, a shadow under the head and a lit sill,
 * plus one of four small variations (a blind, a lit room, a darker pane) so a
 * facade does not read as wallpaper.
 */
function facadeTexture(detail: 'tower' | 'block' = 'tower'): THREE.CanvasTexture {
  const S = 256
  const cell = S / 2
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#e7dcc5'
    ctx.fillRect(0, 0, S, S)
    // A faint vertical rib between the bays, the way a stone pier is cast.
    ctx.fillStyle = 'rgba(116, 99, 72, 0.10)'
    for (let x = cell / 2; x < S; x += cell / 2) ctx.fillRect(x, 0, 1, S)

    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 2; col += 1) {
        const ox = col * cell
        const oy = row * cell
        const variant = (row * 2 + col) % 4

        // The floor slab, darker than the wall, with a lit top edge.
        ctx.fillStyle = 'rgba(98, 84, 60, 0.11)'
        ctx.fillRect(ox, oy, cell, 34)
        ctx.fillStyle = 'rgba(255, 252, 242, 0.45)'
        ctx.fillRect(ox, oy + 34, cell, 2)

        const narrow = detail === 'block'
        const wx = ox + (narrow ? 34 : 22)
        const wy = oy + (narrow ? 58 : 50)
        const ww = cell - (narrow ? 68 : 44)
        const wh = cell - (narrow ? 102 : 82)

        // The reveal: the wall turns into the opening.
        ctx.fillStyle = 'rgba(72, 74, 62, 0.9)'
        ctx.fillRect(wx - 1, wy - 1, ww + 2, wh + 2)
        ctx.fillStyle = 'rgba(26, 22, 15, 0.3)'
        ctx.fillRect(wx - 1, wy - 1, ww + 2, 2)

        // The glass: sky above, room below.
        const glass = ctx.createLinearGradient(0, wy, 0, wy + wh)
        glass.addColorStop(0, variant === 2 ? '#9aa6aa' : '#8b979c')
        glass.addColorStop(0.45, '#5b666c')
        glass.addColorStop(1, variant === 3 ? '#333b40' : '#414b51')
        ctx.fillStyle = glass
        ctx.fillRect(wx, wy, ww, wh)

        // One soft reflection across the top third.
        const sheen = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh * 0.9)
        sheen.addColorStop(0, 'rgba(222, 236, 242, 0.22)')
        sheen.addColorStop(0.6, 'rgba(214, 230, 236, 0)')
        ctx.fillStyle = sheen
        ctx.fillRect(wx, wy, ww, wh)

        // Blinds on one variant, a lit room on another.
        if (variant === 1 && detail === 'tower') {
          ctx.fillStyle = 'rgba(226, 216, 192, 0.30)'
          for (let y = wy + 5; y < wy + wh * 0.6; y += 5) ctx.fillRect(wx, y, ww, 1)
        }
        if (variant === 2 && detail === 'tower') {
          ctx.fillStyle = 'rgba(255, 226, 160, 0.16)'
          ctx.fillRect(wx, wy + wh * 0.55, ww, wh * 0.45)
        }

        // A mullion down the middle and the frame edge.
        ctx.fillStyle = 'rgba(226, 215, 190, 0.55)'
        ctx.fillRect(wx + ww / 2 - 1, wy, 1.5, wh)
        ctx.strokeStyle = 'rgba(24, 28, 25, 0.55)'
        ctx.lineWidth = 1
        ctx.strokeRect(wx + 0.5, wy + 0.5, ww - 1, wh - 1)

        // A shadow under the head, a lit sill under the glass.
        ctx.fillStyle = 'rgba(38, 31, 21, 0.2)'
        ctx.fillRect(wx - 2, wy + wh + 2, ww + 4, 2)
        ctx.fillStyle = 'rgba(255, 252, 242, 0.55)'
        ctx.fillRect(wx - 2, wy + wh + 4, ww + 4, 2)
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/** Paving for a city block: a fine tile grid, so an empty corner reads as a plaza. */
function pavingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#2b2e29'
    ctx.fillRect(0, 0, 128, 128)
    ctx.strokeStyle = 'rgba(196, 189, 166, 0.10)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 128; i += 32) {
      ctx.beginPath()
      ctx.moveTo(i + 0.5, 0)
      ctx.lineTo(i + 0.5, 128)
      ctx.moveTo(0, i + 0.5)
      ctx.lineTo(128, i + 0.5)
      ctx.stroke()
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)'
    for (let i = 0; i < 40; i += 1) {
      const x = (i * 47) % 124
      const y = (i * 71) % 124
      ctx.fillRect(x, y, 2, 2)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/**
 * A tower's rooftop sign: a cream plate with a district stripe, the tower code
 * and a pointer tail that touches the roof. One small canvas per tower.
 */
function rooftopTexture(code: string, color: string): THREE.CanvasTexture {
  const W = 256
  const H = 160
  const x = 10
  const y = 8
  const w = W - x * 2
  const plateH = 122
  const tail = 24
  const r = 7
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, W, H)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + plateH)
    ctx.lineTo(W / 2 + 13, y + plateH)
    ctx.lineTo(W / 2, y + plateH + tail)
    ctx.lineTo(W / 2 - 13, y + plateH)
    ctx.lineTo(x, y + plateH)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fillStyle = '#f2e8d2'
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = '#1b201a'
    ctx.stroke()

    ctx.fillStyle = color
    ctx.fillRect(x + 6, y + 6, w - 12, 13)

    const size = code.length > 2 ? 54 : code.length === 2 ? 66 : 82
    ctx.font = `700 ${size}px "IBM Plex Mono", ui-monospace, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#171d18'
    ctx.fillText(code, W / 2, y + 19 + (plateH - 19) / 2 + 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/**
 * A landmark's fascia sign: the technology's own mark on an enamelled plate in
 * its brand colour, bolted flat to the tower's shaft. Two towers per district
 * carry one, so a logo on the skyline always names something you can open.
 */
function logoSign(logo: TechLogo): THREE.CanvasTexture {
  const W = 256
  const H = 160
  const inset = 6
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, W, H)
    // A shadow line under the plate, so it stands off the windows.
    ctx.beginPath()
    ctx.roundRect(inset, inset + 2, W - inset * 2, H - inset * 2, 20)
    ctx.fillStyle = 'rgba(12, 16, 13, 0.55)'
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2 - 2, 20)
    ctx.fillStyle = logo.hex
    ctx.fill()
    ctx.lineWidth = 7
    ctx.strokeStyle = 'rgba(246, 239, 221, 0.92)'
    ctx.stroke()

    const size = H - inset * 2 - 34
    ctx.save()
    ctx.translate(W / 2 - size / 2, H / 2 - size / 2)
    ctx.scale(size / 24, size / 24)
    ctx.fillStyle = markInk(logo.hex)
    ctx.fill(new Path2D(logo.path))
    ctx.restore()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/** The mark is drawn in whichever ink stands off the badge's brand colour. */
function markInk(hex: string): string {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.55 ? '#141a17' : '#f6efdd'
}

type RectMesh = (rect: Rect, height: number, y: number, material: THREE.Material) => THREE.Mesh

export function createSkillCity(host: HTMLElement, options: SceneOptions): SkillCityController {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400)

  // Phones get a lighter renderer: fewer pixels, a smaller shadow map. The
  // geometry is the same, so nothing about the city changes except its cost.
  const lightDevice = window.matchMedia('(pointer: coarse)').matches || host.clientWidth < 620

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lightDevice ? 1.5 : 1.9))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const canvas = renderer.domElement
  canvas.className = 'city-webgl'
  host.appendChild(canvas)

  const disposables: Array<{ dispose: () => void }> = []
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  const facade = track(facadeTexture('tower'))
  const facadePlain = track(facadeTexture('block'))
  const paving = track(pavingTexture())
  const assets = {
    fabric: track(new THREE.MeshLambertMaterial({ map: facadePlain, color: 0xe4d8bf })),
    plate: track(new THREE.MeshLambertMaterial({ color: 0x191c1a })),
    vehicleCream: track(new THREE.MeshLambertMaterial({ color: 0xf1e7d0 })),
    vehicleDark: track(new THREE.MeshLambertMaterial({ color: 0x454b43 })),
    green: track(new THREE.MeshBasicMaterial({ color: HOT })),
    lane: track(new THREE.MeshLambertMaterial({ color: 0x00944f })),
    dash: track(new THREE.MeshBasicMaterial({ color: 0xd7ccb3 })),
    outlineHover: track(
      new THREE.LineBasicMaterial({ color: HOT, transparent: true, opacity: 0.9 }),
    ),
    outlineSelect: track(new THREE.LineBasicMaterial({ color: HOT })),
    district: track(new THREE.LineBasicMaterial({ color: HOT })),
  }

  /* A district owns a hue: strong on its roofs and kerb, pale on its walls.
     The unnamed neighbourhood blocks stay cream, so a coloured tower always
     means a skill you can open. */
  type DistrictLook = {
    facade: THREE.Material[]
    roof: THREE.Material
    side: THREE.Material
    detail: THREE.Material
    plot: THREE.Material
    kerb: THREE.Material
  }
  const cream = new THREE.Color(0xeee3cc)
  const districtLooks = new Map<DistrictId, DistrictLook>()
  for (const district of districts) {
    const ink = new THREE.Color(district.color)
    const facadeMaterial = track(
      new THREE.MeshLambertMaterial({ map: facade, color: ink.clone().lerp(cream, 0.52) }),
    )
    const roofMaterial = track(
      new THREE.MeshLambertMaterial({ color: ink.clone().lerp(cream, 0.18) }),
    )
    const sideMaterial = track(
      new THREE.MeshLambertMaterial({ color: ink.clone().lerp(cream, 0.52) }),
    )
    const detailMaterial = track(
      new THREE.MeshLambertMaterial({ color: ink.clone().lerp(cream, 0.4) }),
    )
    const plotMaterial = track(
      new THREE.MeshLambertMaterial({
        map: paving,
        color: ink.clone().lerp(new THREE.Color(0xffffff), 0.45),
      }),
    )
    const kerbMaterial = track(
      new THREE.MeshLambertMaterial({ color: ink.clone().lerp(cream, 0.2) }),
    )
    districtLooks.set(district.id, {
      facade: [
        facadeMaterial,
        facadeMaterial,
        roofMaterial,
        roofMaterial,
        facadeMaterial,
        facadeMaterial,
      ],
      roof: roofMaterial,
      side: sideMaterial,
      detail: detailMaterial,
      plot: plotMaterial,
      kerb: kerbMaterial,
    })
  }

  /* ——— light ————————————————————————————————————————————————————————————— */

  const sun = new THREE.DirectionalLight(0xffefd4, 3.0)
  sun.position.set(-26, 40, 18)
  sun.castShadow = true
  const shadowSize = lightDevice ? 1024 : 2048
  sun.shadow.mapSize.set(shadowSize, shadowSize)
  sun.shadow.camera.left = -34
  sun.shadow.camera.right = 34
  sun.shadow.camera.top = 32
  sun.shadow.camera.bottom = -32
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 130
  sun.shadow.bias = -0.0007
  sun.shadow.normalBias = 0.035
  sun.shadow.camera.updateProjectionMatrix()
  scene.add(sun)
  scene.add(sun.target)

  const hemi = new THREE.HemisphereLight(0xfff3de, 0x171a15, 1.5)
  scene.add(hemi)

  /* ——— the plate ————————————————————————————————————————————————————————— */

  const plateGeometry = new THREE.ExtrudeGeometry(
    plateShape(PLATE.width, PLATE.depth, PLATE.radius),
    {
      depth: PLATE.thickness,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2,
      curveSegments: 6,
    },
  )
  plateGeometry.rotateX(-Math.PI / 2)
  // The bevel adds 0.1 below and above the extrusion, so the slab's top face
  // sits at thickness + bevel. Drop the whole thing until that face is at 0.02.
  plateGeometry.translate(0, -(PLATE.thickness + 0.1) + 0.02, 0)
  track(plateGeometry)
  const plate = new THREE.Mesh(plateGeometry, assets.plate)
  plate.receiveShadow = true
  scene.add(plate)

  const rectMesh: RectMesh = (rect, height, y, material) => {
    const geo = track(new THREE.BoxGeometry(rect.w, height, rect.d))
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.set(rect.x, y + height / 2, rect.z)
    mesh.receiveShadow = material === assets.dash || material === assets.green ? false : true
    return mesh
  }

  // Green roads.
  for (const rect of greenRoads) {
    const mesh = rectMesh(rect, 0.05, 0.008, assets.lane)
    mesh.receiveShadow = true
    scene.add(mesh)
  }
  // Cream lane dashes.
  for (const rect of roadDashes) {
    const mesh = rectMesh(rect, 0.03, 0.04, assets.dash)
    scene.add(mesh)
  }
  // A printed rule around the diorama edge.
  for (const rect of plateRim) {
    const mesh = rectMesh(rect, 0.03, 0.02, assets.dash)
    mesh.receiveShadow = false
    scene.add(mesh)
  }

  /* ——— the blocks ——————————————————————————————————————————————————————— */

  const plotMeshes = new Map<DistrictId, THREE.Mesh>()
  const districtRings = new Map<DistrictId, THREE.Line>()

  for (const district of districts) {
    const rect = plotRect(district)
    const look = districtLooks.get(district.id)!
    const platform = rectMesh(rect, PLOT_HEIGHT, 0, look.plot)
    platform.castShadow = false
    platform.receiveShadow = true
    platform.userData.districtId = district.id
    plotMeshes.set(district.id, platform)
    scene.add(platform)

    // A thin cream kerb around the platform.
    const k = 0.14
    const rim: Rect[] = [
      { x: rect.x, z: rect.z - PLOT / 2 + k / 2, w: PLOT, d: k },
      { x: rect.x, z: rect.z + PLOT / 2 - k / 2, w: PLOT, d: k },
      { x: rect.x - PLOT / 2 + k / 2, z: rect.z, w: k, d: PLOT },
      { x: rect.x + PLOT / 2 - k / 2, z: rect.z, w: k, d: PLOT },
    ]
    for (const strip of rim) {
      const mesh = rectMesh(strip, 0.06, PLOT_HEIGHT, look.kerb)
      mesh.castShadow = false
      scene.add(mesh)
    }

    // The green outline that marks the open district.
    const half = PLOT / 2 - 0.1
    const y = PLOT_HEIGHT + 0.02
    const points = [
      new THREE.Vector3(rect.x - half, y, rect.z - half),
      new THREE.Vector3(rect.x + half, y, rect.z - half),
      new THREE.Vector3(rect.x + half, y, rect.z + half),
      new THREE.Vector3(rect.x - half, y, rect.z + half),
      new THREE.Vector3(rect.x - half, y, rect.z - half),
    ]
    const ringGeo = track(new THREE.BufferGeometry().setFromPoints(points))
    const ring = new THREE.Line(ringGeo, assets.district)
    ring.visible = false
    ring.renderOrder = 3
    districtRings.set(district.id, ring)
    scene.add(ring)
  }

  /* ——— the buildings ———————————————————————————————————————————————————— */

  type BuildingRecord = {
    data: CityBuilding
    group: THREE.Group
    outline: THREE.LineSegments
    pad: THREE.Mesh
    districtId: DistrictId
  }

  const pickables: THREE.Object3D[] = []
  const records = new Map<string, BuildingRecord>()

  const buildRecord = (b: CityBuilding): BuildingRecord => {
    const look = districtLooks.get(b.district.id)!
    const group = new THREE.Group()
    for (const part of buildingParts(b)) {
      const geo = track(new THREE.BoxGeometry(part.w, part.h, part.d))
      scaleBoxUv(geo, part.w, part.h, part.d, 1.15)
      const material =
        part.kind === 'facade'
          ? look.facade
          : part.kind === 'roof'
            ? look.roof
            : part.kind === 'detail'
              ? look.detail
              : part.kind === 'side'
                ? look.side
                : assets.green
      const mesh = new THREE.Mesh(geo, material)
      mesh.position.set(part.x, part.y + part.h / 2, part.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)
    }
    group.userData.skillId = b.id

    // A crisp technical box around the whole silhouette, shown on hover.
    // Measured with the group at the origin, so the outline's position is local.
    group.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const outlineGeo = track(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x + 0.07, size.y + 0.07, size.z + 0.07)),
    )
    const outline = new THREE.LineSegments(outlineGeo, assets.outlineHover)
    outline.position.copy(center)
    outline.visible = false
    outline.renderOrder = 4
    outline.raycast = () => {}
    group.add(outline)

    // A flat green pad under the tower, so the selection reads from across the plate.
    const padGeo = track(new THREE.BoxGeometry(b.w + 0.7, 0.05, b.d + 0.7))
    const pad = new THREE.Mesh(padGeo, assets.green)
    pad.position.set(0, 0.02, 0)
    pad.visible = false
    pad.raycast = () => {}
    group.add(pad)

    // A small plate above the roof: the tower's code, its district stripe and
    // a tail that points back at the roof. Sprites always face the camera, so
    // the code stays readable while the city is orbited.
    const signTexture = track(rooftopTexture(b.skill.short, b.district.color))
    const signMaterial = track(
      new THREE.SpriteMaterial({
        map: signTexture,
        transparent: true,
        depthWrite: false,
        alphaTest: 0.02,
      }),
    )
    const sign = new THREE.Sprite(signMaterial)
    const signHeight = 1.625
    sign.scale.set(2.6, signHeight, 1)
    sign.position.set(center.x, box.max.y + 0.08 + signHeight / 2, center.z)
    sign.renderOrder = 6
    group.add(sign)

    // A landmark wears its mark on all four faces of its shaft, so the sign is
    // there whichever way the city is orbited. Flat plates two centimetres off
    // the wall: the tower keeps exactly the geometry buildingParts() drew.
    const logo = techLogos[b.id]
    if (logo && b.shape !== 'construction') {
      const signGeo = track(new THREE.PlaneGeometry(1, 1))
      const signMat = track(
        new THREE.MeshBasicMaterial({
          map: track(logoSign(logo)),
          transparent: true,
          depthWrite: false,
          alphaTest: 0.05,
        }),
      )
      const wide = Math.min(1.55, Math.max(0.72, b.w * 0.9))
      const deep = Math.min(1.55, Math.max(0.72, b.d * 0.9))
      const y = b.h * (b.shape === 'block' ? 0.5 : 0.66)
      const faces: Array<[number, number, number, number]> = [
        [0, b.d / 2 + 0.02, 0, wide],
        [0, -b.d / 2 - 0.02, Math.PI, wide],
        [b.w / 2 + 0.02, 0, Math.PI / 2, deep],
        [-b.w / 2 - 0.02, 0, -Math.PI / 2, deep],
      ]
      for (const [px, pz, ry, width] of faces) {
        const signPlace = new THREE.Mesh(signGeo, signMat)
        signPlace.position.set(px, y, pz)
        signPlace.rotation.y = ry
        signPlace.scale.set(width, width * 0.625, 1)
        signPlace.renderOrder = 5
        signPlace.raycast = () => {}
        group.add(signPlace)
      }
    }

    group.position.set(b.x, PLOT_HEIGHT + 0.01, b.z)

    const record: BuildingRecord = {
      data: b,
      group,
      outline,
      pad,
      districtId: b.district.id,
    }
    records.set(b.id, record)
    scene.add(group)
    pickables.push(group)
    return record
  }

  for (const building of cityBuildings) buildRecord(building)

  // Neighbourhood: low unnamed blocks. They cast shadows but are not pickable.
  for (const fabric of cityFabric) {
    const group = new THREE.Group()
    group.position.set(fabric.x, PLOT_HEIGHT + 0.01, fabric.z)
    const geo = track(new THREE.BoxGeometry(fabric.w, fabric.h, fabric.d))
    scaleBoxUv(geo, fabric.w, fabric.h, fabric.d, 1.15)
    const mesh = new THREE.Mesh(geo, assets.fabric)
    mesh.position.y = fabric.h / 2
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    scene.add(group)
  }

  // Traffic: little boxes on the road, just enough to give the blocks a scale.
  for (const car of cityVehicles) {
    const geo = track(
      new THREE.BoxGeometry(car.turned ? 0.15 : 0.36, 0.12, car.turned ? 0.36 : 0.15),
    )
    const mesh = new THREE.Mesh(
      geo,
      car.tone === 'cream' ? assets.vehicleCream : assets.vehicleDark,
    )
    mesh.position.set(car.x, 0.08, car.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
  }

  for (const mesh of plotMeshes.values()) pickables.push(mesh)

  /* ——— camera ———————————————————————————————————————————————————————————— */

  const cam = {
    azimuth: DEFAULT_AZIMUTH + (options.reducedMotion ? 0 : 0.3),
    elevation: DEFAULT_ELEVATION,
    zoom: options.reducedMotion ? 1 : 0.88,
    shift: 0,
    shiftY: 0,
    target: new THREE.Vector3(0, 2.4, 0),
  }
  const goal = {
    azimuth: DEFAULT_AZIMUTH,
    elevation: DEFAULT_ELEVATION,
    zoom: 1.06,
    shift: 0,
    shiftY: 0,
    target: new THREE.Vector3(0, 2.4, 0),
  }
  const view = { width: 1, height: 1, aspect: 1.6, fit: FIT_HEIGHT }

  const resize = () => {
    const rect = host.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    view.width = width
    view.height = height
    view.aspect = width / height
    // On a narrow screen the plate has to fit across, not down.
    view.fit = Math.max(FIT_HEIGHT, FIT_WIDTH / view.aspect)
    renderer.setSize(width, height, false)
  }

  const placeCamera = () => {
    const ce = Math.cos(cam.elevation)
    const se = Math.sin(cam.elevation)
    const viewHeight = view.fit / cam.zoom
    const viewWidth = viewHeight * view.aspect
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.left = -viewWidth / 2
    camera.right = viewWidth / 2
    camera.updateProjectionMatrix()

    const right = new THREE.Vector3(Math.cos(cam.azimuth), 0, -Math.sin(cam.azimuth))
    const forward = new THREE.Vector3(-Math.sin(cam.azimuth) * ce, -se, -Math.cos(cam.azimuth) * ce)
    const up = new THREE.Vector3().crossVectors(right, forward)
    const offset = right
      .multiplyScalar(viewWidth * cam.shift)
      .addScaledVector(up, viewHeight * cam.shiftY)
    camera.position.set(
      cam.target.x + DISTANCE * ce * Math.sin(cam.azimuth),
      cam.target.y + DISTANCE * se,
      cam.target.z + DISTANCE * ce * Math.cos(cam.azimuth),
    )
    camera.position.add(offset)
    camera.lookAt(cam.target.clone().add(offset))
  }

  resize()
  placeCamera()

  /* ——— picking ——————————————————————————————————————————————————————————— */

  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2()
  const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, inside: false }
  let hovered: string | null = null
  let hoverPoint: HoverPoint | null = null
  let selected: string | null = null
  let selectedDistrict: DistrictId | null = null
  let lastInteraction = typeof performance !== 'undefined' ? performance.now() : 0

  const setHovered = (id: string | null, at: HoverPoint | null) => {
    if (hovered === id) {
      // Follow the pointer, but do not re-render React for every mouse pixel.
      if (
        id &&
        at &&
        hoverPoint &&
        (Math.abs(at.x - hoverPoint.x) > 0.004 || Math.abs(at.y - hoverPoint.y) > 0.004)
      ) {
        hoverPoint = at
        options.onHover(id, at)
      }
      return
    }
    if (hovered) {
      const previous = records.get(hovered)
      if (previous) {
        previous.outline.visible = selected === hovered
        previous.pad.visible = selected === hovered
        if (selected === hovered) previous.outline.material = assets.outlineSelect
      }
    }
    hovered = id
    if (id) {
      const next = records.get(id)
      if (next) {
        next.outline.visible = true
        next.pad.visible = true
        next.outline.material = selected === id ? assets.outlineSelect : assets.outlineHover
      }
    }
    canvas.style.cursor = id ? 'pointer' : 'grab'
    hoverPoint = at
    options.onHover(id, at)
  }

  const pickAt = (clientX: number, clientY: number) => {
    const rect = host.getBoundingClientRect()
    pointerNdc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointerNdc, camera)
    const hits = raycaster.intersectObjects(pickables, true)
    for (const hit of hits) {
      let node: THREE.Object3D | null = hit.object
      while (node) {
        if (node.userData.skillId) {
          return { kind: 'skill' as const, id: node.userData.skillId as string }
        }
        if (node.userData.districtId) {
          return { kind: 'district' as const, id: node.userData.districtId as DistrictId }
        }
        node = node.parent
      }
    }
    return null
  }

  const pointerPosition = (event: PointerEvent): HoverPoint => {
    const rect = host.getBoundingClientRect()
    return {
      x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
      y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
    }
  }

  /* ——— selection ————————————————————————————————————————————————————————— */

  const applySelection = () => {
    for (const [id, record] of records) {
      const isSelected = id === selected
      if (isSelected) {
        record.outline.visible = true
        record.outline.material = assets.outlineSelect
        record.pad.visible = true
      } else {
        record.outline.visible = false
        record.outline.material = assets.outlineHover
        record.pad.visible = false
      }
    }
    for (const [id, ring] of districtRings) ring.visible = id === selectedDistrict
  }

  /** The dossier is a right-hand panel on wide screens, a bottom sheet on phones. */
  const sheetPanel = () => window.matchMedia('(max-width: 860px)').matches

  const focusSkill = (id: string) => {
    const record = records.get(id)
    if (!record) return
    selected = id
    selectedDistrict = record.districtId
    goal.target.set(record.data.x, PLOT_HEIGHT + Math.min(record.data.h * 0.5, 4.5), record.data.z)
    goal.zoom = 2.2
    goal.elevation = THREE.MathUtils.degToRad(31)
    const sheet = sheetPanel()
    goal.shift = !sheet && view.aspect > 1.05 ? 0.19 : 0
    goal.shiftY = sheet ? -0.3 : 0
    applySelection()
    lastInteraction = performance.now()
  }

  const focusDistrict = (id: DistrictId) => {
    const district = districts.find((d) => d.id === id)
    if (!district) return
    const rect = plotRect(district)
    selected = null
    selectedDistrict = id
    goal.target.set(rect.x, 1.6, rect.z)
    goal.zoom = 1.38
    goal.elevation = THREE.MathUtils.degToRad(34)
    const sheet = sheetPanel()
    goal.shift = !sheet && view.aspect > 1.05 ? 0.12 : 0
    goal.shiftY = sheet ? -0.22 : 0
    applySelection()
    lastInteraction = performance.now()
  }

  const clearFocus = () => {
    selected = null
    selectedDistrict = null
    goal.target.set(0, 2.4, 0)
    goal.zoom = 1.06
    goal.elevation = DEFAULT_ELEVATION
    goal.shift = 0
    goal.shiftY = 0
    applySelection()
  }

  const zoomBy = (factor: number) => {
    goal.zoom = clamp(goal.zoom * factor, MIN_ZOOM, MAX_ZOOM)
    lastInteraction = performance.now()
  }

  /* ——— input ————————————————————————————————————————————————————————————— */

  const abort = new AbortController()
  const signal = abort.signal
  const pointers = new Map<number, { x: number; y: number }>()
  let dragging = false
  let moved = 0
  let lastX = 0
  let lastY = 0
  let pinchDistance = 0
  let needsPick = false

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    canvas.setPointerCapture?.(event.pointerId)
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 1) {
      dragging = true
      moved = 0
      lastX = event.clientX
      lastY = event.clientY
      canvas.style.cursor = 'grabbing'
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinchDistance = Math.hypot(a.x - b.x, a.y - b.y)
    }
    lastInteraction = performance.now()
  }

  const onPointerMove = (event: PointerEvent) => {
    const point = pointerPosition(event)
    pointer.x = point.x
    pointer.y = point.y
    pointer.clientX = event.clientX
    pointer.clientY = event.clientY
    pointer.inside = true
    lastInteraction = performance.now()
    if (!dragging) needsPick = true

    if (!pointers.has(event.pointerId)) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchDistance > 0 && distance > 0) {
        zoomBy(distance / pinchDistance)
        goal.zoom = clamp(goal.zoom, MIN_ZOOM, MAX_ZOOM)
      }
      pinchDistance = distance
      return
    }

    if (!dragging) return
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    moved += Math.abs(dx) + Math.abs(dy)
    lastX = event.clientX
    lastY = event.clientY
    if (moved > 5 && hovered) setHovered(null, null)
    goal.azimuth -= dx * 0.006
    goal.elevation = clamp(goal.elevation + dy * 0.0045, MIN_ELEVATION, MAX_ELEVATION)
    lastInteraction = performance.now()
  }

  const endPointer = (event: PointerEvent, commit: boolean) => {
    pointers.delete(event.pointerId)
    if (pointers.size < 2) pinchDistance = 0
    if (pointers.size === 0) {
      canvas.style.cursor = hovered ? 'pointer' : 'grab'
      if (commit && dragging && moved < 7) {
        const hit = pickAt(event.clientX, event.clientY)
        if (hit?.kind === 'skill') {
          options.onSelect(hit.id)
        } else if (hit?.kind === 'district') {
          options.onDistrict(hit.id)
        } else {
          options.onSelect(null)
          options.onDistrict(null)
        }
      }
      dragging = false
    }
    needsPick = true
    lastInteraction = performance.now()
  }

  const onPointerUp = (event: PointerEvent) => endPointer(event, true)
  const onPointerCancel = (event: PointerEvent) => endPointer(event, false)

  const onPointerLeave = () => {
    pointer.inside = false
    setHovered(null, null)
  }

  const onWheel = (event: WheelEvent) => {
    const next = clamp(goal.zoom * Math.exp(-event.deltaY * 0.0011), MIN_ZOOM, MAX_ZOOM)
    // At either end of the zoom the page keeps scrolling, so the section is
    // never a wheel trap.
    if (Math.abs(next - goal.zoom) < 0.0001) return
    event.preventDefault()
    event.stopPropagation()
    goal.zoom = next
    lastInteraction = performance.now()
  }

  canvas.addEventListener('pointerdown', onPointerDown, { signal })
  canvas.addEventListener('pointermove', onPointerMove, { signal })
  canvas.addEventListener('pointerup', onPointerUp, { signal })
  canvas.addEventListener('pointercancel', onPointerCancel, { signal })
  canvas.addEventListener('pointerleave', onPointerLeave, { signal })
  canvas.addEventListener('wheel', onWheel, { signal, passive: false })
  canvas.addEventListener('contextmenu', (event) => event.preventDefault(), { signal })

  /* ——— render loop ——————————————————————————————————————————————————————— */

  const resizeObserver = new ResizeObserver(() => {
    resize()
    placeCamera()
  })
  resizeObserver.observe(host)

  let inView = true
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? true
      if (inView) lastInteraction = performance.now()
    },
    { rootMargin: '160px' },
  )
  intersectionObserver.observe(host)

  let visible = document.visibilityState !== 'hidden'
  const onVisibility = () => {
    visible = document.visibilityState !== 'hidden'
    last = performance.now()
  }
  document.addEventListener('visibilitychange', onVisibility, { signal })

  let raf = 0
  let last = performance.now()
  let disposed = false

  const frame = (now: number) => {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(64, now - last)
    last = now
    if (!inView || !visible) return

    // Idle turntable, slow enough to read as a model on a platter.
    if (
      !options.reducedMotion &&
      !dragging &&
      !selected &&
      !selectedDistrict &&
      !pointer.inside &&
      now - lastInteraction > 7000
    ) {
      goal.azimuth += dt * 0.00022
    }

    const smooth = 1 - Math.exp(-dt * 0.0075)
    cam.azimuth += (goal.azimuth - cam.azimuth) * smooth
    cam.elevation += (goal.elevation - cam.elevation) * smooth
    cam.zoom += (goal.zoom - cam.zoom) * smooth
    cam.shift += (goal.shift - cam.shift) * smooth
    cam.shiftY += (goal.shiftY - cam.shiftY) * smooth
    cam.target.lerp(goal.target, smooth)

    if (needsPick && pointer.inside && !dragging) {
      needsPick = false
      const hit = pickAt(pointer.clientX, pointer.clientY)
      if (hit?.kind === 'skill') {
        setHovered(hit.id, { x: pointer.x, y: pointer.y })
      } else {
        setHovered(null, null)
      }
    }

    placeCamera()
    renderer.render(scene, camera)
  }

  applySelection()
  raf = requestAnimationFrame(frame)

  return {
    focusSkill,
    focusDistrict,
    clearFocus,
    zoomBy,
    dispose: () => {
      disposed = true
      cancelAnimationFrame(raf)
      abort.abort()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      for (const item of disposables) item.dispose()
      renderer.dispose()
      if (canvas.parentElement === host) host.removeChild(canvas)
    },
  }
}
