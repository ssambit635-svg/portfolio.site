import { ArrowUpRight, Github, Server, type LucideIcon } from 'lucide-react'
import { Cloud, Lock, Map, Sparkles, Waves } from 'lucide-react'
import type { Project } from '../../lib/site'
import { cn } from '../../lib/utils'
import { SpotlightCard } from '../ui/SpotlightCard'

const GLYPHS: Record<string, LucideIcon> = {
  map: Map,
  weather: Waves,
  cloud: Cloud,
  lock: Lock,
  spark: Sparkles
}

const LINK_ICONS: Record<string, LucideIcon> = {
  live: ArrowUpRight,
  repo: Github,
  case: Server
}

type Props = {
  project: Project
  className?: string
}

/**
 * Project card: cream surface, mono spec block, and a warm spotlight that
 * follows the pointer. Tilts a couple of degrees — enough to feel physical,
 * not enough to be a gimmick.
 */
export function ProjectCard({ project, className }: Props) {
  const Glyph = GLYPHS[project.glyph] ?? Sparkles

  return (
    <SpotlightCard
      tilt={6}
      glow={460}
      className={cn(
        'surface beam group relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] p-6 sm:p-8',
        'transition-shadow duration-700 hover:shadow-[var(--shadow-lift)]',
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* accent wash */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full opacity-[0.16] blur-3xl transition-opacity duration-700 group-hover:opacity-25"
        style={{ background: project.accent }}
      />

      {/* big watermark index */}
      <span
        aria-hidden
        className="serif-accent pointer-events-none absolute -bottom-6 right-3 select-none text-[7rem] leading-none text-ink-900/[0.045] transition-transform duration-700 group-hover:-translate-y-1"
      >
        {project.index}
      </span>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-ink-900/10 bg-cream-50/70">
              <Glyph className="size-4 text-ink-700" strokeWidth={1.6} />
            </span>
            <span className="label-mono text-ink-400">{project.year}</span>
          </div>
          <span className="label-mono text-ink-300">— {project.index}</span>
        </div>

        <h3 className="mt-7 text-[clamp(1.6rem,2.6vw,2.35rem)] font-medium leading-[1.02] tracking-[-0.04em] text-ink-900">
          {project.title}
        </h3>
        <p className="serif-accent mt-2 text-[1.02rem] text-ember-600">{project.tagline}</p>

        <p className="mt-5 max-w-[46ch] text-[0.94rem] leading-relaxed text-ink-500">{project.description}</p>
      </div>

      <div className="relative z-10 mt-8">
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 border-t border-ink-900/10 pt-5">
          <dt className="label-mono">Role</dt>
          <dd className="text-[0.85rem] text-ink-700">{project.role}</dd>
          <dt className="label-mono">Stack</dt>
          <dd className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-ink-900/10 bg-cream-50/60 px-2.5 py-1 font-mono text-[0.68rem] tracking-tight text-ink-500"
              >
                {item}
              </span>
            ))}
          </dd>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          {project.links.map((link) => {
            const Icon = LINK_ICONS[link.kind] ?? ArrowUpRight
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="view"
                className="group/link inline-flex items-center gap-2 text-[0.88rem] font-medium text-ink-900"
              >
                <span className="relative">
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-ember-500 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:scale-x-100" />
                </span>
                <Icon className="size-3.5 text-ink-400 transition-all duration-500 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-ember-600" />
              </a>
            )
          })}
        </div>
      </div>
    </SpotlightCard>
  )
}
