import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { WaveCanvas } from './fx/WaveCanvas'
import { FocusName } from './fx/FocusName'
import { useSound } from '../context/SoundContext'
import { playGlitch } from '../lib/audio'
import { profile } from '../lib/site'

/**
 * Entry gate: the name snaps into focus over the beam-fan background,
 * then two choices fade in — enter with or without sound.
 */
export function EnterScreen({ onEnter }: { onEnter: () => void }) {
  const { setSoundEnabled } = useSound()
  const [showButtons, setShowButtons] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Fallback reveal in case the focus animation's first cycle is slow.
    const revealTimer = window.setTimeout(() => setShowButtons(true), 2600)
    return () => window.clearTimeout(revealTimer)
  }, [])

  const handleEnter = (withSound: boolean) => {
    setSoundEnabled(withSound)
    // Play directly — the context state hasn't flushed yet at this moment.
    if (withSound) playGlitch()
    setLeaving(true)
    window.setTimeout(onEnter, withSound ? 450 : 350)
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4 text-white transition-opacity duration-500 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 h-full w-full">
        <WaveCanvas variant="enter" bg={[0, 0, 0]} wave={[0.55, 0.55, 0.55]} className="h-full w-full" />
      </div>

      <div className="relative z-10 mb-12 flex w-full justify-center">
        <h1 className="sr-only">{profile.name} — Software Developer & Interface Designer</h1>
        <FocusName
          words={[profile.first, profile.last]}
          start
          holdMs={1400}
          onCycle={() => setShowButtons(true)}
          className="text-6xl font-semibold tracking-tight sm:text-8xl"
        />
      </div>

      <div
        className={`z-10 flex flex-col items-center gap-6 transition-opacity duration-1000 sm:flex-row sm:gap-8 ${
          showButtons ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          onClick={() => handleEnter(true)}
          className="cursor-target group relative border border-transparent px-6 py-3 font-semibold text-white transition-all duration-300 hover:border-white"
        >
          Enter with sound
          <ArrowUpRight className="ml-2 inline-block h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => handleEnter(false)}
          className="cursor-target relative px-6 py-3 font-semibold text-neutral-400 transition-colors duration-300 after:absolute after:bottom-2 after:left-6 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:text-white hover:after:w-[calc(100%-48px)]"
        >
          Enter without sound
        </button>
      </div>
    </div>
  )
}
