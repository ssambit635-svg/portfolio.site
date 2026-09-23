import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { SplitDoors } from './fx/SplitDoors'
import { GradientField } from './fx/GradientField'
import { onPointer } from '../lib/pointer'
import { playWhoosh } from '../lib/audio'
import { prefersReducedMotion } from '../lib/motion'

/**
 * Golden signature loader.
 *
 * Replaces the previous hand-drawn SVG ink loader with the uploaded
 * golden signature animation video (public/golden-signature.mp4).
 * Keeps the same maison framing, progress ring, skip/replay controls,
 * pointer parallax and the final SplitDoors reveal.
 */

const HOLD_AFTER_VIDEO = 0.9 // seconds to admire the finished signature before doors
const FALLBACK_DURATION = 3.2 // if video metadata is missing

export function Loader({ onExit }: { onExit: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)

  const [runId, setRunId] = useState(0)
  const [written, setWritten] = useState(false)
  const [sealed, setSealed] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  const exitedRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const rafRef = useRef(0)

  const reduced = useMemo(() => prefersReducedMotion(), [runId])

  const finish = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    if (soundOn) playWhoosh(0.7, 0.11)
    setDoorsOpen(true)
  }, [soundOn])

  const replay = useCallback(() => {
    exitedRef.current = false
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    cancelAnimationFrame(rafRef.current)

    setWritten(false)
    setSealed(false)
    setDoorsOpen(false)
    setVideoReady(false)
    setHasError(false)
    setRunId((n) => n + 1)

    const v = videoRef.current
    if (v) {
      try {
        v.currentTime = 0
        void v.play()
      } catch {
        /* autoplay may be blocked – user can click replay again */
      }
    }
  }, [])

  /* ------------------------------------------------ video lifecycle */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const timers = timersRef.current

    const updateRing = (progress: number) => {
      const ring = ringRef.current
      if (!ring) return
      const circumference = 2 * Math.PI * 15
      const clamped = Math.min(Math.max(progress, 0), 1)
      ring.style.strokeDashoffset = `${(circumference * (1 - clamped)).toFixed(2)}`
    }

    const onLoaded = () => {
      setVideoReady(true)
      // Autoplay – muted allows it in most browsers
      video.muted = !soundOn
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* autoplay blocked – keep poster and wait for user interaction */
        })
      }
    }

    const onTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) return
      const p = video.currentTime / video.duration
      updateRing(p)
    }

    const onEnded = () => {
      updateRing(1)
      setWritten(true)
      // small delay for seal ripple, then doors
      timers.push(
        window.setTimeout(() => {
          setSealed(true)
          const ripple = rippleRef.current
          const wrap = wrapRef.current
          const rect = video.getBoundingClientRect()
          if (ripple && wrap && rect.width > 4) {
            const wrapRect = wrap.getBoundingClientRect()
            // park ripple at bottom-right of video (where seal would be) – centered
            ripple.style.left = `${rect.left - wrapRect.left + rect.width * 0.78}px`
            ripple.style.top = `${rect.top - wrapRect.top + rect.height * 0.72}px`
          }
        }, 220)
      )
      timers.push(window.setTimeout(finish, HOLD_AFTER_VIDEO * 1000))
    }

    const onError = () => {
      setHasError(true)
      setVideoReady(true)
      // Fallback timeline if video fails
      const total = reduced ? 0.8 : FALLBACK_DURATION
      let start: number | null = null
      const tick = (now: number) => {
        if (start === null) start = now
        const elapsed = (now - start) / 1000
        updateRing(Math.min(elapsed / total, 1))
        if (elapsed < total) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setWritten(true)
          setSealed(true)
          finish()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('canplay', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)

    // If metadata already loaded (replay)
    if (video.readyState >= 2) {
      onLoaded()
    }

    // Fallback ring animation using rAF if timeupdate is sparse
    let lastTime = 0
    const rafLoop = (now: number) => {
      if (now - lastTime > 80) {
        lastTime = now
        if (video.duration && !Number.isNaN(video.duration) && !video.paused && !video.ended) {
          updateRing(video.currentTime / video.duration)
        }
      }
      rafRef.current = requestAnimationFrame(rafLoop)
    }
    rafRef.current = requestAnimationFrame(rafLoop)

    return () => {
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('canplay', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
      timers.forEach((t) => window.clearTimeout(t))
      cancelAnimationFrame(rafRef.current)
    }
  }, [runId, reduced, finish, soundOn])

  /* ------------------------------------------------ sound toggle -> video muted */
  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = !soundOn
  }, [soundOn])

  /* ------------------------------------------------ pointer parallax */
  useEffect(() => {
    if (reduced) return
    return onPointer((p) => {
      const stage = stageRef.current
      if (stage) {
        stage.style.transform = `translate3d(${(p.x * -10).toFixed(2)}px, ${(p.y * -7).toFixed(2)}px, 0)`
      }
    })
  }, [reduced])

  /* ------------------------------------------------ keyboard */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') finish()
      if (event.key.toLowerCase() === 'r' && !event.metaKey && !event.ctrlKey) replay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish, replay])

  const circumference = 2 * Math.PI * 15

  return (
    <>
      <div
        className="fixed inset-0 overflow-hidden bg-[#04040a]"
        style={{ zIndex: 100 }}
        role="status"
        aria-live="polite"
        aria-label="Intro: golden signature animation"
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
            {/* video container */}
            <div
              className="relative w-[min(88vw,780px)] overflow-hidden rounded-[2px]"
              style={{
                aspectRatio: '16 / 9',
                background: 'radial-gradient(120% 120% at 50% 50%, rgb(20 18 24 / 0.9), rgb(4 4 10) 70%)',
                boxShadow: '0 26px 64px rgb(0 0 0 / 0.65), 0 0 0 1px rgb(226 183 106 / 0.12), 0 0 48px rgb(226 183 106 / 0.18)',
                filter: written ? 'drop-shadow(0 0 22px rgb(226 183 106 / 0.28))' : undefined
              }}
            >
              {/* subtle vignette */}
              <div
                className="pointer-events-none absolute inset-0 z-[2]"
                style={{
                  background:
                    'radial-gradient(90% 80% at 50% 50%, transparent 60%, rgb(4 4 10 / 0.55) 100%)'
                }}
                aria-hidden="true"
              />

              <video
                key={runId}
                ref={videoRef}
                className="relative z-[1] h-full w-full object-contain"
                playsInline
                muted={!soundOn}
                autoPlay
                preload="auto"
                // poster fallback could be added if you have a frame
                // The public path is stable for both dev and build
                src="/golden-signature.mp4"
                aria-hidden="true"
                style={{
                  opacity: videoReady ? 1 : 0,
                  transition: 'opacity 600ms ease-out',
                  filter: 'contrast(1.08) brightness(1.05) saturate(1.1)'
                }}
              />

              {/* loading shimmer while video buffers */}
              {!videoReady && !hasError && (
                <div className="absolute inset-0 z-[3] grid place-items-center bg-[#08070c]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-[1px] w-32 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full w-full origin-left"
                        style={{
                          background: 'linear-gradient(90deg, #f6e3bd, #e2b76a, #fff6e2)',
                          animation: 'shimmer-line 1.2s ease-in-out infinite',
                          backgroundSize: '200% 100%'
                        }}
                      />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
                      preparing seal
                    </p>
                  </div>
                </div>
              )}

              {/* error fallback – keep maison aesthetic */}
              {hasError && (
                <div className="absolute inset-0 z-[3] grid place-items-center bg-[#08070c] p-8">
                  <div className="text-center">
                    <p className="font-display italic text-3xl text-white/80">Sambit Swain</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
                      golden signature unavailable — entering
                    </p>
                  </div>
                </div>
              )}

              {/* sheen sweeping after finish */}
              <div
                className="pointer-events-none absolute inset-0 z-[4] overflow-hidden"
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
            </div>

            {/* seal ripple – re-used for golden moment */}
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
              opacity: written ? 1 : 0.65,
              transform: written ? 'translateY(0)' : 'translateY(12px)',
              transition: reduced
                ? 'opacity 200ms linear'
                : 'opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1)'
            }}
          >
            <div className="hairline-gold h-px w-40 opacity-70 sm:w-64" aria-hidden="true" />
            <p className="font-display text-base italic tracking-wide text-white/80 sm:text-lg">firma autografa · golden</p>
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
            aria-label={soundOn ? 'Mute video' : 'Unmute video'}
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
            aria-label="Replay the golden signature"
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
                <linearGradient id="skipRingGold" x1="0" y1="0" x2="1" y2="1">
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
                stroke="url(#skipRingGold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
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
