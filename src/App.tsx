import { useEffect, useState } from 'react'
import MacLaptop from './components/MacLaptop'
import RevealText from './components/RevealText'
import PegBoard from './components/PegBoard'
import WorksWheel from './components/WorksWheel'
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
              <p className="works-row-links">
                <a href={project.href} target="_blank" rel="noreferrer">{project.action}</a>
                {project.repo && <a href={project.repo} target="_blank" rel="noreferrer">Source</a>}
              </p>
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
