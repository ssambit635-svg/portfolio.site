import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { randGlyph, prefersReducedMotion } from '../../lib/utils'

type Props = {
  text: string
  as?: ElementType
  className?: string
  /** ms per character reveal */
  speed?: number
  /** start delay ms */
  delay?: number
  /** run once when scrolled into view (default) or immediately */
  trigger?: 'view' | 'mount' | 'hover'
  color?: string
  children?: ReactNode
}

/**
 * Decode-style text scramble: each char cycles random glyphs (in accent
 * colour) and settles left→right into the final text.
 */
export default function Scramble({
  text,
  as: Tag = 'span',
  className,
  speed = 28,
  delay = 0,
  trigger = 'view',
  color
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const running = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.textContent = text
    if (prefersReducedMotion()) return

    const play = () => {
      if (running.current) return
      running.current = true
      const chars = text.split('')
      const total = chars.length
      const start = performance.now() + delay
      let raf = 0
      const tick = (now: number) => {
        const t = now - start
        if (t < 0) {
          el.innerHTML = chars
            .map((c) => (c === ' ' ? ' ' : `<span class="scr-pending">${randGlyph()}</span>`))
            .join('')
          raf = requestAnimationFrame(tick)
          return
        }
        const settled = Math.floor(t / speed)
        let html = ''
        for (let i = 0; i < total; i++) {
          const c = chars[i]
          if (c === ' ' || c === '\n') html += c
          else if (i < settled) html += c
          else html += `<span class="scr-pending">${randGlyph()}</span>`
        }
        el.innerHTML = html
        if (settled < total) raf = requestAnimationFrame(tick)
        else {
          el.textContent = text
          running.current = false
        }
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }

    if (trigger === 'mount') return play()
    if (trigger === 'hover') {
      const parent = el.closest('[data-scramble-hover]') ?? el
      parent.addEventListener('mouseenter', play)
      return () => parent.removeEventListener('mouseenter', play)
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          play()
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [text, speed, delay, trigger])

  return <Tag ref={ref} className={className} style={color ? ({ '--scr-color': color } as React.CSSProperties) : undefined} />
}
