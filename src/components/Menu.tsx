import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { connect, profile } from '../lib/site'
import { useSound } from '../hooks/useSound'
import Scramble from './fx/Scramble'
import { cn } from '../lib/utils'
import { getLenis } from '../hooks/useLenis'

const items = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#work' },
  { label: 'Contact', href: '#contact' }
]

export default function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const dim = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const { tick, click } = useSound()

  useEffect(() => {
    const p = panel.current!
    const d = dim.current!
    if (open) {
      getLenis()?.stop()
      gsap.set([p, d], { pointerEvents: 'auto' })
      gsap.to(d, { opacity: 1, duration: 0.4 })
      gsap.fromTo(p, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
      gsap.fromTo(
        p.querySelectorAll('[data-stagger]'),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, delay: 0.15 }
      )
    } else {
      getLenis()?.start()
      gsap.to(d, { opacity: 0, duration: 0.3 })
      gsap.to(p, { x: 30, opacity: 0, duration: 0.3, onComplete: () => gsap.set([p, d], { pointerEvents: 'none' }) })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const p = panel.current!
    const focusable = () => Array.from(p.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
    focusable()[0]?.focus()
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const nodes = focusable()
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
    }
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); previous?.focus() }
  }, [open, onClose])

  return (
    <>
      <div ref={dim} onClick={onClose} className="pointer-events-none fixed inset-0 z-[90] bg-black/75 opacity-0" />
      <aside
        ref={panel}
        id="site-menu"
        role="dialog"
        aria-modal={open || undefined}
        inert={!open}
        aria-label="Site menu"
        className="pointer-events-none fixed top-5 right-5 bottom-5 z-[95] flex overflow-y-auto w-[380px] flex-col rounded-md bg-ink-2 p-6 opacity-0 max-sm:inset-x-3 max-sm:w-auto"
      >
        <div className="flex items-center justify-between">
          <span className="t-label text-cream">/ Menu</span>
          <button
            onClick={() => { click(); onClose() }}
            onMouseEnter={tick}
            className="t-label border border-mute-2 bg-ink-3 px-5 py-2.5 font-semibold text-cream"
          >
            Close
          </button>
        </div>

        <nav aria-label="Main navigation" className="mt-8 flex flex-col items-start gap-3">
          {items.map((it, i) => {
            const active = hover === null ? i === 0 : hover === i
            return (
              <a
                key={it.label}
                href={it.href}
                data-stagger
                data-scramble-hover
                onMouseEnter={() => { setHover(i); tick() }}
                onMouseLeave={() => setHover(null)}
                onClick={() => { click(); onClose() }}
                className={cn(
                  'notch-item t-display relative px-3 py-1 text-[44px] font-normal transition-colors duration-200',
                  active ? (hover === i && i === 1 ? 'bg-lime text-ink' : 'bg-cream text-ink') : 'text-cream'
                )}
              >
                <Scramble text={it.label} trigger="hover" speed={40} color="#8f7ab0" />
              </a>
            )
          })}
        </nav>

        <div className="mt-auto">
          <p className="t-label text-cream" data-stagger>
            Connect
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {connect.map((c) => (
              <li key={c.n} data-stagger data-scramble-hover className="flex items-center gap-3">
                <span className="t-label text-mute-2">{c.n}</span>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={tick}
                  className="t-label flex flex-1 items-center justify-between text-mute transition-colors hover:text-cream"
                >
                  <Scramble text={c.label} trigger="hover" speed={40} />
                  <span className="text-lime">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="t-label mt-6 border-t border-mute-2 pt-4 text-mute-2" data-stagger>
            ©2026 by {profile.name}
          </p>
        </div>
      </aside>
    </>
  )
}
