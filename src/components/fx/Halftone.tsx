import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Renders an image as an RGB halftone / LED-matrix — the "dithered portrait"
 * from the hero. Dots respond to the pointer with a colour shift.
 */
export default function Halftone({ src, className }: { src?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d', { alpha: true })!
    let raf = 0
    let img: HTMLImageElement | null = null
    let w = 0
    let h = 0
    const mouse = { x: -9999, y: -9999 }
    const cell = 5

    const sample = document.createElement('canvas')
    const sctx = sample.getContext('2d', { willReadFrequently: true })!
    let data: Uint8ClampedArray | null = null
    let sw = 0
    let sh = 0

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect()
      w = canvas.width = Math.floor(r.width)
      h = canvas.height = Math.floor(r.height)
      sw = Math.ceil(w / cell)
      sh = Math.ceil(h / cell)
      sample.width = sw
      sample.height = sh
      if (img) {
        sctx.clearRect(0, 0, sw, sh)
        // cover-fit
        const s = Math.max(sw / img.width, sh / img.height)
        const dw = img.width * s
        const dh = img.height * s
        sctx.drawImage(img, (sw - dw) / 2, (sh - dh) / 2, dw, dh)
        data = sctx.getImageData(0, 0, sw, sh).data
      }
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      if (data) {
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4
            const l = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255
            if (l < 0.06) continue
            const px = x * cell
            const py = y * cell
            const dx = px - mouse.x
            const dy = py - mouse.y
            const d = Math.sqrt(dx * dx + dy * dy)
            const glow = Math.max(0, 1 - d / 220)
            const hue = (x * 3 + y * 2 + t * 0.03 + glow * 120) % 360
            const sat = 60 + glow * 40
            const light = 20 + l * 45 + glow * 20
            ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`
            const r = (cell * 0.5 * (0.35 + l)) | 0 || 1
            ctx.fillRect(px, py, r, r)
          }
        }
      } else {
        // fallback silhouette: soft noise column
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
            const glow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 220)
            const hue = (x * 3 + y * 2 + t * 0.03 + glow * 120) % 360
            ctx.fillStyle = `hsl(${hue} ${60 + glow * 40}% ${12 + l * 35 + glow * 20}%)`
            ctx.fillRect(px, py, 2, 2)
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

    if (src) {
      const im = new Image()
      im.crossOrigin = 'anonymous'
      im.onload = () => {
        img = im
        resize()
      }
      im.src = src
    }
    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerleave', leave)
    }
  }, [src])

  return <canvas ref={ref} className={cn('block h-full w-full', className)} aria-hidden />
}
