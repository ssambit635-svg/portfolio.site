import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { setScrollLocked } from '../hooks/useLenis'
import { markReady } from '../lib/ready'
import { useSound } from '../hooks/useSound'
import { hasFinePointer, prefersReducedMotion } from '../lib/utils'
import { profile } from '../lib/site'
import VectorWordmark from './VectorWordmark'

/** The wordmark component is authored against a 1200x800 stage. */
const MARK_W = 1200
/** The atlas band sits in the middle of the authored height, so height is scaled against this. */
const MARK_BAND_H = 560
const MARK_MAX_SCALE = 1.25
const MARK_FONT_SIZE = 280
const MARK_FAMILY = "'Big Shoulders Display', 'Arial Narrow', sans-serif"

/** Remember that this session already watched the mark draw itself. */
const SEEN_KEY = 'ss:boot'
const seenThisSession = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}
const rememberSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* private mode — the intro simply replays on the next page load */
  }
}

/** The whole entry beat: one four-second sweep of the wordmark. */
const HOLD = 4
/** Where the mark starts leaving — every other beat lands on the 4s mark. */
const EXIT_AT = HOLD - 0.55
/** If the display face has not resolved by here, draw in whatever is available. */
const TYPE_DEADLINE = 2200

/**
 * The name never fills the authored box edge to edge, and the atlas pads the
 * glyphs by 12% on each side — so measure the real ink before deciding a scale.
 * Mirrors the component's own measurement, at the same font size it rasterises.
 */
function markInkWidth() {
  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) return MARK_W
  probe.font = `500 ${MARK_FONT_SIZE}px ${MARK_FAMILY}`
  try {
    if ('letterSpacing' in probe) {
      ;(probe as unknown as { letterSpacing: string }).letterSpacing = '-0.01em'
    }
  } catch {
    /* older engines simply keep the default spacing */
  }
  const pad = MARK_FONT_SIZE * 0.12
  return Math.min(MARK_W, Math.max(1, probe.measureText(profile.name).width + pad * 2))
}

const META = [
  { b: 'PLAYER 01', s: 'NIST UNIVERSITY' },
  { b: profile.city, s: profile.coords[0] }
] as const

/** A WebGL context is what the wordmark draws with — check before promising it. */
function webglAvailable() {
  if (typeof document === 'undefined') return false
  try {
    const probe = document.createElement('canvas')
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Entry sequence: the name is rasterised into a dotted atlas, drawn on the GPU
 * and swept by a three-handle rig that snaps to a drifting grid. The page opens
 * after one four-second pass — or sooner, via the skip control.
 *
 * Real gates still decide when the page may open (local fonts, a live WebGL
 * context, the hard four-second hold), and a stalled asset can never trap
 * anyone: a deadline falls back to system type and the page still opens on time.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const hud = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLDivElement>(null)
  const floor = useRef<HTMLElement>(null)
  const track = useRef<HTMLSpanElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const flash = useRef<HTMLDivElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  // Sound helpers live in refs: toggling a preference must never restart the story.
  const { tick, click } = useSound()
  const tone = useRef({ tick, click })
  tone.current = { tick, click }

  // Deep links (#work, …) always get the full sequence; returning visitors in the
  // same session go straight through so the mark never becomes a toll booth.
  const [instant] = useState(
    () => typeof window !== 'undefined' && seenThisSession() && !window.location.hash
  )
  const [phase, setPhase] = useState<'tuning' | 'releasing'>('tuning')
  const [typeReady, setTypeReady] = useState(false)
  const [fine] = useState(() => hasFinePointer())
  const [reduced] = useState(() => prefersReducedMotion())
  const [gl] = useState(() => webglAvailable())

  const draws = gl && !reduced

  /* ---------------------------------------------------------------- cursor */
  // The native pointer is used everywhere now (including here): no custom
  // ring, no nib — the footer's purple could never swallow it again.

  /* ------------------------------------------------------------ fit to view */
  // The component keeps its authored 1200x800 canvas (so the atlas is rasterised
  // once, never on resize); the shell scales that stage to the viewport instead.
  useEffect(() => {
    if (!draws) return
    const host = root.current
    const box = stage.current
    if (!host || !box) return
    const fit = () => {
      const cs = getComputedStyle(box)
      const innerW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const innerH = box.clientHeight
      const scale = Math.min(
        MARK_MAX_SCALE,
        Math.max(innerW, 1) / markInkWidth(),
        Math.max(innerH, 1) / MARK_BAND_H
      )
      host.style.setProperty('--boot-fit', String(scale))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [draws, typeReady])

  /* --------------------------------------------------------- real type gate */
  // The wordmark is measured into a canvas atlas, so it must not be shown until
  // the display face is on the canvas — otherwise the first frames rasterise in
  // a fallback font and the letters change under the visitor.
  useEffect(() => {
    if (instant || !draws) return
    const done = () => setTypeReady(true)
    const timer = window.setTimeout(done, TYPE_DEADLINE)
    document.fonts?.ready.then(done, done)
    return () => window.clearTimeout(timer)
  }, [instant, draws])

  /* ------------------------------------------------------------- sequence */
  useEffect(() => {
    if (instant) {
      markReady()
      onDoneRef.current()
      return
    }
    const el = root.current
    if (!el) return

    let finished = false
    let exit: gsap.core.Timeline | null = null
    let meter: gsap.core.Tween | null = null
    let cues: gsap.core.Tween[] = []
    const els = {
      mark: mark.current,
      hud: hud.current,
      floor: floor.current,
      flash: flash.current
    }

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!window.location.hash) window.scrollTo(0, 0)
    setScrollLocked(true)
    const relock = window.setTimeout(() => setScrollLocked(true), 60)

    const enter = () => {
      onDoneRef.current()
      if (window.location.hash) {
        let id = window.location.hash.slice(1)
        try {
          id = decodeURIComponent(id)
        } catch {
          /* keep a malformed fragment as-is */
        }
        document.getElementById(id)?.scrollIntoView()
      }
    }

    const finish = () => {
      if (finished) return
      finished = true
      window.clearTimeout(relock)
      window.clearTimeout(holdTimer)
      setPhase('releasing')
      rememberSeen()
      markReady()
      setScrollLocked(false)
      ScrollTrigger.refresh()

      if (readout.current) readout.current.textContent = '100'
      gsap.set(track.current, { scaleX: 1 })

      if (reduced) {
        exit = gsap.timeline({ onComplete: enter })
        exit.to(el, { autoAlpha: 0, duration: 0.2, delay: 0.5 }, 0)
        exit.set(el, { display: 'none' })
        return
      }

      // No transforms here: the mark's own scale belongs to the fit-to-view rule.
      exit = gsap.timeline({ onComplete: enter, defaults: { ease: 'power2.inOut' } })
      exit
        .to(els.mark, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0)
        .to([els.hud, els.floor].filter(Boolean), { autoAlpha: 0, y: -10, duration: 0.34 }, 0.04)
        .to(els.flash, { autoAlpha: 0.2, duration: 0.16, ease: 'power1.out' }, 0.18)
        .to(els.flash, { autoAlpha: 0, duration: 0.28 }, 0.34)
        .to(el, { autoAlpha: 0, duration: 0.4 }, 0.2)
    }

    /* ------------------------------------------------------------ storyboard */
    let exitAt = EXIT_AT
    if (reduced) {
      gsap.set([els.hud, el, els.floor].filter(Boolean), { autoAlpha: 1 })
      exitAt = 0.4
    } else {
      const story = gsap.timeline({ defaults: { ease: 'power3.out' } })
      story
        .fromTo(els.hud, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.06)
        .fromTo(els.floor, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.14)
      cues = [
        gsap.delayedCall(HOLD * 0.5, () => tone.current.tick()),
        gsap.delayedCall(HOLD * 0.78, () => tone.current.tick())
      ]
    }

    // the meter climbs honestly over the four seconds, then snaps to 100 on exit
    meter = gsap.to(
      { v: 0 },
      {
        v: 98,
        duration: Math.max(0.3, exitAt - 0.1),
        ease: 'none',
        onUpdate () {
          const v = Math.round(this.targets()[0].v as number)
          if (readout.current) readout.current.textContent = String(v).padStart(3, '0')
          gsap.set(track.current, { scaleX: v / 100 })
        }
      }
    )

    // the four-second hold is the contract: nothing below may extend it
    const holdTimer = window.setTimeout(finish, reduced ? 1000 : HOLD * 1000)

    return () => {
      window.clearTimeout(relock)
      window.clearTimeout(holdTimer)
      meter?.kill()
      cues.forEach((cue) => cue.kill())
      exit?.kill()
      setScrollLocked(false)
      ScrollTrigger.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant, reduced])

  /* --------------------------------------------------- the mark fades up in */
  // Opacity only: the mark's transform is the fit-to-view rule and must not be
  // overwritten by the animation library.
  useEffect(() => {
    if (instant || !draws || !typeReady) return
    const el = mark.current
    if (!el) return
    const tween = gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' })
    return () => {
      tween.kill()
    }
  }, [instant, draws, typeReady])

  const gateLabel = !gl ? 'UNAVAILABLE' : reduced ? 'STATIC' : typeReady ? 'ATLAS OK' : 'MEASURING'

  return (
    <div
      ref={root}
      className="boot"
      data-phase={phase}
      data-draws={draws ? 'gl' : 'static'}
      role="status"
      aria-live="polite"
    >
      <div className="boot__bg" aria-hidden="true" />
      <div className="boot__scan" aria-hidden="true" />
      <div ref={flash} className="boot__flash" aria-hidden="true" />

      <p className="sr-only">
        {phase === 'releasing' ? 'Portfolio ready.' : `Drawing the name ${profile.name}.`}
      </p>

      {/* Same band as the site header, so the handoff reads as one element. */}
      <header ref={hud} className="boot__hud" aria-hidden="true">
        <span className="boot__brand">
          <svg width="12" height="11" viewBox="0 0 12 11" fill="none">
            <path d="M6 0 L12 11 H0 Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 4 L8.5 9 H3.5 Z" fill="currentColor" />
          </svg>
          {profile.name}
        </span>
        <span className="boot__hud-meta">
          {META.map((cell) => (
            <span key={cell.b} className="boot__hud-cell">
              <b>{cell.b}</b>
              <small>{cell.s}</small>
            </span>
          ))}
        </span>
      </header>

      <div ref={stage} className="boot__stage">
        <div ref={mark} className="boot__mark" aria-hidden="true">
          {draws ? (
            <VectorWordmark
              text={profile.name}
              background="transparent"
              textColor="#f4f0ff"
              shade="#8f6fd8"
              accent="rgba(180, 140, 255, 0.55)"
              font={{
                fontFamily: MARK_FAMILY,
                fontWeight: 500,
                fontSize: `${MARK_FONT_SIZE}px`,
                lineHeight: '1em',
                letterSpacing: '-0.01em',
                textAlign: 'left'
              }}
              style={{
                position: 'absolute',
                inset: 0,
                minWidth: 0,
                minHeight: 0,
                background: 'transparent'
              }}
            />
          ) : (
            <p className="boot__mark-static">{profile.name}</p>
          )}
        </div>
      </div>

      <footer ref={floor} className="boot__floor">
        <div className="boot__meter" aria-hidden="true">
          <span ref={track} className="boot__meter-fill" />
        </div>
        <div className="boot__floor-row">
          <p className="boot__status" aria-hidden="true">
            <i className="boot__status-dot" />
            <span>
              <b>{phase === 'releasing' ? 'ENTERING THE FIELD' : 'DRAWING THE WORDMARK'}</b>
              <small>
                {draws && fine
                  ? 'Move the cursor — the dots sharpen under the handles.'
                  : 'One four-second sweep, then the page opens.'}
              </small>
            </span>
          </p>
          <p className="boot__readout" aria-hidden="true">
            <span ref={readout}>000</span>
            <em>%</em>
          </p>
          <button
            type="button"
            className="boot__skip"
            onClick={() => {
              tone.current.click()
              rememberSeen()
              markReady()
              setScrollLocked(false)
              ScrollTrigger.refresh()
              onDoneRef.current()
            }}
          >
            Skip intro
          </button>
        </div>
        <p className="boot__gate" aria-hidden="true">
          <span className="boot__gate-cell">VECTOR · {gateLabel}</span>
          <span className="boot__gate-cell">TYPE · LOCAL</span>
          <span className="boot__gate-cell">SWEEP · 1 / 1</span>
        </p>
      </footer>
    </div>
  )
}
