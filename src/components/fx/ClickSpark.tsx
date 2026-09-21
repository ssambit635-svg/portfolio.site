import { useEffect, useRef } from 'react'

type Spark = {
  x: number
  y: number
  angle: number
  born: number
  len: number
  ring?: boolean
}

const SPARK_COUNT = 9
const DURATION = 460
const RADIUS = 28
const GOLD = { r: 226, g: 183, b: 106 }

/**
 * Radiates a small burst of gold ink from every click, plus one expanding
 * ring — a tactile "spark" that makes the interface feel physically wired.
 * The canvas only runs while sparks are alive, so idle cost is zero.
 */
export function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
    const context = ctx

    let sparks: Spark[] = []
    let raf = 0
    let running = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr))
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const draw = () => {
      const now = performance.now()
      sparks = sparks.filter((s) => now - s.born < DURATION)
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const spark of sparks) {
        const t = (now - spark.born) / DURATION
        const eased = easeOut(t)

        if (spark.ring) {
          context.globalAlpha = (1 - t) * 0.5
          context.strokeStyle = `rgb(${GOLD.r} ${GOLD.g} ${GOLD.b})`
          context.lineWidth = 1.1
          context.beginPath()
          context.arc(spark.x, spark.y, eased * 34 + 3, 0, Math.PI * 2)
          context.stroke()
          continue
        }

        const inner = eased * RADIUS * spark.len
        const outer = inner + (1 - eased) * 11 + 3

        context.globalAlpha = 1 - t
        context.strokeStyle = `rgb(${GOLD.r} ${GOLD.g} ${GOLD.b})`
        context.lineWidth = 1.5
        context.lineCap = 'round'
        context.beginPath()
        context.moveTo(spark.x + Math.cos(spark.angle) * inner, spark.y + Math.sin(spark.angle) * inner)
        context.lineTo(spark.x + Math.cos(spark.angle) * outer, spark.y + Math.sin(spark.angle) * outer)
        context.stroke()
      }
      context.globalAlpha = 1

      if (sparks.length > 0) {
        raf = requestAnimationFrame(draw)
      } else {
        running = false
      }
    }

    const reducedMotion = () =>
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onPointerDown = (event: PointerEvent) => {
      if (reducedMotion()) return
      const now = performance.now()
      for (let i = 0; i < SPARK_COUNT; i++) {
        sparks.push({
          x: event.clientX,
          y: event.clientY,
          angle: (Math.PI * 2 * i) / SPARK_COUNT + Math.random() * 0.4,
          born: now,
          len: 0.7 + Math.random() * 0.6
        })
      }
      sparks.push({ x: event.clientX, y: event.clientY, angle: 0, born: now, len: 1, ring: true })
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
      className="pointer-events-none fixed inset-0 z-[998] h-full w-full mix-blend-screen"
      aria-hidden="true"
    />
  )
}
