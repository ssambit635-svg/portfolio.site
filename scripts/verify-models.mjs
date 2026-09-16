/**
 * Sanity-checks every generated .glb by parsing it with three's GLTFLoader
 * in Node. Run after scripts/build-models.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = resolve(__dirname, '../src/assets/models')

const loader = new GLTFLoader()
let failed = false

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.glb'))) {
  const buf = readFileSync(join(DIR, file))
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  try {
    const gltf = await new Promise((res, rej) => loader.parse(ab, '', res, rej))
    let meshes = 0
    let tris = 0
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        meshes++
        tris += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3
      }
    })
    console.log(`✓ ${file}: parsed, ${meshes} mesh(es), ~${Math.round(tris).toLocaleString()} tris`)
  } catch (err) {
    failed = true
    console.error(`✗ ${file}: ${err?.message || err}`)
  }
}

process.exit(failed ? 1 : 0)
