import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/utils'

let lenis: Lenis | null = null
let locked = false
export const getLenis = () => lenis

/** Freeze the page (native scroll + Lenis) — used by the preloader and menu. */
export function setScrollLocked(next: boolean) {
  if (typeof document === 'undefined') return
  locked = next
  document.documentElement.style.overflow = next ? 'hidden' : ''
  document.body.style.overflow = next ? 'hidden' : ''
  if (next) lenis?.stop()
  else lenis?.start()
}

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return
    lenis = new Lenis({
      duration: 1.65,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.52,
      touchMultiplier: 0.75
    })
    // The preloader locks the page before Lenis exists, so a wheel gesture
    // during the shutter must not be left for Lenis to answer later.
    if (locked) lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis?.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
      locked = false
    }
  }, [enabled])
}
