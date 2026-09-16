import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { SmoothScrollProvider } from './providers/SmoothScroll'
import { AppBoundary } from './components/layout/AppBoundary'
import { Preloader } from './components/layout/Preloader'
import { Nav } from './components/layout/Nav'
import { Footer } from './components/layout/Footer'
import { Cursor } from './components/ui/Cursor'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { Hero } from './components/sections/Hero'
import { Ticker } from './components/sections/Ticker'
import { Work } from './components/sections/Work'
import { About } from './components/sections/About'
import { Skills } from './components/sections/Skills'
import { Certificates } from './components/sections/Certificates'
import { Process } from './components/sections/Process'
import { Contact } from './components/sections/Contact'

export default function App() {
  /* Layout shifts from fonts / lazy images can desync pinned sections, so we
     refresh ScrollTrigger once everything has settled. */
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh).catch(() => {})
    const timers = [400, 1200, 2400].map((delay) => window.setTimeout(refresh, delay))
    window.addEventListener('load', refresh)
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <AppBoundary>
      <SmoothScrollProvider>
        <div className="cream-wash" aria-hidden="true" />
        <div className="paper-lines" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />

        <Preloader />
        <Cursor />
        <ScrollProgress />
        <Nav />

        <main className="relative z-10">
          <Hero />
          <Ticker />
          <Work />
          <About />
          <Skills />
          <Certificates />
          <Process />
          <Contact />
        </main>

        <Footer />
      </SmoothScrollProvider>
    </AppBoundary>
  )
}
