import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { cn, hasFinePointer, prefersReducedMotion } from '../../lib/utils'

type MagneticProps = {
  children: ReactNode
  className?: string
  /** 0 = no pull, 1 = element follows the pointer 1:1. */
  strength?: number
  /** Inner counter-movement, gives the label a satisfying lag behind the shell. */
  innerStrength?: number
}

/**
 * Magnetic hover — the element leans toward the pointer and springs back on
 * exit. Disabled on touch devices and for reduced-motion users.
 */
export function Magnetic({ children, className, strength = 0.3, innerStrength = 0.12 }: MagneticProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shell = shellRef.current
    const inner = innerRef.current
    if (!shell || !inner) return
    if (!hasFinePointer() || prefersReducedMotion()) return

    const xTo = gsap.quickTo(shell, 'x', { duration: 0.7, ease: 'power3.out' })
    const yTo = gsap.quickTo(shell, 'y', { duration: 0.7, ease: 'power3.out' })
    const xiTo = gsap.quickTo(inner, 'x', {
      duration: 0.9,
      ease: 'power3.out'
    })
    const yiTo = gsap.quickTo(inner, 'y', {
      duration: 0.9,
      ease: 'power3.out'
    })

    const onMove = (event: MouseEvent) => {
      const rect = shell.getBoundingClientRect()
      const relX = event.clientX - (rect.left + rect.width / 2)
      const relY = event.clientY - (rect.top + rect.height / 2)
      xTo(relX * strength)
      yTo(relY * strength)
      xiTo(relX * innerStrength)
      yiTo(relY * innerStrength)
    }

    const onLeave = () => {
      xTo(0)
      yTo(0)
      xiTo(0)
      yiTo(0)
    }

    shell.addEventListener('mousemove', onMove)
    shell.addEventListener('mouseleave', onLeave)

    return () => {
      shell.removeEventListener('mousemove', onMove)
      shell.removeEventListener('mouseleave', onLeave)
    }
  }, [strength, innerStrength])

  return (
    <div ref={shellRef} className={cn('inline-flex will-change-transform', className)}>
      <div ref={innerRef} className="inline-flex will-change-transform">
        {children}
      </div>
    </div>
  )
}
