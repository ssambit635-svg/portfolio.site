/**
 * The living half of Skill City: toy cars running the three avenues, the lamp
 * standards along the kerbs and the zebra stripes at the junctions.
 *
 * The cars are real kit models, not boxes: Kenney's Car Kit 3.1 (CC0 1.0,
 * kenney.nl/assets/car-kit), meshopt-compressed to about forty kilobytes each
 * and drawn as one instanced mesh per type, so thirty vehicles cost four draw
 * calls. Every car keeps to its lane, eases off behind the car in front, and
 * gives way when the junction is already occupied: no vehicle ever drives
 * through another.
 *
 * The module owns its own geometry and materials and hands back a single
 * dispose, so the scene can be torn down without leaking a GPU buffer.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
  AVENUE_X,
  ROAD,
  cityCars,
  cityCrossings,
  cityLamps,
  trafficLanes,
  type CarEntry,
  type CarRole,
  type CityCarKind,
} from '../lib/skillCity'
import deliveryUrl from '../assets/cars/delivery.glb?url'
import hatchbackUrl from '../assets/cars/hatchback-sports.glb?url'
import raceUrl from '../assets/cars/race-future.glb?url'
import sedanUrl from '../assets/cars/sedan-sports.glb?url'
import taxiUrl from '../assets/cars/taxi.glb?url'

const CAR_URLS: Record<CityCarKind, string> = {
  sedan: sedanUrl,
  hatch: hatchbackUrl,
  supercar: raceUrl,
  van: deliveryUrl,
  taxi: taxiUrl,
}

/** A car under the pointer: what it is carrying, not just where it is. */
export type CarHit = {
  role: CarRole
  entry: CarEntry
  /** Distance along the ray, so the nearest of several hits wins. */
  distance: number
}

/** A car's state along its lane. */
type Runner = {
  kind: CityCarKind
  role: CarRole
  entry: CarEntry
  lane: number
  /** Position along the lane's axis, in world units. */
  at: number
  speed: number
  length: number
  /** Slot inside its type's instanced mesh. */
  slot: number
}

export type Traffic = {
  /** Advance the cars. `dt` is the frame's delta in seconds. */
  update: (dt: number) => void
  /** The car under this ray, if any. */
  hitTest: (raycaster: THREE.Raycaster) => CarHit | null
  dispose: () => void
}

/**
 * The kit models are meshopt-compressed with quantised attributes — positions
 * as normalised shorts, normals as bytes. Those cannot be transformed in
 * place, so copy them out into plain floats first.
 */
function dequantise(source: THREE.Mesh): THREE.BufferGeometry {
  const from = source.geometry
  const geometry = new THREE.BufferGeometry()
  const copy = (
    attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
    size: number,
  ) => {
    const out = new Float32Array(attribute.count * size)
    for (let i = 0; i < attribute.count; i += 1) {
      out[i * size] = attribute.getX(i)
      if (size > 1) out[i * size + 1] = attribute.getY(i)
      if (size > 2) out[i * size + 2] = attribute.getZ(i)
    }
    return new THREE.BufferAttribute(out, size)
  }
  const position = from.getAttribute('position')
  geometry.setAttribute('position', copy(position, 3))
  const normal = from.getAttribute('normal')
  if (normal) geometry.setAttribute('normal', copy(normal, 3))
  const uv = from.getAttribute('uv')
  if (uv) geometry.setAttribute('uv', copy(uv, 2))
  if (from.index) geometry.setIndex(from.index.clone())
  return geometry
}

/** A soft dark disc for the contact shadow under a car. */
function blob(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    )
    gradient.addColorStop(0, 'rgba(0,0,0,0.95)')
    gradient.addColorStop(0.55, 'rgba(0,0,0,0.55)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  return new THREE.CanvasTexture(canvas)
}

/** A soft warm disc, used as the halo around each lamp head. */
function halo(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    )
    gradient.addColorStop(0, 'rgba(255,246,226,0.95)')
    gradient.addColorStop(0.3, 'rgba(255,214,150,0.5)')
    gradient.addColorStop(1, 'rgba(255,190,110,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const dummy = new THREE.Object3D()
const JUNCTION_CLEAR = ROAD / 2 + 0.55

export function createTraffic(scene: THREE.Scene, camera: THREE.Camera, animate: boolean): Traffic {
  const disposables: Array<{ dispose: () => void }> = []
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  /* ——— zebra stripes at the two junctions ——————————————————————————————— */

  const stripeParts = cityCrossings.map((rect) =>
    new THREE.BoxGeometry(rect.w, 0.03, rect.d).translate(rect.x, 0.056, rect.z),
  )
  const stripeGeometry = track(mergeGeometries(stripeParts))
  for (const geometry of stripeParts) geometry.dispose()
  const stripeMaterial = track(new THREE.MeshBasicMaterial({ color: 0xd9cfb9 }))
  const stripeMesh = new THREE.Mesh(stripeGeometry, stripeMaterial)
  scene.add(stripeMesh)

  /* ——— lamp standards along the kerbs ——————————————————————————————————— */

  const postHeight = 1.46
  const armReach = 0.44
  const headX = armReach - 0.09
  const postGeometry = track(
    mergeGeometries([
      new THREE.CylinderGeometry(0.05, 0.075, postHeight, 8).translate(0, postHeight / 2, 0),
      new THREE.BoxGeometry(armReach, 0.042, 0.042).translate(armReach / 2, postHeight - 0.018, 0),
      new THREE.BoxGeometry(0.24, 0.08, 0.15).translate(headX, postHeight - 0.066, 0),
    ]),
  )
  const lensGeometry = track(
    new THREE.BoxGeometry(0.19, 0.026, 0.11).translate(headX, postHeight - 0.118, 0),
  )
  const postMaterial = track(new THREE.MeshLambertMaterial({ color: 0xe3d7bd }))
  const lensMaterial = track(new THREE.MeshBasicMaterial({ color: 0xffe6b4 }))
  const lampPosts = new THREE.InstancedMesh(postGeometry, postMaterial, cityLamps.length)
  const lampLenses = new THREE.InstancedMesh(lensGeometry, lensMaterial, cityLamps.length)
  lampPosts.castShadow = true
  lampPosts.receiveShadow = true
  cityLamps.forEach((lamp, index) => {
    dummy.position.set(lamp.x, 0.06, lamp.z)
    dummy.rotation.set(0, lamp.arm, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    lampPosts.setMatrixAt(index, dummy.matrix)
    lampLenses.setMatrixAt(index, dummy.matrix)
  })
  lampPosts.instanceMatrix.needsUpdate = true
  lampLenses.instanceMatrix.needsUpdate = true
  scene.add(lampPosts)
  scene.add(lampLenses)

  // The light itself. Points are not an option here — several GL back ends clamp
  // gl_PointSize to a single pixel — so each lamp head carries a small quad that
  // is turned to face the camera every frame: one draw call for all of them.
  const haloGeometry = track(new THREE.PlaneGeometry(1, 1))
  const haloMaterial = track(
    new THREE.MeshBasicMaterial({
      map: track(halo()),
      color: 0xffe0b0,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  )
  const halos = new THREE.InstancedMesh(haloGeometry, haloMaterial, cityLamps.length)
  halos.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  halos.frustumCulled = false
  scene.add(halos)

  const haloHeads = cityLamps.map((lamp) => ({
    x: lamp.x + Math.cos(lamp.arm) * headX,
    y: 0.06 + postHeight - 0.13,
    z: lamp.z - Math.sin(lamp.arm) * headX,
  }))
  const faceCamera = () => {
    haloHeads.forEach((head, index) => {
      dummy.position.set(head.x, head.y, head.z)
      dummy.quaternion.copy(camera.quaternion)
      dummy.scale.setScalar(0.56)
      dummy.updateMatrix()
      halos.setMatrixAt(index, dummy.matrix)
    })
    halos.instanceMatrix.needsUpdate = true
  }

  /* ——— the cars ————————————————————————————————————————————————————————— */

  const runners: Runner[] = []
  const slotByKind = new Map<CityCarKind, number>()
  for (const car of cityCars) {
    const slot = slotByKind.get(car.kind) ?? 0
    slotByKind.set(car.kind, slot + 1)
    runners.push({
      kind: car.kind,
      role: car.role,
      entry: car.entry,
      lane: car.lane,
      at: car.start,
      speed: car.speed,
      length: car.length,
      slot,
    })
  }
  const meshes = new Map<CityCarKind, THREE.InstancedMesh>()
  /** Which car sits in which instance slot, per type. Runners keep the order
   * they were added in, which is the order the slots were handed out. */
  const bySlot = new Map<CityCarKind, Runner[]>()
  for (const runner of runners) {
    const list = bySlot.get(runner.kind) ?? []
    list.push(runner)
    bySlot.set(runner.kind, list)
  }

  // The sun's shadow map skips the green carriageways, so every car carries a
  // soft contact shadow of its own — without it they read as decals.
  const shadowGeometry = track(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2))
  const shadowMaterial = track(
    new THREE.MeshBasicMaterial({
      map: track(blob()),
      color: 0x0d0c0a,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    }),
  )
  const contact = new THREE.InstancedMesh(shadowGeometry, shadowMaterial, runners.length)
  contact.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  contact.renderOrder = 1
  scene.add(contact)
  const shadeDummy = new THREE.Object3D()

  const place = (runner: Runner) => {
    const mesh = meshes.get(runner.kind)
    if (!mesh) return
    const lane = trafficLanes[runner.lane]
    const across = lane.road + lane.offset
    if (lane.axis === 'x') {
      dummy.position.set(runner.at, 0.07, across)
      dummy.rotation.set(0, lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0)
    } else {
      dummy.position.set(across, 0.07, runner.at)
      dummy.rotation.set(0, lane.dir > 0 ? Math.PI : 0, 0)
    }
    dummy.scale.setScalar(runner.length)
    dummy.updateMatrix()
    mesh.setMatrixAt(runner.slot, dummy.matrix)
    mesh.instanceMatrix.needsUpdate = true

    // Offset away from the sun, so the shadow falls where the light would put it.
    shadeDummy.position.set(
      dummy.position.x + runner.length * 0.22,
      0.062,
      dummy.position.z - runner.length * 0.16,
    )
    shadeDummy.rotation.copy(dummy.rotation)
    shadeDummy.scale.set(runner.length * 0.56, 1, runner.length * 1.02)
    shadeDummy.updateMatrix()
    contact.setMatrixAt(runners.indexOf(runner), shadeDummy.matrix)
    contact.instanceMatrix.needsUpdate = true
  }

  let disposed = false
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)

  const loadKind = async (kind: CityCarKind) => {
    const gltf = await loader.loadAsync(CAR_URLS[kind])
    if (disposed) {
      gltf.scene.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (mesh.isMesh) mesh.geometry.dispose()
      })
      return
    }
    let source: THREE.Mesh | undefined
    gltf.scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!source && mesh.isMesh) source = mesh
    })
    if (!source) return

    // Normalise the model: one unit long on its long axis, centred, wheels on
    // y = 0. Every instance is then just a position, a yaw and a scale.
    gltf.scene.updateMatrixWorld(true)
    const geometry = track(dequantise(source))
    geometry.applyMatrix4(source.matrixWorld)
    geometry.computeBoundingBox()
    const box = geometry.boundingBox ?? new THREE.Box3()
    const size = box.getSize(new THREE.Vector3())
    const centre = box.getCenter(new THREE.Vector3())
    geometry.translate(-centre.x, -box.min.y, -centre.z)
    if (size.x > size.z) geometry.rotateY(Math.PI / 2)
    const unit = 1 / Math.max(size.x, size.z)
    geometry.scale(unit, unit, unit)

    // The kit ships a single unlit-looking PBR material per car. Repaint it as
    // glossy paint: a specular highlight is what makes a toy car read as a car
    // at this size, and the map still carries the windows and lights.
    const paint = track(
      new THREE.MeshPhongMaterial({
        map: (source.material as THREE.MeshStandardMaterial).map ?? null,
        color: 0xffffff,
        specular: 0x8d8577,
        shininess: 46,
        side: THREE.FrontSide,
      }),
    )
    const mesh = new THREE.InstancedMesh(geometry, paint, slotByKind.get(kind) ?? 1)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    meshes.set(kind, mesh)
    scene.add(mesh)
    for (const runner of runners) if (runner.kind === kind) place(runner)
  }

  for (const kind of slotByKind.keys()) {
    // A missing or broken model must never take the city down.
    loadKind(kind).catch(() => undefined)
  }

  /* ——— traffic rules ———————————————————————————————————————————————————— */

  /** Is a car from the crossing avenue sitting in the junction at `junctionX`? */
  const junctionBusy = (junctionX: number, callerAxis: 'x' | 'z'): boolean => {
    for (const other of runners) {
      const lane = trafficLanes[other.lane]
      if (lane.axis === callerAxis) continue
      const x = lane.axis === 'x' ? other.at : lane.road
      const z = lane.axis === 'x' ? lane.road : other.at
      if (Math.abs(x - junctionX) > JUNCTION_CLEAR) continue
      if (Math.abs(z) > JUNCTION_CLEAR) continue
      return true
    }
    return false
  }

  /** Where this car has to hold, if a junction ahead is already taken. */
  const junctionLimit = (runner: Runner, lane: number): number => {
    const spec = trafficLanes[lane]
    let limit = spec.dir > 0 ? spec.to : spec.from
    const consider = (stop: number) => {
      const ahead = spec.dir > 0 ? stop > runner.at : stop < runner.at
      if (!ahead) return
      if (spec.dir > 0 ? stop < limit : stop > limit) limit = stop
    }
    const hold = (junctionX: number) => {
      if (!junctionBusy(junctionX, spec.axis)) return
      const stop =
        (spec.axis === 'x' ? junctionX : 0) - spec.dir * (ROAD / 2 + 0.5 + runner.length / 2)
      consider(stop)
    }
    if (spec.axis === 'x') {
      hold(-AVENUE_X)
      hold(AVENUE_X)
    } else {
      hold(spec.road)
    }
    return limit
  }

  /** Where this car has to hold to keep a gap to the car in front. */
  const followLimit = (runner: Runner, lane: number): number => {
    const spec = trafficLanes[lane]
    let limit = spec.dir > 0 ? spec.to : spec.from
    for (const other of runners) {
      if (other === runner || other.lane !== lane) continue
      const ahead = spec.dir > 0 ? other.at > runner.at : other.at < runner.at
      if (!ahead) continue
      const stop = other.at - spec.dir * (runner.length / 2 + other.length / 2 + 0.26)
      if (spec.dir > 0 ? stop < limit : stop > limit) limit = stop
    }
    return limit
  }

  const update = (dt: number) => {
    // The halos face the camera, so they keep working while the model is orbited.
    faceCamera()
    if (!animate) return
    for (const runner of runners) {
      const lane = trafficLanes[runner.lane]
      const next = runner.at + runner.speed * dt * lane.dir
      const limit = junctionLimit(runner, runner.lane)
      const follow = followLimit(runner, runner.lane)
      let stopAt = lane.dir > 0 ? Math.min(limit, follow) : Math.max(limit, follow)
      if (lane.dir > 0 ? stopAt < runner.at : stopAt > runner.at) stopAt = runner.at
      let target = next
      if (lane.dir > 0 ? target > stopAt : target < stopAt) target = stopAt
      if (lane.dir > 0 ? target >= lane.to : target <= lane.from) {
        target = lane.dir > 0 ? lane.from : lane.to
      }
      runner.at = target
      place(runner)
    }
  }

  const hitTest = (raycaster: THREE.Raycaster): CarHit | null => {
    let best: CarHit | null = null
    for (const [kind, mesh] of meshes) {
      for (const intersection of raycaster.intersectObject(mesh, false)) {
        const slot = intersection.instanceId
        if (slot === undefined) continue
        const runner = bySlot.get(kind)?.[slot]
        if (!runner) continue
        if (best && best.distance <= intersection.distance) continue
        best = { role: runner.role, entry: runner.entry, distance: intersection.distance }
      }
    }
    return best
  }

  return {
    update,
    hitTest,
    dispose: () => {
      disposed = true
      for (const mesh of meshes.values()) {
        scene.remove(mesh)
        mesh.dispose()
        ;(mesh.material as THREE.Material).dispose()
      }
      scene.remove(lampPosts)
      scene.remove(lampLenses)
      scene.remove(halos)
      scene.remove(contact)
      scene.remove(stripeMesh)
      lampPosts.dispose()
      lampLenses.dispose()
      halos.dispose()
      contact.dispose()
      for (const item of disposables) item.dispose()
    },
  }
}
