import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { profile, stats, timeline } from '../../lib/site'
import { useMountWhenNear, usePrefersReducedMotion } from '../../hooks'
import { type ScrollRef } from '../../three/frame'
import { ClayKnotScene } from '../../three/LazyScene'
import { Counter } from '../ui/Counter'
import { RevealHeading } from '../ui/RevealHeading'

const PRINCIPLES = [
  {
    title: 'Calm over loud',
    body: 'Interfaces should lower your heart rate, not raise it. Restraint is a feature.'
  },
  {
    title: 'Ship, then sharpen',
    body: 'A live URL beats a perfect local build. Real feedback is the only review that counts.'
  },
  {
    title: 'Understand the layer below',
    body: 'I like knowing what the framework is doing — that is where the good bugs come from.'
  }
]

export function About() {
  const rootRef = useRef<HTMLElement>(null)
  const progressRef = useRef<number>(0) as ScrollRef
  const reduced = usePrefersReducedMotion()
  const { ref: canvasHostRef, shouldMount } = useMountWhenNear<HTMLDivElement>('30% 0px 30% 0px')

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || reduced) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            progressRef.current = self.progress
          }
        })

        gsap.from('[data-knot-canvas]', {
          yPercent: 14,
          scale: 0.92,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-knot-canvas]',
            start: 'top 88%',
            once: true
          }
        })
      })

      gsap.from('[data-about-row]', {
        y: 34,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: {
          trigger: '[data-about-list]',
          start: 'top 88%',
          once: true
        }
      })

      gsap.from('[data-about-principle]', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: '[data-about-principles]',
          start: 'top 90%',
          once: true
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  return (
    <section id="about" ref={rootRef} className="relative z-10 px-5 py-[clamp(5rem,9vw,8.5rem)] sm:px-8">
      <div className="mx-auto w-full max-w-[86rem]">
        <div className="flex items-center gap-4 pb-10 sm:gap-6">
          <span className="size-1.5 shrink-0 rounded-full bg-ember-500" />
          <span className="label-mono text-ink-500">About</span>
          <span className="h-px flex-1 bg-ink-900/10" />
          <span className="label-mono hidden text-ink-300 sm:block">02</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          {/* ------------------------------------------------------- knot */}
          <div ref={canvasHostRef} className="relative">
            <div data-knot-canvas className="lg:sticky lg:top-28">
              <ClayKnotScene
                mount={shouldMount && !reduced}
                active={shouldMount}
                className="h-[42vh] min-h-[280px] w-full lg:h-[62vh]"
                cameraPosition={[0, 0.3, 6.4]}
                fov={34}
                shadow="wide"
                progress={progressRef}
              />

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-900/10 pt-4">
                <div>
                  <p className="label-mono">Based in</p>
                  <p className="mt-1 text-[0.9rem] text-ink-700">{profile.location}</p>
                </div>
                <div>
                  <p className="label-mono">Focus</p>
                  <p className="mt-1 text-[0.9rem] text-ink-700">Full-stack · interface · cloud</p>
                </div>
                <div className="col-span-2">
                  <p className="label-mono">Right now</p>
                  <p className="mt-1 text-[0.9rem] text-ink-700">
                    Building cloud tooling, learning DevOps practice, and redesigning this very page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------ story */}
          <div>
            <RevealHeading
              as="h2"
              className="max-w-[24ch] text-[clamp(2.1rem,4.6vw,3.6rem)] font-medium leading-[0.99] tracking-[-0.045em] text-ink-900"
            >
              A developer who cares how things <span className="serif-accent text-ember-600">feel</span>, not just
              whether they compile.
            </RevealHeading>

            <div className="mt-8 space-y-5 text-[1rem] leading-relaxed text-ink-500">
              <p>
                I started with a C programming paper in Dhenkanal, moved into Python because I wanted to build something
                I could actually show someone, and ended up here — designing and shipping web products while studying
                computer science at NIST University.
              </p>
              <p>
                My work sits between design and engineering. I care about type, spacing and how a page moves, and I also
                care about what happens when the API is slow, the database disagrees with the front end, or the
                container refuses to start on the first try. Both halves make the other one better.
              </p>
              <p>
                Right now I am going deep on cloud architecture and DevOps — not from tutorials, but by breaking
                deployments until they hold.
              </p>
            </div>

            {/* stats */}
            <div className="mt-12 grid grid-cols-2 gap-y-8 border-y border-ink-900/10 py-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1.5 pr-4">
                  <span className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium tracking-[-0.04em] text-ink-900">
                    <Counter
                      value={stat.value}
                      suffix={stat.suffix}
                      decimals={'decimals' in stat ? (stat.decimals as number) : 0}
                    />
                  </span>
                  <span className="label-mono text-ink-400">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* principles */}
            <div data-about-principles className="mt-12 space-y-px">
              {PRINCIPLES.map((principle, index) => (
                <div
                  key={principle.title}
                  data-about-principle
                  className="group flex items-start gap-5 border-b border-ink-900/10 py-5 transition-colors duration-500"
                >
                  <span className="label-mono mt-1 text-ink-300 transition-colors duration-500 group-hover:text-ember-500">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-[1.12rem] font-medium tracking-[-0.02em] text-ink-900">{principle.title}</h3>
                    <p className="mt-1 max-w-[46ch] text-[0.93rem] leading-relaxed text-ink-500">{principle.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* education */}
            <div data-about-list className="mt-12">
              <p className="label-mono">Education</p>
              <div className="mt-5 space-y-6">
                {timeline.map((entry) => (
                  <article key={entry.title} data-about-row className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                    <span className="label-mono pt-1 text-ink-400">{entry.period}</span>
                    <div>
                      <h3 className="text-[1.05rem] font-medium tracking-[-0.02em] text-ink-900">{entry.title}</h3>
                      <p className="text-[0.9rem] text-ink-500">{entry.org}</p>
                      <p className="mt-2 max-w-[52ch] text-[0.9rem] leading-relaxed text-ink-500">{entry.detail}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-ink-900 px-2.5 py-1 font-mono text-[0.68rem] text-cream-100">
                          {entry.metric}
                        </span>
                        {entry.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-ink-900/10 px-2.5 py-1 font-mono text-[0.68rem] text-ink-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
