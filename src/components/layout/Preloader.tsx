import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { profile } from '../../lib/site'
import { useSmoothScroll } from '../../providers/SmoothScroll'
import { usePrefersReducedMotion } from '../../hooks'
import { setAppReady } from '../../lib/ready'

/**
 * Opening beat: a cream curtain with a counting mono counter, then two panels
 * split vertically to hand the page over to the hero. ~1.4s total, skippable
 * by any input, and instant for reduced-motion users.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)
  const reduced = usePrefersReducedMotion()
  const { stop, start } = useSmoothScroll()

  useEffect(() => {
    stop()
    return () => start()
  }, [stop, start])

  /** Hands the page over to the hero. Runs once, from the timeline or the fail-safe. */
  const finish = useCallback(() => {
    setAppReady(true)
    start()
    setGone(true)
  }, [start])

  // Whatever happens, the curtain lifts. A stuck intro would be worse than no intro.
  useEffect(() => {
    const id = window.setTimeout(finish, 4200)
    return () => window.clearTimeout(id)
  }, [finish])

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      if (reduced) {
        finish()
        return
      }

      const counter = { value: 0 }
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

      tl.from('[data-loader-line]', {
        yPercent: 112,
        opacity: 0,
        duration: 0.9,
        ease: 'editorial'
      })
        .from('[data-loader-meta]', { opacity: 0, y: 10, duration: 0.6, stagger: 0.08 }, 0.15)
        .to(
          counter,
          {
            value: 100,
            duration: 1.35,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0')
              }
            }
          },
          0.15
        )
        .to('[data-loader-bar]', { scaleX: 1, duration: 1.35, ease: 'power2.inOut' }, 0.15)
        .to('[data-loader-inner]', { opacity: 0, y: -18, duration: 0.5, ease: 'power2.in' }, '+=0.1')
        .to('[data-loader-panel="top"]', { yPercent: -101, duration: 1.05, ease: 'power4.inOut' }, '-=0.15')
        .to('[data-loader-panel="bottom"]', { yPercent: 101, duration: 1.05, ease: 'power4.inOut' }, '<')
        .add(finish)
        .to(root, { autoAlpha: 0, duration: 0.2 })

      // Any deliberate input skips the intro.
      const skip = () => tl.progress(0.86)
      window.addEventListener('wheel', skip, { passive: true, once: true })
      window.addEventListener('touchstart', skip, {
        passive: true,
        once: true
      })
      window.addEventListener('keydown', skip, { once: true })

      return () => {
        window.removeEventListener('wheel', skip)
        window.removeEventListener('touchstart', skip)
        window.removeEventListener('keydown', skip)
      }
    },
    { scope: rootRef, dependencies: [reduced, finish], revertOnUpdate: true }
  )

  if (gone) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
      <div data-loader-panel="top" className="absolute inset-x-0 top-0 h-1/2 bg-cream-100 will-change-transform" />
      <div
        data-loader-panel="bottom"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-cream-100 will-change-transform"
      />

      <div
        data-loader-inner
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
      >
        <div className="w-full max-w-xl">
          <div className="line-mask">
            <h1
              data-loader-line
              className="text-center text-[clamp(1.9rem,7vw,3.4rem)] font-medium tracking-[-0.05em] text-ink-900"
            >
              {profile.first} <span className="serif-accent text-ember-600">{profile.last}</span>
            </h1>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="label-mono" data-loader-meta>
              Loading portfolio
            </span>
            <span className="h-px flex-1 overflow-hidden bg-ink-900/12">
              <span
                data-loader-bar
                className="block h-px w-full origin-left bg-ember-500"
                style={{ transform: 'scaleX(0)' }}
              />
            </span>
            <span className="label-mono tabular-nums text-ink-900" data-loader-meta>
              <span ref={counterRef}>000</span>
            </span>
          </div>

          <p className="label-mono mt-3 text-center text-ink-300" data-loader-meta>
            WebGL · GSAP · Hand-built
          </p>
        </div>
      </div>
    </div>
  )
}
