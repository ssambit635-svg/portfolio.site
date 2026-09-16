import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { modelUrls } from './assets'
import { type ScrollRef } from './frame'
import { useModelGeometry } from './SceneCanvas'

type Props = {
  progress: ScrollRef
  /** Drag inside the canvas to spin the gem. */
  onDragChange?: (dragging: boolean) => void
}

/**
 * Faceted gem rendered with real transmission (refraction, chromatic
 * aberration). Draggable — the section wraps this in PresentationControls.
 */
export function CrystalGem({ progress }: Props) {
  const geometry = useModelGeometry(modelUrls.crystal)
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  /** Sized so the gem reads as an object, not a wall. */
  const BASE_SCALE = 0.78

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const p = progress.current
    const speed = 0.22 + p * 1.5 + (hovered ? 0.35 : 0)

    g.rotation.y += delta * speed
    g.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.09
    g.scale.setScalar(BASE_SCALE * (1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02))
  })

  if (!geometry) return null

  return (
    <group ref={group} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh geometry={geometry}>
        <MeshTransmissionMaterial
          samples={4}
          resolution={384}
          thickness={1.5}
          chromaticAberration={0.32}
          anisotropy={0.22}
          distortion={0.24}
          distortionScale={0.3}
          temporalDistortion={0.08}
          roughness={0.06}
          ior={1.42}
          color="#f7ead2"
          attenuationColor="#d97a4c"
          attenuationDistance={2.6}
          backside={false}
        />
      </mesh>
    </group>
  )
}

export function CrystalGemFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="size-40 rotate-45 rounded-[28%] bg-[linear-gradient(140deg,#fdf8ee,#e9dcc2)] shadow-[inset_0_2px_20px_rgba(255,255,255,0.9),0_24px_50px_-32px_rgba(90,76,52,0.65)]" />
    </div>
  )
}
