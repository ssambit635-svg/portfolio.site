import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { tickerWords } from '../../lib/site'

/**
 * Editorial marquee band. Scroll velocity bends it slightly — the only place
 * on the site where the layout itself reacts to how fast you are scrolling.
 */
export function Ticker() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const skewSetter = gsap.quickTo('[data-ticker-track]', 'skewX', {
        duration: 0.5,
        ease: 'power2.out'
      })
      const scaleSetter = gsap.quickTo('[data-ticker-track]', 'scaleY', {
        duration: 0.5,
        ease: 'power2.out'
      })

      let lastY = window.scrollY
      let raf = 0

      const tick = () => {
        const y = window.scrollY
        const velocity = y - lastY
        lastY = y
        const clamped = Math.max(-60, Math.min(60, velocity * 1.4))
        skewSetter(clamped * 0.06)
        scaleSetter(1 + Math.min(0.05, Math.abs(clamped) * 0.0009))
        raf = window.requestAnimationFrame(tick)
      }
      raf = window.requestAnimationFrame(tick)

      // Reveal the band as it enters.
      gsap.from(root, {
        opacity: 0,
        y: 26,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 96%', once: true }
      })

      return () => window.cancelAnimationFrame(raf)
    },
    { scope: rootRef, dependencies: [], revertOnUpdate: true }
  )

  const words = [...tickerWords, ...tickerWords]

  return (
    <div ref={rootRef} className="relative z-10 border-y border-ink-900/10 bg-cream-50/45 py-5 backdrop-blur-sm">
      <div className="mask-fade-x flex overflow-hidden">
        <div
          data-ticker-track
          className="flex w-max shrink-0 items-center will-change-transform"
          style={{ animation: 'marquee-x 38s linear infinite' }}
        >
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className="flex shrink-0 items-center">
              <span
                className={
                  index % 2 === 0
                    ? 'px-6 text-[clamp(1.1rem,2.4vw,1.9rem)] font-medium tracking-[-0.03em] text-ink-900/85'
                    : 'serif-accent px-6 text-[clamp(1.15rem,2.6vw,2rem)] text-ink-500'
                }
              >
                {word}
              </span>
              <span className="size-1 shrink-0 rounded-full bg-ember-500/60" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
