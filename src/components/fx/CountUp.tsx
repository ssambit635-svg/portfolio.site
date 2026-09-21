import { useEffect, useRef, useState } from 'react'
import { easeOutQuint, prefersReducedMotion } from '../../lib/motion'

/**
 * Counts a number up when it scrolls into view. Reduced motion gets the
 * final value immediately; the DOM always ends on the real number.
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1500,
  className
}: {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0))
  const hostRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (prefersReducedMotion()) {
      setDisplay(value)
      return
    }

    let raf = 0
    let startTimeout = 0
    let startTime = 0

    const step = (now: number) => {
      if (!startTime) startTime = now
      const t = Math.min((now - startTime) / duration, 1)
      setDisplay(value * easeOutQuint(t))
      if (t < 1) raf = requestAnimationFrame(step)
      else setDisplay(value)
    }

    const run = () => {
      startTime = 0
      raf = requestAnimationFrame(step)
    }

    if (typeof IntersectionObserver === 'undefined') {
      startTimeout = window.setTimeout(run, 200)
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            observer.unobserve(entry.target)
            run()
          })
        },
        { threshold: 0.4 }
      )
      observer.observe(host)
      return () => {
        observer.disconnect()
        cancelAnimationFrame(raf)
        window.clearTimeout(startTimeout)
      }
    }

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(startTimeout)
    }
  }, [value, duration])

  return (
    <span ref={hostRef} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
