import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createAmbientTrack, type Track } from '../lib/music'
import { onReady } from '../lib/ready'

type Ctx = {
  /** UI blips on hover / click */
  sfx: boolean
  /** background generative lo-fi track */
  music: boolean
  toggleSfx: () => void
  toggleMusic: () => void
  tick: () => void
  click: () => void
  /** call from a user gesture (or when the loader lifts) to start the track */
  unlock: () => void
}

const SoundCtx = createContext<Ctx>({
  sfx: false,
  music: false,
  toggleSfx: () => {},
  toggleMusic: () => {},
  tick: () => {},
  click: () => {},
  unlock: () => {}
})

const LS_SFX = 'ss:sfx'
const LS_MUSIC = 'ss:music'
const read = (k: string, fallback: boolean) => {
  try {
    const v = localStorage.getItem(k)
    return v === null ? fallback : v === 'on'
  } catch {
    return fallback
  }
}
const write = (k: string, v: boolean) => {
  try {
    localStorage.setItem(k, v ? 'on' : 'off')
  } catch {
    /* private mode */
  }
}

/** WebAudio blips for hover / click + the generative background track. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [sfx, setSfx] = useState(() => read(LS_SFX, false))
  const [music, setMusic] = useState(() => read(LS_MUSIC, true))
  const ac = useRef<AudioContext | null>(null)
  const track = useRef<Track | null>(null)

  const ctx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    ac.current ??= new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    return ac.current
  }, [])

  const beep = useCallback(
    (f: number, dur: number, gain = 0.04) => {
      if (!sfx) return
      const c = ctx()
      if (!c) return
      if (c.state === 'suspended') void c.resume()
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
    [sfx, ctx]
  )

  const unlock = useCallback(() => {
    if (!music) return
    const c = ctx()
    if (!c) return
    if (c.state === 'suspended') void c.resume()
    track.current ??= createAmbientTrack(c, c.destination, 0.13)
    track.current.start()
  }, [music, ctx])

  useEffect(() => write(LS_SFX, sfx), [sfx])

  // start / stop the track with the toggle
  useEffect(() => {
    write(LS_MUSIC, music)
    if (!music) {
      track.current?.stop()
      return
    }
    unlock()
  }, [music, unlock])

  // browsers block audio until the visitor interacts — pick up the first one
  useEffect(() => {
    if (!music) return
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'wheel']
    const once = () => {
      unlock()
      events.forEach((e) => window.removeEventListener(e, once))
    }
    events.forEach((e) => window.addEventListener(e, once, { passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, once))
  }, [music, unlock])

  // the moment the preloader lifts is our best shot at un-gated playback
  useEffect(() => onReady(unlock), [unlock])

  // pause with the tab so it never plays into the void
  useEffect(() => {
    const vis = () => {
      const c = ac.current
      if (!c) return
      if (document.hidden) void c.suspend()
      else if (music) {
        void c.resume()
        unlock()
      }
    }
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [music, unlock])

  useEffect(() => () => track.current?.dispose(), [])

  const v = useMemo<Ctx>(
    () => ({
      sfx,
      music,
      toggleSfx: () => setSfx((s) => !s),
      toggleMusic: () => setMusic((s) => !s),
      tick: () => beep(1800, 0.03, 0.02),
      click: () => beep(600, 0.08),
      unlock
    }),
    [sfx, music, beep, unlock]
  )
  return <SoundCtx.Provider value={v}>{children}</SoundCtx.Provider>
}

export const useSound = () => useContext(SoundCtx)
