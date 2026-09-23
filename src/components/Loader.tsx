import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { SplitDoors } from './fx/SplitDoors'
import { createPenScratch, playWhoosh } from '../lib/audio'
import { prefersReducedMotion } from '../lib/motion'
import { SIGNATURE_STROKES } from './loader/signature'

/**
 * Cinematic Golden Signature Loader.
 *
 * "Sambit Swain" writes itself across the full screen in glowing golden ink —
 * letterbox bars, slow camera push-in, rising gold-dust embers, a metallic
 * shimmer sweep and a soft floor reflection. Runs for exactly 5 seconds,
 * then the doors swing open onto the site.
 */

const TOTAL_MS = 5000
const REDUCED_MS = 1400
const DRAW_START = 0.05 // signature starts drawing
const DRAW_END = 0.7 // signature completes
const SHIM_START = 0.7 // shimmer sweep begins
const SHIM_END = 0.97 // shimmer sweep ends
const NAME_AT = 0.56 // printed name caption fades in
const RING_C = 2 * Math.PI * 15

type StrokePath = { d: string; kind: 'letter' | 'flourish' | 'dot' }

const PATHS: StrokePath[] = SIGNATURE_STROKES.flatMap((stroke) =>
  stroke.d.map((d) => ({ d, kind: stroke.kind }))
)

const strokeWidth = (kind: StrokePath['kind']) => (kind === 'dot' ? 8 : kind === 'flourish' ? 4 : 5)

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
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

export function Loader({ onExit }: { onExit: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const glowRef = useRef<SVGGElement>(null)
  const reflRef = useRef<SVGGElement>(null)
  const shimRef = useRef<SVGGElement>(null)
  const shimGradRef = useRef<SVGLinearGradientElement>(null)
  const goldGradRef = useRef<SVGLinearGradientElement>(null)
  const nibRef = useRef<SVGGElement>(null)
  const nibHaloRef = useRef<SVGCircleElement>(null)
  const hairRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  const [runId, setRunId] = useState(0)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [showName, setShowName] = useState(false)

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
    setShowName(false)
    setDoorsOpen(false)
    setRunId((n) => n + 1)
  }, [stopScratch])

  /* ---------------------------------------------------------- master loop */
  useEffect(() => {
    if (reduced) {
      // Calm fallback: the signature rests fully drawn, then we leave.
      for (const p of pathRefs.current) {
        if (!p) continue
        p.style.strokeDasharray = 'none'
        p.style.strokeDashoffset = '0'
      }
      if (glowRef.current) glowRef.current.style.opacity = '0.5'
      if (reflRef.current) reflRef.current.style.opacity = '0.3'
      if (nibRef.current) nibRef.current.style.opacity = '0'
      if (shimRef.current) shimRef.current.style.opacity = '0'
      if (hairRef.current) hairRef.current.style.transform = 'scaleX(1)'
      if (ringRef.current) ringRef.current.style.strokeDashoffset = '0'
      setShowName(true)
      const t = window.setTimeout(finish, REDUCED_MS)
      timersRef.current.push(t)
      return () => window.clearTimeout(t)
    }

    const paths = pathRefs.current.filter((p): p is SVGPathElement => !!p)
    if (paths.length === 0) {
      const t = window.setTimeout(finish, 800)
      timersRef.current.push(t)
      return () => window.clearTimeout(t)
    }

    // Measure every path so the pen travels at one constant speed.
    const lengths = paths.map((p) => {
      try {
        const len = p.getTotalLength()
        return Number.isFinite(len) && len > 0 ? len : 100
      } catch {
        return 100
      }
    })
    const total = lengths.reduce((a, b) => a + b, 0)
    const spans: { from: number; to: number; len: number }[] = []
    let acc = 0
    for (const len of lengths) {
      const from = DRAW_START + ((DRAW_END - DRAW_START) * acc) / total
      acc += len
      const to = DRAW_START + ((DRAW_END - DRAW_START) * acc) / total
      spans.push({ from, to, len })
    }
    for (let i = 0; i < paths.length; i++) {
      paths[i].style.strokeDasharray = `${lengths[i]}`
      paths[i].style.strokeDashoffset = `${lengths[i]}`
    }

    timersRef.current.push(window.setTimeout(() => setShowName(true), TOTAL_MS * NAME_AT))

    let raf = 0
    const start = performance.now()

    const frame = (now: number) => {
      if (exitedRef.current) return
      const elapsed = now - start
      const p = clamp01(elapsed / TOTAL_MS)

      // Signature draw.
      let nibX = 0
      let nibY = 0
      let nibOn = false
      for (let i = 0; i < paths.length; i++) {
        const { from, to, len } = spans[i]
        const local = clamp01((p - from) / Math.max(to - from, 1e-6))
        const eased = easeInOut(local)
        paths[i].style.strokeDashoffset = `${(len * (1 - eased)).toFixed(1)}`
        if (local > 0 && local < 1) {
          try {
            const pt = paths[i].getPointAtLength(len * local)
            nibX = pt.x
            nibY = pt.y
            nibOn = true
          } catch {
            /* keep last tip */
          }
        }
      }
      const drawP = clamp01((p - DRAW_START) / (DRAW_END - DRAW_START))

      // Pen nib follows the wet tip of the ink.
      const nib = nibRef.current
      if (nib) {
        nib.style.opacity = nibOn ? '1' : '0'
        if (nibOn) {
          nib.setAttribute('transform', `translate(${nibX.toFixed(1)} ${nibY.toFixed(1)})`)
          const flicker = 0.75 + 0.25 * Math.sin(now / 57)
          if (nibHaloRef.current) nibHaloRef.current.setAttribute('opacity', flicker.toFixed(2))
        }
      }

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

      // Pen scratch tracks the writing.
      const scratch = scratchRef.current
      if (scratch) {
        const writing = p > DRAW_START && p < DRAW_END
        scratch.update(writing ? 0.9 : 0.06, writing ? 0.4 + 0.3 * Math.sin(elapsed / 210) : 0)
      }

      if (p >= 1) {
        finish()
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(raf)
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

  const NAME = 'SAMBIT SWAIN'

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

        {/* Rising gold dust */}
        <EmberCanvas active={!reduced && !doorsOpen} />

        {/* Signature stage (slow push-in via rAF) */}
        <div ref={stageRef} className="absolute inset-0 grid place-items-center will-change-transform">
          <div className="w-[min(1180px,94vw)]">
            <svg
              viewBox="10 10 1100 440"
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
                <linearGradient id="reflFade" gradientUnits="userSpaceOnUse" x1="0" y1="298" x2="0" y2="448">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <mask id="reflMask">
                  <rect x="0" y="290" width="1120" height="170" fill="url(#reflFade)" />
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
                transform="translate(0 570) scale(1 -1)"
              >
                {PATHS.map((s, i) => (
                  <path
                    key={`refl-${i}`}
                    d={s.d}
                    fill="none"
                    stroke="#e2b76a"
                    strokeWidth={strokeWidth(s.kind)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </g>

              {/* Warm under-glow */}
              <g ref={glowRef} filter="url(#sigBlur)" opacity="0">
                {PATHS.map((s, i) => (
                  <path
                    key={`glow-${i}`}
                    d={s.d}
                    fill="none"
                    stroke="#e2b76a"
                    strokeWidth={strokeWidth(s.kind) + 7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </g>

              {/* The golden signature itself */}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {PATHS.map((s, i) => (
                  <path
                    key={`sig-${runId}-${i}`}
                    ref={(el) => {
                      pathRefs.current[i] = el
                    }}
                    d={s.d}
                    stroke="url(#sigGold)"
                    strokeWidth={strokeWidth(s.kind)}
                    style={{ filter: 'drop-shadow(0 0 6px rgb(226 183 106 / 0.65))' }}
                  />
                ))}
              </g>

              {/* Shimmer sweep */}
              <g ref={shimRef} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0">
                {PATHS.map((s, i) => (
                  <path
                    key={`shim-${i}`}
                    d={s.d}
                    stroke="url(#sigShimmer)"
                    strokeWidth={strokeWidth(s.kind) + 1.5}
                  />
                ))}
              </g>

              {/* Pen nib riding the wet tip */}
              <g ref={nibRef} opacity="0" filter="url(#nibGlow)" style={{ transition: 'opacity 180ms ease' }}>
                <circle ref={nibHaloRef} r="17" fill="#f6c86a" opacity="0.8" />
                <circle r="6" fill="#fff6e2" />
                <circle r="2.4" fill="#ffffff" />
              </g>
            </svg>

            {/* Printed name caption */}
            <div className="mt-1 text-center sm:mt-2" aria-hidden={!showName}>
              <p
                className="font-sans text-[clamp(13px,2.4vw,21px)] font-medium uppercase"
                style={{ letterSpacing: '0.55em', textIndent: '0.55em' }}
              >
                {NAME.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="inline-block bg-gradient-to-b from-[#fff6e2] via-[#e9c37c] to-[#9a7434] bg-clip-text text-transparent"
                    style={{
                      opacity: showName ? 1 : 0,
                      transform: showName ? 'translateY(0)' : 'translateY(10px)',
                      filter: showName ? 'blur(0)' : 'blur(4px)',
                      transition: `opacity 600ms ease ${i * 38}ms, transform 600ms ease ${i * 38}ms, filter 600ms ease ${i * 38}ms`
                    }}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
              </p>
              <div
                className="mx-auto mt-3 h-px w-40 bg-gradient-to-r from-transparent via-[#e2b76a]/80 to-transparent sm:mt-4 sm:w-56"
                style={{
                  opacity: showName ? 1 : 0,
                  transform: showName ? 'scaleX(1)' : 'scaleX(0.3)',
                  transition: 'opacity 700ms ease 500ms, transform 900ms ease 500ms'
                }}
              />
              <p
                className="mt-3 font-mono text-[9px] uppercase tracking-[0.32em] text-white/40 sm:mt-4 sm:text-[10px]"
                style={{
                  opacity: showName ? 1 : 0,
                  transform: showName ? 'translateY(0)' : 'translateY(6px)',
                  transition: 'opacity 700ms ease 750ms, transform 700ms ease 750ms'
                }}
              >
                Software Developer · Interface Designer
              </p>
            </div>
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
