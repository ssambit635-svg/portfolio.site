import { useEffect, useRef, useState } from 'react'

/**
 * Animated film grain.
 *
 * A 96×96 noise tile is generated once into an offscreen canvas and then
 * blitted as a repeating pattern with a random offset ~24 times a second —
 * the texture of real film stock for a fraction of the cost of a shader.
 * Where 2D canvas is unavailable (jsdom, exotic runtimes) a static SVG
 * turbulence data-URI carries the same effect.
 */

const TILE = 96
const FALLBACK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")"

export function Grain({
  opacity = 0.07,
  className = '',
  zIndex = 3,
  fixed = true
}: {
  opacity?: number
  className?: string
  zIndex?: number
  fixed?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasAlive, setCanvasAlive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      ctx = null
    }
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr))
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr))
    }
    resize()

    /* One grayscale noise tile, reused forever. */
    const tile = document.createElement('canvas')
    tile.width = TILE
    tile.height = TILE
    const tileCtx = tile.getContext('2d')
    if (!tileCtx) return
    const image = tileCtx.createImageData(TILE, TILE)
    for (let i = 0; i < image.data.length; i += 4) {
      const v = 105 + Math.random() * 150
      image.data[i] = v
      image.data[i + 1] = v
      image.data[i + 2] = v
      image.data[i + 3] = 255
    }
    tileCtx.putImageData(image, 0, 0)

    let pattern: CanvasPattern | null = null
    try {
      pattern = ctx.createPattern(tile, 'repeat')
    } catch {
      pattern = null
    }
    if (!pattern) return

    setCanvasAlive(true)

    const reduced =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let timer = 0
    let alive = true

    const blit = () => {
      if (!alive) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const jitterX = Math.floor(Math.random() * TILE)
      const jitterY = Math.floor(Math.random() * TILE)
      ctx.setTransform(dpr, 0, 0, dpr, -jitterX * dpr, -jitterY * dpr)
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, canvas.width / dpr + TILE * 2, canvas.height / dpr + TILE * 2)
      if (!reduced) timer = window.setTimeout(blit, 42)
    }
    blit()

    const onVisibility = () => {
      if (document.hidden) {
        window.clearTimeout(timer)
      } else if (!reduced) {
        window.clearTimeout(timer)
        blit()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', resize)

    return () => {
      alive = false
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      setCanvasAlive(false)
    }
  }, [])

  if (!canvasAlive) {
    return (
      <div
        aria-hidden="true"
        className={`grain-layer pointer-events-none absolute inset-0 mix-blend-overlay ${className}`}
        style={{ opacity: opacity * 1.5, zIndex, backgroundImage: FALLBACK }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none mix-blend-overlay ${fixed ? 'fixed' : 'absolute'} inset-0 h-full w-full ${className}`}
      style={{ opacity, zIndex }}
    />
  )
}
