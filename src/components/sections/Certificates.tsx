import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { certificates } from '../../lib/site'
import { hasFinePointer, prefersReducedMotion } from '../../lib/utils'
import { RevealHeading } from '../ui/RevealHeading'

/**
 * Certificates as an editorial index. On desktop, hovering a row floats the
 * actual certificate scan next to the cursor — proof, not decoration.
 */
export function Certificates() {
  const rootRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [canPreview, setCanPreview] = useState(false)

  useEffect(() => {
    setCanPreview(hasFinePointer() && !prefersReducedMotion())
  }, [])

  /* Cursor-following preview card. */
  useEffect(() => {
    if (!canPreview) return
    const el = previewRef.current
    if (!el) return

    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.92, autoAlpha: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.72, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.72, ease: 'power3.out' })
    const rTo = gsap.quickTo(el, 'rotate', {
      duration: 0.9,
      ease: 'power3.out'
    })

    let lastX = window.innerWidth / 2

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX)
      yTo(event.clientY)
      const velocity = event.clientX - lastX
      lastX = event.clientX
      rTo(gsap.utils.clamp(-7, 7, velocity * 0.35))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [canPreview])

  useEffect(() => {
    const el = previewRef.current
    if (!el || !canPreview) return
    gsap.to(el, {
      autoAlpha: hovered === null ? 0 : 1,
      scale: hovered === null ? 0.92 : 1,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto'
    })
  }, [hovered, canPreview])

  const onRowEnter = useCallback((index: number) => setHovered(index), [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      gsap.from('[data-cert-row]', {
        y: 26,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: '[data-cert-list]',
          start: 'top 88%',
          once: true
        }
      })

      gsap.from('[data-cert-card]', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: '[data-cert-strip]',
          start: 'top 92%',
          once: true
        }
      })
    },
    { scope: rootRef, dependencies: [], revertOnUpdate: true }
  )

  const active = hovered !== null ? certificates[hovered] : null

  return (
    <section id="certificates" ref={rootRef} className="relative z-10 px-5 py-[clamp(4.5rem,8vw,7.5rem)] sm:px-8">
      <div className="mx-auto w-full max-w-[86rem]">
        <div className="flex items-center gap-4 pb-10 sm:gap-6">
          <span className="size-1.5 shrink-0 rounded-full bg-ember-500" />
          <span className="label-mono text-ink-500">Certificates</span>
          <span className="h-px flex-1 bg-ink-900/10" />
          <span className="label-mono hidden text-ink-300 sm:block">04</span>
        </div>

        <div className="flex flex-col gap-6 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <RevealHeading
            as="h2"
            className="max-w-[24ch] text-[clamp(2.1rem,4.8vw,3.7rem)] font-medium leading-[0.99] tracking-[-0.045em] text-ink-900"
          >
            Six courses finished, <span className="serif-accent text-ember-600">all verifiable.</span>
          </RevealHeading>
          <p className="max-w-[30rem] text-[0.98rem] leading-relaxed text-ink-500 lg:text-right">
            Not badges for badge&rsquo;s sake — each one maps to something on this page. Hover a row to see the
            certificate itself.
          </p>
        </div>

        {/* desktop index */}
        <div data-cert-list className="hidden lg:block">
          {certificates.map((certificate, index) => (
            <a
              key={certificate.id}
              data-cert-row
              href={certificate.href}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="view"
              onMouseEnter={() => onRowEnter(index)}
              onMouseLeave={() => setHovered(null)}
              className="group relative flex items-center gap-6 border-b border-ink-900/10 py-6 transition-colors duration-500 hover:border-ink-900/25"
            >
              <span className="label-mono w-10 shrink-0 text-ink-300 transition-colors duration-500 group-hover:text-ember-500">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="relative flex-1 overflow-hidden">
                <span className="block text-[clamp(1.25rem,2.4vw,1.85rem)] font-medium tracking-[-0.03em] text-ink-900 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                  {certificate.title}
                </span>
              </span>

              <span className="label-mono hidden w-64 shrink-0 text-ink-400 xl:block">{certificate.issuer}</span>
              <span className="label-mono w-24 shrink-0 text-right text-ink-400">{certificate.date}</span>

              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ink-900/12 text-ink-500 transition-all duration-500 group-hover:border-ember-500/50 group-hover:bg-ember-500/8 group-hover:text-ember-600">
                <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>

        {/* touch layout */}
        <div
          data-cert-strip
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:hidden"
        >
          {certificates.map((certificate) => (
            <a
              key={certificate.id}
              data-cert-card
              href={certificate.href}
              target="_blank"
              rel="noreferrer noopener"
              className="surface w-[74vw] shrink-0 snap-center overflow-hidden rounded-3xl sm:w-[46vw]"
            >
              <img
                src={certificate.image}
                alt={`${certificate.title} certificate`}
                loading="lazy"
                className="h-40 w-full object-cover object-top"
              />
              <div className="p-4">
                <p className="text-[0.98rem] font-medium leading-snug tracking-[-0.02em] text-ink-900">
                  {certificate.title}
                </p>
                <p className="label-mono mt-1.5 text-ink-400">{certificate.issuer}</p>
                <p className="label-mono mt-0.5 text-ink-300">{certificate.date}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* floating preview */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[65] hidden w-[19rem] overflow-hidden rounded-2xl border border-ink-900/12 bg-cream-50 shadow-[var(--shadow-lift)] lg:block"
        style={{ visibility: 'hidden' }}
      >
        {active ? (
          <>
            <img src={active.image} alt="" className="h-44 w-full object-cover object-top" />
            <div className="flex items-center justify-between gap-3 border-t border-ink-900/10 px-4 py-3">
              <span className="font-mono text-[0.7rem] text-ink-500">{active.issuer}</span>
              <span className="font-mono text-[0.7rem] text-ember-600">{active.date}</span>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
