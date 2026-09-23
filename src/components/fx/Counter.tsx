import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'

/** Number that counts up when scrolled into view. */
export default function Counter({ to, suffix = '', className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    const o = { v: 0 }
    const tw = gsap.to(o, {
      v: to,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = Math.round(o.v) + suffix),
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    })
    return () => {
      tw.scrollTrigger?.kill()
      tw.kill()
    }
  }, [to, suffix])
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}
export { ScrollTrigger }
