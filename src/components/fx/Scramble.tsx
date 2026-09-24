import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { GLYPHS, prefersReducedMotion } from '../../lib/utils'
import { onReady } from '../../lib/ready'

type Props = {
  text: string
  as?: ElementType
  className?: string
  /** ms per character reveal */
  speed?: number
  /** start delay ms */
  delay?: number
  /** run once when scrolled into view (default) / on mount / on hover */
  trigger?: 'view' | 'mount' | 'hover' | 'now'
  color?: string
  /** how far settle times may drift from a strict left→right order (0–1) */
  chaos?: number
  children?: ReactNode
}

const GLYPH_SET = (GLYPHS + GLYPHS.toLowerCase() + '0123456789').split('')
const pickGlyph = () => GLYPH_SET[(Math.random() * GLYPH_SET.length) | 0]
const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** canvas used to measure glyph widths so scrambling never reflows the line */
let measure: CanvasRenderingContext2D | null = null
const widthCache = new Map<string, number>()
function charWidth(font: string, ch: string) {
  const key = font + '|' + ch
  const hit = widthCache.get(key)
  if (hit !== undefined) return hit
  measure ??= document.createElement('canvas').getContext('2d')
  let w = 0
  if (measure) {
    measure.font = font
    w = measure.measureText(ch).width
  }
  widthCache.set(key, w)
  return w
}

/**
 * Chunky decode-style scramble.
 *
 * Every character keeps its own clock: a random glyph flip every ~40–110ms
 * (never every frame — that reads as a smooth blur) and its own settle time
 * that drifts around the left→right order, so the word snaps into place in
 * jagged bursts instead of wiping across cleanly. Character slots are
 * width-locked to the widest of (final char, current glyph) so nothing
 * reflows while it decodes.
 */
export default function Scramble({
  text,
  as: Tag = 'span',
  className,
  speed = 28,
  delay = 0,
  trigger = 'view',
  chaos = 0.55,
  color,
  children
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.textContent = text
    if (prefersReducedMotion()) return

    let raf = 0
    let cleanup: (() => void)[] = []

    const stop = () => {
      cancelAnimationFrame(raf)
      cleanup.forEach((fn) => fn())
      cleanup = []
    }

    const play = () => {
      stop()
      const cs = getComputedStyle(el)
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const chars = text.split('')
      const total = chars.length
      if (!total) return

      // pre-roll: pure garbage before the first character is allowed to land
      const preRoll = Math.min(420, 90 + total * speed * 0.12)
      const flipBase = Math.min(130, Math.max(45, speed * 2.2))
      const start = performance.now() + delay + preRoll

      const slots = chars.map((c, i) => {
        const drift = rand(-speed, speed * 1.35) * chaos
        // a few characters refuse to settle until the very end
        const stubborn = Math.random() < 0.12 ? speed * rand(1.5, 3.2) : 0
        return {
          char: c,
          settleAt: start + Math.max(0, i * speed + drift) + stubborn,
          nextFlip: 0,
          done: c === ' ' || c === '\n'
        }
      })

      // build the spans once — afterwards we only touch textContent
      el.textContent = ''
      const frag = document.createDocumentFragment()
      const nodes: (HTMLSpanElement | Text)[] = []
      slots.forEach((s) => {
        if (s.char === ' ') {
          const t = document.createTextNode(' ')
          nodes.push(t)
          frag.appendChild(t)
          return
        }
        const span = document.createElement('span')
        span.className = 'scr-slot'
        span.textContent = pickGlyph()
        nodes.push(span)
        frag.appendChild(span)
      })
      el.appendChild(frag)

      const tick = (now: number) => {
        let pending = 0
        for (let i = 0; i < total; i++) {
          const s = slots[i]
          if (s.done) continue
          const node = nodes[i] as HTMLSpanElement
          if (now >= s.settleAt) {
            s.done = true
            node.textContent = s.char
            node.classList.remove('scr-pending')
            node.classList.add('scr-hit')
            node.style.width = ''
            continue
          }
          pending++
          if (now >= s.nextFlip) {
            const g = pickGlyph()
            node.textContent = g
            node.classList.add('scr-pending')
            const w = Math.max(charWidth(font, s.char), charWidth(font, g))
            node.style.width = w ? w.toFixed(2) + 'px' : ''
            s.nextFlip = now + flipBase * rand(0.55, 1.45)
          }
        }
        if (pending > 0) raf = requestAnimationFrame(tick)
        else {
          el.textContent = text
          raf = 0
        }
      }
      raf = requestAnimationFrame(tick)
    }

    if (trigger === 'now') {
      play()
      return stop
    }

    if (trigger === 'mount') {
      cleanup.push(onReady(play))
      return stop
    }

    if (trigger === 'hover') {
      const parent = el.closest('[data-scramble-hover]') ?? el
      parent.addEventListener('mouseenter', play)
      parent.addEventListener('focusin', play)
      return () => {
        parent.removeEventListener('mouseenter', play)
        parent.removeEventListener('focusin', play)
        stop()
      }
    }

    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          play()
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      stop()
    }
  }, [text, speed, delay, trigger, chaos, color])

  return (
    <Tag ref={ref} className={className} style={color ? ({ '--scr-color': color } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  )
}
