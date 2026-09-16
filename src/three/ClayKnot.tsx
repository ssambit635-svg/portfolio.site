import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { modelUrls } from './assets'
import { clayMaterialProps, type ScrollRef } from './frame'
import { useModelGeometry } from './SceneCanvas'
import { getPointer } from './pointer'

type Props = {
  progress: ScrollRef
  /** Hover speeds the knot up — a small reward for exploring. */
  interactive?: boolean
}

/** Sculptural knot for the about section: slow tumble, scroll-linked spin. */
export function ClayKnot({ progress, interactive = true }: Props) {
  const geometry = useModelGeometry(modelUrls.knot)
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const speed = useRef(0)
  const smoothed = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    const target = interactive && hovered ? 0.9 : 0.16
    speed.current += (target - speed.current) * Math.min(1, delta * 3)

    const pointer = getPointer()
    const ease = Math.min(1, delta * 3)
    smoothed.current.x += (pointer.x - smoothed.current.x) * ease
    smoothed.current.y += (pointer.y - smoothed.current.y) * ease

    const p = progress.current
    g.rotation.y += delta * speed.current
    g.rotation.x = 0.22 + smoothed.current.y * 0.25 - p * 0.6
    g.rotation.z = smoothed.current.x * 0.3
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06
  })

  if (!geometry) return null

  return (
    <group
      ref={group}
      onPointerOver={() => interactive && setHovered(true)}
      onPointerOut={() => interactive && setHovered(false)}
    >
      <mesh geometry={geometry} scale={1.24}>
        <meshPhysicalMaterial
          {...clayMaterialProps.porcelain}
          iridescence={0.22}
          iridescenceIOR={1.24}
          sheen={0.3}
          sheenColor="#e9d6b6"
        />
      </mesh>
    </group>
  )
}
