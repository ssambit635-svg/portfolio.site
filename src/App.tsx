import { Fragment, useEffect, useState } from 'react'
import MacLaptop from './components/MacLaptop'
import RevealText from './components/RevealText'
import PegBoard from './components/PegBoard'
import EmoRobot from './components/EmoRobot'
import HeroKeyboard from './components/HeroKeyboard'
import WorksWheel from './components/WorksWheel'
import { credentials, experience, profile, projects } from './lib/site'
import { setScrollLocked, useLenis } from './hooks/useLenis'
import { prefersReducedMotion } from './lib/utils'
import heroMonitor from './assets/hero-monitor.jpg'

/** A quiet, screen-accurate loader: only the monitor's thin status rule moves. */
function Preloader() {
  const [done, setDone] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [progress, setProgress] = useState(0.08)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true)
      return
    }

    let cancelled = false
    let closing = false
    let safetyTimer = 0
    let minimumTimer = 0
    let completeTimer = 0
    let fadeTimer = 0
    let readyAssets = 0
    const startedAt = performance.now()
    setScrollLocked(true)

    const reportAssetReady = () => {
      readyAssets += 1
      if (cancelled || closing) return
      setProgress(readyAssets === 1 ? 0.56 : 0.9)
    }

    const heroImage = document.querySelector<HTMLImageElement>('.hero-monitor')
    const imageReady = heroImage
      ? heroImage.decode().catch(() => undefined)
      : Promise.resolve()
    const fontsReady = document.fonts.ready.catch(() => undefined)
    void imageReady.then(reportAssetReady)
    void fontsReady.then(reportAssetReady)

    const allReady = Promise.all([imageReady, fontsReady]).then(() => undefined)
    const safety = new Promise<void>((resolve) => {
      safetyTimer = window.setTimeout(resolve, 1800)
    })

    void Promise.race([allReady, safety]).then(async () => {
      window.clearTimeout(safetyTimer)
      if (cancelled) return

      const remaining = Math.max(0, 420 - (performance.now() - startedAt))
      if (remaining > 0) {
        await new Promise<void>((resolve) => {
          minimumTimer = window.setTimeout(resolve, remaining)
        })
      }
      if (cancelled) return

      setProgress(1)
      completeTimer = window.setTimeout(() => {
        if (cancelled) return
        closing = true
        setLeaving(true)
        fadeTimer = window.setTimeout(() => {
          if (cancelled) return
          setScrollLocked(false)
          setDone(true)
        }, 320)
      }, 140)
    })

    return () => {
      cancelled = true
      window.clearTimeout(safetyTimer)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(completeTimer)
      window.clearTimeout(fadeTimer)
      setScrollLocked(false)
    }
  }, [])

  if (done || reduced) return null
  return (
    <div className={`preloader${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="hero-frame preloader-frame">
        <div className="hero-screen preloader-screen">
          <div className="preloader-meter">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const links = [
  ['Home', '#home'],
  ['Works', '#works'],
  ['Certified', '#certified'],
  ['About me', '#about'],
  ['Contact', '#contact']
] as const

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className="side-nav">
      <a className="nav-name" href="#home" aria-label="Sambit Swain — home">SS</a>
      <button
        className="menu-toggle"
        type="button"
        onClick={() => setOpen(!open)}
        aria-controls="main-navigation"
        aria-expanded={open}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="main-navigation" className={open ? 'is-open' : ''} aria-label="Main navigation">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
    </header>
  )
}

/**
 * The headline is laid on the panel's cylinder instead of pasted flat over it.
 * The glass is measured off hero-monitor.jpg: the visible band is 262px tall in
 * the middle and 288px at either end (9.9% more), i.e. the ends are closer to the
 * lens — so each word is rotated about its own centre and scaled up toward the
 * ends. Static transforms only, so SSR, no-JS and reduced-motion all get the
 * same frame as a moving pointer.
 */
const ARC_SPREAD = 11 /** degrees of turn at the end of a line */
const ARC_BULGE = 0.09 /** the measured height gain of the band at the ends */

function ArcLine({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <span className="hero-line">
      {words.map((word, i) => {
        const u = ((i + 0.5) / words.length) * 2 - 1
        return (
          <Fragment key={word + i}>
            <span
              className="hero-word"
              style={{
                transform: `perspective(1000px) rotateY(${(u * ARC_SPREAD).toFixed(2)}deg) scale(${(
                  1 +
                  ARC_BULGE * u * u
                ).toFixed(3)})`,
              }}
            >
              {word}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        )
      })}
    </span>
  )
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-frame">
        <div className="hero-monitor-wrapper">
          <img src={heroMonitor} alt="" width={1376} height={768} className="hero-monitor" fetchPriority="high" />
          <div className="hero-screen">
            <p className="hero-screen-label">
              <ArcLine text="CLOUD · FULL-STACK · CSE ’29" />
            </p>
            <h1 className="hero-screen-title">
              <ArcLine text="From code to cloud." />
              <ArcLine text="From pixels to production." />
            </h1>
          </div>
          <EmoRobot />
          <HeroKeyboard />
        </div>
      </div>
      {/* Outside the frame: the photo is cropped top and bottom to bleed edge to
          edge, and the name has to sit on the fold instead of inside the scene. */}
      <p className="hero-tagline">
        {profile.first} · {profile.last}
      </p>
    </section>
  )
}

/** The work as a wheel: it sits in a ring, the first scroll blows it open into
    a drum, and the section keeps the gesture until the last piece has turned
    past the front — then the page carries on. */
function Works() {
  const wheel = projects.map(({ title, image, href }) => ({ title, image, href }))
  return (
    <section id="works" className="works" aria-labelledby="work-heading">
      <h2 id="work-heading" className="sr-only">Works</h2>
      <WorksWheel
        items={wheel}
        label="Works"
        kicker="Selected projects · 2025—26"
        action="Open project"
        wheelUnits={640}
        renderFront={(_item, index) => {
          const project = projects[index]
          return (
            <>
              <p className="ww-meta-no">{String(index + 1).padStart(2, '0')} · {project.kind} · {project.year}</p>
              <p className="ww-meta-desc">{project.description}</p>
              <ul className="ww-meta-stack">{project.stack.map(tech => <li key={tech}>{tech}</li>)}</ul>
              <p className="ww-meta-links">
                <a className="ww-front-link" href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.action} for ${project.title}`}>{project.action} <Arrow /></a>
                {project.repo && <a className="ww-front-link" href={project.repo} target="_blank" rel="noreferrer" aria-label={`Source code for ${project.title}`}>Source <Arrow /></a>}
              </p>
              {project.note && <p className="ww-meta-note">{project.note}</p>}
            </>
          )
        }}
      />

      {/* The same eight, in text. Crawlable copy, and the reading path for
          anyone who would rather not turn a wheel to see the work. */}
      <div className="works-index">
        <div className="works-index-head">
          <p>The same eight, in text</p>
          <a href={profile.github} target="_blank" rel="noreferrer">All repositories <Arrow /></a>
        </div>
        <ol className="works-list">
          {projects.map((project, index) => (
            <li className="works-row" id={`project-${project.id}`} key={project.id}>
              <span className="works-row-no">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{project.title}</h3>
                <p className="works-row-meta">{project.kind} · {project.year}</p>
              </div>
              <p className="works-row-desc">{project.description}</p>
              <div className="works-row-side">
                <p className="works-row-links">
                  <a href={project.href} target="_blank" rel="noreferrer">{project.action}</a>
                  {project.repo && <a href={project.repo} target="_blank" rel="noreferrer">Source</a>}
                </p>
                {project.note && <p className="works-row-note">{project.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Certified() {
  return (
    <section id="certified" className="section certified">
      <div className="section-head"><p>Things I learned properly</p><h2>Certified</h2></div>
      <div className="cert-grid">
        {credentials.map((cert, i) => <article className="cert" key={cert.id}>
          <span className="cert-no">{String(i + 1).padStart(2, '0')}</span>
          {cert.image ? <img src={cert.image} alt="" loading="lazy"/> : <div className="cert-placeholder">SS<br/>/26</div>}
          <div><p>{cert.issuer}</p><h3>{cert.title}</h3><span>{cert.detail}</span>
            {cert.href && <a className="cert-link" href={cert.href} target="_blank" rel="noreferrer">{cert.action ?? 'View'} <Arrow /></a>}
          </div>
        </article>)}
      </div>
      <a className="white-button" href="dashboard/">All certificates & achievements <Arrow /></a>
    </section>
  )
}

function About() {
  const education = experience.filter(item => item.id === 'nist' || item.id === 'dhss')
  return <section id="about" className="section about">
    <div className="section-head"><p>The human behind the terminal</p><h2>About me</h2></div>
    <div className="about-grid">
      <PegBoard />
      <div className="bio"><RevealText text="I’m a Computer Science student and product-minded developer working from interface to infrastructure. I turn real-world problems into dependable web products—then containerise and ship them." /><RevealText text="I learn by building in public, joining hackathons, and following each idea all the way from a rough screen to a running service." /></div>
    </div>
    <div className="education"><h3>Education</h3>{education.map(item => <div className="edu-row" key={item.id}><span>{item.role}</span><h4>{item.org}</h4><p>{item.detail}</p></div>)}</div>
    <div className="personal"><span>Berhampur, India</span><span>{profile.coords.join(' · ')}</span><span>CSE ’29</span><span>Available for good ideas</span></div>
  </section>
}

function Footer() {
  return <footer id="contact"><MacLaptop /></footer>
}

export default function App({ staticRender = false }: { staticRender?: boolean }) {
  void staticRender
  useLenis()
  useEffect(() => { document.documentElement.dataset.theme = 'reference' }, [])
  return <><Preloader /><a className="skip-link" href="#works">Skip to work</a><Nav/><main><Hero/><Works/><Certified/><About/></main><Footer/></>
}
