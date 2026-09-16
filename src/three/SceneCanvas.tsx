import type { ErrorInfo, ReactNode } from 'react'
import { Component, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from '../lib/utils'
import { usePrefersReducedMotion } from '../hooks'
import { CanvasFallback } from './frame'

type SceneCanvasProps = {
  children: ReactNode
  className?: string
  /** Only mount the WebGL context when true (lazy, viewport-driven). */
  mount: boolean
  /** Keep rendering only while the section is on screen. */
  active: boolean
  cameraPosition?: [number, number, number]
  fov?: number
  dpr?: [number, number]
  /** Soft CSS shadow printed under the object — cheaper than a shadow pass. */
  shadow?: 'blob' | 'wide' | 'none'
}

/**
 * Shared WebGL shell.
 *
 * - mounts lazily, only when the section is near the viewport
 * - pauses the render loop when the section scrolls away
 * - keeps a cream CSS shape underneath and crossfades once the model is ready
 * - falls back to that shape entirely when WebGL is unavailable
 */
export function SceneCanvas({
  children,
  className,
  mount,
  active,
  cameraPosition = [0, 0, 5.2],
  fov = 34,
  dpr = [1, 1.75],
  shadow = 'blob'
}: SceneCanvasProps) {
  const reduced = usePrefersReducedMotion()
  const [sceneReady, setSceneReady] = useState(false)
  const onReady = useCallback(() => setSceneReady(true), [])

  const shadowClass = useMemo(() => {
    if (shadow === 'none') return 'hidden'
    return shadow === 'wide'
      ? 'absolute bottom-[6%] left-1/2 h-[16%] w-[74%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(107,92,68,0.30),transparent_70%)] blur-2xl'
      : 'absolute bottom-[12%] left-1/2 h-[12%] w-[58%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(107,92,68,0.28),transparent_72%)] blur-2xl'
  }, [shadow])

  return (
    <div className={cn('relative', className)}>
      {shadow !== 'none' ? <div aria-hidden className={shadowClass} /> : null}

      <CanvasFallback
        className={cn(
          'absolute inset-0 z-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
          mount && sceneReady ? 'opacity-0' : 'opacity-100'
        )}
      />

      {mount ? (
        <CanvasErrorBoundary fallback={null}>
          <Canvas
            className="absolute inset-0 z-10 !bg-transparent"
            frameloop={active && !reduced ? 'always' : 'demand'}
            dpr={dpr}
            camera={{ position: cameraPosition, fov }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.NeutralToneMapping
              gl.toneMappingExposure = 1.02
            }}
          >
            <Suspense fallback={null}>
              <StudioLights />
              {children}
              <SceneReady onReady={onReady} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      ) : null}
    </div>
  )
}

/** Fires once every suspended child has resolved — i.e. the model is on screen. */
function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onReady, 60)
    return () => window.clearTimeout(id)
  }, [onReady])
  return null
}

/** Warm, gallery-like three-point rig built from lights only (no HDR fetch). */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.72 * intensity} color="#fff6e9" />
      <hemisphereLight intensity={0.7 * intensity} color="#fff4e2" groundColor="#b9ad97" />
      <directionalLight position={[3.2, 4.2, 2.8]} intensity={2.1 * intensity} color="#fff2dc" castShadow={false} />
      <directionalLight position={[-4, 1.2, -2.4]} intensity={0.85 * intensity} color="#a9b79a" />
      <pointLight position={[0.6, -2.4, 3.2]} intensity={9 * intensity} distance={11} color="#e0a173" />
      <pointLight position={[-1.8, 2.2, -3]} intensity={5 * intensity} distance={12} color="#ffe9c6" />
    </>
  )
}

/**
 * WebGL can be unavailable (older devices, blocked GPU, headless browsers).
 * A failed canvas should never take the page down with it.
 */
class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('WebGL scene failed, using static fallback:', error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Loads a .glb and returns its geometry, cloned so React Three Fiber can own
 * the lifetime of the buffer. Materials that ship inside the file are
 * intentionally ignored — the creamy clay look is art-directed here.
 */
export function useModelGeometry(url: string) {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    scene.updateMatrixWorld(true)
    const mesh = scene.getObjectByProperty('isMesh', true) as THREE.Mesh | undefined
    return mesh?.geometry ? mesh.geometry.clone() : null
  }, [scene])
}
