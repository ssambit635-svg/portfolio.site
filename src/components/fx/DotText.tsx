import { useEffect, useRef } from 'react'

/**
 * Giant text rendered as a grid of dots on a canvas. Dots near the pointer
 * get pushed/warped outward and spring back — the footer effect from the
 * reference. Text scrolls as a slow marquee.
 */
export default function DotText({ text, color = '#180735', speed = 40 }: { text: string; color?: string; speed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    const step = 7
    const mouse = { x: -9999, y: -9999 }
    let offset = 0
    let last = performance.now()

    // pre-rasterise the text once to a sample canvas, read points
    let pts: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = []
    let textW = 0

    const build = () => {
      const r = canvas.parentElement!.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = r.width
      h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const fs = h * 0.98
      const s = document.createElement('canvas')
      const sc = s.getContext('2d', { willReadFrequently: true })!
      sc.font = `600 ${fs}px "Big Shoulders Display", "Arial Narrow", sans-serif`
      const label = text + '   ·   '
      textW = Math.ceil(sc.measureText(label).width)
      s.width = textW
      s.height = Math.ceil(h)
      sc.font = `600 ${fs}px "Big Shoulders Display", "Arial Narrow", sans-serif`
      sc.textBaseline = 'alphabetic'
      sc.fillStyle = '#000'
      sc.fillText(label, 0, h * 0.86)
      const d = sc.getImageData(0, 0, s.width, s.height).data
      pts = []
      for (let y = step / 2; y < s.height; y += step)
        for (let x = step / 2; x < s.width; x += step) {
          const i = ((y | 0) * s.width + (x | 0)) * 4 + 3
          if (d[i] > 128) pts.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 })
        }
    }

    const R = 120
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      offset = (offset + speed * dt) % textW

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      const copies = Math.ceil(w / textW) + 2
      for (const p of pts) {
        // spring back
        p.vx += (p.ox - p.x) * 0.12
        p.vy += (p.oy - p.y) * 0.12
        p.vx *= 0.82
        p.vy *= 0.82
        for (let c = 0; c < copies; c++) {
          const sx = p.ox - offset + c * textW
          if (sx < -step || sx > w + step) continue
          const dx = sx - mouse.x
          const dy = p.oy - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / R) * 22
            p.vx += (dx / d) * f * 0.35
            p.vy += (dy / d) * f * 0.35
          }
        }
        p.x += p.vx
        p.y += p.vy
        const dxo = p.x - p.ox
        const dyo = p.y - p.oy
        for (let c = 0; c < copies; c++) {
          const sx = p.ox - offset + c * textW + dxo
          if (sx < -step || sx > w + step) continue
          const sz = step * 0.62
          ctx.fillRect(sx - sz / 2, p.oy + dyo - sz / 2, sz, sz)
        }
      }
      raf = requestAnimationFrame(draw)
    }

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const leave = () => {
      mouse.x = mouse.y = -9999
    }

    const start = () => {
      build()
      raf = requestAnimationFrame(draw)
    }
    // make sure the display font is loaded before rasterising
    if ('fonts' in document) document.fonts.load('600 100px "Big Shoulders Display"').then(start, start)
    else start()

    window.addEventListener('resize', build)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [text, color, speed])

  return <canvas ref={ref} className="block h-full w-full" aria-label={text} role="img" />
}
