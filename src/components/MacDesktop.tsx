import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { credentials, profile, projects } from '../lib/site'
import { useClock } from '../hooks/useClock'
import '../mac-desktop.css'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`
const MAILTO = `mailto:${profile.email}`
const HIRE = `mailto:${profile.email}?subject=Let%27s%20work%20together`

/* ————————————————————————————————————————————————————————————————
   Glyphs — 24×24, single path, drawn white on the app's gradient.
   ———————————————————————————————————————————————————————————————— */
const P = {
  apple: 'M17.05 12.54c-.03-2.2 1.78-3.26 1.86-3.31-1.01-1.49-2.59-1.7-3.15-1.72-1.35-.14-2.63.79-3.31.79-.68 0-1.73-.77-2.85-.75-1.47.02-2.82.85-3.57 2.16-1.53 2.65-.39 6.57 1.1 8.72.72 1.05 1.59 2.22 2.73 2.18 1.1-.04 1.51-.71 2.84-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.92-1.07 2.65-2.12.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.36-3.47zM14.9 5.9c.6-.73 1.01-1.75.9-2.76-.87.04-1.93.58-2.55 1.31-.56.65-1.05 1.68-.92 2.68.97.08 1.97-.5 2.57-1.23z',
  mail: 'M3 6.6A2.6 2.6 0 015.6 4h12.8A2.6 2.6 0 0121 6.6v.3l-9 5.6-9-5.6v-.3zm0 2.6V17.4A2.6 2.6 0 005.6 20h12.8a2.6 2.6 0 002.6-2.6V9.2l-8.44 5.25a1.5 1.5 0 01-1.52 0L3 9.2z',
  phone: 'M6.7 10.9a15.5 15.5 0 006.4 6.4l2.1-2.1c.28-.28.7-.37 1.07-.24 1.13.37 2.35.57 3.6.57.57 0 1.03.46 1.03 1.03V20c0 .57-.46 1.03-1.03 1.03C10.4 21.03 2.97 13.6 2.97 4.13 2.97 3.56 3.43 3.1 4 3.1h3.5c.57 0 1.03.46 1.03 1.03 0 1.25.2 2.47.57 3.6.13.37.04.79-.24 1.07L6.7 10.9z',
  message: 'M12 3.6c-5.1 0-9.2 3.4-9.2 7.6 0 2.36 1.3 4.5 3.4 5.87-.15 1.1-.62 2.5-1.5 3.5 1.9-.28 3.5-1.1 4.62-1.86.84.17 1.75.27 2.68.27 5.1 0 9.2-3.4 9.2-7.78S17.1 3.6 12 3.6z',
  user: 'M12 12.3a4.4 4.4 0 100-8.8 4.4 4.4 0 000 8.8zm0 1.9c-4.35 0-7.9 2.3-7.9 5.13V21h15.8v-1.67c0-2.83-3.55-5.13-7.9-5.13z',
  github: 'M12 .3a12 12 0 00-3.8 23.4c.6.1.82-.26.82-.58l-.01-2.05c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.6-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.9 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.82.58A12 12 0 0012 .3z',
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.63-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.13 2.07 2.07 0 010 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  x: 'M14.23 10.16L22.98 0h-2.07l-7.6 8.82L7.25 0H.26l9.17 13.34L.26 24h2.07l8.02-9.32L16.75 24h6.99l-9.51-13.84zm-2.84 3.3l-.93-1.33L3.08 1.56h3.18l5.97 8.53.93 1.33 7.75 11.09h-3.18l-6.34-9.05z',
  discord: 'M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.44.87-.6 1.25a18.3 18.3 0 00-5.5 0c-.16-.39-.4-.87-.62-1.25a.08.08 0 00-.08-.04c-1.7.3-3.35.8-4.88 1.52a.07.07 0 00-.04.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 00.03.05 19.9 19.9 0 006 3.03.08.08 0 00.08-.03c.46-.63.88-1.3 1.23-1.99a.08.08 0 00-.05-.11c-.65-.25-1.27-.55-1.87-.9a.08.08 0 01-.01-.12l.37-.3a.07.07 0 01.08-.01 14.2 14.2 0 0012.06 0 .07.07 0 01.08.01l.37.3a.08.08 0 01-.01.12c-.6.35-1.22.65-1.87.9a.08.08 0 00-.04.11c.36.7.78 1.36 1.22 1.99a.08.08 0 00.09.03 19.8 19.8 0 006-3.03.08.08 0 00.03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 00-.03-.03zM8.02 15.33c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.22 0 2.18 1.1 2.16 2.42 0 1.33-.94 2.42-2.16 2.42z',
  hashnode: 'M22.35 8.02l-6.37-6.37a5.63 5.63 0 00-7.96 0L1.65 8.02a5.63 5.63 0 000 7.96l6.37 6.37a5.63 5.63 0 007.96 0l6.37-6.37a5.63 5.63 0 000-7.96zM12 15.95a3.95 3.95 0 110-7.9 3.95 3.95 0 010 7.9z',
  doc: 'M6 2.5h7.2L19 8.3V21a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 21V4a1.5 1.5 0 011.5-1.5zm7 1.9V9h4.6L13 4.4z',
  drive: 'M3.5 7.5A2.5 2.5 0 016 5h12a2.5 2.5 0 012.5 2.5V14a2.5 2.5 0 01-2.5 2.5H6A2.5 2.5 0 013.5 14V7.5zm3 6.6h6.2a.9.9 0 000-1.8H6.5a.9.9 0 000 1.8z',
  folder: 'M3.5 6.6A2.1 2.1 0 015.6 4.5h3.2c.56 0 1.09.22 1.48.62l1.03 1.03h7.1a2.1 2.1 0 012.1 2.1v8.15a2.1 2.1 0 01-2.1 2.1H5.6a2.1 2.1 0 01-2.1-2.1V6.6z',
  gear: 'M12 8.4a3.6 3.6 0 100 7.2 3.6 3.6 0 000-7.2zm9 3.6c0 .6-.06 1.18-.17 1.74l2.02 1.52-2 3.46-2.4-.9c-.87.7-1.86 1.25-2.95 1.6L15.2 22h-4l-.3-2.58a9.3 9.3 0 01-2.95-1.6l-2.4.9-2-3.46 2.02-1.52A9.2 9.2 0 015.4 12c0-.6.06-1.18.17-1.74L3.55 8.74l2-3.46 2.4.9c.87-.7 1.86-1.25 2.95-1.6L11.2 2h4l.3 2.58c1.09.35 2.08.9 2.95 1.6l2.4-.9 2 3.46-2.02 1.52c.11.56.17 1.14.17 1.74z',
  copy: 'M8.4 3h8.1a2.5 2.5 0 012.5 2.5v8.1a2.4 2.4 0 01-2.4 2.4H8.4A2.4 2.4 0 016 13.6V5.5A2.5 2.5 0 018.4 3zM4.5 7.5v9A3.6 3.6 0 008.1 20h9v-1.8h-9a1.8 1.8 0 01-1.8-1.8v-8.9H4.5z',
  bulb: 'M12 2.2A6.8 6.8 0 005.2 9c0 2.5 1.35 4.4 2.5 5.9.6.8 1.1 1.5 1.3 2.5h6c.2-1 .7-1.7 1.3-2.5 1.15-1.5 2.5-3.4 2.5-5.9A6.8 6.8 0 0012 2.2zm-2.7 17c0 .7.3 1.4.8 1.9l.4.5c.4.5 1 .8 1.5.8s1.1-.3 1.5-.8l.4-.5c.5-.5.8-1.2.8-1.9H9.3z',
  check: 'M9.6 16.2L5.4 12l-1.5 1.5 5.7 5.7L20.1 8.7 18.6 7.2 9.6 16.2z',
  lock: 'M12 2.5a4.5 4.5 0 00-4.5 4.5v2.2H6.8A1.8 1.8 0 005 11v8.2a1.8 1.8 0 001.8 1.8h10.4a1.8 1.8 0 001.8-1.8V11a1.8 1.8 0 00-1.8-1.8h-.7V7A4.5 4.5 0 0012 2.5zm-2.6 6.7V7a2.6 2.6 0 015.2 0v2.2H9.4z',
  back: 'M14.7 5.3L8 12l6.7 6.7 1.5-1.5L11 12l5.2-5.2-1.5-1.5z',
  fwd: 'M9.3 5.3L7.8 6.8 13 12l-5.2 5.2 1.5 1.5L16 12 9.3 5.3z',
  share: 'M12 2.5l4.2 4.2-1.5 1.5-1.7-1.7v7h-2v-7L9.3 8.2 7.8 6.7 12 2.5zM5.5 12v7.5a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5V12h-2v7h-9v-7h-2z',
  plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z',
  video: 'M4 6.5A2.5 2.5 0 016.5 4h7A2.5 2.5 0 0116 6.5v11a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 014 17.5v-11zM17.5 9.6l4-2.4v9.6l-4-2.4V9.6z',
  rocket: 'M14.4 2.6c2.8 0 5.4 1.4 6.9 3.6-1.3 6.4-5.4 11.2-10 13.6l-.6-3.2-3.2-.6C9.9 11.4 12.6 4.5 14.4 2.6zM4.2 17.4c1-1 2.4-1.3 3.4-.6.9.6 1.2 1.9.7 3-.4.9-1.6 1.7-3.2 2 .7-1 .6-2.3-.9-4.4z',
  grid: 'M4 4h6.2v6.2H4V4zm9.8 0H20v6.2h-6.2V4zM4 13.8h6.2V20H4v-6.2zm9.8 0H20V20h-6.2v-6.2z',
  trash: 'M9.5 3.5h5a1 1 0 011 1v1.2h4v2h-1.4l-.9 12.1a2 2 0 01-2 1.9H8.8a2 2 0 01-2-1.9L5.9 7.7H4.5v-2h4V4.5a1 1 0 011-1zm.5 3.2v11.6h1.4V6.7H10zm2.6 0v11.6H14V6.7h-1.4z',
} as const

type GlyphName = keyof typeof P

function Glyph({ name, size }: { name: GlyphName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={size ? { width: size, height: size } : undefined}>
      <path d={P[name]} />
    </svg>
  )
}

/* ————————————————————————————————————————————————————————————————
   The apps. Every one of them is a way to reach Sambit.
   ———————————————————————————————————————————————————————————————— */
type Kind = 'finder' | 'launchpad' | 'mail' | 'contacts' | 'web' | 'chat'

type AppDef = {
  id: string
  name: string
  tip: string
  kind: Kind
  from: string
  to: string
  glyph?: GlyphName
  art?: 'finder' | 'launchpad' | 'safari'
  href?: string
  /** window copy */
  win?: {
    title?: string
    url?: string
    brand?: string
    theme?: 'light' | 'dark'
    headline?: string
    sub?: string
    stats?: [string, string][]
    rows?: { head: string; meta: string }[]
    cta?: string
    draft?: { to: string; subject: string; body: string[] }
    thread?: { who: string; at: string; text: string }[]
    channel?: string
  }
}

const APPS: AppDef[] = [
  {
    id: 'finder', name: 'Finder', tip: 'All the ways in', kind: 'finder', from: '#fbfdff', to: '#bcd7f7', art: 'finder',
    win: { title: 'Sambit — Contacts' },
  },
  { id: 'launchpad', name: 'Launchpad', tip: 'Every app at once', kind: 'launchpad', from: '#8f9cff', to: '#3632c9', art: 'launchpad' },
  {
    id: 'mail', name: 'Email', tip: 'ssambit635@gmail.com', kind: 'mail', from: '#7fd8ff', to: '#0b74e8', glyph: 'mail',
    win: {
      title: 'New Message',
      draft: {
        to: profile.email,
        subject: 'Let’s make something that runs',
        body: [
          'Hi Sambit —',
          '',
          'I saw the laptop. I’d like to talk about a project.',
          '',
          '— sent from your Mac',
        ],
      },
    },
  },
  {
    id: 'phone', name: 'Contacts', tip: profile.phone, kind: 'contacts', from: '#b6f2c0', to: '#1e9b56', glyph: 'user',
    win: { title: 'Sambit Swain' },
  },
  {
    id: 'hire', name: 'Hire me', tip: 'Open a brief', kind: 'mail', from: '#d8ffb0', to: '#3fbf72', glyph: 'bulb',
    win: {
      title: 'New Message — Brief',
      draft: {
        to: profile.email,
        subject: 'Let’s work together',
        body: ['Hi Sambit —', '', 'Role: ', 'Timeline: ', 'What we’re building: ', '', 'Looking forward to it.'],
      },
    },
  },
  {
    id: 'github', name: 'GitHub', tip: '@ssambit635-svg', kind: 'web', from: '#3a3f47', to: '#0d0f12', glyph: 'github', href: profile.github,
    win: {
      title: 'GitHub — Sambit Swain', url: 'github.com/ssambit635-svg', brand: 'GitHub', theme: 'dark', cta: 'Follow on GitHub',
      headline: 'Full-stack & cloud', sub: '@ssambit635-svg · Berhampur, India',
      stats: [[String(projects.length), 'Projects'], [String(credentials.length), 'Certifications'], ['3+', 'Years building']],
      rows: projects.slice(0, 3).map((p) => ({ head: p.title, meta: `${p.stack.slice(0, 3).join(' · ')} — ${p.description}` })),
    },
  },
  {
    id: 'linkedin', name: 'LinkedIn', tip: 'Connect', kind: 'web', from: '#2e9cf5', to: '#0a5cae', glyph: 'linkedin', href: profile.linkedin,
    win: {
      title: 'LinkedIn — Sambit Swain', url: 'linkedin.com/in/sambit-swain', brand: 'LinkedIn', theme: 'light', cta: 'Connect on LinkedIn',
      headline: 'Sambit Swain', sub: 'Full-stack & cloud · CSE ’29 at NIST University',
      stats: [['500+', 'Connections'], ['8', 'Projects'], ['7', 'Certifications']],
      rows: [
        { head: 'NIST University', meta: 'B.Tech, Computer Science & Engineering · 2025 — 2029' },
        { head: 'Full-stack & cloud', meta: 'React · TypeScript · Node · FastAPI · Docker · AWS' },
        { head: 'Berhampur, Odisha, India', meta: `${profile.coords.join(' · ')} — open to internships` },
      ],
    },
  },
  {
    id: 'x', name: 'X', tip: '@swainsambit7i', kind: 'web', from: '#5c626b', to: '#07080a', glyph: 'x', href: profile.x,
    win: {
      title: 'X — @swainsambit7i', url: 'x.com/swainsambit7i', brand: 'X', theme: 'dark', cta: 'Follow on X',
      headline: 'Sambit Swain', sub: '@swainsambit7i', stats: [['8', 'Projects'], ['7', 'Certs'], ['2025', 'Joined']],
      rows: [
        { head: 'Building in public', meta: 'Shipping small things weekly — full-stack, mostly dark UIs.' },
        { head: 'Hackathon season', meta: 'Annadata Connect, CivicReport, Shadow Quest — Tech Zypher 2026.' },
        { head: 'Say hi', meta: 'DMs open for projects, collabs and strange ideas.' },
      ],
    },
  },
  {
    id: 'discord', name: 'Discord', tip: 'Message me', kind: 'chat', from: '#7c86ff', to: '#4650d8', glyph: 'discord', href: profile.discord,
    win: {
      title: 'Discord — sambit', channel: 'say-hi', cta: 'Open Discord',
      thread: [
        { who: 'Sambit', at: 'Today at 10:24', text: 'Hey — you found the laptop. Nice.' },
        { who: 'Sambit', at: 'Today at 10:24', text: 'Every app in the Dock opens something that actually works. Try the email one.' },
        { who: 'you', at: 'Today at 10:26', text: '…' },
      ],
    },
  },
  {
    id: 'hashnode', name: 'Hashnode', tip: 'Read the blog', kind: 'web', from: '#5b8dff', to: '#1442c8', glyph: 'hashnode', href: profile.hashnode,
    win: {
      title: 'Hashnode — @ssambit', url: 'hashnode.com/@ssambit', brand: 'Hashnode', theme: 'dark', cta: 'Read on Hashnode',
      headline: 'Writing it down', sub: '@ssambit · notes from building',
      stats: [['3', 'Drafts'], ['1', 'Series'], ['∞', 'Tabs open']],
      rows: [
        { head: 'Shipping a full-stack app from a hackathon brief', meta: 'What survives contact with a real operator.' },
        { head: 'Docker, but the smallest possible', meta: 'Multi-stage builds for a Node + Vite stack.' },
        { head: 'Cloud notes', meta: 'Certificates, and what they actually changed.' },
      ],
    },
  },
  {
    id: 'avely', name: 'Avely', tip: 'My profile', kind: 'web', from: '#9b8cff', to: '#5a46d6', glyph: 'user', href: profile.avely,
    win: {
      title: 'Avely — Sambit', url: 'avely.me/sambit', brand: 'Avely', theme: 'dark', cta: 'Open profile',
      headline: 'Sambit Swain', sub: 'Developer profile — Berhampur, India',
      stats: [['CSE ’29', 'NIST'], ['8', 'Projects'], ['7', 'Certs']],
      rows: [
        { head: 'Available now', meta: 'Internships, freelance builds, and hackathon teams.' },
        { head: 'What I’m good at', meta: 'React · TypeScript · Node · FastAPI · Docker · AWS' },
        { head: 'How I work', meta: 'From a rough screen to a running service.' },
      ],
    },
  },
]

const DOCK_SYSTEM = { id: 'trash', name: 'Bin', tip: 'Nothing to bin — say hi instead', kind: 'finder' as Kind, from: '#e9f4ff', to: '#a9c4e0', glyph: 'trash' as GlyphName }

/** Not in the dock — it only exists behind the  menu. */
const SYSTEM_APP: AppDef = {
  id: 'system',
  name: 'About This Mac',
  tip: 'This machine',
  kind: 'finder',
  from: '#eef4ff',
  to: '#9bbdf0',
  glyph: 'apple',
  win: { title: 'About This Mac' },
}

const CONTACT_APPS = APPS.filter((a) => a.kind !== 'finder' && a.kind !== 'launchpad')

const appById = (id: string) =>
  APPS.find((a) => a.id === id) ?? (id === 'system' ? SYSTEM_APP : id === 'trash' ? (DOCK_SYSTEM as unknown as AppDef) : APPS[0])

/* window geometry, in % of the desktop */
const GEOM: Record<string, { w: number; h: number }> = {
  finder: { w: 62, h: 62 },
  mail: { w: 54, h: 58 },
  phone: { w: 58, h: 62 },
  hire: { w: 54, h: 58 },
  discord: { w: 60, h: 60 },
  launchpad: { w: 60, h: 60 },
  system: { w: 46, h: 46 },
}

type Win = { id: string; app: string; x: number; y: number; z: number; min: boolean; max: boolean }

/* ————————————————————————————————————————————————————————————————
   Icon art — the bits of macOS that need shapes, not glyphs.
   ———————————————————————————————————————————————————————————————— */
function IconArt({ app }: { app: AppDef }) {
  if (app.art === 'finder') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="ms-art">
        <path d="M12 1.6h4.1a6.3 6.3 0 016.3 6.3v8.2a6.3 6.3 0 01-6.3 6.3H12V1.6z" fill="url(#fdrB)" />
        <path d="M12 1.6H7.9A6.3 6.3 0 001.6 7.9v8.2a6.3 6.3 0 006.3 6.3H12V1.6z" fill="url(#fdrA)" />
        <path d="M9.1 7.7h.02M14.9 7.7h.02" stroke="#1b2c49" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M8.2 15.1c1 .9 2.4 1.4 3.8 1.4s2.8-.5 3.8-1.4" stroke="#1b2c49" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <defs>
          <linearGradient id="fdrA" x1="6" y1="2" x2="11" y2="22"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#dce9fb" /></linearGradient>
          <linearGradient id="fdrB" x1="13" y1="2" x2="19" y2="22"><stop stopColor="#83baf7" /><stop offset="1" stopColor="#2a76df" /></linearGradient>
        </defs>
      </svg>
    )
  }
  if (app.art === 'launchpad') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="ms-art ms-art-lp">
        <g fill="#fff">
          <circle cx="8" cy="8" r="2" /><circle cx="12" cy="8" r="2" /><circle cx="16" cy="8" r="2" />
          <circle cx="8" cy="12" r="2" /><circle cx="12" cy="12" r="2" opacity=".62" /><circle cx="16" cy="12" r="2" />
          <circle cx="8" cy="16" r="2" opacity=".62" /><circle cx="12" cy="16" r="2" /><circle cx="16" cy="16" r="2" opacity=".62" />
        </g>
      </svg>
    )
  }
  if (app.art === 'safari') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="ms-art">
        <circle cx="12" cy="12" r="9.4" fill="#f7fbff" />
        <circle cx="12" cy="12" r="8.1" fill="none" stroke="#d3e4f7" strokeWidth=".9" />
        <path d="M16.4 7.6l-6 2.6-2.6 6 6-2.6 2.6-6z" fill="#e8443c" />
        <path d="M16.4 7.6l-3 5.2-2.8.8 2.6-6 3.2-1z" fill="#fff" opacity=".92" />
      </svg>
    )
  }
  return <Glyph name={app.glyph ?? 'doc'} />
}

/* ————————————————————————————————————————————————————————————————
   Small helpers
   ———————————————————————————————————————————————————————————————— */
const css = (vars: Record<string, string | number>) => vars as CSSProperties

function useMedia(query: string) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const sync = () => setOn(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])
  return on
}

function useCopy() {
  const [copied, setCopied] = useState('')
  const copy = useCallback((value: string, key: string) => {
    const flash = () => {
      setCopied(key)
      setTimeout(() => setCopied(''), 1600)
    }
    const write = typeof navigator !== 'undefined' ? navigator.clipboard?.writeText(value) : undefined
    if (write) write.then(flash).catch(flash)
    else flash()
  }, [])
  return { copied, copy }
}

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

function Traffic({ onClose, onMin, onMax }: { onClose: () => void; onMin: () => void; onMax: () => void }) {
  return (
    <div className="ms-lights" onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="ms-l ms-l-close" onClick={onClose} aria-label="Close window">
        <svg viewBox="0 0 8 8" aria-hidden="true"><path d="M2 2l4 4M6 2l-4 4" /></svg>
      </button>
      <button type="button" className="ms-l ms-l-min" onClick={onMin} aria-label="Minimise window">
        <svg viewBox="0 0 8 8" aria-hidden="true"><path d="M1.6 4h4.8" /></svg>
      </button>
      <button type="button" className="ms-l ms-l-max" onClick={onMax} aria-label="Zoom window">
        <svg viewBox="0 0 8 8" aria-hidden="true"><path d="M4 1.6v4.8M1.6 4h4.8" /></svg>
      </button>
    </div>
  )
}

/* ————————————————————————————————————————————————————————————————
   Window bodies
   ———————————————————————————————————————————————————————————————— */
type BodyProps = { app: AppDef; onOpen: (id: string) => void; compact: boolean }

function FinderBody({ onOpen }: BodyProps) {
  const [sel, setSel] = useState('Applications')
  const side = ['AirDrop', 'Recents', 'Applications', 'Desktop', 'Documents', 'Downloads']
  const cloud = ['iCloud Drive', 'Shared', 'Sambit — Contacts']
  const tags: [string, string][] = [['Projects', '#7ea8ff'], ['Cloud', '#7ce8b3'], ['Contact', '#ffd479']]
  return (
    <div className="ms-finder">
      <aside className="ms-side">
        <div className="ms-side-search"><Search /> <span>Search</span></div>
        <p className="ms-side-h">Favourites</p>
        <ul className="ms-side-list">
          {side.map((s) => (
            <li key={s}>
              <button type="button" className={sel === s ? 'is-sel' : ''} onClick={() => { setSel(s); if (s === 'Applications' || s === 'Desktop') onOpen('launchpad') }}>
                <Glyph name={s === 'Applications' ? 'grid' : s === 'Downloads' ? 'back' : 'folder'} />
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="ms-side-h">iCloud</p>
        <ul className="ms-side-list">
          {cloud.map((s) => (
            <li key={s}>
              <button type="button" className={sel === s ? 'is-sel' : ''} onClick={() => setSel(s)}>
                <Glyph name="folder" />
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="ms-side-h">Tags</p>
        <ul className="ms-side-list ms-tags">
          {tags.map(([t, c]) => (
            <li key={t}>
              <button type="button" onClick={() => setSel(t)}><i style={{ background: c }} /><span>{t}</span></button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="ms-finder-main">
        <div className="ms-finder-bar">
          <span className="ms-chip">{CONTACT_APPS.length + 1} ways in</span>
          <span className="ms-finder-title">Sambit — Contacts</span>
          <span className="ms-finder-bar-r"><Glyph name="grid" /><Glyph name="doc" /></span>
        </div>
        <ul className="ms-grid" data-lenis-prevent-wheel>
          {CONTACT_APPS.map((a) => (
            <li key={a.id}>
              <button type="button" className="ms-file" onClick={() => onOpen(a.id)}>
                <span className="ms-file-ico" style={css({ '--from': a.from, '--to': a.to })}><IconArt app={a} /></span>
                <span className="ms-file-name">{a.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="ms-finder-foot">
          <Glyph name="bulb" />
          Every item here opens a real, working app — email, chat, phone, profiles.
        </p>
      </div>
    </div>
  )
}

function MailBody({ app, compact }: BodyProps) {
  const { copied, copy } = useCopy()
  const draft = app.win?.draft ?? { to: profile.email, subject: 'Let’s make something that runs', body: ['Hi Sambit —'] }
  const [body, setBody] = useState(draft.body.join('\n'))
  return (
    <div className="ms-mail">
      <div className="ms-mail-tools">
        <a className="ms-btn ms-btn-primary" href={`mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(body)}`}>
          <Glyph name="share" /> Send
        </a>
        <span className="ms-btn"><Glyph name="doc" /></span>
        <span className="ms-btn"><Glyph name="copy" /></span>
        <span className="ms-mail-tools-r">From: <b>{profile.name}</b></span>
      </div>
      <div className="ms-mail-fields">
        <p><span>To:</span> <b className="ms-pill">{profile.name} · {draft.to}</b></p>
        <p><span>Cc:</span> <i className="ms-empty">—</i></p>
        <p><span>Subject:</span> <b>{draft.subject}</b></p>
      </div>
      <textarea
        className="ms-mail-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        spellCheck={false}
        aria-label="Message body"
      />
      <div className="ms-mail-foot">
        <span className="ms-mail-attach"><Glyph name="doc" /> Resume.pdf · 184 KB</span>
        <span className="ms-mail-actions">
          <button type="button" className="ms-btn" onClick={() => copy(draft.to, 'mail')}>
            <Glyph name={copied === 'mail' ? 'check' : 'copy'} /> {copied === 'mail' ? 'Copied' : 'Copy address'}
          </button>
          <a className="ms-btn ms-btn-primary" href={`mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}`}>
            <Glyph name="share" /> Open in Mail
          </a>
        </span>
      </div>
      {!compact && <p className="ms-hint">This window is live — write anything, then hit “Open in Mail”.</p>}
    </div>
  )
}

function ContactsBody({ onOpen }: BodyProps) {
  const { copied, copy } = useCopy()
  const rows: [GlyphName, string, string, string][] = [
    ['phone', 'mobile', profile.phone, `tel:${profile.phoneHref}`],
    ['mail', 'email', profile.email, MAILTO],
    ['github', 'url', 'github.com/ssambit635-svg', profile.github],
    ['linkedin', 'url', 'linkedin.com/in/sambit-swain', profile.linkedin],
    ['x', 'url', 'x.com/swainsambit7i', profile.x],
  ]
  return (
    <div className="ms-contacts">
      <aside className="ms-side ms-side-sm">
        <div className="ms-side-search"><Search /> <span>Search</span></div>
        <p className="ms-side-h">All Contacts</p>
        <ul className="ms-side-list">
          <li><button type="button" className="is-sel"><i className="ms-avatar ms-avatar-xs" style={css({ '--img': `url(${PORTRAIT})` })} /><span>Sambit Swain</span></button></li>
          <li><button type="button" onClick={() => onOpen('mail')}><i className="ms-avatar ms-avatar-xs ms-avatar-a" /><span>Say hello</span></button></li>
        </ul>
        <p className="ms-side-h">Groups</p>
        <ul className="ms-side-list">
          <li><button type="button" onClick={() => onOpen('hire')}><Glyph name="bulb" /><span>Available now</span></button></li>
          <li><button type="button" onClick={() => onOpen('github')}><Glyph name="grid" /><span>Work</span></button></li>
        </ul>
      </aside>
      <div className="ms-card" data-lenis-prevent-wheel>
        <div className="ms-card-top">
          <i className="ms-avatar ms-avatar-lg" style={css({ '--img': `url(${PORTRAIT})` })} role="img" aria-label={`${profile.name} portrait`} />
          <div>
            <h4>{profile.name}</h4>
            <p>{profile.role} · {profile.classTag} @ NIST</p>
            <p className="ms-card-sub">{profile.availability} · {profile.city}</p>
          </div>
          <span className="ms-card-actions">
            <a className="ms-round" href={`tel:${profile.phoneHref}`} aria-label={`Call ${profile.phone}`}><Glyph name="phone" /></a>
            <a className="ms-round" href={HIRE} aria-label="Message Sambit"><Glyph name="message" /></a>
            <a className="ms-round ms-round-video" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="Video call link"><Glyph name="video" /></a>
          </span>
        </div>
        <ul className="ms-card-rows">
          {rows.map(([g, label, value, href]) => (
            <li key={label}>
              <span className="ms-card-ic"><Glyph name={g} /></span>
              <span className="ms-card-label">{label}</span>
              <a className="ms-card-value" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{value}</a>
              <button type="button" className="ms-card-copy" onClick={() => copy(value, value)} aria-label={`Copy ${label}`}>
                <Glyph name={copied === value ? 'check' : 'copy'} />
              </button>
            </li>
          ))}
          <li>
            <span className="ms-card-ic"><Glyph name="bulb" /></span>
            <span className="ms-card-label">note</span>
            <span className="ms-card-value">{profile.availability} · {profile.coords.join(' · ')}</span>
          </li>
        </ul>
        <p className="ms-card-foot">Tap any row to open it — or copy it and paste it anywhere.</p>
      </div>
    </div>
  )
}

function WebBody({ app, compact }: BodyProps) {
  const { copied, copy } = useCopy()
  const w = app.win ?? {}
  const theme = w.theme ?? 'dark'
  return (
    <div className={`ms-web ms-web-${theme}`} style={css({ '--brand': app.to, '--brand2': app.from })}>
      <div className="ms-web-chrome">
        <span className="ms-nav"><Glyph name="back" /></span>
        <span className="ms-nav ms-nav-off"><Glyph name="fwd" /></span>
        <span className="ms-url"><Glyph name="lock" /> {w.url}</span>
        <button type="button" className="ms-nav" onClick={() => copy(`https://${w.url}`, 'url')} aria-label="Copy link">
          <Glyph name={copied === 'url' ? 'check' : 'share'} />
        </button>
      </div>
      <div className="ms-web-page" data-lenis-prevent-wheel>
        <header className="ms-web-head">
          <i className="ms-avatar ms-avatar-md" style={css({ '--img': `url(${PORTRAIT})` })} />
          <div className="ms-web-id">
            <h4>{w.headline}</h4>
            <p>{w.sub}</p>
          </div>
          <a className="ms-web-cta" href={app.href} target="_blank" rel="noreferrer">{w.cta}</a>
        </header>
        {w.stats && (
          <ul className="ms-web-stats">
            {w.stats.map(([n, l]) => (
              <li key={l}><b>{n}</b><span>{l}</span></li>
            ))}
          </ul>
        )}
        <ul className="ms-web-rows">
          {(w.rows ?? []).map((r) => (
            <li key={r.head}>
              <b>{r.head}</b>
              {!compact && <span>{r.meta}</span>}
            </li>
          ))}
        </ul>
        <footer className="ms-web-foot">
          <span className="ms-web-brand"><i />{w.brand}</span>
          <span className="ms-web-more">Rendered inside the laptop — the real page is one tap away.</span>
        </footer>
      </div>
    </div>
  )
}

function ChatBody({ app }: BodyProps) {
  const w = app.win ?? {}
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState<string[]>([])
  const { copied, copy } = useCopy()
  return (
    <div className="ms-chat">
      <aside className="ms-chat-rail" aria-hidden="true">
        <i className="ms-rail-ico ms-rail-home" />
        {CONTACT_APPS.slice(0, 5).map((a) => (
          <i key={a.id} className="ms-rail-ico" style={css({ '--from': a.from, '--to': a.to })} />
        ))}
      </aside>
      <div className="ms-chat-main">
        <header className="ms-chat-head">
          <Glyph name="discord" />
          <b>#{w.channel}</b>
          <span>{profile.availability}</span>
        </header>
        <ul className="ms-chat-log" aria-live="polite" data-lenis-prevent-wheel>
          {(w.thread ?? []).map((m, i) => (
            <li key={i} className={m.who === 'you' ? 'is-me' : ''}>
              <i className="ms-avatar ms-avatar-sm" style={css({ '--img': m.who === 'you' ? 'none' : `url(${PORTRAIT})` })} />
              <div>
                <p className="ms-chat-who"><b>{m.who}</b> <span>{m.at}</span></p>
                <p className="ms-chat-text">{m.text}</p>
              </div>
            </li>
          ))}
          {sent.map((t, i) => (
            <li key={`s${i}`} className="is-me">
              <i className="ms-avatar ms-avatar-sm" />
              <div>
                <p className="ms-chat-who"><b>you</b> <span>just now</span></p>
                <p className="ms-chat-text">{t}</p>
              </div>
            </li>
          ))}
        </ul>
        <form
          className="ms-chat-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            setSent((s) => [...s, draft.trim()])
            setDraft('')
          }}
        >
          <Glyph name="plus" />
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message #${w.channel}`} aria-label="Write a message" />
          <a className="ms-chat-cta" href={app.href} target="_blank" rel="noreferrer">{w.cta}</a>
        </form>
        <p className="ms-hint">Type something — then open Discord to actually send it.</p>
      </div>
      <aside className="ms-chat-people">
        <p className="ms-side-h">Online — 1</p>
        <span><i className="ms-dot" /> Sambit <b>you?</b></span>
        <span><i className="ms-dot ms-dot-off" /> Away</span>
        <button type="button" className="ms-btn ms-btn-block" onClick={() => copy(profile.discord, 'dc')}>
          <Glyph name={copied === 'dc' ? 'check' : 'copy'} /> {copied === 'dc' ? 'Copied' : 'Copy Discord link'}
        </button>
      </aside>
    </div>
  )
}

function AboutBody() {
  const specs: [string, string][] = [
    ['Chip', 'Apple M4 Pro'],
    ['Memory', '24 GB'],
    ['Storage', '1 TB SSD'],
    ['Display', 'Liquid Retina XDR'],
    ['OS', 'macOS 15 — Sambit’s build'],
    ['Owner', profile.name],
  ]
  return (
    <div className="ms-about">
      <div className="ms-about-top">
        <i className="ms-avatar ms-avatar-lg" style={css({ '--img': `url(${PORTRAIT})` })} />
        <div>
          <h4>MacBook Pro</h4>
          <p>14-inch, 2024</p>
        </div>
      </div>
      <ul className="ms-specs">
        {specs.map(([k, v]) => (
          <li key={k}><span>{k}</span><b>{v}</b></li>
        ))}
      </ul>
      <p className="ms-about-foot">This machine answers emails, ships products, and keeps {projects.length} projects in the air.</p>
    </div>
  )
}

/* ————————————————————————————————————————————————————————————————
   The desktop
   ———————————————————————————————————————————————————————————————— */
export default function MacDesktop() {
  const clock = useClock(profile.timezone)
  const [awake, setAwake] = useState(false)
  const [sleep, setSleep] = useState(false)
  const [booting, setBooting] = useState(false)
  const [launchpad, setLaunchpad] = useState(false)
  const [apple, setApple] = useState(false)
  const [wins, setWins] = useState<Win[]>([])
  const root = useRef<HTMLDivElement>(null)
  const opened = useRef(false)
  const compact = useMedia('(max-width: 900px) and (orientation: portrait), (max-width: 640px)')
  const compactRef = useRef(compact)
  compactRef.current = compact

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
      { threshold: 0.22 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const topZ = (list: Win[]) => list.reduce((m, w) => Math.max(m, w.z), 10)

  const openApp = useCallback((appId: string) => {
    setLaunchpad(false)
    setApple(false)
    if (appId === 'trash') return
    setWins((list) => {
      const z = topZ(list) + 1
      const already = list.find((w) => w.app === appId)
      if (already) return list.map((w) => (w.id === already.id ? { ...w, z, min: false } : w))
      if (compactRef.current) return [{ id: `${appId}-${z}`, app: appId, x: 3, y: 5, z, min: false, max: false }]
      const n = list.length
      const g = GEOM[appId] ?? { w: 60, h: 58 }
      return [
        ...list,
        { id: `${appId}-${z}`, app: appId, x: Math.min(16 + (n % 3) * 7, 96 - g.w), y: 5 + (n % 3) * 6, z, min: false, max: false },
      ]
    })
  }, [])

  const close = useCallback((id: string) => setWins((l) => l.filter((w) => w.id !== id)), [])
  const minimise = useCallback((id: string) => setWins((l) => l.map((w) => (w.id === id ? { ...w, min: true } : w))), [])
  const zoom = useCallback((id: string) => setWins((l) => l.map((w) => (w.id === id ? { ...w, max: !w.max } : w))), [])
  const front = useCallback((id: string) => setWins((l) => (l.find((w) => w.id === id)?.z === topZ(l) ? l : l.map((w) => (w.id === id ? { ...w, z: topZ(l) + 1, min: false } : w)))), [])

  const drag = useCallback((e: ReactPointerEvent<HTMLElement>, id: string) => {
    if (compactRef.current) return
    const bar = e.currentTarget
    const desk = bar.closest('.ms-wins') as HTMLElement | null
    const win = wins.find((w) => w.id === id)
    if (!desk || !win || win.max) return
    if ((e.target as HTMLElement).closest('.ms-lights')) return
    const rect = desk.getBoundingClientRect()
    const start = { px: e.clientX, py: e.clientY, x: win.x, y: win.y }
    const move = (ev: PointerEvent) => {
      const nx = start.x + ((ev.clientX - start.px) / rect.width) * 100
      const ny = start.y + ((ev.clientY - start.py) / rect.height) * 100
      setWins((l) => l.map((w) => (w.id === id ? { ...w, x: Math.max(-4, Math.min(nx, 96)), y: Math.max(-3, Math.min(ny, 92)) } : w)))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }, [wins])

  /* the welcome window opens itself once — the laptop is never empty */
  useEffect(() => {
    if (!awake || opened.current) return
    opened.current = true
    const t = setTimeout(() => openApp('finder'), 900)
    return () => clearTimeout(t)
  }, [awake, openApp])

  /* esc closes the front-most thing */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setApple(false)
      setLaunchpad(false)
      setWins((l) => {
        if (!l.length) return l
        const top = l.reduce((a, b) => (a.z > b.z ? a : b))
        return l.filter((w) => w.id !== top.id)
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const frontWin = wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0]
  const frontName = frontWin ? appById(frontWin.app).name : 'Finder'
  const stamp = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: profile.timezone }).format(new Date())

  const doSleep = () => {
    setApple(false)
    setSleep(true)
    setTimeout(() => setSleep(false), 1800)
  }

  const doRestart = () => {
    setApple(false)
    setBooting(true)
    setWins([])
    setTimeout(() => setBooting(false), 1500)
  }

  return (
    <div className="ms-root" ref={root} data-awake={awake ? '1' : '0'}>
      <div className="ms-wall" aria-hidden="true">
        <i className="ms-wall-blob ms-wall-a" />
        <i className="ms-wall-blob ms-wall-b" />
        <i className="ms-wall-blob ms-wall-c" />
        <i className="ms-wall-glow" />
        <i className="ms-wall-grain" />
      </div>

      <div className="ms-desk">
        {/* menu bar */}
        <div className="ms-menu">
          <div className="ms-menu-l">
            <button type="button" className="ms-menu-apple" onClick={() => setApple(!apple)} aria-expanded={apple} aria-label="Apple menu">
              <Glyph name="apple" />
            </button>
            <b className="ms-menu-app">{frontName}</b>
            <a href="#works">Projects</a>
            <a href="#certified">Certified</a>
            <a href="#about">About</a>
            <button type="button" onClick={() => openApp('mail')}>Talk</button>
            <button type="button" onClick={() => setLaunchpad(true)}>Apps</button>
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
              <button type="button" role="menuitem" onClick={() => { setApple(false); openApp('system') }}>About This Mac</button>
              <button type="button" role="menuitem" onClick={doSleep}>Sleep</button>
              <button type="button" role="menuitem" onClick={doRestart}>Restart…</button>
              <i className="ms-apple-sep" />
              <button type="button" role="menuitem" onClick={() => { setApple(false); setWins([]) }}>Close all windows</button>
              <a role="menuitem" href={profile.github} target="_blank" rel="noreferrer" onClick={() => setApple(false)}>GitHub ↗</a>
            </div>
          )}
        </div>

        {/* desktop icons */}
        <div className="ms-icons">
          <button type="button" className="ms-dicon" onClick={() => openApp('finder')}>
            <span className="ms-dicon-art"><Glyph name="drive" /></span>
            <span className="ms-dicon-label">Sambit’s MacBook Pro</span>
          </button>
          <button type="button" className="ms-dicon" onClick={() => openApp('phone')}>
            <span className="ms-dicon-art ms-dicon-card"><b>AA</b></span>
            <span className="ms-dicon-label">Contact Card.vcf</span>
          </button>
          <button type="button" className="ms-dicon" onClick={() => openApp('hire')}>
            <span className="ms-dicon-art ms-dicon-txt"><Glyph name="doc" /><b>TXT</b></span>
            <span className="ms-dicon-label">Hire me.txt</span>
          </button>
        </div>

        {/* windows */}
        <div className="ms-wins">
          {wins.map((w) => {
            const app = appById(w.app)
            const g = GEOM[w.app] ?? { w: 58, h: 56 }
            const isFront = frontWin?.id === w.id
            return (
              <section
                key={w.id}
                className={`ms-win ms-win-${app.kind}${w.max ? ' is-max' : ''}${w.min ? ' is-min' : ''}${isFront ? ' is-front' : ' is-back'}`}
                style={css({ left: `${w.x}%`, top: `${w.y}%`, ['--w' as string]: `${g.w}%`, ['--h' as string]: `${g.h}%`, zIndex: w.z })}
                onPointerDown={() => front(w.id)}
                role="dialog"
                aria-label={`${app.name} window`}
                aria-hidden={w.min || undefined}
              >
                <header className="ms-win-bar" onPointerDown={(e) => drag(e, w.id)} onDoubleClick={() => zoom(w.id)}>
                  <Traffic onClose={() => close(w.id)} onMin={() => minimise(w.id)} onMax={() => zoom(w.id)} />
                  <p className="ms-win-title">
                    {app.id === 'system'
                      ? 'About This Mac'
                      : app.kind === 'web'
                        ? app.win?.title
                        : app.kind === 'mail'
                          ? `Mail — ${app.win?.title}`
                          : app.kind === 'contacts'
                            ? `Contacts — ${app.name}`
                            : app.kind === 'chat'
                              ? `Discord — ${app.name}`
                              : 'Finder — Sambit'}
                  </p>
                  <div className="ms-win-tools">
                    {isFront && <span className="ms-live"><i /> live</span>}
                  </div>
                </header>
                <div className="ms-win-body">
                  {app.kind === 'finder' && <FinderBody app={app} onOpen={openApp} compact={compact} />}
                  {app.kind === 'mail' && <MailBody app={app} onOpen={openApp} compact={compact} />}
                  {app.kind === 'contacts' && <ContactsBody app={app} onOpen={openApp} compact={compact} />}
                  {app.kind === 'web' && <WebBody app={app} onOpen={openApp} compact={compact} />}
                  {app.kind === 'chat' && <ChatBody app={app} onOpen={openApp} compact={compact} />}
                  {app.id === 'system' && <AboutBody />}
                </div>
              </section>
            )
          })}
        </div>

        {/* dock */}
        <div className="ms-dock" role="group" aria-label="Contact apps">
          <div className="ms-dock-inner">
            {APPS.map((a) => {
              const open = wins.find((w) => w.app === a.id)
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`ms-dapp${open ? ' is-run' : ''}${open && open.min ? ' is-min' : ''}`}
                  style={css({ '--from': a.from, '--to': a.to })}
                  onClick={() => openApp(a.id)}
                  aria-label={`${a.name} — ${a.tip}`}
                >
                  <span className="ms-tip"><b>{a.name}</b><i>{a.tip}</i></span>
                  <span className="ms-dico"><IconArt app={a} /></span>
                  <span className="ms-dot-ind" />
                </button>
              )
            })}
            <i className="ms-dock-sep" />
            <button type="button" className="ms-dapp ms-dapp-bin" style={css({ '--from': DOCK_SYSTEM.from, '--to': DOCK_SYSTEM.to })} onClick={() => openApp('phone')} aria-label="Bin — nothing to bin, say hi">
              <span className="ms-tip"><b>Bin</b><i>Nothing to bin — say hi instead</i></span>
              <span className="ms-dico"><Glyph name="trash" /></span>
              <span className="ms-dot-ind" />
            </button>
          </div>
          <p className="ms-dock-hint">Every app is a way to reach Sambit</p>
        </div>
      </div>

      {launchpad && (
        <div className="ms-lp" role="dialog" aria-label="Launchpad — all contacts" data-lenis-prevent-wheel>
          <div className="ms-lp-search"><Search /><span>Search</span></div>
          <ul className="ms-lp-grid">
            {APPS.filter((a) => a.id !== 'launchpad').map((a) => (
              <li key={a.id}>
                <button type="button" className="ms-dapp ms-lp-app" style={css({ '--from': a.from, '--to': a.to })} onClick={() => openApp(a.id)}>
                  <span className="ms-dico"><IconArt app={a} /></span>
                  <span className="ms-lp-name">{a.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="ms-lp-foot">
            {CONTACT_APPS.length} windows into one person — tap anything.
            <button type="button" className="ms-lp-close" onClick={() => setLaunchpad(false)}>Close</button>
          </p>
        </div>
      )}

      <div className="ms-notch" aria-hidden="true" />
      <div className="ms-bezel" aria-hidden="true" />
      <div className="ms-sleep" data-on={sleep ? '1' : '0'} aria-hidden="true" />
      <div className="ms-power" data-on={awake && !booting ? '1' : '0'} aria-hidden="true" />
      <div className="ms-glass" aria-hidden="true" />
    </div>
  )
}
