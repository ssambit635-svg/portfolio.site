import Header from './components/Header'
import Hero from './components/sections/Hero'
import Systems from './components/sections/Systems'
import Work from './components/sections/Work'
import About from './components/sections/About'
import Stats from './components/sections/Stats'
import WorkedAt from './components/sections/WorkedAt'
import Footer from './components/sections/Footer'
import { useLenis } from './hooks/useLenis'
import { useReveal } from './hooks/useReveal'
import { useSectionTheme } from './hooks/useSectionTheme'
import { useParallax } from './hooks/useParallax'

export default function App({ staticRender = false }: { staticRender?: boolean }) {
  void staticRender
  useLenis()
  useSectionTheme()
  useReveal()
  useParallax()

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <Systems />
        <Work />
        <About />
        <Stats />
        <WorkedAt />
      </main>
      <Footer />
    </>
  )
}
