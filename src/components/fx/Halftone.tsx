import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Portrait rendered as an RGB LED-matrix. A soft pointer spotlight reveals the
 * original photo. Touch and keyboard users can toggle the same reveal.
 */
export default function Halftone({ src, className }: { src?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const sample = document.createElement('canvas')
    const sctx = sample.getContext('2d', { willReadFrequently: true })
    const full = document.createElement('canvas')
    const fctx = full.getContext('2d')
    const tmp = document.createElement('canvas')
    const tc = tmp.getContext('2d')
    if (!ctx || !sctx || !fctx || !tc) return

    let raf = 0
    let img: HTMLImageElement | null = null
    let w = 0
    let h = 0
    const cell = 5
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
    let reveal = 0
    let revealTarget = 0
    let touchPinned = false
    let pointerActivationPending = false
    let keyboardActivationPending = false
    let pointerClearTimer = 0
    let keyboardClearTimer = 0
    let inView = true
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let data: Uint8ClampedArray | null = null
    let sw = 0
    let sh = 0
    const radius = 150

    const fit = (context: CanvasRenderingContext2D, cw: number, ch: number) => {
      if (!img) return
      const scale = Math.max(cw / img.width, ch / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      context.clearRect(0, 0, cw, ch)
      context.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    const draw = (t: number) => {
      raf = 0
      const ease = reducedMotion ? 1 : 0.18
      mouse.x += (mouse.tx - mouse.x) * ease
      mouse.y += (mouse.ty - mouse.y) * ease
      reveal += (revealTarget - reveal) * (reducedMotion ? 1 : 0.1)

      ctx.clearRect(0, 0, w, h)

      if (data) {
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4
            const light = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255
            if (light < 0.03) continue

            const px = x * cell
            const py = y * cell
            const dx = px - mouse.x
            const dy = py - mouse.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const inside = Math.max(0, 1 - distance / radius) * reveal
            const halo = Math.max(0, 1 - distance / (radius * 1.9))
            const hue = (270 + x * 0.6 + y * 0.4 + (reducedMotion ? 0 : t * 0.02) + halo * 60) % 360
            const saturation = 55 + halo * 40
            const brightness = 14 + Math.pow(light, 0.75) * 52 + halo * 16
            ctx.globalAlpha = 1 - inside
            ctx.fillStyle = `hsl(${hue} ${saturation}% ${brightness}%)`
            const dot = Math.max(1, (cell * 0.55 * (0.35 + light)) | 0)
            ctx.fillRect(px, py, dot, dot)
          }
        }
        ctx.globalAlpha = 1

        // Draw the real photo only inside a reusable, soft circular mask.
        if (reveal > 0.01 && img) {
          tc.globalCompositeOperation = 'source-over'
          tc.clearRect(0, 0, w, h)
          tc.drawImage(full, 0, 0)
          tc.globalCompositeOperation = 'destination-in'
          const gradient = tc.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius)
          gradient.addColorStop(0, `rgba(0,0,0,${reveal})`)
          gradient.addColorStop(0.7, `rgba(0,0,0,${reveal * 0.85})`)
          gradient.addColorStop(1, 'rgba(0,0,0,0)')
          tc.fillStyle = gradient
          tc.fillRect(0, 0, w, h)
          tc.globalCompositeOperation = 'source-over'
          ctx.drawImage(tmp, 0, 0)
        }
      } else {
        // Calm fallback until the portrait asset is available.
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const cx = sw / 2
            const rx = Math.abs(x - cx) / (sw * 0.28)
            const ry = (y / sh - 0.35) * 2.2
            const body = Math.exp(-(rx * rx * 2.2 + Math.max(0, ry) * ry * 0.4))
            const head = Math.exp(-((rx * 2.4) ** 2 + ((y / sh - 0.22) * 6) ** 2))
            const light = Math.min(1, body * 0.5 + head * 0.9)
            if (light < 0.12) continue
            const px = x * cell
            const py = y * cell
            const distance = Math.hypot(px - mouse.x, py - mouse.y)
            const halo = Math.max(0, 1 - distance / 220)
            const hue = (270 + x * 0.6 + y * 0.4 + (reducedMotion ? 0 : t * 0.02) + halo * 60) % 360
            ctx.fillStyle = `hsl(${hue} ${55 + halo * 40}% ${12 + light * 35 + halo * 20}%)`
            ctx.fillRect(px, py, 2, 2)
          }
        }
      }

      const moving =
        Math.abs(mouse.tx - mouse.x) > 0.5 ||
        Math.abs(mouse.ty - mouse.y) > 0.5 ||
        Math.abs(revealTarget - reveal) > 0.01
      if (!reducedMotion || moving) raf = requestAnimationFrame(draw)
    }

    const schedule = () => {
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect || rect.width < 1 || rect.height < 1) return
      w = canvas.width = Math.floor(rect.width)
      h = canvas.height = Math.floor(rect.height)
      sw = Math.ceil(w / cell)
      sh = Math.ceil(h / cell)
      sample.width = sw
      sample.height = sh
      full.width = w
      full.height = h
      tmp.width = w
      tmp.height = h
      if (img) {
        fit(sctx, sw, sh)
        data = sctx.getImageData(0, 0, sw, sh).data
        fit(fctx, w, h)
      }
      schedule()
    }

    const locate = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height }
    }

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        if (!touchPinned) return
        const point = locate(event.clientX, event.clientY)
        mouse.tx = point.x
        mouse.ty = point.y
        revealTarget = point.inside ? 1 : 0
      } else {
        touchPinned = false
        canvas.setAttribute('aria-pressed', 'false')
        const point = locate(event.clientX, event.clientY)
        mouse.tx = point.x
        mouse.ty = point.y
        revealTarget = point.inside ? 1 : 0
      }
      schedule()
    }

    const togglePinned = (x: number, y: number) => {
      touchPinned = !touchPinned
      if (touchPinned) {
        mouse.tx = x
        mouse.ty = y
      }
      revealTarget = touchPinned ? 1 : 0
      canvas.setAttribute('aria-pressed', String(touchPinned))
      schedule()
    }

    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' && event.button !== 0) return
      const point = locate(event.clientX, event.clientY)
      if (!point.inside) return
      pointerActivationPending = true
      togglePinned(point.x, point.y)
    }

    const pointerUp = () => {
      window.clearTimeout(pointerClearTimer)
      pointerClearTimer = window.setTimeout(() => { pointerActivationPending = false }, 150)
    }

    const pointerCancel = () => {
      window.clearTimeout(pointerClearTimer)
      pointerActivationPending = false
    }

    const activateClick = () => {
      if (pointerActivationPending) {
        pointerActivationPending = false
        return
      }
      if (keyboardActivationPending) {
        keyboardActivationPending = false
        return
      }
      togglePinned(w / 2, h / 2)
    }

    const pointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || touchPinned) return
      revealTarget = 0
      schedule()
    }

    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      keyboardActivationPending = true
      window.clearTimeout(keyboardClearTimer)
      keyboardClearTimer = window.setTimeout(() => { keyboardActivationPending = false }, 150)
      togglePinned(w / 2, h / 2)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
      } else {
        schedule()
      }
    }

    if (src) {
      img = new Image()
      img.onload = () => resize()
      img.onerror = () => {
        img = null
        data = null
        schedule()
      }
      img.src = src
    }

    resize()
    schedule()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move, { passive: true })
    canvas.addEventListener('pointerdown', pointerDown)
    canvas.addEventListener('click', activateClick)
    canvas.addEventListener('pointerleave', pointerLeave)
    canvas.addEventListener('keydown', keyDown)
    window.addEventListener('pointerup', pointerUp)
    window.addEventListener('pointercancel', pointerCancel)
    document.addEventListener('visibilitychange', onVisibilityChange)

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    if (resizeObserver && canvas.parentElement) resizeObserver.observe(canvas.parentElement)

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
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(pointerClearTimer)
      window.clearTimeout(keyboardClearTimer)
      if (img) {
        img.onload = null
        img.onerror = null
      }
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('click', activateClick)
      canvas.removeEventListener('pointerleave', pointerLeave)
      canvas.removeEventListener('keydown', keyDown)
      window.removeEventListener('pointerup', pointerUp)
      window.removeEventListener('pointercancel', pointerCancel)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [src])

  return (
    <canvas
      ref={ref}
      className={cn('block h-full w-full touch-pan-y', className)}
      role="button"
      tabIndex={0}
      aria-label="Portrait of Sambit Swain. Hover or move to reveal the photo; tap or press Enter to toggle it."
      aria-pressed="false"
    />
  )
}
