import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { SplitDoors } from './fx/SplitDoors'
import { createPenScratch, playWhoosh } from '../lib/audio'
import { prefersReducedMotion } from '../lib/motion'

/**
 * Cinematic Golden Signature Loader.
 *
 * "Sambit Swain" is written across the full screen in glowing golden ink —
 * a real pen-order performance: each letter flows in writing sequence at one
 * constant pen speed, the nib lifts and hops between letters (higher between
 * words), ink glows wet at the tip, then a metallic shimmer sweeps the
 * finished signature. Letterbox bars, slow camera push-in, rising gold-dust
 * embers, spotlight pool and a soft floor reflection. Runs for exactly
 * 5 seconds, then the doors swing open onto the site.
 */

const TOTAL_MS = 5000
const REDUCED_MS = 1400
const DRAW_START = 0.05 // pen touches down
const DRAW_END = 0.7 // pen lifts for the last time
const SHIM_START = 0.7 // shimmer sweep begins
const SHIM_END = 0.97 // shimmer sweep ends
const RING_C = 2 * Math.PI * 15

const SIGNATURE_TEXT = 'Sambit Swain'
const SIGNATURE_SIZE = 175
const SIGNATURE_X = 560
const SIGNATURE_BASELINE = 285
const LETTER_LEAD = 60 // soft ink edge ahead of the nib, per letter
const LIFT_SMALL = 12 // nib hop height between letters
const LIFT_WORD = 30 // nib hop height between words

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** Gentle pen easing — the nib breathes at curves, runs mid-stroke. */
const penEase = (t: number) => t * t * (3 - 2 * t)
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/* ---------------------------------------------------------------- embers -- */
/* Rising gold-dust particles on a lightweight canvas (additive glow). */

function EmberCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    type Ember = { x: number; y: number; r: number; vy: number; sway: number; phase: number; speed: number; hue: number }
    let embers: Ember[] = []

    const seed = () => {
      const count = Math.max(36, Math.min(110, Math.floor((w * h) / 16000)))
      embers = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 2.1,
        vy: 8 + Math.random() * 26,
        sway: 6 + Math.random() * 22,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.6,
        hue: 38 + Math.random() * 10
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = now / 1000
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const e of embers) {
        e.y -= e.vy * dt
        if (e.y < -8) {
          e.y = h + 8
          e.x = Math.random() * w
        }
        const x = e.x + Math.sin(t * e.speed + e.phase) * e.sway * 0.4
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * e.speed * 2 + e.phase))
        const a = 0.75 * twinkle
        const g = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.r * 4)
        g.addColorStop(0, `hsla(${e.hue}, 95%, 78%, ${a})`)
        g.addColorStop(0.35, `hsla(${e.hue}, 90%, 60%, ${a * 0.4})`)
        g.addColorStop(1, 'hsla(42, 90%, 50%, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, e.y, e.r * 4, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}

/* ----------------------------------------------------------------- loader -- */

type LetterSeg = {
  index: number
  x0: number
  x1: number
  start: number
  end: number
}

type GapSeg = {
  start: number
  end: number
  fromX: number
  toX: number
  lift: number
}

export function Loader({ onExit }: { onExit: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const mainTextRef = useRef<SVGTextElement>(null)
  const wipeSolidRefs = useRef<(SVGRectElement | null)[]>([])
  const wipeSoftRefs = useRef<(SVGRectElement | null)[]>([])
  const glowRef = useRef<SVGGElement>(null)
  const reflRef = useRef<SVGGElement>(null)
  const shimRef = useRef<SVGGElement>(null)
  const shimGradRef = useRef<SVGLinearGradientElement>(null)
  const goldGradRef = useRef<SVGLinearGradientElement>(null)
  const nibRef = useRef<SVGGElement>(null)
  const nibHaloRef = useRef<SVGCircleElement>(null)
  const nibCoreRef = useRef<SVGCircleElement>(null)
  const hairRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  const [runId, setRunId] = useState(0)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const exitedRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const scratchRef = useRef<ReturnType<typeof createPenScratch>>(null)
  const soundRef = useRef(false)
  soundRef.current = soundOn

  const reduced = useMemo(() => prefersReducedMotion(), [runId])

  const stopScratch = useCallback(() => {
    scratchRef.current?.stop()
    scratchRef.current = null
  }, [])

  const finish = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    stopScratch()
    if (soundRef.current) playWhoosh(0.8, 0.12)
    setDoorsOpen(true)
  }, [stopScratch])

  const replay = useCallback(() => {
    exitedRef.current = false
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    stopScratch()
    setDoorsOpen(false)
    setRunId((n) => n + 1)
  }, [stopScratch])

  /* ---------------------------------------------------------- master loop */
  useEffect(() => {
    let cancelled = false
    let raf = 0

    const openWipeFully = () => {
      for (const r of wipeSolidRefs.current) {
        if (!r) continue
        r.setAttribute('x', '0')
        r.setAttribute('width', '1120')
      }
      for (const r of wipeSoftRefs.current) {
        if (!r) continue
        r.setAttribute('width', '0')
      }
    }

    if (reduced) {
      // Calm fallback: the signature rests fully written, then we leave.
      openWipeFully()
      if (glowRef.current) glowRef.current.style.opacity = '0.5'
      if (reflRef.current) reflRef.current.style.opacity = '0.3'
      if (nibRef.current) nibRef.current.style.opacity = '0'
      if (shimRef.current) shimRef.current.style.opacity = '0'
      if (hairRef.current) hairRef.current.style.transform = 'scaleX(1)'
      if (ringRef.current) ringRef.current.style.strokeDashoffset = '0'
      const t = window.setTimeout(finish, REDUCED_MS)
      timersRef.current.push(t)
      return () => {
        cancelled = true
        window.clearTimeout(t)
      }
    }

    const boot = async () => {
      // Wait for the signature face so the ink never flashes in a fallback.
      try {
        if (document.fonts?.load) {
          await Promise.race([
            document.fonts.load(`${SIGNATURE_SIZE}px "Ms Madi"`, SIGNATURE_TEXT),
            new Promise((resolve) => window.setTimeout(resolve, 1800))
          ])
        }
      } catch {
        /* fall back to whatever rendered */
      }
      if (cancelled || exitedRef.current) return

      /* ---- measure every letter in place (shaping intact) ---- */
      const chars = SIGNATURE_TEXT.split('')
      const bounds: { x0: number; x1: number }[] = []
      const textEl = mainTextRef.current
      let measuredOk = false
      if (textEl) {
        try {
          const total = textEl.getComputedTextLength()
          if (Number.isFinite(total) && total > 200 && total < 1100) {
            measuredOk = true
            for (let i = 0; i < chars.length; i++) {
              const s = textEl.getStartPositionOfChar(i).x
              const e = textEl.getEndPositionOfChar(i).x
              bounds.push({ x0: s, x1: Math.max(e, s + 1) })
            }
          }
        } catch {
          measuredOk = false
        }
      }
      if (!measuredOk) {
        // Even fallback slices keep the pen-order rhythm.
        const lineWidth = 880
        const left = SIGNATURE_X - lineWidth / 2
        const slice = lineWidth / chars.length
        for (let i = 0; i < chars.length; i++) {
          bounds.push({ x0: left + i * slice, x1: left + (i + 1) * slice })
        }
      }

      /* ---- pen choreography: constant speed, lifts between letters ---- */
      const letters: LetterSeg[] = []
      const gaps: GapSeg[] = []
      const isSpace = (i: number) => chars[i] === ' '
      const letterWidth = bounds.reduce((a, b, i) => (isSpace(i) ? a : a + (b.x1 - b.x0)), 0)

      const GAP_LETTER = 0.014 // progress units ≈ 70ms pen lift
      const GAP_WORD = 0.06 // progress units ≈ 300ms word lift
      let gapTotal = 0
      for (let i = 0; i < chars.length - 1; i++) {
        if (isSpace(i) || isSpace(i + 1)) gapTotal += GAP_WORD
        else gapTotal += GAP_LETTER
      }
      const writeSpan = DRAW_END - DRAW_START - gapTotal

      let cursor = DRAW_START
      let prevLetter: LetterSeg | null = null
      for (let i = 0; i < chars.length; i++) {
        if (isSpace(i)) continue
        if (prevLetter) {
          const wordBreak = chars[prevLetter.index + 1] === ' ' || i - prevLetter.index > 1
          const gapLen = wordBreak ? GAP_WORD : GAP_LETTER
          gaps.push({
            start: cursor,
            end: cursor + gapLen,
            fromX: prevLetter.x1,
            toX: bounds[i].x0,
            lift: wordBreak ? LIFT_WORD : LIFT_SMALL
          })
          cursor += gapLen
        }
        const dur = ((bounds[i].x1 - bounds[i].x0) / letterWidth) * writeSpan
        const seg: LetterSeg = { index: i, x0: bounds[i].x0, x1: bounds[i].x1, start: cursor, end: cursor + dur }
        letters.push(seg)
        prevLetter = seg
        cursor += dur
      }

      const NIB_Y = SIGNATURE_BASELINE - 46
      const start = performance.now()

      const frame = (now: number) => {
        if (cancelled || exitedRef.current) return
        const elapsed = now - start
        const p = clamp01(elapsed / TOTAL_MS)

        // Each letter flows in writing order.
        let active: LetterSeg | null = null
        let activeEased = 0
        for (const seg of letters) {
          const local = clamp01((p - seg.start) / Math.max(seg.end - seg.start, 1e-6))
          const eased = penEase(local)
          const solidW = eased * (seg.x1 - seg.x0 + LETTER_LEAD)
          const solid = wipeSolidRefs.current[seg.index]
          const soft = wipeSoftRefs.current[seg.index]
          solid?.setAttribute('x', (seg.x0 - LETTER_LEAD).toFixed(1))
          solid?.setAttribute('width', Math.max(solidW, 0.1).toFixed(1))
          soft?.setAttribute('x', (seg.x0 - LETTER_LEAD + solidW).toFixed(1))
          if (local > 0 && local < 1) {
            active = seg
            activeEased = eased
          }
        }

        // Pen nib: writes, lifts, hops — never glides mechanically.
        const nib = nibRef.current
        let writing = false
        if (nib) {
          if (active) {
            writing = true
            const nx = active.x0 + activeEased * (active.x1 - active.x0)
            // The tip dips into downstrokes and breathes as it runs.
            const ny = NIB_Y - Math.sin(activeEased * Math.PI) * 8 + Math.sin(elapsed / 150) * 5
            nib.style.opacity = '1'
            nib.setAttribute('transform', `translate(${nx.toFixed(1)} ${ny.toFixed(1)})`)
            // Pressure: the halo swells mid-stroke.
            const pressure = 0.8 + Math.sin(activeEased * Math.PI) * 0.35
            nibHaloRef.current?.setAttribute('opacity', (pressure * (0.8 + 0.2 * Math.sin(now / 57))).toFixed(2))
            nibCoreRef.current?.setAttribute('r', (6 * (0.9 + 0.25 * Math.sin(activeEased * Math.PI))).toFixed(2))
          } else {
            const gap = gaps.find((g) => p >= g.start && p < g.end)
            if (gap) {
              const gp = (p - gap.start) / Math.max(gap.end - gap.start, 1e-6)
              const nx = gap.fromX + (gap.toX - gap.fromX) * gp
              const ny = NIB_Y - Math.sin(gp * Math.PI) * gap.lift
              nib.style.opacity = '0.35'
              nib.setAttribute('transform', `translate(${nx.toFixed(1)} ${ny.toFixed(1)})`)
              nibHaloRef.current?.setAttribute('opacity', '0.3')
            } else {
              nib.style.opacity = '0'
            }
          }
        }

        const drawP = clamp01((p - DRAW_START) / (DRAW_END - DRAW_START))

        // Living metal: the gold gradient breathes, the under-glow swells.
        if (goldGradRef.current) {
          const drift = Math.sin(elapsed / 900) * 40
          goldGradRef.current.setAttribute('gradientTransform', `translate(${drift.toFixed(1)} 0)`)
        }
        if (glowRef.current) {
          const pulse = drawP >= 1 ? 0.55 + 0.12 * Math.sin(elapsed / 320) : 0.55 * drawP
          glowRef.current.style.opacity = pulse.toFixed(3)
        }
        if (reflRef.current) reflRef.current.style.opacity = (0.38 * drawP).toFixed(3)

        // Shimmer sweep across the finished signature.
        const shim = shimRef.current
        if (shim) {
          const sp = clamp01((p - SHIM_START) / (SHIM_END - SHIM_START))
          if (sp > 0 && sp < 1) {
            const x = -320 + sp * 1760
            shim.style.opacity = (Math.sin(sp * Math.PI) * 0.85).toFixed(3)
            shimGradRef.current?.setAttribute('gradientTransform', `translate(${x.toFixed(1)} 0)`)
          } else {
            shim.style.opacity = '0'
          }
        }

        // Slow cinematic push-in.
        if (stageRef.current) {
          const z = 1 + easeInOut(clamp01(p / 0.92)) * 0.07
          stageRef.current.style.transform = `scale(${z.toFixed(4)}) translateY(${(-8 * p).toFixed(2)}px)`
        }

        // Progress hairline + skip ring.
        if (hairRef.current) hairRef.current.style.transform = `scaleX(${p.toFixed(4)})`
        if (ringRef.current) ringRef.current.style.strokeDashoffset = `${(RING_C * (1 - p)).toFixed(2)}`

        // Pen scratch tracks the writing, hushes on lifts.
        const scratch = scratchRef.current
        if (scratch) {
          scratch.update(
            writing ? 0.9 : 0.05,
            writing ? 0.4 + 0.3 * Math.sin(elapsed / 210) : 0
          )
        }

        if (p >= 1) {
          finish()
          return
        }
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }
    boot()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [runId, reduced, finish])

  /* ---------------------------------------------------------- sound toggle */
  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on
      if (!next) stopScratch()
      else if (!reduced && !exitedRef.current) {
        try {
          scratchRef.current = createPenScratch()
        } catch {
          scratchRef.current = null
        }
      }
      return next
    })
  }, [reduced, stopScratch])

  useEffect(() => stopScratch, [stopScratch])

  /* --------------------------------------------------------------- keyboard */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') finish()
      if (event.key.toLowerCase() === 'r' && !event.metaKey && !event.ctrlKey) replay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish, replay])

  const textProps = {
    x: SIGNATURE_X,
    y: SIGNATURE_BASELINE,
    textAnchor: 'middle' as const,
    fontSize: SIGNATURE_SIZE,
    className: 'font-signature'
  }

  return (
    <>
      <style>{`
        @keyframes loader-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bar-in-top { from { transform: translateY(-100%) } to { transform: translateY(0) } }
        @keyframes bar-in-bottom { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes grain-shift {
          0%, 100% { transform: translate(0, 0) }
          20% { transform: translate(-4%, 3%) }
          40% { transform: translate(3%, -5%) }
          60% { transform: translate(-3%, -2%) }
          80% { transform: translate(4%, 4%) }
        }
        @keyframes ambient-breathe {
          0%, 100% { opacity: 0.55; transform: scale(1) }
          50% { opacity: 0.9; transform: scale(1.06) }
        }
      `}</style>

      <div
        className="fixed inset-0 overflow-hidden bg-black"
        style={{ zIndex: 100, animation: 'loader-fade-in 450ms ease-out both' }}
        role="status"
        aria-live="polite"
        aria-label="Loading — Sambit Swain"
      >
        {/* Ambient champagne glow breathing behind the ink */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(58% 46% at 50% 46%, rgb(226 183 106 / 0.16) 0%, rgb(120 84 30 / 0.07) 46%, transparent 72%)',
            animation: reduced ? undefined : 'ambient-breathe 5s ease-in-out infinite'
          }}
        />

        {/* Spotlight pool on the surface the ink flows onto */}
        <div
          className="absolute left-1/2 top-1/2 h-[46vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, rgb(232 196 120 / 0.1) 0%, rgb(160 118 52 / 0.05) 45%, transparent 70%)'
          }}
        />

        {/* Rising gold dust */}
        <EmberCanvas active={!reduced && !doorsOpen} />

        {/* Signature stage (slow push-in via rAF) */}
        <div ref={stageRef} className="absolute inset-0 grid place-items-center will-change-transform">
          <div className="w-[min(1180px,94vw)]">
            <svg
              viewBox="10 10 1100 470"
              className="h-auto w-full overflow-visible"
              role="img"
              aria-label="Sambit Swain, written in golden ink"
            >
              <defs>
                <linearGradient id="sigGold" ref={goldGradRef} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1120" y2="0">
                  <stop offset="0%" stopColor="#8a6428" />
                  <stop offset="22%" stopColor="#e2b76a" />
                  <stop offset="42%" stopColor="#fff3d6" />
                  <stop offset="58%" stopColor="#e9c37c" />
                  <stop offset="78%" stopColor="#f6e3bd" />
                  <stop offset="100%" stopColor="#8a6428" />
                </linearGradient>
                <linearGradient
                  id="sigShimmer"
                  ref={shimGradRef}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2="260"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#fff6e2" stopOpacity="0" />
                  <stop offset="42%" stopColor="#fff6e2" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="58%" stopColor="#fff6e2" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#fff6e2" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="wipeSoftGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="140" y2="0">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="reflFade" gradientUnits="userSpaceOnUse" x1="0" y1="320" x2="0" y2="475">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <mask id="inkWipe" maskUnits="userSpaceOnUse" x="0" y="0" width="1120" height="490">
                  {SIGNATURE_TEXT.split('').map((ch, i) =>
                    ch === ' ' ? null : (
                      <Fragment key={i}>
                        <rect
                          ref={(el) => {
                            wipeSolidRefs.current[i] = el
                          }}
                          x="0"
                          y="0"
                          width="0.1"
                          height="490"
                          fill="#ffffff"
                        />
                        <rect
                          ref={(el) => {
                            wipeSoftRefs.current[i] = el
                          }}
                          x="0"
                          y="0"
                          width="140"
                          height="490"
                          fill="url(#wipeSoftGrad)"
                        />
                      </Fragment>
                    )
                  )}
                </mask>
                <mask id="reflMask">
                  <rect x="0" y="310" width="1120" height="175" fill="url(#reflFade)" />
                </mask>
                <filter id="sigBlur" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
                <filter id="reflBlur" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="2.2" />
                </filter>
                <filter id="nibGlow" x="-160%" y="-160%" width="420%" height="420%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Floor reflection of the wet ink */}
              <g
                ref={reflRef}
                mask="url(#reflMask)"
                filter="url(#reflBlur)"
                opacity="0"
                transform="translate(0 630) scale(1 -1)"
              >
                <text {...textProps} fill="#e2b76a">
                  {SIGNATURE_TEXT}
                </text>
              </g>

              {/* Warm under-glow */}
              <g ref={glowRef} filter="url(#sigBlur)" opacity="0">
                <text {...textProps} fill="#e2b76a">
                  {SIGNATURE_TEXT}
                </text>
              </g>

              {/* The golden signature itself */}
              <text
                {...textProps}
                ref={mainTextRef}
                mask="url(#inkWipe)"
                fill="url(#sigGold)"
                stroke="#ffe9bd"
                strokeWidth="2"
                paintOrder="stroke"
                style={{ filter: 'drop-shadow(0 0 6px rgb(226 183 106 / 0.65))' }}
              >
                {SIGNATURE_TEXT}
              </text>

              {/* Shimmer sweep */}
              <g ref={shimRef} opacity="0">
                <text {...textProps} mask="url(#inkWipe)" fill="none" stroke="url(#sigShimmer)" strokeWidth="3">
                  {SIGNATURE_TEXT}
                </text>
              </g>

              {/* Pen nib riding the wet tip */}
              <g ref={nibRef} opacity="0" filter="url(#nibGlow)" style={{ transition: 'opacity 120ms ease' }}>
                <circle ref={nibHaloRef} r="17" fill="#f6c86a" opacity="0.8" />
                <circle ref={nibCoreRef} r="6" fill="#fff6e2" />
                <circle r="2.4" fill="#ffffff" />
              </g>
            </svg>
          </div>
        </div>

        {/* Letterbox bars */}
        <div
          className="absolute inset-x-0 top-0 h-[7vh] bg-black"
          aria-hidden="true"
          style={{ animation: reduced ? undefined : 'bar-in-top 900ms cubic-bezier(0.72, 0, 0.16, 1) both' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[7vh] bg-black"
          aria-hidden="true"
          style={{ animation: reduced ? undefined : 'bar-in-bottom 900ms cubic-bezier(0.72, 0, 0.16, 1) both' }}
        />
        <div
          className="absolute inset-x-0 top-[7vh] h-px bg-gradient-to-r from-transparent via-[#e2b76a]/40 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-[7vh] h-px bg-gradient-to-r from-transparent via-[#e2b76a]/40 to-transparent"
          aria-hidden="true"
        />

        {/* Progress hairline */}
        <div className="absolute inset-x-0 bottom-[calc(7vh+22px)] flex justify-center" aria-hidden="true">
          <div className="h-[2px] w-[min(420px,58vw)] overflow-hidden rounded-full bg-white/10">
            <div
              ref={hairRef}
              className="h-full w-full origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg, #8a6428, #e2b76a 55%, #fff6e2)',
                boxShadow: '0 0 12px rgb(226 183 106 / 0.7)',
                transform: 'scaleX(0)'
              }}
            />
          </div>
        </div>

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.55) 100%)' }}
        />

        {/* Film grain */}
        {!reduced && (
          <div
            className="pointer-events-none absolute -inset-[10%] opacity-[0.07]"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E")`,
              animation: 'grain-shift 0.9s steps(4) infinite'
            }}
          />
        )}

        {/* Controls */}
        <div className="absolute bottom-[calc(7vh+34px)] right-5 flex items-center gap-3 sm:right-8" style={{ zIndex: 20 }}>
          <button
            type="button"
            onClick={toggleSound}
            data-sfx="hover"
            aria-label={soundOn ? 'Mute pen sound' : 'Unmute pen sound'}
            aria-pressed={soundOn}
            className="cursor-target grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md transition-all hover:border-amber-400/50 hover:text-white"
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-[#f6e3bd]" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={replay}
            data-sfx="hover"
            aria-label="Replay signature"
            className="cursor-target grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md transition-all hover:-rotate-90 hover:border-amber-400/50 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={finish}
            data-sfx="hover"
            aria-label="Skip intro"
            className="cursor-target group relative grid h-12 w-12 place-items-center rounded-full bg-black/40 backdrop-blur-md transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
              <defs>
                <linearGradient id="skipRingGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff6e2" />
                  <stop offset="60%" stopColor="#e2b76a" />
                  <stop offset="100%" stopColor="#d69884" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
              <circle
                ref={ringRef}
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="url(#skipRingGold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C}
                style={{ filter: 'drop-shadow(0 0 4px rgba(226, 183, 106, 0.6))' }}
              />
            </svg>
            <X className="relative h-4 w-4 text-white/70 transition-colors group-hover:text-white" />
          </button>
        </div>

        <div
          className="absolute bottom-[calc(7vh+46px)] left-5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 sm:left-8"
          style={{ zIndex: 20 }}
          aria-hidden="true"
        >
          esc — skip &nbsp;·&nbsp; r — replay
        </div>
      </div>

      {doorsOpen && <SplitDoors open onDone={onExit} bg="#000000" zIndex={110} durationMs={1000} />}
    </>
  )
}
