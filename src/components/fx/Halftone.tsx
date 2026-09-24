import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Portrait rendered as an RGB LED-matrix. Around the pointer the dots
 * dissolve and the real photo shows through (soft circular reveal).
 */
export default function Halftone({ src, className }: { src?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let img: HTMLImageElement | null = null
    let w = 0
    let h = 0
    const cell = 5
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
    let reveal = 0 // 0..1 eased when pointer is over the canvas
    let revealTarget = 0

    const sample = document.createElement('canvas')
    const sctx = sample.getContext('2d', { willReadFrequently: true })!
    const full = document.createElement('canvas')
    const fctx = full.getContext('2d')!
    let data: Uint8ClampedArray | null = null
    let sw = 0
    let sh = 0

    const fit = (c: CanvasRenderingContext2D, cw: number, ch: number) => {
      if (!img) return
      const s = Math.max(cw / img.width, ch / img.height)
      const dw = img.width * s
      const dh = img.height * s
      c.clearRect(0, 0, cw, ch)
      c.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect()
      w = canvas.width = Math.floor(r.width)
      h = canvas.height = Math.floor(r.height)
      sw = Math.ceil(w / cell)
      sh = Math.ceil(h / cell)
      sample.width = sw
      sample.height = sh
      full.width = w
      full.height = h
      if (img) {
        fit(sctx, sw, sh)
        data = sctx.getImageData(0, 0, sw, sh).data
        fit(fctx, w, h)
      }
    }

    // Reuse the reveal surface rather than allocating a canvas every frame.
    const tmp = document.createElement('canvas')
    const tc = tmp.getContext('2d')!
    const R = 150 // reveal radius

    const draw = (t: number) => {
      // ease pointer + reveal amount
      mouse.x += (mouse.tx - mouse.x) * 0.18
      mouse.y += (mouse.ty - mouse.y) * 0.18
      reveal += (revealTarget - reveal) * 0.1

      ctx.clearRect(0, 0, w, h)

      if (data) {
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4
            const l = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255
            if (l < 0.03) continue
            const px = x * cell
            const py = y * cell
            const dx = px - mouse.x
            const dy = py - mouse.y
            const d = Math.sqrt(dx * dx + dy * dy)
            const inside = Math.max(0, 1 - d / R) * reveal // 1 at pointer centre
            const halo = Math.max(0, 1 - d / (R * 1.9))
            const hue = (270 + x * 0.6 + y * 0.4 + t * 0.02 + halo * 60) % 360
            const sat = 55 + halo * 40
            const light = 14 + Math.pow(l, 0.75) * 52 + halo * 16
            ctx.globalAlpha = 1 - inside
            ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`
            const r = Math.max(1, (cell * 0.55 * (0.35 + l)) | 0)
            ctx.fillRect(px, py, r, r)
          }
        }
        ctx.globalAlpha = 1
        // real photo through a soft circular mask around the pointer
        if (reveal > 0.01 && img) {
          ctx.save()
          const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R)
          g.addColorStop(0, `rgba(0,0,0,${reveal})`)
          g.addColorStop(0.7, `rgba(0,0,0,${reveal * 0.85})`)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.globalCompositeOperation = 'source-over'
          // draw photo, then keep only the gradient area
          if (tmp.width !== w) tmp.width = w
          if (tmp.height !== h) tmp.height = h
          tc.globalCompositeOperation = 'source-over'
          tc.clearRect(0, 0, w, h)
          tc.drawImage(full, 0, 0)
          tc.globalCompositeOperation = 'destination-in'
          tc.fillStyle = g
          tc.fillRect(0, 0, w, h)
          ctx.drawImage(tmp, 0, 0)
          ctx.restore()
        }
      } else {
        // fallback silhouette until a portrait is provided
        for (let y = 0; y < sh; y++)
          for (let x = 0; x < sw; x++) {
            const cx = sw / 2
            const rx = Math.abs(x - cx) / (sw * 0.28)
            const ry = (y / sh - 0.35) * 2.2
            const body = Math.exp(-(rx * rx * 2.2 + Math.max(0, ry) * ry * 0.4))
            const head = Math.exp(-((rx * 2.4) ** 2 + ((y / sh - 0.22) * 6) ** 2))
            const l = Math.min(1, body * 0.5 + head * 0.9) * (0.4 + Math.random() * 0.6)
            if (l < 0.12) continue
            const px = x * cell
            const py = y * cell
            const dx = px - mouse.x
            const dy = py - mouse.y
            const halo = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 220)
            const hue = (270 + x * 0.6 + y * 0.4 + t * 0.02 + halo * 60) % 360
            ctx.fillStyle = `hsl(${hue} ${55 + halo * 40}% ${12 + l * 35 + halo * 20}%)`
            ctx.fillRect(px, py, 2, 2)
          }
      }
      raf = requestAnimationFrame(draw)
    }

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = e.clientX - r.left
      mouse.ty = e.clientY - r.top
      const over = mouse.tx >= 0 && mouse.ty >= 0 && mouse.tx <= r.width && mouse.ty <= r.height
      revealTarget = over ? 1 : 0
    }
    const leave = () => {
      revealTarget = 0
    }

    if (src) {
      const im = new Image()
      im.onload = () => {
        img = im
        resize()
      }
      im.onerror = () => {
        img = null
        data = null
      }
      im.src = src
    }
    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [src])

  return <canvas ref={ref} className={cn('block h-full w-full', className)} role="img" aria-label="Sambit Swain - Software Developer" />
}
