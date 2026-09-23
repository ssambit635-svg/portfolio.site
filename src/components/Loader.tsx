import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { SplitDoors } from './fx/SplitDoors'
import { playWhoosh } from '../lib/audio'
import { prefersReducedMotion } from '../lib/motion'

/**
 * Fullscreen Golden Signature Loader.
 * Plays public/golden-signature.mp4 borderless across the screen
 * with smooth fade-in, autoplay handling, progress ring, skip & replay.
 */

const HOLD_AFTER_VIDEO = 0.5 // seconds to linger on the completed signature
const FALLBACK_DURATION = 3.2

export function Loader({ onExit }: { onExit: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  const [runId, setRunId] = useState(0)
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

    setDoorsOpen(false)
    setVideoReady(false)
    setHasError(false)
    setRunId((n) => n + 1)

    const v = videoRef.current
    if (v) {
      try {
        v.currentTime = 0
        const p = v.play()
        if (p && typeof p.catch === 'function') {
          p.catch(() => {})
        }
      } catch {
        /* autoplay handling */
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
      video.muted = !soundOn
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* browser policy blocked autoplay */
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
      timers.push(window.setTimeout(finish, HOLD_AFTER_VIDEO * 1000))
    }

    const onError = () => {
      setHasError(true)
      setVideoReady(true)
      const total = reduced ? 0.8 : FALLBACK_DURATION
      let start: number | null = null
      const tick = (now: number) => {
        if (start === null) start = now
        const elapsed = (now - start) / 1000
        updateRing(Math.min(elapsed / total, 1))
        if (elapsed < total) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
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

    if (video.readyState >= 2) {
      onLoaded()
    }

    // Backup rAF ticker for smooth ring progress
    let lastTime = 0
    const rafLoop = (now: number) => {
      if (now - lastTime > 60) {
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

  /* ------------------------------------------------ sound toggle */
  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = !soundOn
  }, [soundOn])

  /* ------------------------------------------------ keyboard shortcuts */
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
        className="fixed inset-0 overflow-hidden bg-black"
        style={{ zIndex: 100 }}
        role="status"
        aria-live="polite"
        aria-label="Loading signature"
      >
        {/* Fullscreen signature video without bezels or outer box borders */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            key={runId}
            ref={videoRef}
            className="h-full w-full object-contain"
            playsInline
            muted={!soundOn}
            autoPlay
            preload="auto"
            src="/golden-signature.mp4"
            aria-hidden="true"
            style={{
              opacity: videoReady ? 1 : 0,
              transition: 'opacity 500ms ease-in-out'
            }}
          />
        </div>

        {/* Loading shimmer fallback */}
        {!videoReady && !hasError && (
          <div className="absolute inset-0 z-[2] grid place-items-center bg-black">
            <div className="h-[2px] w-32 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-full origin-left"
                style={{
                  background: 'linear-gradient(90deg, #f6e3bd, #e2b76a, #fff6e2)',
                  animation: 'shimmer-line 1.2s ease-in-out infinite',
                  backgroundSize: '200% 100%'
                }}
              />
            </div>
          </div>
        )}

        {/* Error fallback */}
        {hasError && (
          <div className="absolute inset-0 z-[2] grid place-items-center bg-black p-8 text-center">
            <p className="font-display italic text-3xl text-white/90">Sambit Swain</p>
          </div>
        )}

        {/* Subtle controls: Mute, Replay, Skip */}
        <div
          className="absolute bottom-6 right-6 flex items-center gap-3 sm:bottom-8 sm:right-8"
          style={{ zIndex: 20 }}
        >
          <button
            type="button"
            onClick={() => setSoundOn((s) => !s)}
            data-sfx="hover"
            aria-label={soundOn ? 'Mute audio' : 'Unmute audio'}
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
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                style={{ filter: 'drop-shadow(0 0 4px rgba(226, 183, 106, 0.6))' }}
              />
            </svg>
            <X className="relative h-4 w-4 text-white/70 transition-colors group-hover:text-white" />
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div
          className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 sm:bottom-8 sm:left-8"
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
