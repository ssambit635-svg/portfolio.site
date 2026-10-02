import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { setScrollLocked } from '../hooks/useLenis'
import { markReady } from '../lib/ready'
import { prefersReducedMotion } from '../lib/utils'
import { profile, projects } from '../lib/site'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`
type Gate = 'pending' | 'ready' | 'fallback'

const shortName = (value: string) => value.toUpperCase().replaceAll(' ', ' / ')

/**
 * A site-specific signal tuner: it resolves the actual portrait and local type,
 * then folds the instrument panel into the portrait to hand over to the page.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const lens = useRef<HTMLDivElement>(null)
  const onDoneRef = useRef(onDone)
  const [portraitGate, setPortraitGate] = useState<Gate>('pending')
  const [typeGate, setTypeGate] = useState<Gate>('pending')
  const [sceneReady, setSceneReady] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [signalIndex, setSignalIndex] = useState(() => Math.floor(Math.random() * projects.length))
  onDoneRef.current = onDone

  useEffect(() => {
    if (prefersReducedMotion()) return
    const interval = window.setInterval(() => {
      setSignalIndex((index) => (index + 1) % projects.length)
    }, 720)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = prefersReducedMotion()
    let active = true
    let finished = false
    let imageResolved = false
    let fontsResolved = false
    let minimumElapsed = false
    let forceFinish = false
    let relockTimer = 0
    let minimumTimer = 0
    let deadlineTimer = 0
    let exitTimeline: gsap.core.Timeline | null = null

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!window.location.hash) window.scrollTo(0, 0)
    setScrollLocked(true)
    relockTimer = window.setTimeout(() => setScrollLocked(true), 60)

    const enterPage = () => {
      if (!active) return
      onDoneRef.current()
      if (window.location.hash) {
        let id = window.location.hash.slice(1)
        try { id = decodeURIComponent(id) } catch { /* keep malformed fragment */ }
        document.getElementById(id)?.scrollIntoView()
      }
    }

    const finish = () => {
      if (finished || !active) return
      finished = true
      setReleasing(true)
      markReady()
      window.clearTimeout(relockTimer)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(deadlineTimer)
      setScrollLocked(false)
      ScrollTrigger.refresh()

      if (reduced) {
        gsap.to(el, { opacity: 0, duration: 0.18, onComplete: enterPage })
        return
      }

      const rect = lens.current?.getBoundingClientRect()
      const x = rect ? ((rect.left + rect.width / 2) / window.innerWidth) * 100 : 72
      const y = rect ? ((rect.top + rect.height / 2) / window.innerHeight) * 100 : 48
      const origin = `circle(180% at ${x}% ${y}%)`
      const collapse = `circle(0% at ${x}% ${y}%)`
      gsap.set(el, { clipPath: origin })
      exitTimeline = gsap.timeline({ onComplete: enterPage })
      exitTimeline.to(el, { clipPath: collapse, duration: 1.05, ease: 'power4.inOut' })
    }

    const maybeFinish = () => {
      if (forceFinish || (imageResolved && fontsResolved && minimumElapsed)) finish()
    }

    const resolvePortrait = (status: Exclude<Gate, 'pending'>) => {
      if (imageResolved) return
      imageResolved = true
      if (active) setPortraitGate(status)
      maybeFinish()
    }

    const resolveType = (status: Exclude<Gate, 'pending'>) => {
      if (fontsResolved) return
      fontsResolved = true
      if (active) setTypeGate(status)
      maybeFinish()
    }

    const image = new Image()
    image.onload = () => resolvePortrait('ready')
    image.onerror = () => resolvePortrait('fallback')
    image.src = PORTRAIT
    if (image.complete) queueMicrotask(() => resolvePortrait(image.naturalWidth > 0 ? 'ready' : 'fallback'))

    if (document.fonts?.ready) document.fonts.ready.then(() => resolveType('ready'), () => resolveType('fallback'))
    else resolveType('fallback')

    minimumTimer = window.setTimeout(() => {
      minimumElapsed = true
      setSceneReady(true)
      maybeFinish()
    }, reduced ? 220 : 940)

    // Never trap visitors behind the intro if a browser stalls on a local asset.
    deadlineTimer = window.setTimeout(() => {
      forceFinish = true
      if (!imageResolved) resolvePortrait('fallback')
      if (!fontsResolved) resolveType('fallback')
      maybeFinish()
    }, reduced ? 1400 : 4200)

    return () => {
      active = false
      window.clearTimeout(relockTimer)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(deadlineTimer)
      image.onload = null
      image.onerror = null
      exitTimeline?.kill()
      setScrollLocked(false)
    }
  }, [])

  const currentProject = projects[signalIndex]
  const steps = [
    {
      code: '01',
      label: 'PORTRAIT',
      status: portraitGate === 'ready' ? 'LOCKED' : portraitGate === 'fallback' ? 'BUFFERED' : 'TUNING',
      state: portraitGate
    },
    {
      code: '02',
      label: 'TYPE LAYER',
      status: typeGate === 'ready' ? 'IN TUNE' : typeGate === 'fallback' ? 'SYSTEM' : 'RESOLVING',
      state: typeGate
    },
    {
      code: '03',
      label: 'PAGE FIELD',
      status: sceneReady ? 'COMPOSED' : 'MAPPING',
      state: sceneReady ? 'ready' : 'pending'
    }
  ]

  return (
    <div ref={root} className="site-loader" aria-hidden="true" data-releasing={releasing}>
      <div className="site-loader__grid" aria-hidden="true" />
      <div className="site-loader__glow site-loader__glow--one" aria-hidden="true" />
      <div className="site-loader__glow site-loader__glow--two" aria-hidden="true" />

      <header className="site-loader__topline">
        <div className="site-loader__brand">
          <span className="site-loader__sigil" aria-hidden="true"><i /><i /><i /></span>
          <span className="site-loader__brand-copy">
            <b>{profile.first} / {profile.last}</b>
            <small>PERSONAL SYSTEMS · FIELD 029</small>
          </span>
        </div>
        <div className="site-loader__coordinates">
          <span>LOCAL SIGNAL</span>
          <b>{profile.city}</b>
          <small>{profile.coords[0]} &nbsp; {profile.coords[1]}</small>
        </div>
      </header>

      <div className="site-loader__body">
        <section className="site-loader__identity">
          <p className="site-loader__eyebrow"><i aria-hidden="true" /> BUILDING A PERSONAL FIELD GUIDE <span> / 2026</span></p>
          <div className="site-loader__name" aria-label={profile.name}>
            <span>{profile.first}</span>
            <span>{profile.last}<i>.</i></span>
          </div>
          <div className="site-loader__role">
            <span>{profile.role}</span><i aria-hidden="true" /><span>{profile.classTag}</span>
          </div>
          <p className="site-loader__manifesto">Ideas enter as signals.<br /><em>Useful things</em> leave as software.</p>

          <div className="site-loader__project-signal">
            <span className="site-loader__signal-label"><i aria-hidden="true" /> PROJECT SIGNAL</span>
            <span className="site-loader__signal-title" key={currentProject.id}>
              {shortName(currentProject.title)} <small> / {currentProject.kind.toUpperCase()}</small>
            </span>
          </div>
        </section>

        <figure className="site-loader__lens" ref={lens}>
          <div className="site-loader__orbit site-loader__orbit--outer" aria-hidden="true" />
          <div className="site-loader__orbit site-loader__orbit--inner" aria-hidden="true" />
          <div className="site-loader__portrait-frame" data-portrait={portraitGate}>
            <img className="site-loader__portrait" src={PORTRAIT} alt="" />
            <div className="site-loader__portrait-wash" aria-hidden="true" />
            <div className="site-loader__scan" aria-hidden="true" />
            <svg className="site-loader__contours" viewBox="0 0 100 133" preserveAspectRatio="none" aria-hidden="true">
              <path d="M-10 30 C12 13 22 56 44 38 S77 14 110 31" />
              <path d="M-10 47 C12 30 22 73 44 55 S77 31 110 48" />
              <path d="M-10 64 C12 47 22 90 44 72 S77 48 110 65" />
              <path d="M-10 81 C12 64 22 107 44 89 S77 65 110 82" />
              <path d="M-10 98 C12 81 22 124 44 106 S77 82 110 99" />
              <circle cx="27" cy="45" r="1.2" /><circle cx="72" cy="64" r="1.2" />
            </svg>
            <div className="site-loader__frame-label"><span>FIG. 01</span><span>PORTRAIT / {portraitGate === 'ready' ? 'SYNCED' : 'INCOMING'}</span></div>
            {portraitGate === 'fallback' && <div className="site-loader__fallback">IMAGE BUFFERED<br />OPENING THE FIELD</div>}
          </div>
          <figcaption className="site-loader__lens-caption"><span>BERHAMPUR / INDIA</span><span>19°18′55.0″N</span></figcaption>
        </figure>
      </div>

      <footer className="site-loader__bottomline">
        <div className="site-loader__checklist" aria-label="Site startup checklist">
          {steps.map((step) => (
            <div className="site-loader__step" data-state={step.state} key={step.code}>
              <span className="site-loader__step-code">{step.code}</span>
              <span className="site-loader__step-copy"><b>{step.label}</b><small>{step.status}</small></span>
              <i className="site-loader__step-node" aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="site-loader__status">
          <span className="site-loader__status-pulse" aria-hidden="true" />
          <span className="site-loader__status-copy">
            <b>{releasing ? 'SIGNAL LOCKED / HANDOFF' : 'TUNING THE SIGNAL'}</b>
            <small>{releasing ? 'Folding the field into the page.' : 'Portrait · typography · one complete point of view.'}</small>
          </span>
          <span className="site-loader__status-mark" aria-hidden="true">SS<span>/</span>29</span>
        </div>
      </footer>
    </div>
  )
}
