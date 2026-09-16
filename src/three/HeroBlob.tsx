import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { modelUrls } from './assets'
import { clayMaterialProps, type ScrollRef } from './frame'
import { useModelGeometry } from './SceneCanvas'
import { getPointer } from './pointer'

type Props = {
  /** 0 → 1 progress through the hero scroll scene. */
  progress: ScrollRef
  /**
   * When true the blob follows the pointer instead of the scroll progress —
   * used for the "hero is pinned and user is exploring" state.
   */
  hoverBoost?: boolean
}

/**
 * The hero model: a lumpy clay pebble, hand-modelled by the noise generator in
 * scripts/build-models.mjs. Rotates with the pointer, breathes on its own, and
 * pulls back / tips over as the page scrolls away from the hero.
 */
export function HeroBlob({ progress, hoverBoost = true }: Props) {
  const geometry = useModelGeometry(modelUrls.blob)
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const smoothed = useRef({ x: 0, y: 0 })

  /** Framed so the pebble fills ~70% of the canvas height. */
  const BASE_SCALE = 0.95

  useFrame((state, delta) => {
    const g = group.current
    const m = mesh.current
    if (!g || !m) return

    const pointer = getPointer()
    const ease = Math.min(1, delta * 4.2)
    const influence = hoverBoost ? 1 : 0.35

    smoothed.current.x += (pointer.x - smoothed.current.x) * ease
    smoothed.current.y += (pointer.y - smoothed.current.y) * ease

    const t = state.clock.elapsedTime
    const p = progress.current

    g.rotation.y = smoothed.current.x * 0.62 * influence + t * 0.055 + p * 0.7
    g.rotation.x = -smoothed.current.y * 0.34 * influence + Math.sin(t * 0.42) * 0.05
    g.rotation.z = p * 0.18
    g.position.y = Math.sin(t * 0.7) * 0.075 + p * 0.5
    g.position.x = smoothed.current.x * 0.16 * influence - p * 0.2
    g.scale.setScalar(BASE_SCALE * (1 - p * 0.2 + Math.sin(t * 0.5) * 0.008))

    m.rotation.z = -t * 0.02
  })

  if (!geometry) return null

  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={geometry} castShadow={false} receiveShadow={false}>
        <meshPhysicalMaterial {...clayMaterialProps.clay} sheen={0.5} sheenColor="#f6e2c8" sheenRoughness={0.72} />
      </mesh>
    </group>
  )
}
