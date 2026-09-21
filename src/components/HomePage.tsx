import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Calendar,
  Github,
  Globe,
  Hash,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  MousePointer2,
  Phone,
  Send,
  Sparkles,
  Sun,
  Terminal
} from 'lucide-react'
import { WaveCanvas } from './fx/WaveCanvas'
import { BlurFade } from './fx/BlurFade'
import { HoverPreview } from './fx/HoverPreview'
import { Magnetic } from './fx/Magnetic'
import { TiltCard } from './fx/TiltCard'
import { TextScramble } from './fx/TextScramble'
import { Marquee } from './fx/Marquee'
import { CountUp } from './fx/CountUp'
import { LiveClock } from './fx/LiveClock'
import { CopyChip } from './fx/CopyChip'
import { ScrollProgress } from './fx/ScrollProgress'
import { PillNav } from './PillNav'
import { useSmoothScroll } from '../providers/SmoothScroll'
import { useSound } from '../context/SoundContext'
import {
  certificates,
  contactChannels,
  home,
  processSteps,
  profile,
  projects,
  skillGroups,
  stats,
  tickerWords,
  timeline,
  type Project
} from '../lib/site'

const SECTIONS = ['intro', 'about', 'work', 'credentials', 'connect']

/** Theme-tuned backdrops: dither waves + Gemini-style aurora tints. */
const BACKDROPS = {
  dark: {
    bg: [0.055, 0.055, 0.075] as [number, number, number],
    wave: [0.15, 0.15, 0.19] as [number, number, number],
    aurora: {
      a: [0.16, 0.14, 0.34] as [number, number, number],
      b: [0.24, 0.15, 0.3] as [number, number, number],
      c: [0.09, 0.2, 0.24] as [number, number, number],
      strength: 0.58
    }
  },
  light: {
    bg: [0.955, 0.94, 0.9] as [number, number, number],
    wave: [0.83, 0.8, 0.72] as [number, number, number],
    aurora: {
      a: [0.94, 0.85, 0.72] as [number, number, number],
      b: [0.82, 0.86, 0.74] as [number, number, number],
      c: [0.79, 0.85, 0.9] as [number, number, number],
      strength: 0.6
    }
  }
}

const GOLD = 'rgb(226 183 106)'

/* ------------------------------------------------------------ primitives */

const GOLD_GRADIENT =
  'linear-gradient(100deg, rgb(244 214 160) 0%, rgb(226 183 106) 42%, rgb(255 246 226) 56%, rgb(214 152 132) 78%, rgb(226 183 106) 100%)'

function GoldButton({
  href,
  onClick,
  children,
  icon
}: {
  href?: string
  onClick?: () => void
  children: ReactNode
  icon?: ReactNode
}) {
  const external = href?.startsWith('http')
  return (
    <Magnetic
      as={href ? 'a' : 'button'}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={onClick}
      strength={0.3}
      onFieldEnter={undefined}
      className="cursor-target sheen-host group relative inline-flex w-fit items-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium text-[#141008] transition-shadow duration-500"
      style={{
        background: GOLD_GRADIENT,
        backgroundSize: '200% 100%',
        boxShadow: '0 14px 38px rgb(226 183 106 / 0.24), inset 0 1px 0 rgb(255 255 255 / 0.55)'
      }}
    >
      <span data-magnetic-inner className="relative z-10 inline-flex items-center gap-2">
        {icon}
        {children}
        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
      </span>
    </Magnetic>
  )
}

function GhostButton({
  href,
  onClick,
  children,
  icon
}: {
  href?: string
  onClick?: () => void
  children: ReactNode
  icon?: ReactNode
}) {
  const external = href?.startsWith('http')
  return (
    <Magnetic
      as={href ? 'a' : 'button'}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={onClick}
      strength={0.26}
      className="cursor-target sheen-host group relative inline-flex w-fit items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-500 hover:text-foreground"
      style={{
        borderColor: 'color-mix(in oklch, var(--border) 80%, transparent)',
        background: 'linear-gradient(180deg, color-mix(in oklch, var(--foreground) 5%, transparent), transparent)',
        color: 'var(--muted-foreground)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <span data-magnetic-inner className="relative z-10 inline-flex items-center gap-2">
        {icon}
        {children}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Magnetic>
  )
}

function SectionHeading({ index, kicker, title }: { index: string; kicker: string; title: string }) {
  return (
    <div className="group cursor-target space-y-3">
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
        <span className="ink-gold transition-all duration-500 group-hover:tracking-[0.42em]">{index}</span>
        <span
          className="hairline-gold h-px w-10 origin-left opacity-60 transition-transform duration-700 group-hover:scale-x-[2.4]"
          aria-hidden="true"
        />
        <TextScramble text={kicker} />
      </div>
      <h2 className="text-3xl font-light tracking-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
    </div>
  )
}

const CHANNEL_ICONS: Record<string, ReactNode> = {
  Email: <Mail className="h-4 w-4" />,
  GitHub: <Github className="h-4 w-4" />,
  LinkedIn: <Linkedin className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
  'Book a call': <Calendar className="h-4 w-4" />,
  X: <Hash className="h-4 w-4" />,
  Hashnode: <Terminal className="h-4 w-4" />,
  Discord: <MessageCircle className="h-4 w-4" />
}

/* ------------------------------------------------------------------ page */

export function HomePage({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const [activeSection, setActiveSection] = useState('intro')
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const { scrollToSection } = useSmoothScroll()
  const { hover, chime } = useSound()
  const backdrop = isDark ? BACKDROPS.dark : BACKDROPS.light

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  const elsewhere = contactChannels.filter((channel) => channel.kind !== 'primary')

  const sectionRef = (index: number) => (el: HTMLElement | null) => {
    sectionsRef.current[index] = el
  }

  return (
    <>
      <ScrollProgress />

      {/* Fixed dithered-wave + aurora backdrop across the whole page */}
      <div className="fixed inset-0 z-0">
        <WaveCanvas
          variant="home"
          bg={backdrop.bg}
          wave={backdrop.wave}
          aurora={backdrop.aurora}
          className="h-full w-full"
        />
        {/* warm wash so the shader sits inside the maison palette */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{
            background: isDark
              ? 'radial-gradient(120% 80% at 20% 0%, rgb(226 183 106 / 0.16), transparent 55%), radial-gradient(100% 70% at 85% 20%, rgb(122 176 165 / 0.14), transparent 60%), radial-gradient(120% 90% at 50% 100%, rgb(214 152 132 / 0.12), transparent 60%)'
              : 'radial-gradient(120% 80% at 20% 0%, rgb(226 183 106 / 0.22), transparent 55%), radial-gradient(100% 70% at 85% 20%, rgb(122 176 165 / 0.18), transparent 60%)'
          }}
          aria-hidden="true"
        />
      </div>

      <PillNav sections={SECTIONS} active={activeSection} onNavigate={scrollToSection} />

      <main className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8 lg:px-16">
        {/* ------------------------------------------------------- intro -- */}
        <header id="intro" ref={sectionRef(0)} className="flex min-h-screen items-center opacity-0">
          <div className="grid w-full gap-12 sm:gap-16 lg:grid-cols-5">
            <div className="space-y-6 sm:space-y-8 lg:col-span-3">
              <div className="space-y-3 sm:space-y-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.34em] text-muted-foreground sm:text-xs">
                  <TextScramble text={home.kicker} />
                </div>

                <BlurFade delay={0.25}>
                  <h1 className="cursor-target text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    <span className="ink-gold inline-block transition-transform duration-700 hover:scale-[1.02]">
                      {home.headline[0]}
                    </span>
                    <br />
                    <span className="text-3xl text-muted-foreground sm:text-4xl lg:text-5xl">{home.headline[1]}</span>
                  </h1>
                </BlurFade>
              </div>

              <BlurFade delay={0.45}>
                <div className="max-w-md space-y-6">
                  <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    I'm <span className="font-medium text-foreground">{profile.name}</span>, {home.ledeBefore}{' '}
                    <span className="text-foreground">{home.lede[0]}</span>,{' '}
                    <span className="text-foreground">{home.lede[1]}</span> and{' '}
                    <span className="text-foreground">{home.lede[2]}</span>. {home.ledeAfter}
                  </p>

                  <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="inline-flex items-center gap-2">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                          <span
                            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70"
                            style={{ animation: 'soft-pulse 2.4s ease-in-out infinite' }}
                          />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        {home.status}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" style={{ color: GOLD }} aria-hidden="true" />
                        {profile.location}
                      </span>
                      <LiveClock timeZone={profile.timezone} label="local" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <GoldButton onClick={() => scrollToSection('work')} icon={<Sparkles className="h-4 w-4" />}>
                        See the work
                      </GoldButton>
                      <GhostButton href={`mailto:${profile.email}`} icon={<Send className="h-4 w-4" />}>
                        Say hello
                      </GhostButton>
                    </div>
                  </div>
                </div>
              </BlurFade>
            </div>

            <div className="mt-8 flex flex-col justify-end space-y-6 sm:space-y-8 lg:col-span-2 lg:mt-0">
              <BlurFade delay={0.7}>
                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-3">
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Currently
                    </div>
                    <TiltCard
                      max={5}
                      lift={8}
                      className="rounded-xl border border-border/70 bg-card/40 p-5 backdrop-blur-sm"
                      onEnter={hover}
                    >
                      <div className="space-y-1.5">
                        <div className="text-foreground">{home.currently.title}</div>
                        <div className="text-sm text-muted-foreground">{home.currently.org}</div>
                        <div className="font-mono text-xs text-muted-foreground/80">{home.currently.period}</div>
                      </div>
                    </TiltCard>
                  </div>

                  <div className="space-y-3">
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Focus</div>
                    <div className="flex flex-wrap gap-2">
                      {home.focusSkills.map((skill, i) => (
                        <Magnetic
                          key={skill}
                          strength={0.5}
                          field={1.2}
                          onFieldEnter={hover}
                          className="cursor-target rounded-full px-3 py-1 text-xs transition-colors duration-300"
                          style={{
                            border: `1px solid color-mix(in oklch, var(--border) 90%, transparent)`,
                            color: 'var(--muted-foreground)',
                            background:
                              i % 3 === 0 ? 'linear-gradient(180deg, rgb(226 183 106 / 0.1), transparent)' : undefined,
                            transitionDelay: `${i * 12}ms`
                          }}
                        >
                          <span data-magnetic-inner>{skill}</span>
                        </Magnetic>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Around the web
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <GhostButton href={profile.linkedin} icon={<Linkedin className="h-4 w-4" />}>
                        LinkedIn
                      </GhostButton>
                      <GhostButton href={profile.github} icon={<Github className="h-4 w-4" />}>
                        GitHub
                      </GhostButton>
                    </div>
                  </div>
                </div>
              </BlurFade>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------ ticker -- */}
        <div className="border-y border-border/60 py-4 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground sm:py-5 sm:text-xs">
          <Marquee items={tickerWords} />
        </div>

        {/* ------------------------------------------------------- about -- */}
        <section id="about" ref={sectionRef(1)} className="py-20 opacity-0 sm:py-28">
          <div className="space-y-12 sm:space-y-16">
            <BlurFade delay={0.15}>
              <SectionHeading index="01" kicker="the short version" title="About" />
            </BlurFade>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <BlurFade key={stat.label} delay={0.2 + i * 0.08}>
                  <TiltCard
                    max={8}
                    lift={10}
                    className="group h-full rounded-xl border border-border/70 bg-card/40 p-5 backdrop-blur-sm"
                    onEnter={hover}
                  >
                    <div className="space-y-2">
                      <div className="ink-gold text-3xl font-light tracking-tight sm:text-4xl">
                        <CountUp
                          value={stat.value}
                          decimals={'decimals' in stat ? (stat.decimals as number) : 0}
                          suffix={stat.suffix}
                        />
                      </div>
                      <div className="text-xs leading-relaxed text-muted-foreground">{stat.label}</div>
                      <div
                        className="h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                        style={{ background: GOLD_GRADIENT }}
                        aria-hidden="true"
                      />
                    </div>
                  </TiltCard>
                </BlurFade>
              ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-5">
              <div className="space-y-6 lg:col-span-3">
                <BlurFade delay={0.2}>
                  <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Timeline</div>
                </BlurFade>

                <div className="relative space-y-8 pl-6">
                  <div
                    className="absolute bottom-2 left-[3px] top-2 w-px"
                    style={{
                      background:
                        'linear-gradient(180deg, rgb(226 183 106 / 0.7), rgb(214 152 132 / 0.35) 55%, transparent)'
                    }}
                    aria-hidden="true"
                  />
                  {timeline.map((entry, i) => (
                    <BlurFade key={entry.title} delay={0.25 + i * 0.12}>
                      <div className="group relative">
                        <span
                          className="absolute -left-6 top-2 h-[7px] w-[7px] rounded-full transition-all duration-500 group-hover:scale-150"
                          style={{
                            background: GOLD,
                            boxShadow: '0 0 0 4px rgb(226 183 106 / 0.14), 0 0 14px rgb(226 183 106 / 0.6)'
                          }}
                          aria-hidden="true"
                        />
                        <TiltCard
                          max={4}
                          lift={6}
                          className="rounded-xl border border-border/60 bg-card/30 p-5 backdrop-blur-sm transition-colors duration-500 group-hover:border-gold/30"
                          onEnter={hover}
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                              <span>{entry.period}</span>
                              <span className="ink-gold">{entry.metric}</span>
                            </div>
                            <h3 className="text-base font-medium sm:text-lg">{entry.title}</h3>
                            <div className="text-sm text-muted-foreground">{entry.org}</div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{entry.detail}</p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {entry.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-border/70 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors duration-300 hover:border-gold/40 hover:text-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </TiltCard>
                      </div>
                    </BlurFade>
                  ))}
                </div>
              </div>

              <div className="space-y-6 lg:col-span-2">
                <BlurFade delay={0.3}>
                  <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Toolkit</div>
                </BlurFade>

                <div className="space-y-4">
                  {skillGroups.map((group, i) => (
                    <BlurFade key={group.title} delay={0.3 + i * 0.08}>
                      <div className="group cursor-target rounded-xl border border-border/60 bg-card/30 p-4 backdrop-blur-sm transition-all duration-500 hover:border-gold/30 hover:shadow-[0_10px_40px_rgb(226_183_106_/_0.08)]">
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="text-sm font-medium">{group.title}</div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                            {group.note}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {group.items.map((item) => (
                            <span
                              key={item}
                              className="rounded px-2 py-1 text-xs text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground"
                              style={{ background: 'color-mix(in oklch, var(--muted) 60%, transparent)' }}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                        <div
                          className="mt-3 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                          style={{ background: GOLD_GRADIENT }}
                          aria-hidden="true"
                        />
                      </div>
                    </BlurFade>
                  ))}
                </div>
              </div>
            </div>

            <BlurFade delay={0.2}>
              <div className="grid gap-4 sm:grid-cols-3">
                {processSteps.map((step) => (
                  <TiltCard
                    key={step.index}
                    max={6}
                    lift={8}
                    className="h-full rounded-xl border border-border/60 bg-card/25 p-5 backdrop-blur-sm"
                    onEnter={hover}
                  >
                    <div className="space-y-2">
                      <div className="ink-gold font-mono text-xs tracking-[0.2em]">{step.index}</div>
                      <h3 className="text-sm font-medium leading-snug">{step.title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                      <div className="pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                        {step.detail}
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* -------------------------------------------------------- work -- */}
        <section id="work" ref={sectionRef(2)} className="min-h-screen py-20 opacity-0 sm:py-28">
          <div className="space-y-12 sm:space-y-14">
            <div className="flex flex-row flex-wrap items-end justify-between gap-6">
              <BlurFade delay={0.2}>
                <SectionHeading index="02" kicker="selected projects" title="My Work" />
              </BlurFade>
              <BlurFade delay={0.3}>
                <GoldButton href={`${profile.github}?tab=repositories`} icon={<Github className="h-4 w-4" />}>
                  View all projects
                </GoldButton>
              </BlurFade>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {projects.map((project, i) => (
                <BlurFade key={project.id} delay={0.1 + i * 0.06}>
                  <ProjectRow project={project} onHover={hover} />
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- credentials -- */}
        <section id="credentials" ref={sectionRef(3)} className="min-h-screen py-20 opacity-0 sm:py-28">
          <div className="space-y-12 sm:space-y-14">
            <div className="flex flex-row flex-wrap items-end justify-between gap-6">
              <BlurFade delay={0.2}>
                <SectionHeading index="03" kicker="verified credentials" title="Certificates" />
              </BlurFade>
              <BlurFade delay={0.3}>
                <GhostButton href={profile.linkedin} icon={<Linkedin className="h-4 w-4" />}>
                  Show more
                </GhostButton>
              </BlurFade>
            </div>

            <BlurFade delay={0.35}>
              <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                {certificates.map((cert) => (
                  <HoverPreview key={cert.id} src={cert.image} alt={`${cert.title} certificate`}>
                    <TiltCard
                      as="a"
                      href={cert.href}
                      target="_blank"
                      rel="noreferrer"
                      max={7}
                      lift={12}
                      className="cursor-target group h-full rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm"
                      onEnter={hover}
                    >
                      <div className="relative p-6 sm:p-7">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            <span>{cert.date}</span>
                            <span className="text-right normal-case tracking-normal">{cert.issuer}</span>
                          </div>

                          <h3 className="text-lg font-medium leading-snug transition-colors duration-300 sm:text-xl">
                            {cert.title}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                            <span>View credential</span>
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>

                        <div
                          className="absolute inset-x-6 bottom-4 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                          style={{ background: GOLD_GRADIENT }}
                          aria-hidden="true"
                        />
                      </div>
                    </TiltCard>
                  </HoverPreview>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* ----------------------------------------------------- connect -- */}
        <section id="connect" ref={sectionRef(4)} className="py-20 opacity-0 sm:py-28">
          <div className="grid gap-12 sm:gap-16 lg:grid-cols-2">
            <div className="space-y-6 sm:space-y-8">
              <BlurFade delay={0.2}>
                <SectionHeading index="04" kicker="let's talk" title="Let's Connect" />
              </BlurFade>

              <BlurFade delay={0.35}>
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">{home.connectBlurb}</p>

                  <div className="space-y-3">
                    <div className="group flex flex-wrap items-center gap-3">
                      <a
                        href={`mailto:${profile.email}`}
                        data-sfx="hover"
                        className="cursor-target inline-flex items-center gap-2.5 text-foreground transition-colors duration-300 hover:text-gold"
                      >
                        <Mail className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" />
                        <span className="text-base sm:text-lg">{profile.email}</span>
                        <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </a>
                      <CopyChip value={profile.email} label="email" toastLabel="Email" />
                    </div>

                    <div className="group flex flex-wrap items-center gap-3">
                      <a
                        href={`tel:${profile.phoneHref}`}
                        data-sfx="hover"
                        className="cursor-target inline-flex items-center gap-2.5 text-foreground transition-colors duration-300 hover:text-gold"
                      >
                        <Phone className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" />
                        <span className="text-base sm:text-lg">{profile.phone}</span>
                        <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </a>
                      <CopyChip value={profile.phone} label="phone" toastLabel="Phone" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <GoldButton href={profile.avely} icon={<Calendar className="h-4 w-4" />}>
                      Book a call
                    </GoldButton>
                    <GhostButton href={`mailto:${profile.email}`} icon={<Send className="h-4 w-4" />}>
                      Send a brief
                    </GhostButton>
                  </div>
                </div>
              </BlurFade>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <BlurFade delay={0.45}>
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Elsewhere</div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {elsewhere.map((channel) => {
                    const external = !channel.href.startsWith('tel:') && !channel.href.startsWith('mailto:')
                    return (
                      <TiltCard
                        key={channel.label}
                        as="a"
                        href={channel.href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                        max={9}
                        lift={10}
                        className="cursor-target group rounded-xl border border-border/70 bg-card/35 backdrop-blur-sm"
                        onEnter={hover}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 group-hover:scale-110"
                            style={{
                              borderColor: 'rgb(226 183 106 / 0.28)',
                              background: 'linear-gradient(160deg, rgb(226 183 106 / 0.14), transparent)',
                              color: GOLD
                            }}
                            aria-hidden="true"
                          >
                            {CHANNEL_ICONS[channel.label] ?? <Globe className="h-4 w-4" />}
                          </span>
                          <span className="min-w-0 space-y-0.5">
                            <span className="block truncate text-sm text-foreground">{channel.label}</span>
                            <span className="block truncate font-mono text-[11px] text-muted-foreground">
                              {channel.value}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                            aria-hidden="true"
                          />
                        </div>
                      </TiltCard>
                    )
                  })}
                </div>
              </BlurFade>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ footer -- */}
        <footer className="border-t border-border/70 py-14 sm:py-20">
          <div className="space-y-10">
            <Magnetic strength={0.12} field={1.3} className="block w-full" onFieldEnter={hover}>
              <div
                data-magnetic-inner
                className="ink-gold cursor-target select-none font-display text-[13vw] italic leading-[0.85] tracking-tight transition-transform duration-700 sm:text-[9vw] lg:text-[7.5rem]"
                aria-hidden="true"
              >
                Sambit Swain
              </div>
            </Magnetic>

            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span>© 2026 {profile.name}. All rights reserved.</span>
                  <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />
                  <span>Designed &amp; built in {profile.location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  <MousePointer2 className="h-3 w-3" aria-hidden="true" />
                  <span>React 19 · Vite · Tailwind 4 · raw WebGL · Web Audio</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onToggleTheme()
                    chime()
                  }}
                  data-sfx="hover"
                  className="cursor-target group relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-border transition-all duration-500 hover:border-gold/45"
                  aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  <span
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(160deg, rgb(226 183 106 / 0.22), transparent)' }}
                    aria-hidden="true"
                  />
                  {isDark ? (
                    <Sun className="relative h-4 w-4 text-muted-foreground transition-all duration-500 group-hover:rotate-45 group-hover:text-foreground" />
                  ) : (
                    <Moon className="relative h-4 w-4 text-muted-foreground transition-all duration-500 group-hover:-rotate-12 group-hover:text-foreground" />
                  )}
                </button>

                <Magnetic
                  as="a"
                  href={`mailto:${profile.email}`}
                  strength={0.35}
                  className="cursor-target group grid h-11 w-11 place-items-center rounded-full border border-border transition-all duration-500 hover:border-gold/45"
                  ariaLabel="Start a conversation"
                  onFieldEnter={hover}
                >
                  <span data-magnetic-inner>
                    <MessageCircle className="h-4 w-4 text-muted-foreground transition-colors duration-500 group-hover:text-foreground" />
                  </span>
                </Magnetic>

                <Magnetic
                  as="button"
                  type="button"
                  strength={0.35}
                  onClick={() => scrollToSection('intro')}
                  className="cursor-target group inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-all duration-500 hover:border-gold/45 hover:text-foreground"
                  ariaLabel="Back to top"
                  onFieldEnter={hover}
                >
                  <span data-magnetic-inner className="inline-flex items-center gap-2">
                    <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5" />
                    top
                  </span>
                </Magnetic>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Soft fade so content melts into the backdrop near the viewport bottom */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </>
  )
}

/* ---------------------------------------------------------- project row */

function ProjectRow({ project, onHover }: { project: Project; onHover: () => void }) {
  return (
    <HoverPreview src={project.image} alt={`${project.title} screenshot`}>
      <TiltCard
        max={2.6}
        lift={8}
        className="cursor-target group relative rounded-xl border border-border/50 bg-card/25 backdrop-blur-[2px] transition-colors duration-500 hover:border-border"
        onEnter={onHover}
      >
        <div className="grid gap-4 p-5 sm:gap-8 sm:p-7 lg:grid-cols-12">
          <div className="flex items-start gap-4 lg:col-span-2 lg:block">
            <div className="font-mono text-[11px] tracking-[0.2em]" style={{ color: GOLD }} aria-hidden="true">
              {project.index}
            </div>
            <div className="text-xl font-light text-muted-foreground transition-colors duration-500 group-hover:text-foreground sm:text-2xl lg:mt-2">
              {project.year}
            </div>
          </div>

          <div className="space-y-3 lg:col-span-6">
            <div>
              <h3 className="text-lg font-medium transition-colors duration-500 sm:text-xl">{project.title}</h3>
              <div className="text-sm text-muted-foreground">{project.tagline}</div>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{project.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  data-sfx="hover"
                  className="cursor-target inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap content-start gap-2 lg:col-span-4 lg:mt-0 lg:justify-end">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="self-start rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-all duration-500 group-hover:border-gold/25 group-hover:text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* accent wash that blooms on hover, tinted by the project's own colour */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(90% 120% at 8% 50%, ${project.accent}22, transparent 62%)`
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-5 bottom-3 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, ${project.accent}, transparent)` }}
          aria-hidden="true"
        />
      </TiltCard>
    </HoverPreview>
  )
}
