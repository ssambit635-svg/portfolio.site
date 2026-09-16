import { useCallback, useState } from 'react'
import { SoundProvider } from './context/SoundContext'
import { SmoothScrollProvider } from './providers/SmoothScroll'
import { useTheme } from './lib/theme'
import { Loader } from './components/Loader'
import { EnterScreen } from './components/EnterScreen'
import { HomePage } from './components/HomePage'
import { TargetCursor } from './components/fx/TargetCursor'
import { ClickSpark } from './components/fx/ClickSpark'

type Phase = 'loading' | 'gate' | 'home'

const LOADER_KEY = 'sambit-loaded'

export default function App() {
  // The handwritten intro plays once per tab session; after that we skip
  // straight to the sound gate.
  const [phase, setPhase] = useState<Phase>(() => {
    try {
      return sessionStorage.getItem(LOADER_KEY) ? 'gate' : 'loading'
    } catch {
      return 'loading'
    }
  })
  const { isDark, toggle } = useTheme()

  const finishLoading = useCallback(() => {
    try {
      sessionStorage.setItem(LOADER_KEY, '1')
    } catch {
      /* private mode — the loader simply plays again next visit */
    }
    setPhase('gate')
  }, [])

  return (
    <SoundProvider>
      <SmoothScrollProvider>
        <TargetCursor />
        <ClickSpark />
        {phase === 'home' ? (
          <HomePage isDark={isDark} onToggleTheme={toggle} />
        ) : (
          <EnterScreen onEnter={() => setPhase('home')} />
        )}
        {phase === 'loading' && <Loader onExit={finishLoading} />}
      </SmoothScrollProvider>
    </SoundProvider>
  )
}
