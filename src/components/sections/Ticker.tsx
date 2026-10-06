import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { cn, prefersReducedMotion } from '../../lib/utils'

/**
 * Horizontal scroll band: two rows of giant display type that slide in
 * opposite directions, driven purely by scroll position — a second horizontal
 * axis that exists on every viewport (the pinned project track only runs on
 * desktop). Rows start edge-to-edge and drift, never exposing empty space.
 */
const ROWS: string[][] = [
  ['Web apps', 'Cloud labs', 'Android builds', 'Applied AI'],
  ['Hackathon prototypes', 'NIST University', 'Berhampur, India', 'CSE ’29']
]

export default function Ticker() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const rows = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-row]') ?? [])
    if (!rows.length) return
    const tweens = rows.map((row, i) => {
      const forward = i % 2 === 0
      return gsap.fromTo(
        row,
        { xPercent: forward ? 0 : -12 },
        {
          xPercent: forward ? -12 : 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5
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
  }, [])

  return (
    <section
      ref={root}
      aria-label="What I build"
      data-theme="dark"
      className="relative select-none overflow-hidden border-y border-white/10 bg-ink py-12"
    >
      <div className="grid gap-2">
        {ROWS.map((phrases, r) => (
          <div key={r} className="overflow-hidden">
            <div
              data-row
              className={cn(
                't-display flex w-max items-center gap-x-[0.45em] whitespace-nowrap text-[clamp(44px,8vw,116px)] leading-[1.02] uppercase',
                r === 0
                  ? 'text-lime'
                  : 'text-transparent [-webkit-text-stroke:1px_rgba(180,140,255,0.55)]'
              )}
            >
              {Array.from({ length: 4 }, (_, copy) => (
                <span key={copy} className="flex items-center gap-x-[0.45em]" aria-hidden={copy > 0 || undefined}>
                  {phrases.map((p) => (
                    <span key={p} className="flex items-center gap-x-[0.45em]">
                      {p}
                      <i className="text-[0.4em] not-italic opacity-60">✦</i>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
