import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { isBrowser } from '../lib/utils'

export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect

/** Reactive media-query hook. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (isBrowser ? window.matchMedia(query).matches : false))

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True once the element has entered the viewport (kept true afterwards). */
export function useInView<T extends HTMLElement>(rootMargin = '200px', once = true) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, once])

  return { ref, inView }
}

/**
 * Mounts heavy content (WebGL canvases) only when it is near the viewport and
 * keeps it mounted once it has been seen — avoids GPU work for offscreen
 * sections without causing re-load flicker.
 */
export function useMountWhenNear<T extends HTMLElement>(rootMargin = '35% 0px 35% 0px') {
  const { ref, inView } = useInView<T>(rootMargin, true)
  return { ref, shouldMount: inView }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    isBrowser ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** Live clock string for the given IANA timezone. */
export function useTimeZoneClock(timeZone: string) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date())

    setTime(format())
    const id = window.setInterval(() => setTime(format()), 1000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return time
}
