import { useRef } from 'react'
import { ArrowDown, ArrowUpRight, Github, MapPin } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { heroCopy, profile } from '../../lib/site'
import { cn } from '../../lib/utils'
import { useAppReady } from '../../lib/ready'
import { useMountWhenNear, usePrefersReducedMotion, useTimeZoneClock } from '../../hooks'
import { type ScrollRef } from '../../three/frame'
import { HeroBlobScene } from '../../three/LazyScene'
import { Magnetic } from '../ui/Magnetic'
import { useSmoothScroll } from '../../providers/SmoothScroll'

export function Hero() {
  const rootRef = useRef<HTMLElement>(null)
  const progressRef = useRef<number>(0) as ScrollRef
  const heroProgress = progressRef
  const ready = useAppReady()
  const reduced = usePrefersReducedMotion()
  const clock = useTimeZoneClock(profile.timezone)
  const { ref: canvasHostRef, shouldMount } = useMountWhenNear<HTMLDivElement>('25% 0px 25% 0px')
  const { scrollTo } = useSmoothScroll()

  /* ---------------------------------------------------------- intro beat -- */
  useGSAP(
    () => {
      if (!ready) return

      if (reduced) {
        gsap.set('[data-hero-fade], [data-hero-line], [data-hero-canvas]', {
          opacity: 1,
          yPercent: 0,
          y: 0,
          scale: 1
        })
        return
      }

      const tl = gsap.timeline({
        defaults: { ease: 'editorial' },
        delay: 0.06
      })

      tl.from('[data-hero-kicker] > *', {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.08
      })
        .from('[data-hero-line]', { yPercent: 116, opacity: 0, duration: 1.25, stagger: 0.085 }, 0.05)
        .from('[data-hero-lede]', { opacity: 0, y: 22, filter: 'blur(8px)', duration: 1 }, 0.5)
        .from('[data-hero-cta] > *', { opacity: 0, y: 20, duration: 0.85, stagger: 0.09 }, 0.62)
        .from('[data-hero-meta] > *', { opacity: 0, y: 14, duration: 0.7, stagger: 0.07 }, 0.72)
        .from('[data-hero-canvas]', { opacity: 0, scale: 0.9, duration: 1.6, ease: 'power3.out' }, 0.15)
        .from('[data-hero-tag]', { opacity: 0, y: 10, duration: 0.7, stagger: 0.1 }, 0.9)
        .from('[data-hero-cue]', { opacity: 0, y: 12, duration: 0.7 }, 1)
    },
    { scope: rootRef, dependencies: [ready, reduced], revertOnUpdate: true }
  )

  /* ------------------------------------------- pointer depth on the tags -- */
  useGSAP(
    () => {
      if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const tags = gsap.utils.toArray<HTMLElement>('[data-hero-tag]')
      const setters = tags.map((tag, index) => ({
        x: gsap.quickTo(tag, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(tag, 'y', { duration: 1.2, ease: 'power3.out' }),
        depth: 14 + index * 12
      }))

      const onMove = (event: PointerEvent) => {
        const nx = (event.clientX / window.innerWidth) * 2 - 1
        const ny = (event.clientY / window.innerHeight) * 2 - 1
        setters.forEach(({ x, y, depth }) => {
          x(-nx * depth)
          y(-ny * depth)
        })
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      return () => window.removeEventListener('pointermove', onMove)
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  /* -------------------------------------------------- scroll choreography -- */
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=125%',
            scrub: 0.8,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              progressRef.current = self.progress
            }
          }
        })

        tl.to('[data-hero-title]', { yPercent: -14, scale: 0.965, opacity: 0.15 }, 0)
          .to('[data-hero-lede]', { yPercent: -40, opacity: 0 }, 0)
          .to('[data-hero-cta]', { yPercent: -30, opacity: 0 }, 0)
          .to('[data-hero-meta]', { opacity: 0, y: -18 }, 0)
          .to('[data-hero-kicker]', { opacity: 0, y: -14 }, 0)
          .to('[data-hero-cue]', { opacity: 0, y: 20 }, 0)
          .to('[data-hero-canvas]', { scale: 1.14, yPercent: -6 }, 0)
          .to('[data-hero-tags]', { opacity: 0, y: -24 }, 0)
      })

      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6
          }
        })
        tl.to('[data-hero-copy]', { yPercent: -12, opacity: 0.1 }, 0).to('[data-hero-canvas]', { scale: 0.92 }, 0)
      })

      ScrollTrigger.refresh()

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [], revertOnUpdate: true }
  )

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pb-10 pt-28 sm:px-8 lg:pb-16 lg:pt-24"
    >
      <div className="mx-auto grid w-full max-w-[86rem] flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* ------------------------------------------------------------ copy */}
        <div data-hero-copy className="relative z-10 max-w-[40rem]">
          <div data-hero-kicker className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <span className="label-mono">{heroCopy.kicker}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-sage-600/25 bg-sage-100/60 px-3 py-1.5">
              <span className="size-1.5 animate-[blink_1.15s_step-end_infinite] rounded-full bg-sage-600" />
              <span className="label-mono text-[0.625rem] text-sage-600">{heroCopy.available}</span>
            </span>
          </div>

          <h1
            data-hero-title
            className="mt-6 text-[clamp(2.5rem,7.6vw,5.2rem)] font-medium leading-[0.94] tracking-[-0.05em] text-ink-900"
          >
            {heroCopy.headline.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block">
                  {index === heroCopy.headline.length - 1 ? (
                    <>
                      loud <span className="serif-accent text-ember-600">problems.</span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h1>

          <p
            data-hero-lede
            className="mt-7 max-w-[34rem] text-[1.02rem] leading-relaxed text-ink-500 sm:text-[1.08rem]"
          >
            {heroCopy.lede}
          </p>

          <div data-hero-cta className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={() => scrollTo('#work')}
                data-cursor="view"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-ink-900 px-6 py-3.5 text-[0.92rem] font-medium text-cream-100"
              >
                <span className="absolute inset-0 z-0 translate-y-full bg-ember-600 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                <span className="relative z-10">{heroCopy.ctas[0].label}</span>
                <ArrowDown className="relative z-10 size-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
              </button>
            </Magnetic>

            <Magnetic strength={0.2}>
              <button
                type="button"
                onClick={() => scrollTo('#contact')}
                data-cursor="mail"
                className="group inline-flex items-center gap-2.5 rounded-full border border-ink-900/15 px-6 py-3.5 text-[0.92rem] font-medium text-ink-900 transition-colors duration-500 hover:border-ink-900/40 hover:bg-cream-50/60"
              >
                {heroCopy.ctas[1].label}
                <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </Magnetic>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
              aria-label="GitHub profile"
              className="grid size-12 place-items-center rounded-full border border-ink-900/12 text-ink-500 transition-colors duration-500 hover:border-ink-900/35 hover:text-ink-900"
            >
              <Github className="size-4" />
            </a>
          </div>

          <div
            data-hero-meta
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ink-900/10 pt-5"
          >
            <span className="inline-flex items-center gap-2 text-[0.85rem] text-ink-500">
              <MapPin className="size-3.5 text-ember-500" />
              {profile.location}
            </span>
            <span className="label-mono tabular-nums text-ink-400">{clock} IST — local time</span>
            <span className="label-mono text-ink-400">B.Tech CSE · 2029</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- 3D */}
        <div ref={canvasHostRef} className="relative z-0">
          <div data-hero-canvas className="relative">
            <HeroBlobScene
              mount={ready && shouldMount && !reduced}
              active={shouldMount}
              className="h-[46vh] min-h-[300px] w-full sm:h-[56vh] lg:h-[74vh]"
              cameraPosition={[0, 0, 6.6]}
              fov={32}
              shadow="blob"
              progress={heroProgress}
            />

            {/* floating spec tags — the designer's margin notes */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <span
                data-hero-tag
                className="label-mono absolute left-0 top-[16%] rounded-full border border-ink-900/10 bg-cream-50/80 px-3 py-1.5 backdrop-blur"
              >
                glTF 2.0 · 2.4k tris
              </span>
              <span
                data-hero-tag
                className="label-mono absolute right-0 top-[38%] rounded-full border border-ink-900/10 bg-cream-50/80 px-3 py-1.5 backdrop-blur"
              >
                follow the cursor
              </span>
              <span
                data-hero-tag
                className="label-mono absolute bottom-[20%] left-[10%] rounded-full border border-ink-900/10 bg-cream-50/80 px-3 py-1.5 backdrop-blur"
              >
                noise-sculpted clay
              </span>
            </div>
          </div>

          <p
            data-hero-tags
            className="mt-2 hidden max-w-[24rem] font-mono text-[0.7rem] leading-relaxed text-ink-300 lg:block"
          >
            Live WebGL — geometry exported from a sculpt pass in
            <span className="text-ink-400"> scripts/build-models.mjs</span>, shaded for cream light.
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------- scroll cue */}
      <div
        data-hero-cue
        className={cn(
          'mx-auto mt-6 flex w-full max-w-[86rem] items-center justify-between gap-4',
          'border-t border-ink-900/10 pt-4'
        )}
      >
        <span className="label-mono">Scroll to explore</span>
        <span className="relative hidden h-px flex-1 overflow-hidden bg-ink-900/10 sm:block">
          <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-full animate-[cue-sweep_3.2s_linear_infinite] bg-gradient-to-r from-transparent via-ember-500 to-transparent" />
        </span>
        <span className="label-mono hidden sm:block">05 projects · 06 certificates</span>
      </div>
    </section>
  )
}
