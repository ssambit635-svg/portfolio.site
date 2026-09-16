import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { navLinks, profile } from '../../lib/site'
import { useSmoothScroll } from '../../providers/SmoothScroll'
import { Magnetic } from '../ui/Magnetic'
import { Marquee } from '../ui/Marquee'

export function Footer() {
  const { scrollTo } = useSmoothScroll()
  const [year, setYear] = useState(2026)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-footer-piece]', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '[data-footer]', start: 'top 92%', once: true }
    })
  }, [])

  return (
    <footer data-footer data-footer-root className="relative z-10 mt-[clamp(4rem,7vw,6rem)]">
      <Marquee duration={52} reverse fade={false} className="border-y border-ink-900/10 py-6">
        {[profile.first, profile.last, 'Freelance', 'Internships', 'Let’s build', '2026'].map((word, index) => (
          <span key={`${word}-${index}`} className="flex shrink-0 items-center">
            <span className="serif-accent px-8 text-[clamp(2rem,6vw,4.4rem)] leading-none text-ink-900/12">{word}</span>
            <span className="size-1.5 rounded-full bg-ember-500/40" />
          </span>
        ))}
      </Marquee>

      <div className="mx-auto w-full max-w-[86rem] px-5 py-12 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div data-footer-piece>
            <p className="max-w-[34ch] text-[1.05rem] leading-relaxed text-ink-700">
              Designing and building calm interfaces from Berhampur, Odisha — currently studying, always shipping.
            </p>
            <a
              href={`mailto:${profile.email}`}
              data-cursor="mail"
              className="mt-5 inline-block text-[1.05rem] font-medium text-ink-900 underline decoration-ink-900/25 decoration-1 underline-offset-4 transition-colors duration-400 hover:decoration-ember-500"
            >
              {profile.email}
            </a>
          </div>

          <nav data-footer-piece className="flex flex-col gap-2.5">
            <span className="label-mono">Sections</span>
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="w-fit text-left text-[0.93rem] text-ink-500 transition-colors duration-300 hover:text-ink-900"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div data-footer-piece className="flex flex-col gap-2.5">
            <span className="label-mono">Elsewhere</span>
            {[
              { label: 'GitHub', href: profile.github },
              { label: 'LinkedIn', href: profile.linkedin },
              { label: 'X / Twitter', href: profile.x },
              { label: 'Hashnode', href: profile.hashnode }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="link"
                className="w-fit text-[0.93rem] text-ink-500 transition-colors duration-300 hover:text-ink-900"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div
          data-footer-piece
          className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-ink-900/10 pt-6 sm:flex-row sm:items-center"
        >
          <p className="label-mono text-ink-400">
            © {year} {profile.name} — built with React, GSAP &amp; three.js
          </p>

          <div className="flex items-center gap-5">
            <span className="label-mono hidden text-ink-300 sm:block">Designed &amp; coded end to end</span>
            <Magnetic strength={0.25}>
              <button
                type="button"
                onClick={() => scrollTo('#hero')}
                data-cursor="link"
                className="group inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-2.5 text-[0.85rem] font-medium text-ink-900 transition-colors duration-500 hover:border-ink-900/40 hover:bg-cream-50/70"
              >
                Back to top
                <ArrowUp className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  )
}
