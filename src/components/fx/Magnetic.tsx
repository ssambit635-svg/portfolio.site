import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react'
import { springStep } from '../../lib/motion'
import { cn } from '../../lib/utils'

/**
 * Magnetic interaction: the element leans toward the pointer while it is
 * inside an invisible field around it, then springs back when it leaves.
 *
 * Everything happens on the DOM node itself (no React state per frame), so a
 * page full of magnetic buttons still costs one rAF and zero re-renders.
 *
 *   <Magnetic as="a" href="#work" strength={0.35}>
 *     <span data-magnetic-inner>See the work</span>
 *   </Magnetic>
 */

type MagneticProps = {
  children: ReactNode
  as?: 'div' | 'button' | 'a' | 'span'
  className?: string
  style?: CSSProperties
  /** 0..1 — how far the element travels toward the pointer */
  strength?: number
  /** radius multiplier of the element's own box */
  field?: number
  /** inner content counter-moves for a layered, parallax feel */
  innerStrength?: number
  disabled?: boolean
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
  onClick?: () => void
  onFieldEnter?: () => void
}

export function Magnetic({
  children,
  as = 'div',
  className,
  style,
  strength = 0.32,
  field = 1.5,
  innerStrength = 0.55,
  disabled = false,
  href,
  target,
  rel,
  type,
  ariaLabel,
  onClick,
  onFieldEnter
}: MagneticProps) {
  const hostRef = useRef<HTMLElement | null>(null)
  const state = useRef({
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    ix: 0,
    iy: 0,
    targetX: 0,
    targetY: 0,
    inField: false
  })
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const enterRef = useRef(onFieldEnter)
  enterRef.current = onFieldEnter

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  const tick = useCallback(
    (now: number) => {
      const host = hostRef.current
      if (!host) return
      const s = state.current
      const dt = lastRef.current ? Math.min((now - lastRef.current) / 1000, 0.05) : 0.016
      lastRef.current = now

      const steppedX = springStep(s.tx, s.targetX, s.vx, 190, 22, dt)
      const steppedY = springStep(s.ty, s.targetY, s.vy, 190, 22, dt)
      s.tx = steppedX.value
      s.ty = steppedY.value
      s.vx = steppedX.velocity
      s.vy = steppedY.velocity

      s.ix += (s.tx * innerStrength - s.ix) * 0.18
      s.iy += (s.ty * innerStrength - s.iy) * 0.18

      host.style.transform = `translate3d(${s.tx.toFixed(2)}px, ${s.ty.toFixed(2)}px, 0)`

      const inner = host.querySelector<HTMLElement>('[data-magnetic-inner]')
      if (inner) {
        inner.style.transform = `translate3d(${(-s.ix).toFixed(2)}px, ${(-s.iy).toFixed(2)}px, 0)`
      }

      const settled =
        Math.abs(s.tx - s.targetX) < 0.05 &&
        Math.abs(s.ty - s.targetY) < 0.05 &&
        Math.abs(s.vx) < 0.5 &&
        Math.abs(s.vy) < 0.5
      if (settled && !s.inField) {
        host.style.transform = ''
        if (inner) inner.style.transform = ''
        stop()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [innerStrength, stop]
  )

  const start = useCallback(() => {
    if (rafRef.current) return
    lastRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const onMove = (event: ReactPointerEvent) => {
    if (disabled) return
    const host = hostRef.current
    if (!host) return
    const rect = host.getBoundingClientRect()
    const padX = (rect.width * (field - 1)) / 2
    const padY = (rect.height * (field - 1)) / 2
    const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 + padX)
    const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 + padY)

    const s = state.current
    if (!s.inField) {
      s.inField = true
      enterRef.current?.()
    }
    s.targetX = Math.max(-1, Math.min(1, relX)) * rect.width * 0.5 * strength
    s.targetY = Math.max(-1, Math.min(1, relY)) * rect.height * 0.5 * strength
    start()
  }

  const onLeave = () => {
    const s = state.current
    s.inField = false
    s.targetX = 0
    s.targetY = 0
    start()
  }

  useEffect(() => stop, [stop])

  const Tag = as as 'div'
  const shared = {
    ref: hostRef as React.Ref<HTMLDivElement>,
    className: cn('will-change-transform', className),
    style: { touchAction: 'manipulation', ...style } as CSSProperties,
    'aria-label': ariaLabel,
    onClick
  }

  if (disabled) {
    return <Tag {...shared}>{children}</Tag>
  }

  return (
    <Tag
      {...shared}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onMove}
      {...(as === 'a' ? { href, target, rel } : {})}
      {...(as === 'button' ? { type: type ?? 'button' } : {})}
    >
      {children}
    </Tag>
  )
}
