import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { cn } from '../../lib/utils'
import { usePrefersReducedMotion } from '../../hooks'

type CounterProps = {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

/** Number that rolls up from zero when it scrolls into view. */
export function Counter({ value, decimals = 0, suffix = '', prefix = '', className, duration = 1.8 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`

      if (reduced) {
        el.textContent = format(value)
        return
      }

      const state = { n: 0 }
      gsap.to(state, {
        n: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = format(state.n)
        },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      })
    },
    {
      scope: ref,
      dependencies: [value, decimals, suffix, prefix, reduced],
      revertOnUpdate: true
    }
  )

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {`${prefix}${(0).toFixed(decimals)}${suffix}`}
    </span>
  )
}
