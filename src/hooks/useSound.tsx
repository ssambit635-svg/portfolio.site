import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type Ctx = { on: boolean; toggle: () => void; tick: () => void; click: () => void }
const SoundCtx = createContext<Ctx>({ on: false, toggle: () => {}, tick: () => {}, click: () => {} })

/** Tiny WebAudio blips for hover / click. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false)
  const ac = useRef<AudioContext | null>(null)

  const beep = useCallback(
    (f: number, dur: number, gain = 0.04) => {
      if (!on) return
      ac.current ??= new AudioContext()
      const c = ac.current
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = 'square'
      o.frequency.value = f
      g.gain.setValueAtTime(gain, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
      o.connect(g).connect(c.destination)
      o.start()
      o.stop(c.currentTime + dur)
    },
    [on]
  )

  const v = useMemo<Ctx>(
    () => ({
      on,
      toggle: () => setOn((s) => !s),
      tick: () => beep(1800, 0.03, 0.02),
      click: () => beep(600, 0.08)
    }),
    [on, beep]
  )
  return <SoundCtx.Provider value={v}>{children}</SoundCtx.Provider>
}
export const useSound = () => useContext(SoundCtx)
