import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Map a value from one range to another, clamped. */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1)
  return outMin + (outMax - outMin) * t
}

export const isBrowser = typeof window !== 'undefined'

export function prefersReducedMotion() {
  if (!isBrowser) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer() {
  if (!isBrowser) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
