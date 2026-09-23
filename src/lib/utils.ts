import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isBrowser = typeof window !== 'undefined'

export function prefersReducedMotion() {
  return isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer() {
  return isBrowser && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%$+=/\\<>'
export const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
