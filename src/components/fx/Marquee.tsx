import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * Infinite ticker. The row is duplicated once and translated -50% forever,
 * so the seam is invisible. Hovering accelerates it; the keyboard pause
 * control is available on focus.
 */

type MarqueeProps = {
  items: readonly string[]
  className?: string
  separator?: string
  /** seconds for one full loop */
  duration?: number
}

export function Marquee({ items, className, separator = '✦', duration = 38 }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [fast, setFast] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.style.animationDuration = `${fast ? Math.max(duration * 0.35, 8) : duration}s`
    track.style.animationPlayState = paused ? 'paused' : 'running'
  }, [duration, paused, fast])

  const row = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <span key={`${ariaHidden ? 'dup' : 'live'}-${item}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="px-6">{item}</span>
          <span className="ink-gold opacity-80">{separator}</span>
        </span>
      ))}
    </div>
  )

  return (
    <div
      className={cn('marquee-host group relative flex overflow-hidden', className)}
      onMouseEnter={() => setFast(true)}
      onMouseLeave={() => setFast(false)}
    >
      <div ref={trackRef} className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent sm:w-28" />

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest opacity-0 backdrop-blur transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
        aria-label={paused ? 'Play ticker' : 'Pause ticker'}
      >
        {paused ? 'play' : 'pause'}
      </button>
      <span className="sr-only">{items.join(' · ')}</span>
    </div>
  )
}
