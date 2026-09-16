import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { modelUrls } from './assets'
import { clayMaterialProps, type ScrollRef } from './frame'
import { useModelGeometry } from './SceneCanvas'
import { getPointer } from './pointer'

type Props = {
  progress: ScrollRef
}

/** Ribbed clay column for the contact section: turns as you approach the CTA. */
export function ClayPillar({ progress }: Props) {
  const geometry = useModelGeometry(modelUrls.pillar)
  const group = useRef<THREE.Group>(null)
  const smoothed = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    const pointer = getPointer()
    const ease = Math.min(1, delta * 3.4)
    smoothed.current.x += (pointer.x - smoothed.current.x) * ease
    smoothed.current.y += (pointer.y - smoothed.current.y) * ease

    const p = progress.current
    g.rotation.y = p * Math.PI * 1.35 + smoothed.current.x * 0.35
    g.rotation.x = -0.08 + smoothed.current.y * 0.16
    g.position.y = -0.15 + Math.sin(state.clock.elapsedTime * 0.7) * 0.05 - p * 0.25
  })

  if (!geometry) return null

  return (
    <group ref={group} scale={1.16}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial {...clayMaterialProps.matte} sheen={0.45} sheenColor="#f0dcbe" />
      </mesh>
    </group>
  )
}
