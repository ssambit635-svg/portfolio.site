import { useEffect, useState } from 'react'
import HardwareConsole from './components/HardwareConsole'
import HardwareConsolePhoto from './components/HardwareConsolePhoto'
import RevealText from './components/RevealText'
import PegBoard from './components/PegBoard'
import { credentials, experience, profile, projects, tagline } from './lib/site'
import { setScrollLocked, useLenis } from './hooks/useLenis'
import { prefersReducedMotion } from './lib/utils'
import heroTv from './assets/hero-tv.jpg'

/** Preloader greeting sequence — 0.9s per language, 5 languages = 4.5s, then a 0.5s fade. */
const WELCOMES = [
  ['en', 'Welcome'],
  ['hi', 'स्वागत है'],
  ['or', 'ସ୍ୱାଗତ'],
  ['fr', 'Bienvenue'],
  ['ja', 'ようこそ'],
] as const

function Preloader() {
  const [done, setDone] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true)
      return
    }
    document.documentElement.dataset.boot = '1'
    setScrollLocked(true)
    const t = setTimeout(() => {
      setDone(true)
      setScrollLocked(false)
    }, 6100)
    return () => {
      clearTimeout(t)
      setScrollLocked(false)
    }
  }, [])
  if (done || reduced) return null
  return (
    <div className="preloader" aria-hidden="true">
      <div className="pre-glow" />
      <div className="pre-words">
        {WELCOMES.map(([lang, word]) => (
          <span key={lang} lang={lang}>
            {word}
          </span>
        ))}
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
  return (
    <header className="side-nav">
      <a className="nav-name" href="#home" aria-label="Sambit Swain — home">SS</a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">{open ? 'Close' : 'Menu'}</button>
      <nav className={open ? 'is-open' : ''} aria-label="Main navigation">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-frame">
        <img src={heroTv} alt="" />
        <p className="tv-hello" aria-hidden="true">
          <span>h</span><span>e</span><span>l</span><span>l</span><span>o</span>
        </p>
        <div className="tv-screen-fx" aria-hidden="true">
          <i className="flicker" />
          <i className="scan" />
          <i className="roll" />
        </div>
      </div>
      <h1 className="sr-only">{tagline}</h1>
    </section>
  )
}

function Works() {
  return (
    <section id="works" className="section works">
      <div className="section-head"><p>Selected projects · 2025—26</p><h2>Works</h2></div>
      <div className="work-list">
        {projects.map((project, index) => (
          <article className="work" id={`project-${project.id}`} key={project.id}>
            <div className="work-meta"><span>{String(index + 1).padStart(2, '0')}</span><span>{project.kind}</span><span>{project.year}</span></div>
            <a className="work-media" href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`}>
              <img src={project.image} alt={`${project.title} project preview`} loading="lazy" />
              <div className="play">View<br/>project <Arrow /></div>
              <span className="video-label">PROJECT PREVIEW</span>
            </a>
            <div className="work-copy">
              <h3>{project.title}</h3><p>{project.description}</p>
              <div className="chips">{project.stack.map(item => <span key={item}>{item}</span>)}</div>
              <div className="project-links"><a href={project.href} target="_blank" rel="noreferrer">{project.action} <Arrow /></a>{project.repo && <a href={project.repo} target="_blank" rel="noreferrer">Source <Arrow /></a>}</div>
            </div>
          </article>
        ))}
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
  return <footer id="contact">
    <p className="footer-kicker">Have a project, a strange idea, or just want to say hello?</p>
    <h2>Let’s make<br/>it <em>run.</em></h2>
    <HardwareConsole />
    <HardwareConsolePhoto />
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Sambit Swain</span><span>{profile.email}</span><span>Designed to keep moving.</span></div>
  </footer>
}

export default function App({ staticRender = false }: { staticRender?: boolean }) {
  void staticRender
  useLenis()
  useEffect(() => { document.documentElement.dataset.theme = 'reference' }, [])
  return <><Preloader /><a className="skip-link" href="#works">Skip to work</a><Nav/><main><Hero/><Works/><Certified/><About/></main><Footer/></>
}
