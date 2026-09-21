import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Volume2, VolumeX } from 'lucide-react'
import { FocusName } from './fx/FocusName'
import { WaveCanvas } from './fx/WaveCanvas'
import { GradientField } from './fx/GradientField'
import { TextScramble } from './fx/TextScramble'
import { onPointer } from '../lib/pointer'
import { prefersReducedMotion } from '../lib/motion'
import { useSound } from '../context/SoundContext'
import { playGlitch } from '../lib/audio'
import { home, profile } from '../lib/site'

/**
 * Entry gate. The name snaps between rack-focus frames over a deep gradient
 * field, the whole plate tilts a few degrees toward the pointer, and two
 * choices arrive: enter with sound, or enter in silence.
 *
 * Keyboard: Enter = with sound, S = silent.
 */
export function EnterScreen({ onEnter }: { onEnter: () => void }) {
  const { setSoundEnabled } = useSound()
  const [showButtons, setShowButtons] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [choice, setChoice] = useState<'sound' | 'silent' | null>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const leavingRef = useRef(false)

  useEffect(() => {
    // Fallback reveal in case the focus animation's first cycle is slow.
    const revealTimer = window.setTimeout(() => setShowButtons(true), 2600)
    return () => window.clearTimeout(revealTimer)
  }, [])

  /* The plate leans toward the pointer — small, expensive-looking. */
  useEffect(() => {
    if (prefersReducedMotion()) return
    return onPointer((p) => {
      const plate = plateRef.current
      if (!plate) return
      plate.style.transform = `perspective(1200px) rotateY(${(p.x * 3.4).toFixed(
        2
      )}deg) rotateX(${(-p.y * 2.6).toFixed(2)}deg) translate3d(${(p.x * 8).toFixed(
        2
      )}px, ${(p.y * 6).toFixed(2)}px, 0)`
    })
  }, [])

  const handleEnter = useCallback(
    (withSound: boolean) => {
      if (leavingRef.current) return
      leavingRef.current = true
      setSoundEnabled(withSound)
      setChoice(withSound ? 'sound' : 'silent')
      // Play directly — the context state hasn't flushed yet at this moment.
      if (withSound) playGlitch()
      setLeaving(true)
      window.setTimeout(onEnter, withSound ? 480 : 360)
    },
    [onEnter, setSoundEnabled]
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!showButtons) return
      if (event.key === 'Enter') handleEnter(true)
      if (event.key.toLowerCase() === 's') handleEnter(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showButtons, handleEnter])

  const buttonBase =
    'cursor-target sheen-host group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-500'

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#05060c] p-4 text-white transition-all duration-700 ${
        leaving ? 'scale-[1.04] opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      <GradientField preset="atelier" />

      {/* the beam-fan shader rides on top of the gradient field, screened in
          so the gate keeps its original light-throw without losing the ink */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 4 }} aria-hidden="true">
        <WaveCanvas
          variant="enter"
          bg={[0, 0, 0]}
          wave={[0.62, 0.55, 0.42]}
          aurora={{
            a: [0.2, 0.16, 0.36] as [number, number, number],
            b: [0.28, 0.19, 0.16] as [number, number, number],
            c: [0.1, 0.22, 0.24] as [number, number, number],
            strength: 0.45
          }}
          className="h-full w-full opacity-45 mix-blend-screen"
        />
      </div>

      {/* editorial rules top and bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgb(226 183 106 / 0.6) 30%, rgb(255 246 226 / 0.9) 50%, rgb(122 176 165 / 0.5) 70%, transparent)',
          zIndex: 6
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-40"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgb(214 152 132 / 0.6) 40%, rgb(226 183 106 / 0.7) 60%, transparent)',
          zIndex: 6
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/25 lg:block"
        style={{ zIndex: 6, writingMode: 'vertical-rl' }}
        aria-hidden="true"
      >
        portfolio · mmxxvi
      </div>
      <div
        className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/25 lg:block"
        style={{ zIndex: 6, writingMode: 'vertical-rl' }}
        aria-hidden="true"
      >
        {profile.location}
      </div>

      <div
        ref={plateRef}
        className="relative flex w-full flex-col items-center will-change-transform"
        style={{ zIndex: 10 }}
      >
        <div
          className="mb-8 font-mono text-[10px] uppercase tracking-[0.5em] text-white/40 transition-opacity duration-1000 sm:text-[11px]"
          style={{ opacity: showButtons ? 1 : 0 }}
        >
          <TextScramble text={home.kicker} />
        </div>

        <div className="mb-4 flex w-full justify-center">
          <h1 className="sr-only">
            {profile.name} — {profile.role}
          </h1>
          <FocusName
            words={[profile.first, profile.last]}
            start
            holdMs={1400}
            onCycle={() => setShowButtons(true)}
            className="font-display text-6xl font-semibold italic tracking-tight sm:text-8xl"
            frameColor="rgb(246 227 189 / 0.9)"
            glowColor="rgb(226 183 106 / 0.45)"
          />
        </div>

        <p
          className="mb-12 max-w-md text-center text-sm leading-relaxed text-white/50 transition-all duration-1000 sm:text-base"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'translateY(0)' : 'translateY(8px)'
          }}
        >
          {profile.role}. A monochrome study in motion, shaders and restraint —
          <span className="font-display italic text-white/70"> choose how you enter.</span>
        </p>

        <div
          className={`flex flex-col items-center gap-4 transition-all duration-1000 sm:flex-row sm:gap-6 ${
            showButtons ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={() => handleEnter(true)}
            data-sfx="hover"
            className={buttonBase}
            style={{
              background:
                choice === 'sound'
                  ? 'linear-gradient(100deg, #fff6e2, #e2b76a 55%, #d69884)'
                  : 'linear-gradient(100deg, rgb(244 214 160), rgb(226 183 106) 46%, rgb(214 152 132))',
              color: '#12100c',
              boxShadow:
                choice === 'sound'
                  ? '0 0 0 1px rgb(255 246 226 / 0.8), 0 24px 60px rgb(226 183 106 / 0.45)'
                  : '0 16px 48px rgb(226 183 106 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.5)',
              transform: choice === 'sound' ? 'scale(1.04)' : undefined
            }}
          >
            <Volume2 className="h-4 w-4" />
            <span data-magnetic-inner>Enter with sound</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => handleEnter(false)}
            data-sfx="hover"
            className={`${buttonBase} text-white/70 hover:text-white`}
            style={{
              border: '1px solid rgb(255 255 255 / 0.18)',
              background:
                choice === 'silent'
                  ? 'rgb(255 255 255 / 0.12)'
                  : 'linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.015))',
              backdropFilter: 'blur(8px)',
              boxShadow: choice === 'silent' ? '0 0 40px rgb(255 255 255 / 0.12)' : undefined
            }}
          >
            <VolumeX className="h-4 w-4" />
            <span data-magnetic-inner>Enter in silence</span>
          </button>
        </div>

        <p
          className="mt-8 font-mono text-[10px] uppercase tracking-[0.32em] text-white/25 transition-opacity duration-1000"
          style={{ opacity: showButtons ? 1 : 0 }}
          aria-hidden="true"
        >
          enter — sound &nbsp;·&nbsp; s — silence
        </p>
      </div>
    </div>
  )
}
