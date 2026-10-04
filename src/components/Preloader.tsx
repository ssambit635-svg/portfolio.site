import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { setScrollLocked } from '../hooks/useLenis'
import { markReady } from '../lib/ready'
import { useSound } from '../hooks/useSound'
import { hasFinePointer, prefersReducedMotion } from '../lib/utils'
import { profile } from '../lib/site'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`

/** Remember that this session already watched the sequence. */
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

type Gate = 'pending' | 'ready' | 'fallback'

/** The four stat lines printed on the card. Values come from the real profile. */
const CARD_FIELDS = [
  { key: 'NAME', value: profile.name },
  { key: 'ROLE', value: profile.role },
  { key: 'CLASS', value: `${profile.classTag} · NIST UNIVERSITY` },
  { key: 'BASE', value: profile.city }
] as const

/** Startup beats, mirroring the site's instrument-panel vocabulary. */
const BOOT_STEPS = [
  { code: '01', label: 'PROFILE' },
  { code: '02', label: 'TYPE' },
  { code: '03', label: 'SIGNATURE' }
] as const

/**
 * Entry sequence: the visitor's player card is issued, decoded and then signed
 * by hand — the sign-off is what unlocks the door to the site.
 *
 * Real gates still decide when the page may open (portrait bytes, local fonts,
 * a minimum story beat and a hard deadline), so a slow or stalled asset can
 * never trap anyone behind the card.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const cursorNib = useRef<HTMLDivElement>(null)
  const hud = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const photo = useRef<HTMLDivElement>(null)
  const fields = useRef<HTMLDivElement>(null)
  const paper = useRef<HTMLDivElement>(null)
  const signature = useRef<HTMLSpanElement>(null)
  const swash = useRef<HTMLSpanElement>(null)
  const pen = useRef<HTMLSpanElement>(null)
  const seal = useRef<HTMLSpanElement>(null)
  const stamp = useRef<HTMLSpanElement>(null)
  const brief = useRef<HTMLDivElement>(null)
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
  // same session go straight through so the card never becomes a toll booth.
  const [instant] = useState(
    () => typeof window !== 'undefined' && seenThisSession() && !window.location.hash
  )
  const [phase, setPhase] = useState<'tuning' | 'releasing'>('tuning')
  const [beats, setBeats] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [portraitGate, setPortraitGate] = useState<Gate>('pending')
  const [typeGate, setTypeGate] = useState<Gate>('pending')

  /* ---------------------------------------------------------------- cursor */
  useEffect(() => {
    if (instant) return
    if (!hasFinePointer() || prefersReducedMotion()) return
    const el = cursorNib.current
    const host = root.current
    if (!el || !host) return
    host.dataset.pointer = 'nib'
    const xTo = gsap.quickTo(el, 'x', { duration: 0.16, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.16, ease: 'power3' })
    gsap.set(el, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2, autoAlpha: 1 })
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const hot = (e.target as HTMLElement).closest('a,button,[data-cursor]')
      gsap.to(el, { scale: hot ? 2.1 : 1, duration: 0.25 })
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      delete host.dataset.pointer
    }
  }, [instant])

  /* ------------------------------------------------------------- sequence */
  useEffect(() => {
    if (instant) {
      markReady()
      onDoneRef.current()
      return
    }
    const el = root.current
    if (!el) return
    const reduced = prefersReducedMotion()
    const els = {
      hud: hud.current,
      card: card.current,
      photo: photo.current,
      fields: fields.current,
      paper: paper.current,
      signature: signature.current,
      swash: swash.current,
      pen: pen.current,
      seal: seal.current,
      stamp: stamp.current,
      brief: brief.current,
      floor: floor.current,
      flash: flash.current
    }

    let active = true
    let finished = false
    let imageResolved = false
    let fontsResolved = false
    let minimumElapsed = false
    let forceFinish = false
    let relock = 0
    let minimumTimer = 0
    let deadlineTimer = 0
    let exit: gsap.core.Timeline | null = null
    let cues: gsap.core.Tween[] = []

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!window.location.hash) window.scrollTo(0, 0)
    setScrollLocked(true)
    relock = window.setTimeout(() => setScrollLocked(true), 60)

    const enter = () => {
      if (!active) return
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
      if (finished || !active) return
      finished = true
      window.clearTimeout(relock)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(deadlineTimer)
      setPhase('releasing')
      rememberSeen()
      markReady()
      setScrollLocked(false)
      ScrollTrigger.refresh()
      setPortraitGate((t) => (t === 'pending' ? 'fallback' : t))

      if (readout.current) readout.current.textContent = '100'
      gsap.set(track.current, { scaleX: 1 })
      story.pause()
      tone.current.click()

      if (reduced) {
        exit = gsap.timeline({ onComplete: enter })
        exit.to(el, { opacity: 0, duration: 0.2 }, 0)
        exit.set(el, { display: 'none' })
        return
      }

      exit = gsap.timeline({ onComplete: enter, defaults: { ease: 'power2.inOut' } })
      exit
        .to(cursorNib.current, { autoAlpha: 0, duration: 0.2 }, 0)
        .to([els.card, els.brief, els.hud, els.floor].filter(Boolean), { autoAlpha: 0, y: -12, duration: 0.34 }, 0)
        .to(els.flash, { autoAlpha: 0.28, duration: 0.18, ease: 'power1.out' }, 0.06)
        .to(els.flash, { autoAlpha: 0, duration: 0.3 }, 0.24)
        .to(el, { scale: 1.035, duration: 0.78 }, 0)
        .to(el, { autoAlpha: 0, duration: 0.42 }, 0.22)
    }

    const maybeFinish = () => {
      if (forceFinish || (imageResolved && fontsResolved && minimumElapsed)) finish()
    }

    const beat = (index: number) => {
      setBeats((prev) => (prev[index] ? prev : ((prev.map((v, i) => (i === index ? true : v)) as [boolean, boolean, boolean]))))
      tone.current.tick()
    }

    const fieldRows = Array.from(els.fields?.children ?? [])

    /* ------------------------------------------------------------ storyboard */
    const story = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    let exitAt = 3.5
    if (reduced) {
      story.set([els.hud, els.card, els.brief, els.floor, els.seal, els.stamp].filter(Boolean), { autoAlpha: 1 })
      cues = [
        gsap.delayedCall(0.2, () => beat(0)),
        gsap.delayedCall(0.42, () => beat(1)),
        gsap.delayedCall(0.62, () => beat(2))
      ]
      exitAt = 0.9
    } else {
      story
        .fromTo(els.hud, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0)
        .fromTo(els.brief, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.06)
        .fromTo(
          els.card,
          { autoAlpha: 0, y: 30, rotateX: 12, rotateY: -16 },
          { autoAlpha: 1, y: 0, rotateX: 0, rotateY: 0, duration: 0.85, ease: 'power4.out' },
          0.3
        )
        // the portrait decodes, scanline and all
        .fromTo(els.photo, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.inOut' }, 0.62)
        .fromTo('[data-boot-ghost]', { autoAlpha: 0.85 }, { autoAlpha: 0, duration: 0.4, ease: 'steps(5)' }, 0.9)
        .call(() => beat(0), undefined, 0.95)
        .fromTo(fieldRows, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.06 }, 1.0)
        .call(() => beat(1), undefined, 1.2)
        // the blank card slides in, then gets signed
        .fromTo(els.paper, { autoAlpha: 0, yPercent: 14 }, { autoAlpha: 1, yPercent: 0, duration: 0.4 }, 1.32)
        .to(els.pen, { autoAlpha: 1, duration: 0.1 }, 1.42)
        .fromTo(
          els.signature,
          { clipPath: 'inset(-40% 100% -40% 0%)' },
          { clipPath: 'inset(-40% 0% -40% 0%)', duration: 1.25, ease: 'power1.inOut' },
          1.5
        )
        .to(els.pen, { x: () => (els.signature?.offsetWidth ?? 240) * 0.97, duration: 1.25, ease: 'power1.inOut' }, 1.5)
        .to(els.pen, { y: -3.5, duration: 0.22, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 1.5)
        .fromTo(els.swash, { scaleX: 0 }, { scaleX: 1, duration: 0.36, ease: 'power2.out' }, 2.56)
        .to(els.pen, { autoAlpha: 0, duration: 0.16 }, 2.78)
        // stamped and sealed
        .call(() => beat(2), undefined, 2.82)
        .fromTo(els.seal, { autoAlpha: 0, scale: 1.8, rotate: -30 }, { autoAlpha: 1, scale: 1, rotate: -12, duration: 0.36, ease: 'power4.in' }, 2.9)
        .fromTo(els.stamp, { autoAlpha: 0, scale: 1.5, rotate: -2 }, { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.22, ease: 'power4.in' }, 3.08)
        .fromTo(els.stamp, { x: -3 }, { x: 0, duration: 0.1, repeat: 2, ease: 'power2.out' }, 3.3)
        .fromTo(els.flash, { autoAlpha: 0 }, { autoAlpha: 0.14, duration: 0.2 }, 3.08)
        .to(els.flash, { autoAlpha: 0, duration: 0.36 }, 3.28)
    }

    // the meter climbs honestly while the story runs, then snaps to 100 on exit
    const meter = gsap.to(
      { v: 0 },
      {
        v: 96,
        duration: Math.max(0.4, exitAt - 0.15),
        ease: 'none',
        onUpdate () {
          const v = Math.round(this.targets()[0].v as number)
          if (readout.current) readout.current.textContent = String(v).padStart(3, '0')
          gsap.set(track.current, { scaleX: v / 100 })
        }
      }
    )

    const started = performance.now()
    gsap.delayedCall(reduced ? 0.05 : 0.12, () => story.play())
    const minimum = setInterval(() => {
      if (performance.now() - started < (reduced ? 1000 : 4200)) return
      clearInterval(minimum)
      minimumElapsed = true
      maybeFinish()
    }, 120)

    const resolvePortrait = (ok: boolean) => {
      if (imageResolved) return
      imageResolved = true
      setPortraitGate(ok ? 'ready' : 'fallback')
      maybeFinish()
    }
    const image = new Image()
    image.onload = () => resolvePortrait(true)
    image.onerror = () => resolvePortrait(false)
    image.src = PORTRAIT
    if (image.complete) queueMicrotask(() => resolvePortrait(image.naturalWidth > 0))

    if (document.fonts?.ready) document.fonts.ready.then(() => {
      if (fontsResolved) return
      fontsResolved = true
      setTypeGate('ready')
      maybeFinish()
    }, () => {
      if (fontsResolved) return
      fontsResolved = true
      setTypeGate('fallback')
      maybeFinish()
    })
    else {
      fontsResolved = true
      setTypeGate('fallback')
    }

    // hard ceiling: nobody waits on a stalled asset, story or not
    deadlineTimer = window.setTimeout(() => {
      forceFinish = true
      if (!imageResolved) {
        imageResolved = true
        setPortraitGate('fallback')
      }
      if (!fontsResolved) {
        fontsResolved = true
        setTypeGate('fallback')
      }
      maybeFinish()
    }, reduced ? 1800 : 7600)

    return () => {
      active = false
      window.clearTimeout(relock)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(deadlineTimer)
      clearInterval(minimum)
      image.onload = null
      image.onerror = null
      meter.kill()
      cues.forEach((cue) => cue.kill())
      story.kill()
      exit?.kill()
      setScrollLocked(false)
      ScrollTrigger.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant])

  const gateLabel = (gate: Gate, ready: string, fallback: string) =>
    gate === 'ready' ? ready : gate === 'fallback' ? fallback : 'TUNING'

  return (
    <div
      ref={root}
      className="boot"
      data-phase={phase}
      role="status"
      aria-live="polite"
    >
      <div className="boot__bg" aria-hidden="true" />
      <div className="boot__glow boot__glow--one" aria-hidden="true" />
      <div className="boot__glow boot__glow--two" aria-hidden="true" />
      <div ref={flash} className="boot__flash" aria-hidden="true" />
      <div ref={cursorNib} className="boot__nib" aria-hidden="true" />

      <p className="sr-only">{phase === 'releasing' ? 'Portfolio ready.' : 'Preparing the portfolio.'}</p>

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
          <span className="boot__hud-cell">
            <b>PLAYER 01</b>
            <small>NIST UNIVERSITY</small>
          </span>
          <span className="boot__hud-cell">
            <b>{profile.city}</b>
            <small>{profile.coords[0]}</small>
          </span>
        </span>
      </header>

      <div className="boot__stage" aria-hidden="true">
        <div ref={brief} className="boot__brief">
          <p className="boot__eyebrow">
            <i className="boot__pulse" /> IDENTITY CARD · ISSUE 029
          </p>
          <h2 className="boot__title">
            Player one
          </h2>
          <p className="boot__lede">
            Ideas enter as signals. <em>Useful things</em> leave as software — signed below.
          </p>
          <div className="boot__steps">
            {BOOT_STEPS.map((step, i) => (
              <div
                key={step.code}
                className="boot__step"
                data-state={beats[i] ? 'ready' : 'pending'}
              >
                <span className="boot__step-node" />
                <span className="boot__step-code">{step.code}</span>
                <span className="boot__step-label">{step.label}</span>
                <span className="boot__step-state">
                  {i === 0 ? (
                    gateLabel(portraitGate, 'BYTES OK', 'BUFFERED')
                  ) : i === 1 ? (
                    gateLabel(typeGate, 'LOCAL FONTS', 'SYSTEM')
                  ) : (
                    <>
                      <em>PENDING</em>
                      <b>HAND-SIGNED</b>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="boot__card-wrap">
        <span className="boot__watermark" aria-hidden="true">029</span>
        <div ref={card} className="boot__card">
          <p className="boot__card-head">
            <span>PLAYER CARD</span>
            <span>SS / 029</span>
          </p>

          <div ref={photo} className="boot__photo">
            <img src={PORTRAIT} alt="" className="boot__photo-img" />
            <img data-boot-ghost src={PORTRAIT} alt="" className="boot__photo-ghost" />
            <span className="boot__photo-scan" />
            <span className="boot__photo-tag">
              FIG. 01 · {portraitGate === 'ready' ? 'SYNCED' : portraitGate === 'fallback' ? 'BUFFERED' : 'INCOMING'}
            </span>
          </div>

          <div ref={fields} className="boot__fields">
            {CARD_FIELDS.map((field) => (
              <p key={field.key} className="boot__field">
                <span className="boot__field-key">{field.key}</span>
                <span className="boot__field-lead" />
                <span className="boot__field-value">{field.value}</span>
              </p>
            ))}
          </div>

          <span ref={stamp} className="boot__stamp">
            <b>VERIFIED</b>
            <i>READY TO SHIP</i>
          </span>

          <div ref={paper} className="boot__paper">
            <div className="boot__sign">
              <span ref={signature} className="boot__sign-name">{profile.first} {profile.last}</span>
              <span ref={swash} className="boot__swash" />
              <span ref={pen} className="boot__pen" />
            </div>
            <p className="boot__paper-meta">
              <span>Signature — author</span>
              <span>Folio 029 / 2026</span>
            </p>
          </div>
        </div>

          {/* hangs off the card edge, so it lives outside the clipped box */}
          <span ref={seal} className="boot__seal">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="57" className="boot__seal-ring" />
              <circle cx="60" cy="60" r="49" className="boot__seal-ticks" />
              <circle cx="60" cy="60" r="34" className="boot__seal-ring-2" />
              <text x="60" y="56" className="boot__seal-mark" textAnchor="middle">SS</text>
              <text x="60" y="80" className="boot__seal-year" textAnchor="middle">2026</text>
              <circle cx="40" cy="76" r="2.2" className="boot__seal-dot" />
              <circle cx="80" cy="76" r="2.2" className="boot__seal-dot" />
            </svg>
          </span>
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
              <b>{phase === 'releasing' ? 'ENTERING THE FIELD' : 'SIGNING IN'}</b>
              <small>The portrait, local type and one hand-signed card.</small>
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
      </footer>
    </div>
  )
}
