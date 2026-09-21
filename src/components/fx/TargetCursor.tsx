import { useEffect, useRef } from 'react'
import { hasFinePointer } from '../../lib/utils'

/**
 * Custom cursor: a dot, a lagging halo ring and four corner brackets that
 * rest around the pointer and expand to frame any hovered `.cursor-target`.
 * The brackets warm to gold over interactive elements.
 * Renders nothing on touch devices.
 */

const GOLD = '226 183 106'

export function TargetCursor() {
  const enabled = hasFinePointer()
  const dotRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!enabled) return

    document.body.classList.add('target-cursor')

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let curX = mouseX
    let curY = mouseY
    let haloX = mouseX
    let haloY = mouseY
    let pressed = 0
    let raf = 0
    let last = performance.now()

    let target: HTMLElement | null = null
    let pad = 6

    const applyFrame = (x: number, y: number, w: number, h: number, active: boolean) => {
      const [tl, tr, bl, br] = frameRefs.current
      if (!tl || !tr || !bl || !br) return
      const size = active ? 14 : 5
      const color = active ? `rgb(${GOLD})` : 'var(--foreground)'
      const set = (el: HTMLSpanElement, left: number, top: number) => {
        el.style.transform = `translate(${left}px, ${top}px) translate(-50%, -50%)`
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.opacity = active ? '1' : '0.8'
        el.style.borderColor = color
        el.style.filter = active ? `drop-shadow(0 0 6px rgb(${GOLD} / 0.6))` : 'none'
      }
      set(tl, x, y)
      set(tr, x + w, y)
      set(bl, x, y + h)
      set(br, x + w, y + h)
    }

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      const hit = (event.target as HTMLElement | null)?.closest?.('.cursor-target') as HTMLElement | null
      target = hit ?? null
    }

    const onDown = () => {
      pressed = 1
      pad = 2
    }
    const onUp = () => {
      pressed = 0
      pad = 6
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // Dot leads, halo trails — the gap between them reads as speed.
      const lead = 1 - Math.exp(-26 * dt)
      const trail = 1 - Math.exp(-11 * dt)
      curX += (mouseX - curX) * lead
      curY += (mouseY - curY) * lead
      haloX += (mouseX - haloX) * trail
      haloY += (mouseY - haloY) * trail

      const dot = dotRef.current
      if (dot) {
        const scale = (target ? 0.55 : 1) * (pressed ? 0.7 : 1)
        dot.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%) scale(${scale.toFixed(3)})`
        dot.style.background = target ? `rgb(${GOLD})` : 'var(--foreground)'
        dot.style.boxShadow = target ? `0 0 12px rgb(${GOLD} / 0.8)` : 'none'
      }

      const halo = haloRef.current
      if (halo) {
        const speed = Math.min(Math.hypot(mouseX - curX, mouseY - curY) / 40, 1)
        const size = target ? 46 : 26 + speed * 12
        halo.style.width = `${size.toFixed(1)}px`
        halo.style.height = `${size.toFixed(1)}px`
        halo.style.transform = `translate(${haloX}px, ${haloY}px) translate(-50%, -50%)`
        halo.style.opacity = target ? '0.9' : `${(0.35 + speed * 0.4).toFixed(2)}`
        halo.style.borderColor = target
          ? `rgb(${GOLD} / 0.7)`
          : 'color-mix(in oklch, var(--foreground) 45%, transparent)'
      }

      if (target) {
        const rect = target.getBoundingClientRect()
        applyFrame(rect.left - pad, rect.top - pad, rect.width + pad * 2, rect.height + pad * 2, true)
      } else {
        applyFrame(curX - 10, curY - 10, 20, 20, false)
      }

      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    raf = requestAnimationFrame(loop)

    return () => {
      document.body.classList.remove('target-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  const bracket = 'pointer-events-none fixed left-0 top-0 z-[999] border-foreground will-change-transform'

  return (
    <>
      <div
        ref={haloRef}
        className="pointer-events-none fixed left-0 top-0 z-[998] h-6 w-6 rounded-full border will-change-transform"
        style={{ transition: 'width 220ms ease-out, height 220ms ease-out, border-color 220ms ease-out' }}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[999] h-1.5 w-1.5 rounded-full bg-foreground will-change-transform"
        aria-hidden="true"
      />
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          ref={(el) => {
            frameRefs.current[i] = el
          }}
          className={`${bracket} ${
            i === 0
              ? 'border-l-2 border-t-2'
              : i === 1
                ? 'border-r-2 border-t-2'
                : i === 2
                  ? 'border-b-2 border-l-2'
                  : 'border-b-2 border-r-2'
          }`}
          aria-hidden="true"
        />
      ))}
    </>
  )
}
