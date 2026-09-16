import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { skillGroups } from '../../lib/site'
import { useMountWhenNear, usePrefersReducedMotion } from '../../hooks'
import { type ScrollRef } from '../../three/frame'
import { CrystalGemScene } from '../../three/LazyScene'
import { RevealHeading } from '../ui/RevealHeading'

/**
 * Capabilities. The faceted gem is a real glTF model shaded with transmission —
 * drag inside the frame to spin it. Everything else stays quiet: type, rules,
 * and hover states that reward a second look.
 */
export function Skills() {
  const rootRef = useRef<HTMLElement>(null)
  const progressRef = useRef<number>(0) as ScrollRef
  const reduced = usePrefersReducedMotion()
  const { ref: canvasHostRef, shouldMount } = useMountWhenNear<HTMLDivElement>('30% 0px 30% 0px')

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || reduced) return

      gsap.from('[data-skill-group]', {
        y: 34,
        opacity: 0,
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '[data-skill-grid]',
          start: 'top 88%',
          once: true
        }
      })

      gsap.to('[data-gem-canvas]', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  return (
    <section
      id="skills"
      ref={rootRef}
      className="relative z-10 overflow-hidden px-5 py-[clamp(4.5rem,8vw,7.5rem)] sm:px-8"
    >
      <div className="mx-auto w-full max-w-[86rem]">
        <div className="flex items-center gap-4 pb-10 sm:gap-6">
          <span className="size-1.5 shrink-0 rounded-full bg-ember-500" />
          <span className="label-mono text-ink-500">Capabilities</span>
          <span className="h-px flex-1 bg-ink-900/10" />
          <span className="label-mono hidden text-ink-300 sm:block">03</span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <RevealHeading
              as="h2"
              className="max-w-[26ch] text-[clamp(2.1rem,4.8vw,3.7rem)] font-medium leading-[0.99] tracking-[-0.045em] text-ink-900"
            >
              A focused stack — <span className="serif-accent text-ember-600">sharp where it matters.</span>
            </RevealHeading>
            <p className="mt-6 max-w-[52ch] text-[1rem] leading-relaxed text-ink-500">
              I would rather be genuinely good at a small set of tools than passingly familiar with thirty. Here is what
              I actually reach for, and roughly what I use it for.
            </p>
          </div>

          <div ref={canvasHostRef} data-gem-canvas className="relative">
            <div className="surface relative overflow-hidden rounded-[2rem] p-4">
              <CrystalGemScene
                mount={shouldMount && !reduced}
                active={shouldMount}
                className="h-[30vh] min-h-[240px] w-full"
                cameraPosition={[0, 0, 5.6]}
                fov={32}
                shadow="none"
                progress={progressRef}
              />

              <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                <span className="label-mono text-ink-300">drag to rotate</span>
                <span className="label-mono text-right text-ink-300">
                  glTF 2.0 · 80 tris
                  <br />
                  transmission shading
                </span>
              </div>
              <span className="label-mono pointer-events-none absolute left-4 top-4 text-ink-300">
                model-03 · crystal
              </span>
            </div>
          </div>
        </div>

        <div data-skill-grid className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group, index) => (
            <div key={group.title} data-skill-group className="border-t border-ink-900/12 pt-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[1.05rem] font-medium tracking-[-0.02em] text-ink-900">{group.title}</h3>
                <span className="label-mono text-ink-300">0{index + 1}</span>
              </div>
              <p className="mt-1.5 text-[0.86rem] text-ink-400">{group.note}</p>

              <ul className="mt-5 space-y-1">
                {group.items.map((item) => (
                  <li key={item}>
                    <span
                      data-cursor="link"
                      className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-[0.92rem] text-ink-700 transition-colors duration-400 hover:bg-cream-50/70 hover:text-ink-900"
                    >
                      {item}
                      <span className="h-px w-0 bg-ember-500/70 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-6" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
