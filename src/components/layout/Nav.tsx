import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { navLinks, profile } from '../../lib/site'
import { cn } from '../../lib/utils'
import { useSmoothScroll } from '../../providers/SmoothScroll'
import { useTimeZoneClock } from '../../hooks'
import { Magnetic } from '../ui/Magnetic'

export function Nav() {
  const shellRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [condensed, setCondensed] = useState(false)
  const { scrollTo, stop, start } = useSmoothScroll()
  const clock = useTimeZoneClock(profile.timezone)

  /* Condense the bar + hide it on scroll-down, reveal on scroll-up. */
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setCondensed(y > 64)
      const shell = shellRef.current
      if (shell && !open) {
        const goingDown = y > last && y > 240
        gsap.to(shell, {
          yPercent: goingDown ? -130 : 0,
          duration: 0.55,
          ease: goingDown ? 'power3.in' : 'power3.out',
          overwrite: 'auto'
        })
      }
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  /* Full-screen cream menu, staggered in. */
  useGSAP(
    () => {
      const menu = menuRef.current
      if (!menu) return
      if (!open) return

      const tl = gsap.timeline()
      tl.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
        .from(
          '[data-menu-item]',
          {
            yPercent: 108,
            opacity: 0,
            duration: 0.85,
            stagger: 0.06,
            ease: 'editorial'
          },
          0.05
        )
        .from('[data-menu-meta]', { opacity: 0, y: 14, duration: 0.6, stagger: 0.05 }, 0.3)

      return () => tl.kill()
    },
    { dependencies: [open], revertOnUpdate: true }
  )

  useEffect(() => {
    if (open) stop()
    else start()
    return () => start()
  }, [open, stop, start])

  const go = (href: string) => {
    setOpen(false)
    window.setTimeout(() => scrollTo(href), open ? 520 : 0)
  }

  return (
    <>
      <header
        ref={shellRef}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          condensed ? 'px-3 pt-3 sm:px-5 sm:pt-4' : 'px-4 pt-5 sm:px-8 sm:pt-7'
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-[86rem] items-center justify-between gap-4 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            condensed ? 'surface px-4 py-2.5 sm:px-5' : 'border border-transparent bg-transparent px-0 py-2 sm:px-1'
          )}
        >
          <button
            type="button"
            onClick={() => go('#hero')}
            data-cursor="link"
            className="group flex items-center gap-2.5 text-left"
          >
            <span className="relative grid size-7 place-items-center">
              <span className="absolute inset-0 rounded-full border border-ink-900/20 transition-colors duration-500 group-hover:border-ember-500/60" />
              <span className="size-1.5 rounded-full bg-ember-500 transition-transform duration-500 group-hover:scale-150" />
            </span>
            <span className="text-[0.95rem] font-medium tracking-[-0.03em] text-ink-900">
              {profile.first}
              <span className="serif-accent text-ink-500"> {profile.last}</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => go(link.href)}
                data-cursor="link"
                className="group relative rounded-full px-3.5 py-2 text-[0.9rem] text-ink-500 transition-colors duration-300 hover:text-ink-900"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-ember-500/70 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-2 rounded-full border border-ink-900/10 bg-cream-50/70 px-3 py-1.5 xl:inline-flex">
              <span className="size-1.5 animate-[blink_1.15s_step-end_infinite] rounded-full bg-sage-500" />
              <span className="label-mono text-[0.625rem] text-ink-500">{clock} IST</span>
            </span>

            <Magnetic strength={0.22} className="hidden sm:inline-flex">
              <button
                type="button"
                onClick={() => go('#contact')}
                data-cursor="mail"
                className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-[0.85rem] font-medium text-cream-100 transition-colors duration-500 hover:bg-ember-600"
              >
                Let&rsquo;s talk
                <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </Magnetic>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-full border border-ink-900/12 bg-cream-50/70 text-ink-900 transition-colors duration-300 hover:border-ink-900/30 lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet menu */}
      <div
        ref={menuRef}
        className={cn(
          'fixed inset-0 z-40 bg-cream-100/97 backdrop-blur-lg lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none invisible opacity-0'
        )}
      >
        <div className="flex h-full flex-col justify-between px-6 pb-10 pt-28">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <div key={link.href} className="line-mask border-b border-ink-900/10">
                <button
                  type="button"
                  data-menu-item
                  onClick={() => go(link.href)}
                  className="flex w-full items-baseline justify-between py-4 text-left"
                >
                  <span className="text-[clamp(2rem,9vw,3rem)] font-medium tracking-[-0.045em] text-ink-900">
                    {link.label}
                  </span>
                  <span className="label-mono text-ink-300">{link.index}</span>
                </button>
              </div>
            ))}
          </nav>

          <div className="space-y-4">
            <div data-menu-meta className="surface rounded-3xl p-5">
              <p className="label-mono">Available for</p>
              <p className="mt-2 text-[0.95rem] text-ink-700">
                Internships, freelance builds and interesting collaborations.
              </p>
            </div>
            <div data-menu-meta className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="text-[0.95rem] text-ink-900 underline decoration-ink-900/25 underline-offset-4"
              >
                {profile.email}
              </a>
              <span className="label-mono">{clock} IST</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
