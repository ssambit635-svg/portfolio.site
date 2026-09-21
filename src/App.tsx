import { useCallback, useState } from 'react'
import { SoundProvider } from './context/SoundContext'
import { ToastProvider } from './context/ToastContext'
import { SmoothScrollProvider } from './providers/SmoothScroll'
import { useTheme } from './lib/theme'
import { Loader } from './components/Loader'
import { EnterScreen } from './components/EnterScreen'
import { HomePage } from './components/HomePage'
import { TargetCursor } from './components/fx/TargetCursor'
import { ClickSpark } from './components/fx/ClickSpark'
import { SplitDoors } from './components/fx/SplitDoors'

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

  // Horizontal doors that swing open onto the homepage.
  const [revealOpen, setRevealOpen] = useState(false)
  const [showReveal, setShowReveal] = useState(false)

  const finishLoading = useCallback(() => {
    try {
      sessionStorage.setItem(LOADER_KEY, '1')
    } catch {
      /* private mode — the loader simply plays again next visit */
    }
    setPhase('gate')
  }, [])

  const enterHome = useCallback(() => {
    setPhase('home')
    setShowReveal(true)
    // Give the doors one frame to paint closed before they swing open.
    requestAnimationFrame(() => requestAnimationFrame(() => setRevealOpen(true)))
  }, [])

  return (
    <SoundProvider>
      <ToastProvider>
        <SmoothScrollProvider>
          <TargetCursor />
          <ClickSpark />
          {phase === 'home' ? <HomePage isDark={isDark} onToggleTheme={toggle} /> : <EnterScreen onEnter={enterHome} />}
          {showReveal && (
            <SplitDoors
              open={revealOpen}
              onDone={() => setShowReveal(false)}
              bg={isDark ? '#05050c' : '#f3ede1'}
              seam={isDark ? 'rgb(226 183 106 / 0.55)' : 'rgb(169 118 47 / 0.5)'}
              zIndex={90}
              durationMs={1250}
            />
          )}
          {phase === 'loading' && <Loader onExit={finishLoading} />}
        </SmoothScrollProvider>
      </ToastProvider>
    </SoundProvider>
  )
}
