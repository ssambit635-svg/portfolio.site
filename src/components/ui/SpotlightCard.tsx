import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { cn, hasFinePointer, prefersReducedMotion } from '../../lib/utils'

type SpotlightCardProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Adds a subtle 3D lean toward the pointer. */
  tilt?: number
  /** Radius of the warm glow that trails the cursor. */
  glow?: number
}

/**
 * Pointer-aware card: a warm cream spotlight follows the cursor and an
 * optional perspective tilt makes the surface feel physical.
 */
export function SpotlightCard({ children, className, style, tilt = 0, glow = 380 }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el || !hasFinePointer() || prefersReducedMotion()) return

      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height

      el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
      el.style.setProperty('--glow', `${glow}px`)

      if (tilt !== 0) {
        gsap.to(el, {
          rotateY: (px - 0.5) * tilt * 2,
          rotateX: -(py - 0.5) * tilt * 2,
          duration: 0.7,
          ease: 'power3.out',
          transformPerspective: 1100,
          overwrite: 'auto'
        })
      }
    },
    [glow, tilt]
  )

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el || tilt === 0) return
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto'
    })
  }, [tilt])

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className={cn('spotlight-card', className)}
    >
      {children}
    </div>
  )
}
