import { useCallback, useState } from 'react'
import Header from './components/Header'
import Menu from './components/Menu'
import SideBadge from './components/SideBadge'
import Preloader from './components/Preloader'
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

export default function App({ staticRender = false }: { staticRender?: boolean }) {
  const [menu, setMenu] = useState(false)
  const [entered, setEntered] = useState(staticRender)
  const close = useCallback(() => setMenu(false), [])
  useLenis()
  useSectionTheme()
  useReveal()

  return (
    <SoundProvider>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Cursor />
      {!entered && <Preloader onDone={() => setEntered(true)} />}
      <Header menuOpen={menu} onMenu={() => setMenu(true)} />
      <SideBadge />
      <Menu open={menu} onClose={close} />
      <main id="main-content">
        <Hero />
        <Manifesto />
        <Stats />
        <Work />
        <WorkedAt />
      </main>
      <Footer />
    </SoundProvider>
  )
}
