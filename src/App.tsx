import Header from './components/Header'
import Hero from './components/sections/Hero'
import Systems from './components/sections/Systems'
import Work from './components/sections/Work'
import About from './components/sections/About'
import Stack from './components/sections/Stack'
import Path from './components/sections/Path'
import Footer from './components/sections/Footer'
import { useLenis } from './hooks/useLenis'
import { useReveal } from './hooks/useReveal'

export default function App({ staticRender = false }: { staticRender?: boolean }) {
  void staticRender
  useLenis()
  useReveal()

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
        <Stack />
        <Path />
      </main>
      <Footer />
    </>
  )
}
