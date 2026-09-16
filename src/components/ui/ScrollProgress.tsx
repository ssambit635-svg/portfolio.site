import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'

/** Hairline progress rail pinned above the nav. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const bar = barRef.current
    const wrap = wrapRef.current
    if (!bar || !wrap) return

    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress })
      },
      onToggle: (self) => {
        gsap.to(wrap, {
          opacity: self.isActive ? 1 : 0,
          duration: 0.4,
          overwrite: 'auto'
        })
      }
    })

    // Fade the rail out while the hero is on screen to keep it quiet.
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom top',
      onEnter: () => gsap.to(wrap, { opacity: 1, duration: 0.4 }),
      onLeaveBack: () => gsap.to(wrap, { opacity: 0, duration: 0.4 })
    })

    gsap.set(wrap, { opacity: 0 })
  }, [])

  return (
    <div ref={wrapRef} className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-px opacity-0">
      <div
        ref={barRef}
        className="h-px w-full origin-left bg-gradient-to-r from-ember-500/80 via-ember-400/70 to-ochre-500/60"
      />
    </div>
  )
}
