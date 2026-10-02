import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/utils'

/**
 * Giant text rendered as a grid of dots. On fine pointers the dots warp around
 * the cursor; the marquee and continuous rendering pause when out of view.
 */
export default function DotText({ text, color = '#180735', speed = 40 }: { text: string; color?: string; speed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = prefersReducedMotion()
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    const step = 7
    const mouse = { x: -9999, y: -9999 }
    let offset = 0
    let last = performance.now()
    let textW = 0
    let points: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = []
    let inView = true
    let disposed = false

    const build = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect || rect.width < 1 || rect.height < 1) return
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const fontSize = h * 0.98
      const sample = document.createElement('canvas')
      const sampleCtx = sample.getContext('2d', { willReadFrequently: true })
      if (!sampleCtx) return
      sampleCtx.font = `600 ${fontSize}px "Big Shoulders Display", "Arial Narrow", sans-serif`
      const label = `${text}   ·   `
      textW = Math.ceil(sampleCtx.measureText(label).width)
      sample.width = textW
      sample.height = Math.ceil(h)
      sampleCtx.font = `600 ${fontSize}px "Big Shoulders Display", "Arial Narrow", sans-serif`
      sampleCtx.textBaseline = 'alphabetic'
      sampleCtx.fillStyle = '#000'
      sampleCtx.fillText(label, 0, h * 0.86)
      const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data
      points = []
      for (let y = step / 2; y < sample.height; y += step) {
        for (let x = step / 2; x < sample.width; x += step) {
          const i = ((y | 0) * sample.width + (x | 0)) * 4 + 3
          if (pixels[i] > 128) points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 })
        }
      }
      schedule()
    }

    const draw = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!reducedMotion && textW > 0) offset = (offset + speed * dt) % textW
      else offset = 0

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      const copies = textW ? Math.ceil(w / textW) + 2 : 1
      for (const point of points) {
        point.vx += (point.ox - point.x) * 0.12
        point.vy += (point.oy - point.y) * 0.12
        point.vx *= 0.82
        point.vy *= 0.82

        if (!reducedMotion) {
          for (let copy = 0; copy < copies; copy++) {
            const sx = point.ox - offset + copy * textW
            if (sx < -step || sx > w + step) continue
            const dx = sx - mouse.x
            const dy = point.oy - mouse.y
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared < 120 * 120) {
              const distance = Math.sqrt(distanceSquared) || 1
              const force = (1 - distance / 120) * 22
              point.vx += (dx / distance) * force * 0.35
              point.vy += (dy / distance) * force * 0.35
            }
          }
        }

        point.x += point.vx
        point.y += point.vy
        const dx = point.x - point.ox
        const dy = point.y - point.oy
        for (let copy = 0; copy < copies; copy++) {
          const sx = point.ox - offset + copy * textW + dx
          if (sx < -step || sx > w + step) continue
          const size = step * 0.62
          ctx.fillRect(sx - size / 2, point.oy + dy - size / 2, size, size)
        }
      }
      if (!reducedMotion) raf = requestAnimationFrame(draw)
    }

    const schedule = () => {
      if (!disposed && !raf && inView && !document.hidden) raf = requestAnimationFrame(draw)
    }

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = event.clientX - rect.left
      mouse.y = event.clientY - rect.top
    }
    const leave = () => {
      mouse.x = mouse.y = -9999
    }
    const visibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
      } else {
        schedule()
      }
    }
    const start = () => {
      if (!disposed) build()
    }

    if ('fonts' in document) document.fonts.load('600 100px "Big Shoulders Display"').then(start, start)
    else start()

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(build)
    if (resizeObserver && canvas.parentElement) resizeObserver.observe(canvas.parentElement)
    window.addEventListener('resize', build)
    if (!reducedMotion) {
      window.addEventListener('pointermove', move, { passive: true })
      document.addEventListener('pointerleave', leave)
    }
    document.addEventListener('visibilitychange', visibility)

    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting
            if (inView) schedule()
            else {
              if (raf) cancelAnimationFrame(raf)
              raf = 0
            }
          })
    intersectionObserver?.observe(canvas)

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      window.removeEventListener('resize', build)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [text, color, speed])

  return <canvas ref={ref} className="block h-full w-full" aria-label={text} role="img" />
}
