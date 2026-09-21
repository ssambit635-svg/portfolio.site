import { useEffect, useRef, useState } from 'react'

/**
 * Scramble-decode text. When the element scrolls into view the glyphs churn
 * through a machine charset and settle, left to right, into the real string.
 *
 * The settled state always renders as plain text, so screen readers, search
 * engines and the smoke test see the real copy; reduced-motion visitors get
 * it instantly with no churn.
 */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*#%$@?!'

type ScrambleProps = {
  text: string
  className?: string
  /** ms per reveal step */
  speed?: number
  /** delay before it starts once visible */
  delay?: number
  once?: boolean
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p'
}

type QueueItem = { from: string; to: string; start: number; end: number; char?: string }

export function TextScramble({ text, className, speed = 30, delay = 0, once = true, as = 'span' }: ScrambleProps) {
  const [output, setOutput] = useState<string>(text)
  const [scrambling, setScrambling] = useState(false)
  const hostRef = useRef<HTMLElement>(null)
  const frame = useRef(0)
  const queue = useRef<QueueItem[]>([])
  const timer = useRef(0)
  const startTimeout = useRef(0)

  useEffect(() => {
    let cancelled = false

    const step = () => {
      if (cancelled) return
      let out = ''
      let complete = 0

      for (const item of queue.current) {
        if (frame.current >= item.end) {
          complete += 1
          out += item.to
        } else if (frame.current >= item.start) {
          if (!item.char || Math.random() < 0.3) {
            item.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          }
          out += item.char
        } else {
          out += item.from
        }
      }

      frame.current += 1

      if (complete < queue.current.length) {
        setOutput(out)
        timer.current = window.setTimeout(step, speed)
      } else {
        setOutput(text)
        setScrambling(false)
      }
    }

    const run = () => {
      if (cancelled) return
      const reduced =
        typeof window !== 'undefined' &&
        !!window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        setOutput(text)
        return
      }

      const length = text.length
      const q: QueueItem[] = []
      for (let i = 0; i < length; i++) {
        const start = Math.floor(Math.random() * 10) + i * 0.6
        const end = start + Math.floor(Math.random() * 12) + 5
        q.push({ from: ' ', to: text[i], start, end })
      }

      queue.current = q
      frame.current = 0
      setScrambling(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(step, speed)
    }

    let cleanupObserver: IntersectionObserver | null = null
    const host = hostRef.current
    if (!host || typeof IntersectionObserver === 'undefined') {
      startTimeout.current = window.setTimeout(run, delay + 150)
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            startTimeout.current = window.setTimeout(run, delay)
            if (once) observer.unobserve(entry.target)
          })
        },
        { threshold: 0.3 }
      )
      observer.observe(host)
      // keep a reference so cleanup can disconnect deterministically
      cleanupObserver = observer
    }

    return () => {
      cancelled = true
      window.clearTimeout(timer.current)
      window.clearTimeout(startTimeout.current)
      cleanupObserver?.disconnect()
    }
  }, [text, speed, delay, once])

  const Tag = as as 'span'

  return (
    <Tag ref={hostRef as never} className={className} aria-label={text} aria-busy={scrambling || undefined}>
      {scrambling ? (
        <span aria-hidden="true" className="font-mono tabular-nums">
          {output}
        </span>
      ) : (
        text
      )}
    </Tag>
  )
}
