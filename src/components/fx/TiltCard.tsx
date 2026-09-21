import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * Pointer-reactive card: a real 3D tilt (perspective + preserve-3d),
 * a gradient hairline border that lights up under the cursor and a soft
 * spotlight that follows the pointer across the surface.
 *
 * All per-frame work writes straight to the DOM — no state, no re-renders.
 */

type TiltCardProps = {
  children: ReactNode
  className?: string
  /** max tilt in degrees */
  max?: number
  /** lift toward the viewer on hover, in px */
  lift?: number
  /** spotlight colour (css colour string) */
  glow?: string
  /** render the animated gradient hairline border */
  border?: boolean
  disabled?: boolean
  as?: 'div' | 'article' | 'a'
  href?: string
  target?: string
  rel?: string
  onClick?: () => void
  onEnter?: () => void
}

export function TiltCard({
  children,
  className,
  max = 7,
  lift = 14,
  glow = 'rgb(226 183 106 / 0.16)',
  border = true,
  disabled = false,
  as = 'div',
  href,
  target,
  rel,
  onClick,
  onEnter
}: TiltCardProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const target_ = useRef({ rx: 0, ry: 0, z: 0, sx: 50, sy: 50, o: 0 })
  const current = useRef({ rx: 0, ry: 0, z: 0, sx: 50, sy: 0, o: 0 })
  const enterRef = useRef(onEnter)
  enterRef.current = onEnter

  const reduced = useRef(false)
  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const loop = useCallback(() => {
    const host = hostRef.current
    if (!host) return
    const c = current.current
    const t = target_.current

    c.rx += (t.rx - c.rx) * 0.13
    c.ry += (t.ry - c.ry) * 0.13
    c.z += (t.z - c.z) * 0.13
    c.sx += (t.sx - c.sx) * 0.16
    c.sy += (t.sy - c.sy) * 0.16
    c.o += (t.o - c.o) * 0.14

    host.style.transform = `perspective(900px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(
      2
    )}deg) translate3d(0, ${(-c.z * 0.35).toFixed(2)}px, ${c.z.toFixed(2)}px)`

    const spot = spotRef.current
    if (spot) {
      spot.style.opacity = c.o.toFixed(3)
      spot.style.transform = `translate3d(${c.sx.toFixed(1)}px, ${c.sy.toFixed(1)}px, 0) translate(-50%, -50%)`
    }

    const settled =
      Math.abs(c.rx - t.rx) < 0.02 &&
      Math.abs(c.ry - t.ry) < 0.02 &&
      Math.abs(c.z - t.z) < 0.05 &&
      Math.abs(c.o - t.o) < 0.004
    if (settled) {
      rafRef.current = 0
      if (t.o === 0) {
        host.style.transform = ''
        if (spot) spot.style.opacity = '0'
      }
      return
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const kick = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const onMove = (event: React.PointerEvent) => {
    const host = hostRef.current
    if (!host || disabled || reduced.current) return
    const rect = host.getBoundingClientRect()
    if (rect.width < 2) return
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    const nx = (px / rect.width) * 2 - 1
    const ny = (py / rect.height) * 2 - 1

    target_.current.ry = nx * max
    target_.current.rx = -ny * max
    target_.current.z = lift
    target_.current.sx = px
    target_.current.sy = py
    target_.current.o = 1
    kick()
  }

  const onLeave = () => {
    target_.current.rx = 0
    target_.current.ry = 0
    target_.current.z = 0
    target_.current.o = 0
    kick()
  }

  const Tag = as as 'div'

  return (
    <Tag
      ref={hostRef as never}
      onPointerMove={onMove}
      onPointerEnter={
        disabled
          ? undefined
          : (e) => {
              onMove(e)
              enterRef.current?.()
            }
      }
      onPointerLeave={onLeave}
      onClick={onClick}
      {...(as === 'a' ? { href, target, rel } : {})}
      data-sfx="hover"
      className={cn('tilt-host preserve-3d relative will-change-transform motion-reduce:transform-none', className)}
    >
      {border && (
        <span
          aria-hidden="true"
          className="tilt-border pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(130deg, rgb(226 183 106 / 0.55), rgb(214 152 132 / 0.35) 40%, transparent 62%, rgb(122 176 165 / 0.4))',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: 1
          }}
          data-tilt-border=""
        />
      )}

      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full opacity-0 blur-2xl transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 68%)` }}
      />

      <div className="preserve-3d relative">{children}</div>
    </Tag>
  )
}
