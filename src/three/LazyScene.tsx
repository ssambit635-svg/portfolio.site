import { Suspense, lazy, type ComponentProps } from 'react'
import { CanvasFallback, QuietBoundary } from './frame'

/**
 * WebGL entry points.
 *
 * The whole three.js layer (react-three-fiber + three + drei, ~320 KB gzipped)
 * is code-split behind React.lazy, so the hero text paints immediately and the
 * clay models stream in a beat later — crossfading out of the static shape
 * instead of blocking the first render.
 */

const SceneCanvas = lazy(() => import('./SceneCanvas').then((m) => ({ default: m.SceneCanvas })))
const HeroBlob = lazy(() => import('./HeroBlob').then((m) => ({ default: m.HeroBlob })))
const ClayKnot = lazy(() => import('./ClayKnot').then((m) => ({ default: m.ClayKnot })))
const CrystalGem = lazy(() => import('./CrystalGem').then((m) => ({ default: m.CrystalGem })))
const ClayPillar = lazy(() => import('./ClayPillar').then((m) => ({ default: m.ClayPillar })))

type CanvasProps = Omit<ComponentProps<typeof SceneCanvas>, 'children'>
type BlobProps = ComponentProps<typeof HeroBlob>
type KnotProps = ComponentProps<typeof ClayKnot>
type GemProps = ComponentProps<typeof CrystalGem>
type PillarProps = ComponentProps<typeof ClayPillar>

const fallbackShape = <CanvasFallback className="absolute inset-0" />

function LazyScene({ children, ...canvas }: CanvasProps & { children: React.ReactNode }) {
  return (
    <QuietBoundary fallback={fallbackShape}>
      <Suspense fallback={fallbackShape}>
        <SceneCanvas {...canvas}>{children}</SceneCanvas>
      </Suspense>
    </QuietBoundary>
  )
}

export function HeroBlobScene({ progress, ...canvas }: CanvasProps & Pick<BlobProps, 'progress'>) {
  return (
    <LazyScene {...canvas}>
      <HeroBlob progress={progress} />
    </LazyScene>
  )
}

export function ClayKnotScene({ progress, ...canvas }: CanvasProps & Pick<KnotProps, 'progress'>) {
  return (
    <LazyScene {...canvas}>
      <ClayKnot progress={progress} />
    </LazyScene>
  )
}

export function CrystalGemScene({ progress, ...canvas }: CanvasProps & Pick<GemProps, 'progress'>) {
  return (
    <LazyScene {...canvas}>
      <CrystalGem progress={progress} />
    </LazyScene>
  )
}

export function ClayPillarScene({ progress, ...canvas }: CanvasProps & Pick<PillarProps, 'progress'>) {
  return (
    <LazyScene {...canvas}>
      <ClayPillar progress={progress} />
    </LazyScene>
  )
}
