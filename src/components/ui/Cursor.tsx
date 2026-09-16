import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { hasFinePointer, prefersReducedMotion } from '../../lib/utils'

const LABELS: Record<string, string> = {
  link: 'Open',
  view: 'View',
  drag: 'Drag',
  copy: 'Copy',
  mail: 'Write',
  scroll: 'Scroll'
}

/**
 * Custom cursor: an ink dot with a trailing ring that grows and picks up a
 * contextual label when hovering elements marked with `data-cursor`.
 * Never rendered on touch devices or for reduced-motion users.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      const shouldEnable = hasFinePointer() && query.matches && !prefersReducedMotion()
      setEnabled(shouldEnable)
      document.body.classList.toggle('cursor-none', shouldEnable)
    }
    sync()
    query.addEventListener('change', sync)
    return () => {
      query.removeEventListener('change', sync)
      document.body.classList.remove('cursor-none')
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current
    const ring = ringRef.current
    const labelEl = labelRef.current
    if (!dot || !ring || !labelEl) return

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 })

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring, 'x', {
      duration: 0.55,
      ease: 'power3.out'
    })
    const ringY = gsap.quickTo(ring, 'y', {
      duration: 0.55,
      ease: 'power3.out'
    })
    const labelX = gsap.quickTo(labelEl, 'x', {
      duration: 0.5,
      ease: 'power3.out'
    })
    const labelY = gsap.quickTo(labelEl, 'y', {
      duration: 0.5,
      ease: 'power3.out'
    })

    let shown = false

    const onMove = (event: MouseEvent) => {
      if (!shown) {
        shown = true
        gsap.to([dot, ring], { opacity: 1, duration: 0.4, overwrite: 'auto' })
      }
      dotX(event.clientX)
      dotY(event.clientY)
      ringX(event.clientX)
      ringY(event.clientY)
      labelX(event.clientX + 26)
      labelY(event.clientY + 18)
    }

    const onOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null
      const kind = target?.dataset.cursor
      const text = kind ? (LABELS[kind] ?? kind) : null
      setLabel(text)

      const scale = target ? (kind === 'drag' ? 2.5 : 1.9) : 1
      gsap.to(ring, {
        scale,
        borderColor: target ? 'rgba(192,89,44,0.65)' : 'rgba(23,20,15,0.28)',
        backgroundColor: target ? 'rgba(192,89,44,0.07)' : 'rgba(192,89,44,0)',
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto'
      })
      gsap.to(dot, {
        scale: target ? 0.35 : 1,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto'
      })
    }

    const onDown = () => gsap.to(ring, { scale: 1.25, duration: 0.25, overwrite: 'auto' })
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.35, overwrite: 'auto' })
    const onLeave = () =>
      gsap.to([dot, ring, labelEl], {
        opacity: 0,
        duration: 0.3,
        overwrite: 'auto'
      })
    const onEnter = () => gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: 'auto' })

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden lg:block" aria-hidden="true">
      <div ref={ringRef} className="absolute size-10 rounded-full border border-ink-900/25 backdrop-invert-[0.02]" />
      <div ref={dotRef} className="absolute size-1.5 rounded-full bg-ink-900" />
      <span
        ref={labelRef}
        className="label-mono absolute text-[0.625rem] text-ember-600 transition-opacity duration-300"
        style={{ opacity: label ? 1 : 0 }}
      >
        {label}
      </span>
    </div>
  )
}
