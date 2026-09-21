import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * Cycles a corner-bracket focus frame across the words of a name.
 * The active word snaps into focus while the rest stay blurred — a camera
 * "rack focus" treatment for text.
 */

type FocusNameProps = {
  words: string[]
  start: boolean
  frameColor?: string
  glowColor?: string
  holdMs?: number
  onCycle?: () => void
  className?: string
}

type Box = { x: number; y: number; w: number; h: number }

const GAP = 14

export function FocusName({
  words,
  start,
  frameColor = 'rgba(255,255,255,0.9)',
  glowColor = 'rgba(255,255,255,0.35)',
  holdMs = 1500,
  onCycle,
  className
}: FocusNameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [box, setBox] = useState<Box>({ x: 0, y: 0, w: 0, h: 0 })
  const [visible, setVisible] = useState(false)
  const cyclesRef = useRef(0)
  const onCycleRef = useRef(onCycle)
  onCycleRef.current = onCycle

  useEffect(() => {
    if (!start) return
    setVisible(true)

    const measure = (index: number) => {
      const el = wordRefs.current[index]
      const container = containerRef.current
      if (!el || !container) return
      setBox({
        x: el.offsetLeft - GAP,
        y: el.offsetTop - GAP,
        w: el.offsetWidth + GAP * 2,
        h: el.offsetHeight + GAP * 2
      })
    }

    measure(0)
    let index = 0
    const interval = window.setInterval(() => {
      index = (index + 1) % words.length
      setActive(index)
      measure(index)
      if (index === words.length - 1) {
        cyclesRef.current += 1
        if (cyclesRef.current === 1) onCycleRef.current?.()
      }
    }, holdMs)

    const onResize = () => measure(index)
    window.addEventListener('resize', onResize)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('resize', onResize)
    }
  }, [start, words.length, holdMs])

  const corner = 'absolute h-4 w-4 transition-all duration-300 ease-out pointer-events-none'

  return (
    <div ref={containerRef} className={cn('relative inline-flex flex-wrap gap-x-5', className)}>
      {words.map((word, i) => (
        <span
          key={word}
          ref={(el) => {
            wordRefs.current[i] = el
          }}
          className={cn(
            'inline-block whitespace-pre transition-all duration-300',
            i === active || !visible ? 'blur-0 opacity-100' : 'opacity-40 blur-[5px]'
          )}
        >
          {word}
        </span>
      ))}

      <div
        className={cn(
          'pointer-events-none absolute transition-all duration-300 ease-out',
          visible ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          filter: `drop-shadow(0 0 10px ${glowColor})`
        }}
        aria-hidden="true"
      >
        <span className={cn(corner, 'left-0 top-0 border-l-2 border-t-2')} style={{ borderColor: frameColor }} />
        <span className={cn(corner, 'right-0 top-0 border-r-2 border-t-2')} style={{ borderColor: frameColor }} />
        <span className={cn(corner, 'bottom-0 left-0 border-b-2 border-l-2')} style={{ borderColor: frameColor }} />
        <span className={cn(corner, 'bottom-0 right-0 border-b-2 border-r-2')} style={{ borderColor: frameColor }} />
      </div>
    </div>
  )
}
