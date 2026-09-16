import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { isBrowser, prefersReducedMotion } from '../lib/utils'
import { isAppReady } from '../lib/ready'

type ScrollAPI = {
  /** Smooth-scroll to a CSS selector or element, accounting for the fixed nav. */
  scrollTo: (target: string | HTMLElement, offset?: number) => void
  /** Current scroll direction, used for nav hide/show. */
  direction: 1 | -1
  /** Pause / resume page scrolling (preloader, mobile menu). */
  stop: () => void
  start: () => void
}

const ScrollContext = createContext<ScrollAPI>({
  scrollTo: () => {},
  direction: 1,
  stop: () => {},
  start: () => {}
})

export function useSmoothScroll() {
  return useContext(ScrollContext)
}

const NAV_OFFSET = -72

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)

  useEffect(() => {
    // Touch devices and reduced-motion users keep the native scroll: it is
    // faster, and hijacking it is the classic portfolio-site sin.
    const reduced = prefersReducedMotion()
    const coarse = isBrowser && window.matchMedia('(pointer: coarse)').matches
    if (reduced || coarse) {
      ScrollTrigger.refresh()
      return
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
      autoRaf: false
    })

    lenisRef.current = lenis

    // The preloader owns the page until it finishes.
    if (!isAppReady()) lenis.stop()

    lenis.on('scroll', (e: { direction: number }) => {
      setDirection(e.direction >= 0 ? 1 : -1)
    })

    let lastNative = window.scrollY
    const onNativeScroll = () => {
      ScrollTrigger.update()
      const y = window.scrollY
      if (Math.abs(y - lastNative) > 3) {
        setDirection(y > lastNative ? 1 : -1)
        lastNative = y
      }
    }

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    window.addEventListener('scroll', onNativeScroll, { passive: true })

    // Anchor links inside the page are handled by Lenis for a consistent feel.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return
      const hash = anchor.getAttribute('href')
      if (!hash || hash === '#') return
      const target = document.querySelector(hash)
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target as HTMLElement, {
        offset: NAV_OFFSET,
        duration: 1.35
      })
      history.replaceState(null, '', hash)
    }

    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('scroll', onNativeScroll)
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = useCallback((target: string | HTMLElement, offset = NAV_OFFSET) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(el as HTMLElement, { offset, duration: 1.35 })
    } else {
      const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY + offset
      window.scrollTo({
        top,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      })
    }
  }, [])

  const stop = useCallback(() => {
    const lenis = lenisRef.current
    if (lenis) lenis.stop()
    else document.documentElement.style.overflow = 'hidden'
  }, [])

  const start = useCallback(() => {
    const lenis = lenisRef.current
    if (lenis) lenis.start()
    else document.documentElement.style.overflow = ''
  }, [])

  useEffect(
    () => () => {
      document.documentElement.style.overflow = ''
    },
    []
  )

  const value = useMemo<ScrollAPI>(() => ({ scrollTo, direction, stop, start }), [scrollTo, direction, stop, start])

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
}
