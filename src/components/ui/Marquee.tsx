import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type MarqueeProps = {
  children: ReactNode
  className?: string
  /** Seconds for one full loop. */
  duration?: number
  reverse?: boolean
  pauseOnHover?: boolean
  fade?: boolean
}

/**
 * Seamless infinite marquee. Content is rendered twice and translated -50%,
 * so the loop has no visible seam. Pure CSS transform = GPU-friendly.
 */
export function Marquee({
  children,
  className,
  duration = 44,
  reverse = false,
  pauseOnHover = true,
  fade = true
}: MarqueeProps) {
  return (
    <div className={cn('group relative flex w-full overflow-hidden', fade && 'mask-fade-x', className)}>
      <div
        className={cn(
          'flex w-max shrink-0 items-center will-change-transform',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{
          animation: `marquee-x ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal'
        }}
      >
        {children}
        <span aria-hidden="true" className="flex shrink-0 items-center">
          {children}
        </span>
      </div>
    </div>
  )
}
