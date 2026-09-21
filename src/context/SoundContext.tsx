import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { playChime, playClick, playGlitch, playHover, playStamp, playWhoosh } from '../lib/audio'

type SoundContextValue = {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  click: () => void
  glitch: () => void
  hover: () => void
  whoosh: () => void
  stamp: () => void
  chime: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

const HOVER_THROTTLE_MS = 110

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const lastHover = useRef(0)

  const click = useCallback(() => {
    if (soundEnabled) playClick()
  }, [soundEnabled])

  const glitch = useCallback(() => {
    if (soundEnabled) playGlitch()
  }, [soundEnabled])

  const hover = useCallback(() => {
    if (!soundEnabled) return
    const now = performance.now()
    if (now - lastHover.current < HOVER_THROTTLE_MS) return
    lastHover.current = now
    playHover()
  }, [soundEnabled])

  const whoosh = useCallback(() => {
    if (soundEnabled) playWhoosh()
  }, [soundEnabled])

  const stamp = useCallback(() => {
    if (soundEnabled) playStamp()
  }, [soundEnabled])

  const chime = useCallback(() => {
    if (soundEnabled) playChime()
  }, [soundEnabled])

  /* One global listener peps every interactive element with a soft click —
     no need to wire handlers onto each button. Elements can opt into a
     hover tick with `data-sfx="hover"`. */
  useEffect(() => {
    if (!soundEnabled) return

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('a, button')) playClick()
    }

    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const hit = target?.closest?.('[data-sfx="hover"]')
      if (!hit) return
      const now = performance.now()
      if (now - lastHover.current < HOVER_THROTTLE_MS) return
      lastHover.current = now
      playHover()
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('pointerover', onOver, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('pointerover', onOver, true)
    }
  }, [soundEnabled])

  const value = useMemo(
    () => ({ soundEnabled, setSoundEnabled, click, glitch, hover, whoosh, stamp, chime }),
    [soundEnabled, click, glitch, hover, whoosh, stamp, chime]
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used inside <SoundProvider>')
  return ctx
}
