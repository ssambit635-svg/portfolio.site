import { useEffect, useRef } from 'react'

type Spark = {
  x: number
  y: number
  angle: number
  born: number
}

const SPARK_COUNT = 8
const DURATION = 420
const RADIUS = 26

/**
 * Radiates a small burst of ink lines from every click — a tactile
 * "spark" that makes the monochrome UI feel alive.
 */
export function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let sparks: Spark[] = []
    let raf = 0
    let running = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const draw = () => {
      const now = performance.now()
      sparks = sparks.filter((s) => now - s.born < DURATION)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const ink = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()

      for (const spark of sparks) {
        const t = (now - spark.born) / DURATION
        const eased = easeOut(t)
        const inner = eased * RADIUS
        const outer = inner + (1 - eased) * 10 + 3

        ctx.globalAlpha = 1 - t
        ctx.strokeStyle = ink
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(spark.x + Math.cos(spark.angle) * inner, spark.y + Math.sin(spark.angle) * inner)
        ctx.lineTo(spark.x + Math.cos(spark.angle) * outer, spark.y + Math.sin(spark.angle) * outer)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      if (sparks.length > 0) {
        raf = requestAnimationFrame(draw)
      } else {
        running = false
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const now = performance.now()
      for (let i = 0; i < SPARK_COUNT; i++) {
        sparks.push({
          x: event.clientX,
          y: event.clientY,
          angle: (Math.PI * 2 * i) / SPARK_COUNT + Math.random() * 0.45,
          born: now
        })
      }
      if (!running) {
        running = true
        raf = requestAnimationFrame(draw)
      }
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[998] h-full w-full"
      aria-hidden="true"
    />
  )
}
