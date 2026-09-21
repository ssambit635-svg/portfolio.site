import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { SplitDoors } from './fx/SplitDoors'
import { GradientField } from './fx/GradientField'
import { onPointer } from '../lib/pointer'
import { createPenScratch, playStamp, playWhoosh } from '../lib/audio'
import { prefersReducedMotion } from '../lib/motion'
import { SEAL, SIGNATURE_PATHS, SIGNATURE_STROKES, SIGNATURE_VIEWBOX } from './loader/signature'

/**
 * The opening: an Italian chancery signature of "Sambit Swain" writes itself
 * in ink — a gold-nibbed gradient stroke, a chisel shadow for pen thickness,
 * a glowing nib that hunts along the freshly-laid line, a sheen that sweeps
 * the finished signature — then the wax seal is stamped and the doors part.
 *
 * Controls: skip (with a live progress ring), replay the signature, and an
 * opt-in sound toggle for the pen scratch. Keyboard: Esc/Enter skip, R replay.
 */

const WRITE_SECONDS = 2.6 // pen time for the whole signature
const START_DELAY = 0.55 // let the backdrop bloom first
const HOLD_AFTER_WRITE = 1.15 // sheen + seal, then the doors

/** Flat list of stroke kinds, index-aligned with SIGNATURE_PATHS. */
const PATH_KINDS = SIGNATURE_STROKES.flatMap((stroke) => stroke.d.map(() => stroke.kind))
const SWASH_WEIGHT = 1.4

type InkGroup = {
  layers: SVGPathElement[]
  len: number
  delay: number
  dur: number
  kind: (typeof PATH_KINDS)[number]
}

export function Loader({ onExit }: { onExit: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nibRef = useRef<HTMLDivElement>(null)
  const bleedRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)

  const [runId, setRunId] = useState(0)
  const [written, setWritten] = useState(false)
  const [sealed, setSealed] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const soundRef = useRef(soundOn)
  soundRef.current = soundOn
  const scratchRef = useRef<ReturnType<typeof createPenScratch> | null>(null)
  const exitedRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const rafRef = useRef(0)

  const reduced = useMemo(() => prefersReducedMotion(), [runId])

  const stopScratch = useCallback(() => {
    scratchRef.current?.stop()
    scratchRef.current = null
  }, [])

  const finish = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    stopScratch()
    if (soundRef.current) playWhoosh(0.7, 0.11)
    setDoorsOpen(true)
  }, [stopScratch])

  const replay = useCallback(() => {
    exitedRef.current = false
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    cancelAnimationFrame(rafRef.current)
    stopScratch()
    setWritten(false)
    setSealed(false)
    setDoorsOpen(false)
    setRunId((n) => n + 1)
  }, [stopScratch])

  /* ------------------------------------------------------------------- pen */
  useEffect(() => {
    const svg = svgRef.current
    const wrap = wrapRef.current
    if (!svg || !wrap) return

    const inks = Array.from(svg.querySelectorAll<SVGPathElement>('path[data-ink]'))
    const chisels = Array.from(svg.querySelectorAll<SVGPathElement>('path[data-chisel]'))
    const highlights = Array.from(svg.querySelectorAll<SVGPathElement>('path[data-highlight]'))
    if (!inks.length) return

    const geometry = typeof SVGPathElement !== 'undefined' && typeof inks[0]?.getTotalLength === 'function'

    const [vbX, vbY, vbW] = SIGNATURE_VIEWBOX.split(/\s+/).map(Number)
    const timers: number[] = []
    timersRef.current = timers

    let plan: InkGroup[] = []
    let total = START_DELAY
    let penMoving = false

    if (geometry && !reduced) {
      const lengths = inks.map((path, i) => {
        if (PATH_KINDS[i] === 'dot') return 0
        try {
          return Math.max(path.getTotalLength(), 1)
        } catch {
          return 1
        }
      })

      const inkLength = lengths.reduce(
        (sum, len, i) => sum + len * (PATH_KINDS[i] === 'flourish' ? SWASH_WEIGHT : 1),
        0
      )
      const pace = inkLength / WRITE_SECONDS

      lengths.forEach((len, i) => {
        const kind = PATH_KINDS[i]
        const isDot = kind === 'dot'
        const dur = isDot ? 0.16 : Math.max((len * (kind === 'flourish' ? SWASH_WEIGHT : 1)) / pace, 0.05)
        const layers = [inks[i], chisels[i], highlights[i]].filter(Boolean) as SVGPathElement[]

        layers.forEach((layer) => {
          if (isDot) {
            layer.style.opacity = '0'
            layer.style.transition = `opacity 220ms ease-out ${total.toFixed(3)}s`
          } else {
            layer.style.strokeDasharray = `${len}`
            layer.style.strokeDashoffset = `${len}`
            layer.style.transition = `stroke-dashoffset ${dur.toFixed(
              3
            )}s cubic-bezier(0.42, 0.06, 0.36, 0.98) ${total.toFixed(3)}s`
          }
        })

        plan.push({ layers, len, delay: total, dur, kind })
        total += isDot ? dur : dur * 0.97
      })

      const totalSeconds = total + HOLD_AFTER_WRITE

      requestAnimationFrame(() => {
        plan.forEach((group) => {
          group.layers.forEach((layer) => {
            if (group.kind === 'dot') layer.style.opacity = '1'
            else layer.style.strokeDashoffset = '0'
          })
        })
      })

      /* The nib hunts along whichever stroke the pen is on. */
      const started = performance.now()
      const canTrack = typeof inks[0].getPointAtLength === 'function'

      const track = (now: number) => {
        const elapsed = (now - started) / 1000
        const nib = nibRef.current
        const bleed = bleedRef.current
        const ring = ringRef.current

        if (ring) {
          const circumference = 2 * Math.PI * 15
          const p = Math.min(elapsed / totalSeconds, 1)
          ring.style.strokeDashoffset = `${(circumference * (1 - p)).toFixed(2)}`
        }

        if (!canTrack || !nib) {
          if (elapsed < totalSeconds) rafRef.current = requestAnimationFrame(track)
          return
        }

        const active = plan.find((g) => g.kind !== 'dot' && elapsed >= g.delay && elapsed <= g.delay + g.dur)
        const rect = svg.getBoundingClientRect()
        const wrapRect = wrap.getBoundingClientRect()

        if (!active || rect.width < 4) {
          nib.style.opacity = '0'
          if (bleed) bleed.style.opacity = '0'
          penMoving = false
          scratchRef.current?.update(0, 0)
          if (elapsed < totalSeconds) rafRef.current = requestAnimationFrame(track)
          return
        }

        const t = Math.min((elapsed - active.delay) / active.dur, 1)
        let point = { x: 0, y: 0 }
        try {
          point = active.layers[0].getPointAtLength(t * active.len)
        } catch {
          point = { x: 0, y: 0 }
        }

        const scale = rect.width / vbW
        const x = rect.left - wrapRect.left + (point.x - vbX) * scale
        const y = rect.top - wrapRect.top + (point.y - vbY) * scale
        const speed = Math.min(active.len / Math.max(active.dur, 0.001) / 430, 1)

        nib.style.opacity = '1'
        nib.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${(
          0.85 +
          speed * 0.55
        ).toFixed(3)})`

        if (bleed) {
          bleed.style.opacity = '0.55'
          bleed.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${(
            1.3 +
            speed * 1.8
          ).toFixed(3)})`
        }

        if (soundRef.current && !penMoving) {
          penMoving = true
          if (!scratchRef.current) scratchRef.current = createPenScratch()
        }
        scratchRef.current?.update(1, speed)

        rafRef.current = requestAnimationFrame(track)
      }
      rafRef.current = requestAnimationFrame(track)

      timers.push(window.setTimeout(() => setWritten(true), (total + 0.1) * 1000))
      timers.push(
        window.setTimeout(
          () => {
            setSealed(true)
            stopScratch()
            if (soundRef.current) playStamp(0.2)

            // Park the seal ripple exactly over the wax, in screen space.
            const ripple = rippleRef.current
            const rect = svg.getBoundingClientRect()
            const wrapRect = wrap.getBoundingClientRect()
            if (ripple && rect.width > 4) {
              const scale = rect.width / vbW
              ripple.style.left = `${rect.left - wrapRect.left + (SEAL.x - vbX) * scale}px`
              ripple.style.top = `${rect.top - wrapRect.top + (SEAL.y - vbY) * scale}px`
            }
          },
          (total + 0.55) * 1000
        )
      )
      timers.push(window.setTimeout(finish, totalSeconds * 1000))
    } else {
      /* No SVG geometry API (jsdom) or reduced motion: show it complete. */
      inks.concat(chisels, highlights).forEach((path) => {
        path.style.transition = reduced ? 'none' : 'opacity 700ms ease-out'
        path.style.strokeDasharray = 'none'
        path.style.strokeDashoffset = '0'
        path.style.opacity = reduced ? '1' : '0'
      })
      if (!reduced) {
        requestAnimationFrame(() =>
          inks.concat(chisels, highlights).forEach((path) => {
            path.style.opacity = '1'
          })
        )
      }

      total = reduced ? 0.4 : START_DELAY + 0.9
      const totalSeconds = total + (reduced ? 0.35 : HOLD_AFTER_WRITE)

      const started = performance.now()
      const tickRing = () => {
        const ring = ringRef.current
        const elapsed = (performance.now() - started) / 1000
        if (ring) {
          const circumference = 2 * Math.PI * 15
          ring.style.strokeDashoffset = `${(circumference * (1 - Math.min(elapsed / totalSeconds, 1))).toFixed(2)}`
        }
        if (elapsed < totalSeconds) rafRef.current = requestAnimationFrame(tickRing)
      }
      rafRef.current = requestAnimationFrame(tickRing)

      timers.push(window.setTimeout(() => setWritten(true), total * 1000))
      timers.push(window.setTimeout(() => setSealed(true), (total + 0.25) * 1000))
      timers.push(window.setTimeout(finish, totalSeconds * 1000))
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      cancelAnimationFrame(rafRef.current)
      plan = []
    }
  }, [runId, reduced, finish, stopScratch])

  /* --------------------------------------------------------------- sound */
  useEffect(() => {
    if (!soundOn) stopScratch()
    return () => stopScratch()
  }, [soundOn, stopScratch])

  /* ---------------------------------------------------- pointer parallax */
  useEffect(() => {
    if (reduced) return
    return onPointer((p) => {
      const stage = stageRef.current
      if (stage) {
        stage.style.transform = `translate3d(${(p.x * -10).toFixed(2)}px, ${(p.y * -7).toFixed(2)}px, 0)`
      }
    })
  }, [reduced])

  /* ------------------------------------------------------------ keyboard */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') finish()
      if (event.key.toLowerCase() === 'r' && !event.metaKey && !event.ctrlKey) replay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish, replay])

  return (
    <>
      <div
        className="fixed inset-0 overflow-hidden bg-[#04040a]"
        style={{ zIndex: 100 }}
        role="status"
        aria-live="polite"
        aria-label="Intro: the signature of Sambit Swain"
      >
        <GradientField preset="maison" />

        {/* thin gold plate frame */}
        <div
          className="pointer-events-none absolute inset-4 rounded-[2px] sm:inset-8"
          style={{ border: '1px solid rgb(226 183 106 / 0.18)', zIndex: 5 }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-[22px] sm:inset-[38px]"
          style={{ border: '1px solid rgb(255 255 255 / 0.05)', zIndex: 5 }}
          aria-hidden="true"
        />

        <div
          ref={stageRef}
          className="relative flex h-full w-full flex-col items-center justify-center px-6 will-change-transform"
          style={{ zIndex: 10 }}
        >
          <div ref={wrapRef} className="relative flex flex-col items-center">
            <svg
              ref={svgRef}
              viewBox={SIGNATURE_VIEWBOX}
              className="w-[min(88vw,720px)] overflow-visible"
              aria-hidden="true"
              style={{ filter: 'drop-shadow(0 26px 44px rgb(0 0 0 / 0.6))' }}
            >
              <defs>
                <linearGradient id="inkGold" x1="0%" y1="0%" x2="100%" y2="16%">
                  <stop offset="0%" stopColor="#f6e3bd" />
                  <stop offset="24%" stopColor="#e2b76a" />
                  <stop offset="50%" stopColor="#fff6e2" />
                  <stop offset="74%" stopColor="#d69884" />
                  <stop offset="100%" stopColor="#f0cd92" />
                </linearGradient>
                <linearGradient id="inkChisel" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6d4c1c" />
                  <stop offset="100%" stopColor="#3a2a4d" />
                </linearGradient>
                <radialGradient id="sealGold" cx="34%" cy="26%" r="80%">
                  <stop offset="0%" stopColor="#ffeec9" />
                  <stop offset="36%" stopColor="#e2b76a" />
                  <stop offset="72%" stopColor="#a9762f" />
                  <stop offset="100%" stopColor="#543514" />
                </radialGradient>
              </defs>

              {/* The italic hand: sheared 8° for the chancery slant. */}
              <g transform="skewX(-8)">
                <g
                  transform="translate(3.5, 6)"
                  stroke="url(#inkChisel)"
                  strokeWidth={7}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.5}
                >
                  {SIGNATURE_PATHS.map((d, i) => (
                    <path key={`chisel-${i}`} d={d} data-chisel="" />
                  ))}
                </g>

                <g
                  stroke="url(#inkGold)"
                  strokeWidth={4.6}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 0 16px rgb(226 183 106 / 0.42))' }}
                >
                  {SIGNATURE_PATHS.map((d, i) => (
                    <path key={`ink-${i}`} d={d} data-ink="" />
                  ))}
                </g>

                <g
                  transform="translate(-0.9, -1.5)"
                  stroke="#fff8e8"
                  strokeWidth={1.1}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.45}
                >
                  {SIGNATURE_PATHS.map((d, i) => (
                    <path key={`hi-${i}`} d={d} data-highlight="" />
                  ))}
                </g>
              </g>

              {/* wax seal */}
              <g
                style={{
                  transformOrigin: `${SEAL.x}px ${SEAL.y}px`,
                  transform: sealed ? 'scale(1) rotate(0deg)' : 'scale(2.6) rotate(-30deg)',
                  opacity: sealed ? 1 : 0,
                  transition: reduced
                    ? 'opacity 200ms linear'
                    : 'transform 640ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease-out'
                }}
              >
                <circle
                  cx={SEAL.x}
                  cy={SEAL.y}
                  r={SEAL.r}
                  fill="url(#sealGold)"
                  stroke="rgb(255 240 210 / 0.3)"
                  strokeWidth={1}
                  style={{ filter: 'drop-shadow(0 12px 24px rgb(0 0 0 / 0.65))' }}
                />
                <circle
                  cx={SEAL.x}
                  cy={SEAL.y}
                  r={SEAL.r - 6.5}
                  fill="none"
                  stroke="rgb(58 34 12 / 0.4)"
                  strokeWidth={1.2}
                />
                <text
                  x={SEAL.x}
                  y={SEAL.y + 13}
                  textAnchor="middle"
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontStyle="italic"
                  fontWeight={600}
                  fontSize={36}
                  fill="#3a230f"
                  opacity={0.85}
                >
                  SS
                </text>
              </g>
            </svg>

            {/* sheen sweeping the finished signature */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                opacity: written ? 1 : 0,
                transition: 'opacity 700ms ease-out',
                mixBlendMode: 'overlay'
              }}
              aria-hidden="true"
            >
              <div
                className="absolute inset-y-0 -left-1/3 w-1/3"
                style={{
                  background:
                    'linear-gradient(100deg, transparent, rgb(255 246 226 / 0.9) 45%, rgb(226 183 106 / 0.55) 55%, transparent)',
                  filter: 'blur(7px)',
                  animation:
                    written && !reduced ? 'sheen-sweep 2.8s cubic-bezier(0.4,0,0.2,1) 0.25s infinite' : undefined
                }}
              />
            </div>

            {/* ink bleed + nib */}
            <div
              ref={bleedRef}
              className="pointer-events-none absolute left-0 top-0 h-7 w-7 rounded-full opacity-0"
              style={{
                background: 'radial-gradient(circle, rgb(226 183 106 / 0.6), transparent 68%)',
                filter: 'blur(7px)',
                transition: 'opacity 260ms ease-out'
              }}
              aria-hidden="true"
            />
            <div
              ref={nibRef}
              className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 rounded-full opacity-0"
              style={{
                background: 'radial-gradient(circle at 34% 30%, #fffdf6, #e2b76a 58%, #a9762f)',
                boxShadow: '0 0 18px 6px rgb(226 183 106 / 0.55)',
                transition: 'opacity 220ms ease-out'
              }}
              aria-hidden="true"
            />

            {/* seal ripple, parked over the wax in screen space */}
            <span
              key={`ripple-${runId}`}
              ref={rippleRef}
              className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
              style={{
                border: '1px solid rgb(226 183 106 / 0.6)',
                animation: sealed && !reduced ? 'ring-out 1.5s ease-out forwards' : undefined
              }}
              aria-hidden="true"
            />
          </div>

          {/* caption */}
          <div
            className="mt-10 flex flex-col items-center gap-3 sm:mt-14"
            style={{
              opacity: written ? 1 : 0,
              transform: written ? 'translateY(0)' : 'translateY(12px)',
              transition: reduced
                ? 'opacity 200ms linear'
                : 'opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1)'
            }}
          >
            <div className="hairline-gold h-px w-40 opacity-70 sm:w-64" aria-hidden="true" />
            <p className="font-display text-base italic tracking-wide text-white/80 sm:text-lg">firma autografa</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 sm:text-[11px]">
              sambit swain · software developer · mmxxvi
            </p>
          </div>
        </div>

        {/* controls */}
        <div
          className="absolute bottom-6 right-6 flex items-center gap-3 sm:bottom-10 sm:right-10"
          style={{ zIndex: 20 }}
        >
          <button
            type="button"
            onClick={() => setSoundOn((s) => !s)}
            data-sfx="hover"
            aria-label={soundOn ? 'Mute the pen sound' : 'Play the pen sound'}
            aria-pressed={soundOn}
            className="cursor-target grid h-11 w-11 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105"
            style={{
              borderColor: soundOn ? 'rgb(226 183 106 / 0.6)' : 'rgb(255 255 255 / 0.16)',
              background: soundOn ? 'rgb(226 183 106 / 0.12)' : 'rgb(255 255 255 / 0.04)',
              color: soundOn ? '#f6e3bd' : 'rgb(255 255 255 / 0.6)'
            }}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={replay}
            data-sfx="hover"
            aria-label="Replay the signature"
            className="cursor-target grid h-11 w-11 place-items-center rounded-full border text-white/60 backdrop-blur-md transition-all duration-500 hover:-rotate-90 hover:text-white"
            style={{ borderColor: 'rgb(255 255 255 / 0.16)', background: 'rgb(255 255 255 / 0.04)' }}
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={finish}
            data-sfx="hover"
            aria-label="Skip the intro"
            className="cursor-target group relative grid h-14 w-14 place-items-center rounded-full backdrop-blur-md transition-transform duration-300 hover:scale-105"
            style={{ background: 'rgb(255 255 255 / 0.04)' }}
          >
            <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
              <defs>
                <linearGradient id="skipRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff6e2" />
                  <stop offset="60%" stopColor="#e2b76a" />
                  <stop offset="100%" stopColor="#d69884" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="1.5" />
              <circle
                ref={ringRef}
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="url(#skipRing)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={2 * Math.PI * 15}
                style={{ filter: 'drop-shadow(0 0 6px rgb(226 183 106 / 0.6))' }}
              />
            </svg>
            <X className="relative h-4 w-4 text-white/70 transition-colors duration-300 group-hover:text-white" />
          </button>
        </div>

        <div
          className="absolute bottom-8 left-6 font-mono text-[10px] uppercase tracking-[0.28em] text-white/25 sm:bottom-11 sm:left-10"
          style={{ zIndex: 20 }}
          aria-hidden="true"
        >
          esc — skip &nbsp;·&nbsp; r — replay
        </div>
      </div>

      {/* the doors part on top of the loader, revealing the entry gate */}
      {doorsOpen && <SplitDoors open onDone={onExit} bg="#05050c" zIndex={110} durationMs={1250} />}
    </>
  )
}
