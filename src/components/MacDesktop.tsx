import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { profile } from '../lib/site'
import { useClock } from '../hooks/useClock'
import wallpaper from '../assets/macos-wallpaper.png'
import '../mac-desktop.css'

/**
 * The MacBook's screen. Every icon in the Dock is a REAL link — mail, phone,
 * socials — so a click takes you straight to the real thing. No fake windows,
 * no fake browser: the desktop stays clean, the contacts are one tap away.
 */

const CALL = `tel:${profile.phoneHref}`
const MAIL = `mailto:${profile.email}?subject=${encodeURIComponent('Hey Sambit — saw the laptop')}`
const HIRE = `mailto:${profile.email}?subject=${encodeURIComponent('Let’s work together')}`

/* ————————————————————————————————————————————————————————————————
   Glyphs — 24×24, single path, drawn white on the app's gradient.
   ———————————————————————————————————————————————————————————————— */
const P = {
  apple: 'M17.05 12.54c-.03-2.2 1.78-3.26 1.86-3.31-1.01-1.49-2.59-1.7-3.15-1.72-1.35-.14-2.63.79-3.31.79-.68 0-1.73-.77-2.85-.75-1.47.02-2.82.85-3.57 2.16-1.53 2.65-.39 6.57 1.1 8.72.72 1.05 1.59 2.22 2.73 2.18 1.1-.04 1.51-.71 2.84-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.92-1.07 2.65-2.12.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.36-3.47zM14.9 5.9c.6-.73 1.01-1.75.9-2.76-.87.04-1.93.58-2.55 1.31-.56.65-1.05 1.68-.92 2.68.97.08 1.97-.5 2.57-1.23z',
  mail: 'M3 6.6A2.6 2.6 0 015.6 4h12.8A2.6 2.6 0 0121 6.6v.3l-9 5.6-9-5.6v-.3zm0 2.6V17.4A2.6 2.6 0 005.6 20h12.8A2.6 2.6 0 0021 17.4V9.2l-8.44 5.25a1.5 1.5 0 01-1.52 0L3 9.2z',
  phone: 'M6.7 10.9a15.5 15.5 0 006.4 6.4l2.1-2.1c.28-.28.7-.37 1.07-.24 1.13.37 2.35.57 3.6.57.57 0 1.03.46 1.03 1.03V20c0 .57-.46 1.03-1.03 1.03C10.4 21.03 2.97 13.6 2.97 4.13 2.97 3.56 3.43 3.1 4 3.1h3.5c.57 0 1.03.46 1.03 1.03 0 1.25.2 2.47.57 3.6.13.37.04.79-.24 1.07L6.7 10.9z',
  user: 'M12 12.3a4.4 4.4 0 100-8.8 4.4 4.4 0 000 8.8zm0 1.9c-4.35 0-7.9 2.3-7.9 5.13V21h15.8v-1.67c0-2.83-3.55-5.13-7.9-5.13z',
  github: 'M12 .3a12 12 0 00-3.8 23.4c.6.1.82-.26.82-.58l-.01-2.05c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.6-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.9 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.82.58A12 12 0 0012 .3z',
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.63-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.13 2.07 2.07 0 010 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  x: 'M14.23 10.16L22.98 0h-2.07l-7.6 8.82L7.25 0H.26l9.17 13.34L.26 24h2.07l8.02-9.32L16.75 24h6.99l-9.51-13.84zm-2.84 3.3l-.93-1.33L3.08 1.56h3.18l5.97 8.53.93 1.33 7.75 11.09h-3.18l-6.34-9.05z',
  discord: 'M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.44.87-.6 1.25a18.3 18.3 0 00-5.5 0c-.16-.39-.4-.87-.62-1.25a.08.08 0 00-.08-.04c-1.7.3-3.35.8-4.88 1.52a.07.07 0 00-.04.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 00.03.05 19.9 19.9 0 006 3.03.08.08 0 00.08-.03c.46-.63.88-1.3 1.23-1.99a.08.08 0 00-.05-.11c-.65-.25-1.27-.55-1.87-.9a.08.08 0 01-.01-.12l.37-.3a.07.07 0 01.08-.01 14.2 14.2 0 0012.06 0 .07.07 0 01.08.01l.37.3a.08.08 0 01-.01.12c-.6.35-1.22.65-1.87.9a.08.08 0 00-.04.11c.36.7.78 1.36 1.22 1.99a.08.08 0 00.09.03 19.8 19.8 0 006-3.03.08.08 0 00.03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 00-.03-.03zM8.02 15.33c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.22 0 2.18 1.1 2.16 2.42 0 1.33-.94 2.42-2.16 2.42z',
  hashnode: 'M22.35 8.02l-6.37-6.37a5.63 5.63 0 00-7.96 0L1.65 8.02a5.63 5.63 0 000 7.96l6.37 6.37a5.63 5.63 0 007.96 0l6.37-6.37a5.63 5.63 0 000-7.96zM12 15.95a3.95 3.95 0 110-7.9 3.95 3.95 0 010 7.9z',
  bulb: 'M12 2.2A6.8 6.8 0 005.2 9c0 2.5 1.35 4.4 2.5 5.9.6.8 1.1 1.5 1.3 2.5h6c.2-1 .7-1.7 1.3-2.5 1.15-1.5 2.5-3.4 2.5-5.9A6.8 6.8 0 0012 2.2zm-2.7 17c0 .7.3 1.4.8 1.9l.4.5c.4.5 1 .8 1.5.8s1.1-.3 1.5-.8l.4-.5c.5-.5.8-1.2.8-1.9H9.3z',
} as const

type GlyphName = keyof typeof P

function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={P[name]} />
    </svg>
  )
}

/* ————————————————————————————————————————————————————————————————
   The Dock — every app opens the real thing. No windows, no fakes.
   ———————————————————————————————————————————————————————————————— */
type AppDef = {
  id: string
  name: string
  tip: string
  href: string
  from: string
  to: string
  glyph: GlyphName
  external?: boolean
}

const PERSONAL: AppDef[] = [
  { id: 'mail', name: 'Email', tip: profile.email, href: MAIL, from: '#7fd8ff', to: '#0b74e8', glyph: 'mail' },
  { id: 'phone', name: 'Phone', tip: profile.phone, href: CALL, from: '#b6f2c0', to: '#1e9b56', glyph: 'phone' },
  { id: 'hire', name: 'Hire me', tip: 'Open a brief', href: HIRE, from: '#d8ffb0', to: '#3fbf72', glyph: 'bulb' },
]

const SOCIAL: AppDef[] = [
  { id: 'github', name: 'GitHub', tip: '@ssambit635-svg', href: profile.github, from: '#3a3f47', to: '#0d0f12', glyph: 'github', external: true },
  { id: 'linkedin', name: 'LinkedIn', tip: 'Connect with me', href: profile.linkedin, from: '#2e9cf5', to: '#0a5cae', glyph: 'linkedin', external: true },
  { id: 'x', name: 'X', tip: '@swainsambit7i', href: profile.x, from: '#5c626b', to: '#07080a', glyph: 'x', external: true },
  { id: 'discord', name: 'Discord', tip: 'Message me', href: profile.discord, from: '#7c86ff', to: '#4650d8', glyph: 'discord', external: true },
  { id: 'hashnode', name: 'Hashnode', tip: 'Read the blog', href: profile.hashnode, from: '#5b8dff', to: '#1442c8', glyph: 'hashnode', external: true },
  { id: 'avely', name: 'Avely', tip: 'My profile', href: profile.avely, from: '#9b8cff', to: '#5a46d6', glyph: 'user', external: true },
]

const css = (vars: Record<string, string | number>) => vars as CSSProperties

/* ————————————————————————————————————————————————————————————————
   Menu-bar status glyphs
   ———————————————————————————————————————————————————————————————— */
function Wifi() {
  return (
    <svg viewBox="0 0 18 14" aria-hidden="true" className="ms-svg">
      <path d="M9 12.6l1.5-1.9a2.3 2.3 0 00-3 0L9 12.6z" fill="currentColor" />
      <path d="M9 8.6c1 0 1.9.35 2.6 1l1.3-1.6a6.6 6.6 0 00-7.8 0l1.3 1.6c.7-.65 1.6-1 2.6-1z" fill="currentColor" />
      <path d="M9 4.9c1.9 0 3.6.65 5 1.75l1.25-1.55a10 10 0 00-12.5 0L4 6.65A8 8 0 019 4.9z" fill="currentColor" />
    </svg>
  )
}

function Battery() {
  return (
    <span className="ms-batt" aria-hidden="true">
      <i /><b />
    </span>
  )
}

function CC() {
  return (
    <svg viewBox="0 0 20 14" aria-hidden="true" className="ms-svg">
      <rect x=".6" y=".6" width="18.8" height="12.8" rx="3.6" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".9" />
      <rect x="2.6" y="2.6" width="6.2" height="8.8" rx="2.6" fill="currentColor" opacity=".9" />
      <circle cx="14.4" cy="7" r="1.5" fill="currentColor" opacity=".9" />
    </svg>
  )
}

function Search() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="ms-svg">
      <circle cx="6.6" cy="6.6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.1 10.1l3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DockLink({ app, onHighlight }: { app: AppDef; onHighlight: (app: AppDef | null) => void }) {
  return (
    <a
      className="ms-dapp"
      style={css({ '--from': app.from, '--to': app.to })}
      href={app.href}
      target={app.external ? '_blank' : undefined}
      rel={app.external ? 'noreferrer' : undefined}
      aria-label={`${app.name} — ${app.tip}`}
      onPointerEnter={() => onHighlight(app)}
      onPointerLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(app)}
      onBlur={() => onHighlight(null)}
    >
      <span className="ms-tip"><b>{app.name}</b><i>{app.tip}</i></span>
      <span className="ms-dico"><Glyph name={app.glyph} /></span>
      <span className="ms-dlabel">{app.name}</span>
    </a>
  )
}

/* ————————————————————————————————————————————————————————————————
   The desktop
   ———————————————————————————————————————————————————————————————— */
export default function MacDesktop() {
  const clock = useClock(profile.timezone)
  const [awake, setAwake] = useState(false)
  const [sleep, setSleep] = useState(false)
  const [apple, setApple] = useState(false)
  const [compact, setCompact] = useState(false)
  const [highlightedApp, setHighlightedApp] = useState<AppDef | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(max-width: 900px) and (orientation: portrait), (max-width: 640px)')
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setAwake(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setAwake(true)
          io.disconnect()
        }
      },
      { threshold: 0.22 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const doSleep = () => {
    setApple(false)
    setSleep(true)
    setTimeout(() => setSleep(false), 1800)
  }

  const stamp = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: profile.timezone }).format(new Date())

  return (
    <div className="ms-root" ref={root} data-awake={awake ? '1' : '0'}>
      <div className="ms-wall" aria-hidden="true">
        <img className="ms-wall-image" src={wallpaper} alt="" loading="lazy" decoding="async" />
        <i className="ms-wall-shade" />
        <i className="ms-wall-grain" />
      </div>

      <div className="ms-desk">
        {/* menu bar */}
        <div className="ms-menu">
          <div className="ms-menu-l">
            <button type="button" className="ms-menu-apple" onClick={() => setApple(!apple)} aria-expanded={apple} aria-label="Apple menu">
              <Glyph name="apple" />
            </button>
            <b className="ms-menu-app">{profile.name}</b>
            <a href="#works">Projects</a>
            <a href="#certified">Certified</a>
            <a href="#about">About</a>
            <a href={HIRE}>Talk</a>
          </div>
          <div className="ms-menu-r">
            {!compact && <a className="ms-menu-status" href={HIRE}><i />{profile.availability}</a>}
            <span className="ms-menu-ic ms-cc"><CC /></span>
            <span className="ms-menu-ic ms-wifi"><Wifi /></span>
            <span className="ms-menu-batt"><Battery /><b>96%</b></span>
            {compact && <span className="ms-menu-ic"><Search /></span>}
            <span className="ms-menu-clock">{!compact && `${stamp} `}{clock}</span>
          </div>

          {apple && (
            <div className="ms-apple-menu" role="menu">
              <a role="menuitem" href={MAIL} onClick={() => setApple(false)}>Email Sambit</a>
              <a role="menuitem" href={CALL} onClick={() => setApple(false)}>Call {profile.phone}</a>
              <i className="ms-apple-sep" />
              <a role="menuitem" href={profile.github} target="_blank" rel="noreferrer" onClick={() => setApple(false)}>GitHub ↗</a>
              <a role="menuitem" href={profile.linkedin} target="_blank" rel="noreferrer" onClick={() => setApple(false)}>LinkedIn ↗</a>
              <i className="ms-apple-sep" />
              <button type="button" role="menuitem" onClick={doSleep}>Sleep</button>
            </div>
          )}
        </div>

        {/* a live, direct contact headline on the wallpaper */}
        <div className="ms-greeting">
          <h2>Let’s talk<span aria-hidden="true">.</span></h2>
          <a href={HIRE}>Start a conversation <span aria-hidden="true">↗</span></a>
        </div>

        {/* the clock floats over the wallpaper — no widget card */}
        <div className="ms-widget" role="group" aria-label="Local time and availability">
          <time className="ms-widget-time">{clock}</time>
          <p className="ms-widget-date">{stamp}</p>
          <p className="ms-widget-meta"><i />{profile.availability}</p>
        </div>

        {/* every dock app opens a real contact channel or profile */}
        <div className="ms-dock" role="group" aria-label="Contact apps — each icon opens a real contact channel">
          <div className="ms-dock-inner">
            {PERSONAL.map((a) => <DockLink key={a.id} app={a} onHighlight={setHighlightedApp} />)}
            <i className="ms-dock-sep" aria-hidden="true" />
            {SOCIAL.map((a) => <DockLink key={a.id} app={a} onHighlight={setHighlightedApp} />)}
          </div>
          <p className="ms-dock-hint" aria-live="polite">
            {highlightedApp ? `${highlightedApp.name} · ${highlightedApp.tip}` : 'Choose an app to connect'}
          </p>
        </div>
      </div>

      <div className="ms-notch" aria-hidden="true" />
      <div className="ms-bezel" aria-hidden="true" />
      <div className="ms-sleep" data-on={sleep ? '1' : '0'} aria-hidden="true" />
      <div className="ms-power" data-on={awake ? '1' : '0'} aria-hidden="true" />
      <div className="ms-glass" aria-hidden="true" />
    </div>
  )
}
