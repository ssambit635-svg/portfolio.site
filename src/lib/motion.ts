/**
 * Small motion helpers shared by the interactive layer.
 * Everything here is allocation-free on purpose — these run inside rAF loops.
 */

export type Vec2 = { x: number; y: number }

export const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Frame-rate independent lerp factor. */
export const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt)

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Apple-ish "expo out" — fast start, very long tail. Used by the doors. */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/** Critically-damped spring integration (stable at any dt). */
export function springStep(
  current: number,
  target: number,
  velocity: number,
  stiffness: number,
  damping: number,
  dt: number
) {
  const step = Math.min(dt, 1 / 30)
  const force = (target - current) * stiffness
  const nextVelocity = (velocity + force * step) * Math.exp(-damping * step)
  return { value: current + nextVelocity * step, velocity: nextVelocity }
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** requestAnimationFrame loop that cleans itself up on unmount. */
export function startLoop(fn: (now: number, dt: number) => void) {
  let raf = 0
  let last = performance.now()
  let alive = true

  const tick = (now: number) => {
    if (!alive) return
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    fn(now, dt)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    alive = false
    cancelAnimationFrame(raf)
  }
}
