import { useEffect, useMemo, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { setScrollLocked } from '../hooks/useLenis'
import { markReady } from '../lib/ready'
import { prefersReducedMotion } from '../lib/utils'
import { profile } from '../lib/site'
import Scramble from './fx/Scramble'

const PORTRAIT = `${import.meta.env.BASE_URL}portrait.png`

const MIN_MS = 2100 // the counter never finishes faster than this
const MAX_MS = 6500 // …and never blocks longer than this

/**
 * Curtis-style entry: a full-bleed ink panel with a 0→100 counter that tracks
 * real asset loading, then the same pixel-block dissolve used between sections
 * tears it away and hands the page over.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const shots = useMemo(() => [PORTRAIT], [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = prefersReducedMotion()

    // start every visit at the top, scroll locked behind the curtain
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!window.location.hash) window.scrollTo(0, 0)
    setScrollLocked(true)
    // Lenis is created by App (parent effect) a tick later — lock it again once it exists
    const relock = window.setTimeout(() => setScrollLocked(true), 60)

    // ── asset tracking ────────────────────────────────────────────────────
    const total = shots.length + 1 // + webfonts
    let counted = 0
    let assetsDone = false
    const bump = () => {
      counted++
      if (counted >= total) assetsDone = true
    }
    if (document.fonts?.ready) document.fonts.ready.then(bump, bump)
    else bump()
    shots.forEach((src) => {
      const img = new Image()
      img.onload = bump
      img.onerror = bump
      img.src = src
    })

    // ── counter ───────────────────────────────────────────────────────────
    const t0 = performance.now()
    let cur = 0
    let raf = 0
    let done = false

    const finish = () => {
      if (done) return
      done = true
      cancelAnimationFrame(raf)
      if (num.current) num.current.textContent = '100'
      if (fill.current) fill.current.style.transform = 'scaleX(1)'

      markReady()
      window.clearTimeout(relock)
      setScrollLocked(false)
      ScrollTrigger.refresh()

      const cells = el.querySelectorAll('.loader-block')
      const chrome = el.querySelectorAll('.loader-chrome')
      const counter = el.querySelector('.loader-counter')
      const tl = gsap.timeline({ onComplete: () => {
        onDone()
        if (window.location.hash) {
          // Restore section deep links after the entry animation / scroll pin setup.
          let id = window.location.hash.slice(1)
          try { id = decodeURIComponent(id) } catch { /* preserve malformed fragment */ }
          document.getElementById(id)?.scrollIntoView()
        }
      } })

      if (reduced) {
        tl.to(el, { opacity: 0, duration: 0.4 })
        return
      }
      tl.to(chrome, { opacity: 0, duration: 0.35, ease: 'none' })
        .to(counter, { yPercent: -34, opacity: 0, duration: 0.55, ease: 'power3.in' }, '<')
        .to(
          cells,
          { scale: 0, opacity: 0, duration: 0.5, ease: 'power2.inOut', stagger: { amount: 0.55, from: 'random' } },
          '-=0.2'
        )
    }

    const tick = (now: number) => {
      const elapsed = now - t0
      const time = Math.min(1, elapsed / (reduced ? 300 : MIN_MS))
      // hold at 94% until the real assets are in, then race to 100
      const target = Math.min(time, assetsDone ? 1 : 0.94)
      cur += (target * 100 - cur) * 0.13
      if (target >= 1 && cur > 99.2) cur = 100
      const v = Math.min(100, Math.max(0, Math.round(cur)))
      if (num.current) num.current.textContent = String(v).padStart(3, '0')
      if (fill.current) fill.current.style.transform = `scaleX(${v / 100})`
      if (cur >= 100 || elapsed > MAX_MS) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(relock)
      setScrollLocked(false)
    }
  }, [shots, onDone])

  // pixel grid covering the viewport
  const cell = 78
  const cols = Math.max(1, Math.ceil((typeof window === 'undefined' ? 1440 : window.innerWidth) / cell))
  const rows = Math.max(1, Math.ceil((typeof window === 'undefined' ? 900 : window.innerHeight) / cell))
  const blocks = cols * rows

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-ink text-cream"
      aria-hidden
    >
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {Array.from({ length: blocks }).map((_, i) => (
          <i key={i} className="loader-block block bg-ink" />
        ))}
      </div>

      {/* chrome */}
      <div className="loader-chrome pointer-events-none absolute inset-0 px-8 py-6 max-md:px-5">
        <div className="flex items-start justify-between">
          <p className="t-label text-mute">
            <Scramble text={profile.name} trigger="now" speed={34} color="#b48cff" />
          </p>
          <p className="t-label text-right text-mute">
            {profile.city}
            <br />
            {profile.coords[0]}
          </p>
        </div>

        <div className="absolute bottom-6 left-8 flex items-end justify-between w-[calc(100%-4rem)] max-md:left-5 max-md:w-[calc(100%-2.5rem)]">
          <p className="t-label text-mute">
            Decoding assets
            <span className="blink ml-2">▮</span>
          </p>
          <p className="t-label text-mute max-md:hidden">Portfolio / {profile.birthYear}</p>
        </div>
      </div>

      {/* counter */}
      <div className="loader-counter relative flex flex-col items-center">
        <div className="flex items-start">
          <span
            ref={num}
            className="t-display tabular-nums text-[clamp(96px,17vw,240px)] leading-[0.8] font-normal"
          >
            000
          </span>
          <span className="t-label mt-3 ml-2 text-lime">%</span>
        </div>
        <span className="mt-6 block h-[2px] w-[min(72vw,460px)] overflow-hidden bg-mute-2">
          <span ref={fill} className="block h-full origin-left scale-x-0 bg-lime" />
        </span>
        <p className="t-label mt-5 text-mute">
          <Scramble text={profile.role} trigger="now" delay={300} speed={40} />
        </p>
      </div>
    </div>
  )
}
