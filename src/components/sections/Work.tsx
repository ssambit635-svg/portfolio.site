import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { projects, type Project } from '../../lib/site'
import Tag from '../ui/Tag'
import Button from '../ui/Button'
import Scramble from '../fx/Scramble'
import { useSound } from '../../hooks/useSound'
import { cn } from '../../lib/utils'

/* Smaller stagger keeps the longer, more informative cards inside the pin. */
const OFFSETS = [180, 40, 240, 0, 210, 60, 240, 15]

function Card({ p, i }: { p: Project; i: number }) {
  const { tick } = useSound()
  return (
    <article
      id={`project-${p.id}`}
      data-project-card
      data-reveal={i * 60}
      className="project-card relative block w-[300px] shrink-0 max-md:w-[78vw]"
      style={{ marginTop: OFFSETS[i % OFFSETS.length] }}
    >
      {/* connector line */}
      <i
        aria-hidden
        className={cn(
          'absolute top-1/2 -left-[190px] h-px w-[190px] bg-black/25 max-md:hidden',
          i === 0 && 'hidden'
        )}
      />
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={tick}
        data-scramble-hover
        data-cursor
        aria-label={`${p.action}: ${p.title}`}
        className="group block"
      >
        <div className="relative aspect-[300/220] overflow-hidden bg-ink">
          <img
            src={p.image}
            alt={`${p.title} — ${p.kind} project preview`}
            width={1200}
            height={880}
            decoding="async"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(180,140,255,0.6)_100%)]" />
          <Tag tone="ink" className="absolute bottom-3 left-3">
            {p.kind}
          </Tag>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h3 className="font-label text-[13px] font-semibold tracking-[0.06em] text-ink uppercase">
            <Scramble text={p.title} trigger="hover" speed={30} color="#180735" />
          </h3>
          <span className="t-label shrink-0 text-[9px] text-ink/60">
            {p.action} <span className="text-purple">↗</span>
          </span>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink/80">{p.description}</p>
      </a>

      <ul aria-label={`Technologies used for ${p.title}`} className="mt-3 flex flex-wrap gap-1.5">
        {p.stack.map((tool) => (
          <li
            key={tool}
            className="border border-purple/20 px-1.5 py-1 font-label text-[9px] font-medium tracking-[0.03em] text-purple/85"
          >
            {tool}
          </li>
        ))}
      </ul>
      {p.repo && (
        <a
          href={p.repo}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={tick}
          className="mt-2 inline-flex min-h-9 items-center gap-1 pr-2 font-label text-[10px] font-semibold tracking-wide text-ink/65 transition-colors hover:text-purple focus-visible:text-purple"
          aria-label={`View source code for ${p.title}`}
        >
          Source code <span aria-hidden>↗</span>
        </a>
      )}
    </article>
  )
}

export default function Work() {
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const t = track.current!
      const dist = () => t.scrollWidth - window.innerWidth
      const tw = gsap.to(t, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      })
      return () => {
        tw.scrollTrigger?.kill()
        tw.kill()
      }
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
  }, [])

  return (
    <section id="work" data-theme="lime" className="relative bg-lime text-ink">
      <div ref={pin} className="work-pin h-[max(100svh,880px)] overflow-hidden max-md:h-auto max-md:pb-16">
        {/* horizontal baseline */}
        <i aria-hidden className="absolute top-[74%] left-0 h-px w-full bg-black/15 max-md:hidden" />
        <div ref={track} className="project-track flex h-full items-start gap-[120px] px-8 pt-[110px] will-change-transform max-md:flex-col max-md:gap-16 max-md:pt-24">
          {/* heading block */}
          <div className="w-[300px] shrink-0 pt-6 max-md:w-auto">
            <Tag tone="ink">Keep Scrolling</Tag>
            <h2 className="t-display mt-3 text-[clamp(56px,6.2vw,92px)] font-medium leading-[0.9] text-purple">
              <Scramble text="Selected" speed={40} />
              <br />
              <Scramble text="Work" speed={40} delay={250} />
            </h2>
            <p className="t-label mt-10 max-w-[270px] leading-[1.8] text-ink/55">
              A selection of web, cloud and applied-tech projects. Open a live build or jump straight to its source.
            </p>
            <Button href="https://github.com/ssambit635-svg?tab=repositories" target="_blank" rel="noopener noreferrer" className="mt-4 [border-color:var(--color-purple)] [color:var(--color-purple)] hover:[background:var(--color-purple)] hover:[color:var(--color-lime)]">
              More projects on GitHub
            </Button>
          </div>
          {projects.map((project, i) => (
            <Card key={project.id} p={project} i={i} />
          ))}
          <div className="w-[10vw] shrink-0 max-md:hidden" />
        </div>
      </div>
    </section>
  )
}
