/**
 * App-wide "the preloader is finished" signal.
 *
 * Mount-time animations (hero scramble, etc.) subscribe here so they start
 * the moment the curtain lifts instead of playing behind the loader.
 */
let ready = false
const subs = new Set<() => void>()

export const isReady = () => ready

export function onReady(fn: () => void) {
  if (ready) {
    fn()
    return () => {}
  }
  subs.add(fn)
  return () => {
    subs.delete(fn)
  }
}

export function markReady() {
  if (ready) return
  ready = true
  subs.forEach((fn) => fn())
  subs.clear()
  window.dispatchEvent(new CustomEvent('app:ready'))
}
