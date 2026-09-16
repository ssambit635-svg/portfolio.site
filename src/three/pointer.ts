import { isBrowser, prefersReducedMotion } from '../lib/utils'

type PointerState = { x: number; y: number; active: boolean }

const state: PointerState = { x: 0, y: 0, active: false }
let bound = false

function onMove(event: PointerEvent) {
  state.x = (event.clientX / window.innerWidth) * 2 - 1
  state.y = (event.clientY / window.innerHeight) * 2 - 1
  state.active = true
}

function onLeave() {
  state.x = 0
  state.y = 0
  state.active = false
}

/** Page-level pointer position, normalised to -1..1. Bound lazily, once. */
export function getPointer(): PointerState {
  if (!bound && isBrowser && !prefersReducedMotion()) {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    bound = true
  }
  return state
}
