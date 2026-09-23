import { useCallback, useState } from 'react'
import Header from './components/Header'
import Menu from './components/Menu'
import SideBadge from './components/SideBadge'
import Cursor from './components/fx/Cursor'
import Hero from './components/sections/Hero'
import Manifesto from './components/sections/Manifesto'
import Stats from './components/sections/Stats'
import Work from './components/sections/Work'
import WorkedAt from './components/sections/WorkedAt'
import Footer from './components/sections/Footer'
import { SoundProvider } from './hooks/useSound'
import { useLenis } from './hooks/useLenis'
import { useSectionTheme } from './hooks/useSectionTheme'
import { useReveal } from './hooks/useReveal'

export default function App() {
  const [menu, setMenu] = useState(false)
  const close = useCallback(() => setMenu(false), [])
  useLenis()
  useSectionTheme()
  useReveal()

  return (
    <SoundProvider>
      <Cursor />
      <Header onMenu={() => setMenu(true)} />
      <SideBadge />
      <Menu open={menu} onClose={close} />
      <main>
        <Hero />
        <Manifesto />
        <Stats />
        <Work />
        <WorkedAt />
        <Footer />
      </main>
    </SoundProvider>
  )
}
