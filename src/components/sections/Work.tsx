import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { projects, profile } from '../../lib/site'
import { usePrefersReducedMotion } from '../../hooks'
import { ProjectCard } from '../work/ProjectCard'
import { RevealHeading } from '../ui/RevealHeading'

/**
 * Selected work.
 *
 * Desktop: the section pins and the card rail travels sideways, with each card
 * revealing itself *inside* the horizontal timeline via `containerAnimation`.
 * Touch / narrow screens: the rail becomes a snap-scrolling swipe strip, which
 * is what people expect there anyway.
 */
export function Work() {
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = rootRef.current
      const track = trackRef.current
      if (!root || !track) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96)

        const scrollTween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${distance() + window.innerHeight * 0.5}`,
            scrub: 0.9,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (railRef.current) gsap.set(railRef.current, { scaleX: self.progress })
              const index = Math.min(projects.length - 1, Math.round(self.progress * (projects.length - 1)))
              setActive((prev) => (prev === index ? prev : index))
            }
          }
        })

        // Each card rides in from underneath, inside the horizontal timeline.
        const cards = gsap.utils.toArray<HTMLElement>('[data-work-card]')
        cards.forEach((card) => {
          gsap.from(card, {
            yPercent: 12,
            opacity: 0,
            rotate: 1.4,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left 92%',
              end: 'left 45%',
              scrub: true
            }
          })
        })

        return () => {
          scrollTween.scrollTrigger?.kill()
          scrollTween.kill()
        }
      })

      mm.add('(max-width: 1023px)', () => {
        gsap.set(track, { x: 0 })
        const cards = gsap.utils.toArray<HTMLElement>('[data-work-card]')
        cards.forEach((card) => {
          gsap.from(card, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 92%', once: true }
          })
        })
      })

      ScrollTrigger.refresh()

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  return (
    <section id="work" ref={rootRef} className="relative z-10 overflow-hidden py-[clamp(4rem,7vw,5.5rem)] lg:py-12">
      <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8">
        <div className="flex items-center gap-4 pb-8 sm:gap-6">
          <span className="size-1.5 shrink-0 rounded-full bg-ember-500" />
          <span className="label-mono text-ink-500">Selected work</span>
          <span className="h-px flex-1 bg-ink-900/10" />
          <span className="label-mono hidden text-ink-300 sm:block">
            {String(active + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col gap-6 pb-10 lg:flex-row lg:items-end lg:justify-between lg:pb-14">
          <RevealHeading
            as="h2"
            className="max-w-[22ch] text-[clamp(2.3rem,5.4vw,4.3rem)] font-medium leading-[0.96] tracking-[-0.045em] text-ink-900"
          >
            Work that shipped, <span className="serif-accent text-ember-600">not screenshots.</span>
          </RevealHeading>
          <div className="flex max-w-[26rem] flex-col gap-4 lg:items-end lg:text-right">
            <p className="text-[0.98rem] leading-relaxed text-ink-500">
              Five builds where design and engineering had to agree with each other. Every one of them is live or
              open-source — click through and judge for yourself.
            </p>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
              className="label-mono inline-flex items-center gap-2 text-ink-900 transition-colors duration-300 hover:text-ember-600"
            >
              All repositories on GitHub
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* card rail */}
      <div
        data-work-track
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:snap-none lg:gap-7 lg:overflow-visible lg:pl-[max(2rem,calc(50vw-46rem))] lg:pr-24"
      >
        {projects.map((project) => (
          <div
            key={project.id}
            data-work-card
            className="w-[86vw] shrink-0 snap-center sm:w-[62vw] lg:w-[min(40rem,44vw)]"
          >
            <ProjectCard project={project} />
          </div>
        ))}

        <div className="hidden w-[22rem] shrink-0 flex-col justify-center gap-4 pr-4 lg:flex">
          <p className="serif-accent text-[1.6rem] leading-tight text-ink-900">
            More experiments live on GitHub — small tools, half-finished ideas, and things I built to learn.
          </p>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="link"
            className="label-mono text-ember-600"
          >
            github.com/ssambit635-svg ↗
          </a>
        </div>
      </div>

      {/* progress rail (desktop) */}
      <div className="mx-auto mt-6 hidden w-full max-w-[92rem] items-center gap-5 px-8 lg:flex">
        <span className="label-mono text-ink-300">Scroll</span>
        <span className="relative h-px flex-1 bg-ink-900/12">
          <span ref={railRef} className="absolute inset-0 origin-left scale-x-0 bg-ink-900/70" />
        </span>
        <div className="flex items-center gap-2">
          {projects.map((project, index) => (
            <span
              key={project.id}
              className={
                index === active
                  ? 'h-1.5 w-6 rounded-full bg-ember-500 transition-all duration-500'
                  : 'size-1.5 rounded-full bg-ink-900/20 transition-all duration-500'
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
