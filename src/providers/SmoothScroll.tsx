import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { isBrowser } from '../lib/utils'

type ScrollContextValue = {
  /** Smoothly glide to a section by id — Lenis when available, native otherwise. */
  scrollToSection: (id: string) => void
}

const ScrollContext = createContext<ScrollContextValue>({ scrollToSection: () => {} })

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!isBrowser) return

    let lenis: Lenis | null = null
    let raf = 0

    try {
      lenis = new Lenis({
        // Low lerp = long, silky glide.
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4
      })
      lenisRef.current = lenis

      const loop = (time: number) => {
        lenis?.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    } catch {
      /* Environments without full DOM APIs (e.g. smoke tests) keep native scroll. */
    }

    return () => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      lenisRef.current = null
    }
  }, [])

  const value = useMemo<ScrollContextValue>(
    () => ({
      scrollToSection: (id: string) => {
        const el = document.getElementById(id)
        if (!el) return
        const lenis = lenisRef.current
        if (lenis) {
          lenis.scrollTo(el, {
            duration: 1.5,
            easing: (t: number) => 1 - Math.pow(1 - t, 4)
          })
        } else {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }),
    []
  )

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
}

export function useSmoothScroll() {
  return useContext(ScrollContext)
}
