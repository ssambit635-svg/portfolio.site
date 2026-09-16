import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, FileText, MessageCircle, Moon, Sun } from 'lucide-react'
import { WaveCanvas } from './fx/WaveCanvas'
import { BlurFade } from './fx/BlurFade'
import { HoverPreview } from './fx/HoverPreview'
import { PillNav } from './PillNav'
import { useSmoothScroll } from '../providers/SmoothScroll'
import { certificates, contactChannels, home, profile, projects } from '../lib/site'

const SECTIONS = ['intro', 'work', 'credentials', 'connect']

/** Theme-tuned backdrops: dither waves + Gemini-style aurora tints. */
const BACKDROPS = {
  dark: {
    bg: [0.08, 0.08, 0.08] as [number, number, number],
    wave: [0.17, 0.17, 0.17] as [number, number, number],
    aurora: {
      a: [0.13, 0.15, 0.31] as [number, number, number],
      b: [0.21, 0.13, 0.31] as [number, number, number],
      c: [0.08, 0.19, 0.24] as [number, number, number],
      strength: 0.5
    }
  },
  light: {
    bg: [0.955, 0.94, 0.9] as [number, number, number],
    wave: [0.83, 0.8, 0.72] as [number, number, number],
    aurora: {
      a: [0.94, 0.85, 0.72] as [number, number, number],
      b: [0.82, 0.86, 0.74] as [number, number, number],
      c: [0.79, 0.85, 0.9] as [number, number, number],
      strength: 0.55
    }
  }
}

/* Buttons share one skeleton; only the paint changes. */
function BorderButton({
  href,
  children,
  solid = false,
  onClick
}: {
  href?: string
  children: ReactNode
  solid?: boolean
  onClick?: () => void
}) {
  const cls = `cursor-target group relative inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-lg border-2 border-foreground px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
    solid
      ? 'bg-foreground text-background hover:bg-transparent hover:text-foreground'
      : 'bg-background text-foreground hover:bg-foreground hover:text-background'
  }`

  const inner = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </>
  )

  if (href) {
    const external = href.startsWith('http')
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {inner}
      </a>
    )
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

export function HomePage({
  isDark,
  onToggleTheme
}: {
  isDark: boolean
  onToggleTheme: () => void
}) {
  const [activeSection, setActiveSection] = useState('intro')
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const { scrollToSection } = useSmoothScroll()
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

  return (
    <>
      {/* Fixed dithered-wave + aurora backdrop across the whole page */}
      <div className="fixed inset-0 z-0">
        <WaveCanvas
          variant="home"
          bg={backdrop.bg}
          wave={backdrop.wave}
          aurora={backdrop.aurora}
          className="h-full w-full"
        />
      </div>

      <PillNav sections={SECTIONS} active={activeSection} onNavigate={scrollToSection} />

      <main className="relative z-10 mx-auto max-w-4xl px-6 sm:px-8 lg:px-16">
        {/* ------------------------------------------------------- intro -- */}
        <header
          id="intro"
          ref={(el) => {
            sectionsRef.current[0] = el
          }}
          className="flex min-h-screen items-center opacity-0"
        >
          <div className="grid w-full gap-12 sm:gap-16 lg:grid-cols-5">
            <div className="space-y-6 sm:space-y-8 lg:col-span-3">
              <div className="space-y-3 sm:space-y-2">
                <div className="font-mono text-sm tracking-wider text-muted-foreground">
                  {home.kicker}
                </div>
                <BlurFade delay={0.25}>
                  <h1 className="cursor-target text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
                    {home.headline[0]}
                    <br />
                    <span className="text-3xl text-muted-foreground sm:text-4xl lg:text-5xl">
                      {home.headline[1]}
                    </span>
                  </h1>
                </BlurFade>
              </div>

              <BlurFade delay={0.5}>
                <div className="max-w-md space-y-6">
                  <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    I'm <span className="font-medium text-foreground">{profile.name}</span>,{' '}
                    {home.ledeBefore}{' '}
                    <span className="text-foreground">{home.lede[0]}</span>,{' '}
                    <span className="text-foreground">{home.lede[1]}</span> and{' '}
                    <span className="text-foreground">{home.lede[2]}</span>. {home.ledeAfter}
                  </p>

                  <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      {home.status}
                    </div>
                    <div className="flex items-center gap-3">
                      <div>{profile.location}</div>
                      <div className="origin-left scale-90">
                        <BorderButton onClick={() => scrollToSection('work')}>More</BorderButton>
                      </div>
                    </div>
                  </div>
                </div>
              </BlurFade>
            </div>

            <div className="mt-8 flex flex-col justify-end space-y-6 sm:space-y-8 lg:col-span-2 lg:mt-0">
              <BlurFade delay={0.75}>
                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-4">
                    <div className="font-mono text-sm text-muted-foreground">CURRENTLY</div>
                    <div className="space-y-2">
                      <div className="text-foreground">{home.currently.title}</div>
                      <div className="text-muted-foreground">{home.currently.org}</div>
                      <div className="text-xs text-muted-foreground">{home.currently.period}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="font-mono text-sm text-muted-foreground">AROUND THE WEB</div>
                    <BorderButton href={profile.linkedin}>
                      <FileText className="h-4 w-4" />
                      View LinkedIn
                    </BorderButton>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="font-mono text-sm text-muted-foreground">FOCUS</div>
                    <div className="flex flex-wrap gap-2">
                      {home.focusSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border px-3 py-1 text-xs transition-colors duration-300 hover:border-muted-foreground/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </BlurFade>
            </div>
          </div>
        </header>

        {/* -------------------------------------------------------- work -- */}
        <section
          id="work"
          ref={(el) => {
            sectionsRef.current[1] = el
          }}
          className="min-h-screen py-20 opacity-0 sm:py-32"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-row items-center justify-between gap-4">
              <BlurFade delay={0.25}>
                <h2 className="text-3xl font-light sm:text-4xl">My Work</h2>
              </BlurFade>
              <BorderButton href={`${profile.github}?tab=repositories`} solid>
                View All Projects
              </BorderButton>
            </div>

            <BlurFade delay={0.5}>
              <div className="space-y-8 sm:space-y-12">
                {projects.map((project) => (
                  <HoverPreview key={project.id} src={project.image} alt={`${project.title} screenshot`}>
                    <div className="cursor-target group grid gap-4 border-b border-border/50 py-6 transition-colors duration-500 hover:border-border sm:gap-8 sm:py-8 lg:grid-cols-12">
                    <div className="lg:col-span-2">
                      <div className="text-xl font-light text-muted-foreground transition-colors duration-500 group-hover:text-foreground sm:text-2xl">
                        {project.year}
                      </div>
                    </div>

                    <div className="space-y-3 lg:col-span-6">
                      <div>
                        <h3 className="text-lg font-medium sm:text-xl">{project.title}</h3>
                        <div className="text-muted-foreground">{project.tagline}</div>
                      </div>
                      <p className="max-w-lg leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                        {project.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground"
                          >
                            {link.label}
                            <ArrowRight className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 lg:col-span-4 lg:mt-0 lg:justify-end">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="self-start rounded px-2 py-1 text-xs text-muted-foreground transition-colors duration-500 group-hover:text-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    </div>
                  </HoverPreview>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* ------------------------------------------------- credentials -- */}
        <section
          id="credentials"
          ref={(el) => {
            sectionsRef.current[2] = el
          }}
          className="min-h-screen py-20 opacity-0 sm:py-32"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-row items-center justify-between gap-4">
              <BlurFade delay={0.25}>
                <h2 className="text-3xl font-light sm:text-4xl">Certificates</h2>
              </BlurFade>
              <BorderButton href={profile.linkedin}>
                Show More
              </BorderButton>
            </div>

            <BlurFade delay={0.5}>
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                {certificates.map((cert) => (
                  <HoverPreview key={cert.id} src={cert.image} alt={`${cert.title} certificate`}>
                    <a href={cert.href} target="_blank" rel="noreferrer" className="block h-full">
                      <article className="cursor-target group flex h-full cursor-pointer flex-col rounded-lg border border-border p-6 transition-all duration-500 hover:border-muted-foreground/50 hover:shadow-lg sm:p-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
                            <span>{cert.date}</span>
                            <span className="text-right">{cert.issuer}</span>
                          </div>

                          <h3 className="text-lg font-medium transition-colors duration-300 group-hover:text-muted-foreground sm:text-xl">
                            {cert.title}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                            <span>View credential</span>
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </article>
                    </a>
                  </HoverPreview>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* ----------------------------------------------------- connect -- */}
        <section
          id="connect"
          ref={(el) => {
            sectionsRef.current[3] = el
          }}
          className="py-20 opacity-0 sm:py-32"
        >
          <div className="grid gap-12 sm:gap-16 lg:grid-cols-2">
            <div className="space-y-6 sm:space-y-8">
              <BlurFade delay={0.25}>
                <h2 className="text-3xl font-light sm:text-4xl">Let's Connect</h2>
              </BlurFade>

              <BlurFade delay={0.5}>
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {home.connectBlurb}
                  </p>

                  <div className="space-y-4">
                    <a
                      href={`mailto:${profile.email}`}
                      className="cursor-target group flex items-center gap-3 text-foreground transition-colors duration-300 hover:text-muted-foreground"
                    >
                      <span className="text-base sm:text-lg">{profile.email}</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                    <a
                      href={`tel:${profile.phoneHref}`}
                      className="cursor-target group flex items-center gap-3 text-foreground transition-colors duration-300 hover:text-muted-foreground"
                    >
                      <span className="text-base sm:text-lg">{profile.phone}</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </BlurFade>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <BlurFade delay={0.75}>
                <div className="font-mono text-sm text-muted-foreground">ELSEWHERE</div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {elsewhere.map((channel) => {
                    const external = !channel.href.startsWith('tel:') && !channel.href.startsWith('mailto:')
                    return (
                      <a
                        key={channel.label}
                        href={channel.href}
                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="cursor-target group rounded-lg border border-border p-4 transition-all duration-300 hover:border-muted-foreground/50 hover:shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="text-foreground transition-colors duration-300 group-hover:text-muted-foreground">
                            {channel.label}
                          </div>
                          <div className="text-sm text-muted-foreground">{channel.value}</div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </BlurFade>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ footer -- */}
        <footer className="border-t border-border py-12 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-6 sm:gap-8 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2026 {profile.name}. All rights reserved.</div>
              <div className="text-xs text-muted-foreground">Designed &amp; built in {profile.location}</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onToggleTheme}
                className="cursor-target group rounded-lg border border-border p-3 transition-all duration-300 hover:border-muted-foreground/50"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                )}
              </button>

              <a
                href={`mailto:${profile.email}`}
                className="cursor-target group rounded-lg border border-border p-3 transition-all duration-300 hover:border-muted-foreground/50"
                aria-label="Start a conversation"
              >
                <MessageCircle className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
              </a>
            </div>
          </div>
        </footer>
      </main>

      {/* Soft fade so content melts into the backdrop near the viewport bottom */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </>
  )
}
