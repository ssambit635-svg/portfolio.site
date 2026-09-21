import { useEffect, useRef, useState } from 'react'
import { clamp, damp, lerp, prefersReducedMotion } from './motion'

/**
 * One shared, smoothed pointer for the whole app.
 *
 * A single rAF loop lerps the raw mouse position into a "heavy" position and
 * publishes it both as React state (throttled to ~30fps for components that
 * render on it) and as a mutable ref (for components that only touch the DOM
 * inside their own loop, so they never re-render).
 *
 * Coordinates are normalised to -1..1 around the viewport centre.
 */

export type PointerState = {
  /** smoothed, normalised */
  x: number
  y: number
  /** raw, in px */
  px: number
  py: number
  /** smoothed px */
  sx: number
  sy: number
  /** 0 until the first pointer move */
  active: number
}

const shared: PointerState = { x: 0, y: 0, px: 0, py: 0, sx: 0, sy: 0, active: 0 }

const raw = { x: 0, y: 0 }
let started = false
let loopStop: (() => void) | null = null
const listeners = new Set<(p: PointerState) => void>()

function ensureLoop() {
  if (started || typeof window === 'undefined') return
  started = true

  const reduced = prefersReducedMotion()

  const onMove = (event: PointerEvent) => {
    raw.x = event.clientX
    raw.y = event.clientY
    shared.active = 1
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  if (reduced) {
    // No smoothing theatre — just mirror the pointer for parallax consumers
    // that still want a hint of depth.
    const onMoveStatic = () => {
      shared.px = shared.sx = raw.x
      shared.py = shared.sy = raw.y
      shared.x = (raw.x / Math.max(window.innerWidth, 1)) * 2 - 1
      shared.y = (raw.y / Math.max(window.innerHeight, 1)) * 2 - 1
      listeners.forEach((l) => l(shared))
    }
    window.addEventListener('pointermove', onMoveStatic, { passive: true })
    loopStop = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointermove', onMoveStatic)
    }
    return
  }

  let last = performance.now()
  let publishAccumulator = 0
  let raf = 0

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now

    const t = damp(9, dt)
    shared.sx = lerp(shared.sx, raw.x, t)
    shared.sy = lerp(shared.sy, raw.y, t)
    shared.px = raw.x
    shared.py = raw.y
    shared.x = clamp((shared.sx / Math.max(window.innerWidth, 1)) * 2 - 1, -1, 1)
    shared.y = clamp((shared.sy / Math.max(window.innerHeight, 1)) * 2 - 1, -1, 1)

    publishAccumulator += dt
    if (publishAccumulator > 1 / 30) {
      publishAccumulator = 0
      listeners.forEach((l) => l(shared))
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  loopStop = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onMove)
  }
}

/** Subscribe imperatively (no re-renders). Returns an unsubscribe function. */
export function onPointer(fn: (p: PointerState) => void) {
  ensureLoop()
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Mutable snapshot of the smoothed pointer — read it inside your own rAF. */
export function usePointerRef() {
  useEffect(() => {
    ensureLoop()
  }, [])
  return useRef(shared)
}

/** Reactive snapshot, updated ~30fps. Use sparingly (it re-renders). */
export function usePointer() {
  const [state, setState] = useState({ x: 0, y: 0, active: 0 })

  useEffect(() => {
    ensureLoop()
    return onPointer((p) => setState({ x: p.x, y: p.y, active: p.active }))
  }, [])

  return state
}

export function stopPointerLoop() {
  loopStop?.()
  loopStop = null
  started = false
  listeners.clear()
}
