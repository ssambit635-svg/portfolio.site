/**
 * Generates the 3D model assets (.glb) shipped with the portfolio.
 * Run with: node scripts/build-models.mjs
 *
 * Uses three.js geometry + GLTFExporter in Node so the models are real,
 * standalone binary glTF files that can be loaded by anyone.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/assets/models')
mkdirSync(OUT, { recursive: true })

/* three's GLTFExporter expects a browser FileReader; Node 22 has Blob but not FileReader. */
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null
      this.onloadend = null
      this.onerror = null
    }
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = buf
          this.onloadend?.({ target: this })
        })
        .catch((err) => this.onerror?.(err))
    }
    readAsDataURL(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = `data:application/octet-stream;base64,${Buffer.from(buf).toString('base64')}`
          this.onloadend?.({ target: this })
        })
        .catch((err) => this.onerror?.(err))
    }
  }
}

/* ---------------------------------- noise --------------------------------- */

function hash3(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647
  h = (h ^ (h >> 13)) * 1274126177
  return ((h ^ (h >> 16)) >>> 0) / 4294967295
}

function smoothNoise(x, y, z) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)

  const lerp = (a, b, t) => a + (b - a) * t
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz)

  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u)
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), u)
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u)
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), u)
  const y0 = lerp(x00, x10, v)
  const y1 = lerp(x01, x11, v)
  return lerp(y0, y1, w) * 2 - 1
}

function fbm(x, y, z, octaves = 4, lacunarity = 2.1, gain = 0.5) {
  let amp = 1
  let freq = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * smoothNoise(x * freq, y * freq, z * freq)
    norm += amp
    amp *= gain
    freq *= lacunarity
  }
  return sum / norm
}

/* -------------------------------- geometries ------------------------------- */

/** Soft organic clay blob — the hero model. */
function blobGeometry({ radius = 1, detail = 6, amp = 0.34, scale = 1.35 } = {}) {
  const geo = new THREE.IcosahedronGeometry(radius, detail)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = v.clone().normalize()
    const d =
      fbm(n.x * scale + 11.3, n.y * scale + 4.7, n.z * scale + 19.1, 4) * amp +
      fbm(n.x * scale * 3.4, n.y * scale * 3.4, n.z * scale * 3.4, 2) * amp * 0.22
    v.copy(n).multiplyScalar(radius + d)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
  return geo
}

/** Twisted torus knot — secondary shape used in the about / process sections. */
function knotGeometry({ radius = 0.72, tube = 0.26, tubularSegments = 220, radialSegments = 28 } = {}) {
  const geo = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, 2, 3)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = v.clone().normalize()
    const d = fbm(n.x * 2.6 + 3.1, n.y * 2.6 + 7.9, n.z * 2.6 + 1.4, 3) * 0.055
    pos.setXYZ(i, v.x + n.x * d, v.y + n.y * d, v.z + n.z * d)
  }
  geo.computeVertexNormals()
  return geo
}

/** Faceted crystal / gem used as an accent in the work section. */
function crystalGeometry({ radius = 1, detail = 1 } = {}) {
  const geo = new THREE.IcosahedronGeometry(radius, detail)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    v.y *= 1.42
    const j = (hash3(Math.round(v.x * 40), Math.round(v.y * 40), Math.round(v.z * 40)) - 0.5) * 0.09
    v.multiplyScalar(1 + j)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

/** Ribbed column / pedestal used in the contact section. */
function pillarGeometry({ height = 1.9, radialSegments = 72, ribs = 12, twist = 0.22 } = {}) {
  const geo = new THREE.CylinderGeometry(0.42, 0.58, height, radialSegments, 32, false)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const angle = Math.atan2(v.z, v.x)
    const rad = Math.hypot(v.x, v.z)
    const t = v.y / height + 0.5
    const rib = Math.sin(angle * ribs + t * Math.PI * twist * 6) * 0.035
    const taper = 1 - 0.22 * t
    const r2 = rad * taper + rib
    pos.setXYZ(i, Math.cos(angle) * r2, v.y + Math.sin(angle * ribs) * 0.012, Math.sin(angle) * r2)
  }
  geo.computeVertexNormals()
  return geo
}

/* ---------------------------------- export -------------------------------- */

const exporter = new GLTFExporter()

function exportGLB(name, geometry) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xf2ece0 }))
  mesh.name = `${name}-mesh`
  return new Promise((res, rej) => {
    exporter.parse(
      mesh,
      (result) => {
        const buffer = Buffer.from(result)
        const file = resolve(OUT, `${name}.glb`)
        writeFileSync(file, buffer)
        console.log(
          `✓ ${name}.glb — ${geometry.attributes.position.count.toLocaleString()} verts, ${(
            buffer.byteLength / 1024
          ).toFixed(0)} KB`
        )
        res(file)
      },
      (err) => rej(err),
      { binary: true, onlyVisible: false, truncateDrawRange: false }
    )
  })
}

const jobs = [
  ['blob', blobGeometry({ detail: 10, amp: 0.32 })],
  ['knot', knotGeometry()],
  ['crystal', crystalGeometry()],
  ['pillar', pillarGeometry()]
]

for (const [name, geo] of jobs) {
  await exportGLB(name, geo)
}
console.log('\nModels written to src/assets/models')
