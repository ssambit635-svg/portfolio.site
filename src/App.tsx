import MacLaptop from './components/MacLaptop'
import SiteMenu from './components/SiteMenu'
import RevealText from './components/RevealText'
import PegBoard from './components/PegBoard'
import EmoRobot from './components/EmoRobot'
import HeroKeyboard from './components/HeroKeyboard'
import WorksWheel from './components/WorksWheel'
import Preloader from './components/Preloader'
import UptimeDot from './components/UptimeDot'
import AskEmo from './components/AskEmo'
import SkillsLid from './components/SkillsLid'
import { credentials, experience, profile, projects } from './lib/site'
import { formatCheckedAt } from './lib/uptime'
import { useLenis } from './hooks/useLenis'
import heroMonitor from './assets/hero-monitor.jpg'

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

/**
 * The headline is set flat on the panel.
 *
 * The glass of the monitor is curved — the clip-path in `src/index.css` draws
 * it bending away at the edges — but the type on it is not. Every word used to
 * be rotated about its own centre and scaled up toward the ends, so the line
 * bowed like a fisheye and the last words of each line were visibly larger
 * than the first. On a headline that reads as a mistake rather than as a
 * screen, so the words are straight now and the panel keeps its curve.
 */
function ScreenLine({ text }: { text: string }) {
  return <span className="hero-line">{text}</span>
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-frame">
        <div className="hero-monitor-wrapper">
          <img
            src={heroMonitor}
            alt=""
            width={1376}
            height={768}
            className="hero-monitor"
            fetchPriority="high"
          />
          <div className="hero-screen">
            <p className="hero-screen-label">
              <ScreenLine text="CLOUD · FULL-STACK · CSE ’29" />
            </p>
            <h1 className="hero-screen-title">
              <ScreenLine text="From code to cloud." />
              <ScreenLine text="From pixels to production." />
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
      <h2 id="work-heading" className="sr-only">
        Works
      </h2>
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
              <p className="ww-meta-no">
                {String(index + 1).padStart(2, '0')} · {project.kind} · {project.year}
              </p>
              <p className="ww-meta-desc">{project.description}</p>
              <ul className="ww-meta-stack">
                {project.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              <p className="ww-meta-links">
                <a
                  className="ww-front-link"
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.action} for ${project.title}`}
                >
                  {project.action} <Arrow />
                </a>
                {project.repo && (
                  <a
                    className="ww-front-link"
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Source code for ${project.title}`}
                  >
                    Source <Arrow />
                  </a>
                )}
              </p>
            </>
          )
        }}
      />

      {/* The same nine, in text. Crawlable copy, and the reading path for
          anyone who would rather not turn a wheel to see the work. */}
      <div className="works-index">
        <div className="works-index-head">
          <p>The same nine, in text</p>
          <a href={profile.github} target="_blank" rel="noreferrer">
            All repositories <Arrow />
          </a>
        </div>
        <ol className="works-list">
          {projects.map((project, index) => (
            <li className="works-row" id={`project-${project.id}`} key={project.id}>
              <span className="works-row-no">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{project.title}</h3>
                <p className="works-row-meta">
                  {project.kind} · {project.year}
                </p>
              </div>
              <p className="works-row-desc">{project.description}</p>
              <div className="works-row-side">
                {project.status === 'live' && <UptimeDot id={project.id} title={project.title} />}
                <p className="works-row-links">
                  <a href={project.href} target="_blank" rel="noreferrer">
                    {project.action}
                  </a>
                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="works-footnote">
          Free-tier hosting: the first visit to a live demo can take 30–60 seconds while it wakes.
          {formatCheckedAt() && (
            <> Status dots were checked {formatCheckedAt()}, at the last build.</>
          )}
        </p>
      </div>
    </section>
  )
}

function Certified() {
  return (
    <section id="certified" className="section certified">
      <div className="section-head">
        <p>Things I learned properly</p>
        <h2>Certified</h2>
      </div>
      <div className="cert-grid">
        {credentials.map((cert, i) => (
          <article className="cert" key={cert.id}>
            <span className="cert-no">{String(i + 1).padStart(2, '0')}</span>
            {cert.image ? (
              <img src={cert.image} alt="" loading="lazy" />
            ) : (
              <div className="cert-placeholder">
                SS
                <br />
                /26
              </div>
            )}
            <div>
              <p>{cert.issuer}</p>
              <h3>{cert.title}</h3>
              <span>{cert.detail}</span>
              {cert.credentialId && (
                <p className="cert-id">{`Credential ID ${cert.credentialId}`}</p>
              )}
              {cert.href && (
                <a className="cert-link" href={cert.href} target="_blank" rel="noreferrer">
                  {cert.action ?? 'View'} <Arrow />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      <a className="white-button" href="dashboard/">
        All certificates & achievements <Arrow />
      </a>
    </section>
  )
}

function About() {
  const education = experience.filter((item) => item.id === 'nist' || item.id === 'dhss')
  return (
    <section id="about" className="section about">
      <div className="section-head">
        <p>The human behind the terminal</p>
        <h2>About me</h2>
      </div>
      <div className="about-grid">
        <PegBoard />
        <div className="bio">
          <RevealText text="I’m a Computer Science student and product-minded developer working from interface to infrastructure. I turn real-world problems into dependable web products—then containerise and ship them." />
          <RevealText text="I learn by building in public, joining hackathons, and following each idea all the way from a rough screen to a running service." />
        </div>
      </div>
      <div className="education">
        <h3>Education</h3>
        {education.map((item) => (
          <div className="edu-row" key={item.id}>
            <span>{item.role}</span>
            <h4>{item.org}</h4>
            <p>{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="personal">
        <span>Berhampur, India</span>
        <span>{profile.coords.join(' · ')}</span>
        <span>CSE ’29</span>
        <span>Available for good ideas</span>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact">
      <MacLaptop />
    </footer>
  )
}

export default function App() {
  useLenis()
  return (
    <>
      <Preloader />
      <a className="skip-link" href="#works">
        Skip to work
      </a>
      <SiteMenu />
      <main>
        <Hero />
        <Works />
        <Certified />
        <SkillsLid />
        <AskEmo />
        <About />
      </main>
      <Footer />
    </>
  )
}
