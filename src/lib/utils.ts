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

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/**
 * Brand colours are tuned for white backgrounds — on this site's near-black
 * surfaces (GitHub black, cryptography navy…) they vanish. Lift anything too
 * dark into a readable range without changing the hue.
 */
export function readableOnDark(hex: string, minLightness = 0.62) {
  const { r, g, b } = hexToRgb(hex)
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) * 60
    else if (max === G) h = ((B - R) / d + 2) * 60
    else h = ((R - G) / d + 4) * 60
  }
  const L = l < minLightness ? minLightness : l
  return `hsl(${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(L * 100).toFixed(0)}%)`
}
