import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { processSteps } from '../../lib/site'
import { usePrefersReducedMotion } from '../../hooks'
import { RevealHeading } from '../ui/RevealHeading'

/**
 * How the work gets made. A single hairline is drawn down the page as you
 * scroll, lighting up each step as it passes — the only "progress bar" the
 * design needs.
 */
export function Process() {
  const rootRef = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || reduced) return

      gsap.fromTo(
        '[data-process-line]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: '[data-process-list]',
            start: 'top 72%',
            end: 'bottom 62%',
            scrub: 0.6
          }
        }
      )

      gsap.utils.toArray<HTMLElement>('[data-process-step]').forEach((step) => {
        gsap.from(step, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 86%', once: true }
        })

        gsap.fromTo(
          step.querySelector('[data-process-dot]'),
          { scale: 0.6, backgroundColor: 'rgba(23,20,15,0.18)' },
          {
            scale: 1,
            backgroundColor: '#c0592c',
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: step, start: 'top 72%', once: true }
          }
        )
      })
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  return (
    <section id="process" ref={rootRef} className="relative z-10 px-5 py-[clamp(4.5rem,8vw,7.5rem)] sm:px-8">
      <div className="mx-auto w-full max-w-[86rem]">
        <div className="flex items-center gap-4 pb-10 sm:gap-6">
          <span className="size-1.5 shrink-0 rounded-full bg-ember-500" />
          <span className="label-mono text-ink-500">Process</span>
          <span className="h-px flex-1 bg-ink-900/10" />
          <span className="label-mono hidden text-ink-300 sm:block">05</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <RevealHeading
              as="h2"
              className="max-w-[20ch] text-[clamp(2.1rem,4.6vw,3.5rem)] font-medium leading-[0.99] tracking-[-0.045em] text-ink-900"
            >
              Three steps, <span className="serif-accent text-ember-600">every time.</span>
            </RevealHeading>
            <p className="mt-6 max-w-[40ch] text-[1rem] leading-relaxed text-ink-500">
              It is not a rigid methodology — it is the order in which good decisions tend to happen. Skipping straight
              to step two is how projects end up beautiful and useless.
            </p>
          </div>

          <div data-process-list className="relative pl-8 sm:pl-12">
            <span
              aria-hidden
              className="absolute left-[3px] top-2 h-[calc(100%-1rem)] w-px bg-ink-900/10 sm:left-[7px]"
            >
              <span data-process-line className="absolute inset-0 block origin-top bg-ink-900/60" />
            </span>

            <div className="space-y-14">
              {processSteps.map((step) => (
                <article key={step.index} data-process-step className="relative">
                  <span
                    data-process-dot
                    className="absolute -left-8 top-2 size-2 rounded-full bg-ink-900/20 sm:-left-12 sm:size-[9px]"
                  />
                  <div className="flex items-baseline gap-4">
                    <span className="serif-accent text-[1.6rem] leading-none text-ember-600">{step.index}</span>
                    <h3 className="text-[clamp(1.25rem,2.3vw,1.7rem)] font-medium leading-tight tracking-[-0.03em] text-ink-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-3 max-w-[58ch] text-[0.98rem] leading-relaxed text-ink-500">{step.body}</p>
                  <p className="label-mono mt-4 text-ink-300">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
