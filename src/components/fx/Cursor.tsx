import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { hasFinePointer } from '../../lib/utils'

/** Thin ring that lags the pointer, expands on interactive targets. */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasFinePointer()) return
    const el = ring.current!
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' })
    gsap.set(el, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 })

    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest('a,button,[data-cursor]')
      gsap.to(el, { scale: t ? 1.8 : 1, duration: 0.3 })
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [])

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[200] hidden h-8 w-8 rounded-full border transition-colors [border-color:var(--hd-cursor)] [@media(hover:hover)_and_(pointer:fine)]:block"
    />
  )
}
