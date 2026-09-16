import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { playClick, playGlitch } from '../lib/audio'

type SoundContextValue = {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  click: () => void
  glitch: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false)

  const click = useCallback(() => {
    if (soundEnabled) playClick()
  }, [soundEnabled])

  const glitch = useCallback(() => {
    if (soundEnabled) playGlitch()
  }, [soundEnabled])

  /* One global listener peps every interactive element with a soft click —
     no need to wire handlers onto each button. */
  useEffect(() => {
    if (!soundEnabled) return
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('a, button')) playClick()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [soundEnabled])

  const value = useMemo(
    () => ({ soundEnabled, setSoundEnabled, click, glitch }),
    [soundEnabled, click, glitch]
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used inside <SoundProvider>')
  return ctx
}
