import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/utils'

/**
 * Depth parallax for scroll.
 *
 * Any element marked `data-plx="<pixels>"` drifts by that many pixels while
 * its nearest section/`footer` crosses the viewport:
 *   negative = foreground layer (races ahead of the scroll),
 *   positive = background layer (lags behind it).
 * Mixing the two around a section is what sells the depth.
 *
 * Disabled for reduced-motion users; everything then simply sits still.
 */
export function useParallax() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-plx]'))
      const tweens = els.map((el) => {
        const dy = Number(el.dataset.plx) || 0
        const trigger = el.closest('section, footer') || el
        return gsap.fromTo(
          el,
          { y: 0 },
          {
            y: dy,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
              invalidateOnRefresh: true
            }
          }
        )
      })
      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill()
          t.kill()
        })
      }
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
  }, [])
}
