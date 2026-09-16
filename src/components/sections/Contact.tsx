import { useRef, useState } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { contactChannels, profile } from '../../lib/site'
import { useMountWhenNear, usePrefersReducedMotion, useTimeZoneClock } from '../../hooks'
import { type ScrollRef } from '../../three/frame'
import { ClayPillarScene } from '../../three/LazyScene'
import { Magnetic } from '../ui/Magnetic'
import { RevealHeading } from '../ui/RevealHeading'

export function Contact() {
  const rootRef = useRef<HTMLElement>(null)
  const progressRef = useRef<number>(0) as ScrollRef
  const reduced = usePrefersReducedMotion()
  const clock = useTimeZoneClock(profile.timezone)
  const [copied, setCopied] = useState(false)
  const { ref: canvasHostRef, shouldMount } = useMountWhenNear<HTMLDivElement>('25% 0px 25% 0px')

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || reduced) return

      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          progressRef.current = self.progress
        }
      })

      gsap.from('[data-contact-channel]', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: {
          trigger: '[data-contact-grid]',
          start: 'top 88%',
          once: true
        }
      })

      gsap.from('[data-contact-pillar]', {
        opacity: 0,
        scale: 0.94,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-contact-pillar]',
          start: 'top 92%',
          once: true
        }
      })
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section id="contact" ref={rootRef} className="relative z-10 px-5 pt-[clamp(4.5rem,8vw,7.5rem)] sm:px-8">
      <div className="mx-auto w-full max-w-[86rem]">
        <div className="flex items-center gap-4 pb-10 sm:gap-6">
          <span className="size-1.5 shrink-0 rounded-full bg-ember-500" />
          <span className="label-mono text-ink-500">Contact</span>
          <span className="h-px flex-1 bg-ink-900/10" />
          <span className="label-mono hidden text-ink-300 sm:block">06</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <RevealHeading
              as="h2"
              className="max-w-[24ch] text-[clamp(2.4rem,6vw,4.6rem)] font-medium leading-[0.95] tracking-[-0.05em] text-ink-900"
            >
              Have something worth <span className="serif-accent text-ember-600">building?</span>
            </RevealHeading>

            <p className="mt-7 max-w-[46ch] text-[1.04rem] leading-relaxed text-ink-500">
              I am open to internships, freelance work and collaborations — especially problems where the interface and
              the engineering both matter. Tell me what you are making and I will tell you honestly whether I am the
              right person for it.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Magnetic strength={0.18}>
                <a
                  href={`mailto:${profile.email}`}
                  data-cursor="mail"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-ink-900 px-7 py-4 text-[0.98rem] font-medium text-cream-100"
                >
                  <span className="absolute inset-0 z-0 translate-y-full bg-ember-600 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                  <span className="relative z-10">{profile.email}</span>
                  <ArrowUpRight className="relative z-10 size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>

              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-5 py-4 text-[0.9rem] font-medium text-ink-700 transition-colors duration-400 hover:border-ink-900/35 hover:text-ink-900"
              >
                {copied ? <Check className="size-3.5 text-sage-600" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied' : 'Copy address'}
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ink-900/10 pt-5">
              <span className="label-mono tabular-nums text-ink-400">{clock} IST</span>
              <span className="label-mono text-ink-400">{profile.location}</span>
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 animate-[blink_1.15s_step-end_infinite] rounded-full bg-sage-600" />
                <span className="label-mono text-sage-600">Usually replies within a day</span>
              </span>
            </div>
          </div>

          <div ref={canvasHostRef} data-contact-pillar className="relative order-first lg:order-none">
            <ClayPillarScene
              mount={shouldMount && !reduced}
              active={shouldMount}
              className="h-[38vh] min-h-[260px] w-full lg:h-[58vh]"
              cameraPosition={[0, 0.1, 6.5]}
              fov={32}
              shadow="wide"
              progress={progressRef}
            />
            <span className="label-mono pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-ink-300">
              model-04 · column
            </span>
          </div>
        </div>

        {/* channels */}
        <div data-contact-grid className="mt-16 grid gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-4">
          {contactChannels.map((channel) => (
            <a
              key={channel.label}
              data-contact-channel
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer noopener"
              data-cursor="link"
              className="group flex items-center justify-between gap-4 border-b border-ink-900/10 py-5 transition-colors duration-500 hover:border-ink-900/30"
            >
              <span>
                <span className="label-mono block text-ink-300 transition-colors duration-500 group-hover:text-ember-500">
                  {channel.label}
                </span>
                <span className="mt-1 block text-[0.95rem] text-ink-800">{channel.value}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ember-600" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
