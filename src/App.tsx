import { useState } from 'react'
import { SoundProvider } from './context/SoundContext'
import { useTheme } from './lib/theme'
import { EnterScreen } from './components/EnterScreen'
import { HomePage } from './components/HomePage'
import { TargetCursor } from './components/fx/TargetCursor'
import { ClickSpark } from './components/fx/ClickSpark'

export default function App() {
  // Two-stage app: the entry gate first, then the portfolio itself.
  const [entered, setEntered] = useState(false)
  const { isDark, toggle } = useTheme()

  return (
    <SoundProvider>
      <TargetCursor />
      <ClickSpark />
      {entered ? (
        <HomePage isDark={isDark} onToggleTheme={toggle} />
      ) : (
        <EnterScreen onEnter={() => setEntered(true)} />
      )}
    </SoundProvider>
  )
}
