import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Three-free primitives shared by the WebGL layer and the sections that mount
 * it. Keeping this module free of three.js imports means the static fallback
 * can render before (and without) the ~320 KB WebGL chunk.
 */

/** A mutable scroll progress value (0 → 1) shared with the render loop. */
export type ScrollRef = { current: number }

/** Cream shape shown before WebGL loads, and instead of it when unavailable. */
export function CanvasFallback({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true" data-canvas-fallback>
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="h-[58%] w-[58%] rounded-[46%_54%_38%_62%/58%_42%_58%_42%] bg-[radial-gradient(120%_120%_at_30%_18%,#fffdf7_0%,#f0e7d6_46%,#ddcfb4_100%)] shadow-[inset_0_2px_18px_rgba(255,255,255,0.85),0_30px_60px_-40px_rgba(90,76,52,0.6)]"
          style={{ animation: 'var(--animate-breathe)' }}
        />
      </div>
    </div>
  )
}

/** Material presets for the clay models (three-agnostic plain objects). */
export const clayMaterialProps = {
  clay: { color: '#f4ecdc', roughness: 0.52, metalness: 0.04, clearcoat: 0.28, clearcoatRoughness: 0.6 },
  matte: { color: '#efe6d3', roughness: 0.78, metalness: 0.02, clearcoat: 0.06, clearcoatRoughness: 0.9 },
  porcelain: { color: '#fbf6ec', roughness: 0.24, metalness: 0.08, clearcoat: 0.55, clearcoatRoughness: 0.35 }
} as const

export type ClayMaterialPreset = keyof typeof clayMaterialProps

/**
 * Catches anything the WebGL layer throws — including a failed dynamic import
 * of the three.js chunk — and quietly keeps the static shape instead.
 */
export class QuietBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('3D scene unavailable, keeping static fallback:', error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
