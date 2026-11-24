import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { setScrollLocked } from '../hooks/useLenis'
import { prefersReducedMotion } from '../lib/utils'
import '../hero-power.css'

/**
 * The room comes up.
 *
 * The shutter lifts onto black — not onto the hero — and then the desk is
 * switched on in front of you: the light bar over the monitor coughs into
 * life, the panel strikes a white line, the line opens into a raster, the
 * phosphor settles into green, and only then does the black pull back to
 * reveal the photograph that was under it the whole time.
 *
 * Everything here is CSS keyframes on one overlay; the only JavaScript is the
 * measurement (where the light bar and the glass sit) and the two states, run
 * and done. It is skipped entirely for a visitor who asks for reduced motion,
 * and it never swallows a click: the overlay is `pointer-events: none`.
 */

/** How long the whole thing holds the page. Mirrored in `hero-power.css`. */
const TOTAL = 2900
/** Where the light bar sits on the 1376 × 768 photograph, in fractions. */
const LAMP = { x: 0.3596, y: 0.1655, w: 0.2776, h: 0.0285 }
/** The glass, measured off the same photograph — the same numbers `.hero-screen` uses. */
const GLASS = { x: 0.1781, y: 0.196, w: 0.6344, h: 0.378 }

type Phase = 'waiting' | 'running' | 'done'

export default function HeroPowerOn() {
  const [phase, setPhase] = useState<Phase>('waiting')
  const overlay = useRef<HTMLDivElement>(null)
  const box = useRef({ x: 0, y: 0, w: 0, h: 0 })

  // Where the monitor is, in viewport coordinates. Measured before paint and
  // again on a resize, so the light bar lands on the real bar at any width.
  const measure = () => {
    const wrapper = document.querySelector<HTMLElement>('.hero-monitor-wrapper')
    const node = overlay.current
    if (!wrapper || !node) return
    const rect = wrapper.getBoundingClientRect()
    box.current = { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
    const at = (fraction: { x: number; y: number; w: number; h: number }) => {
      node.style.setProperty('--x', `${rect.x + rect.width * fraction.x}px`)
      node.style.setProperty('--y', `${rect.y + rect.height * fraction.y}px`)
      node.style.setProperty('--w', `${rect.width * fraction.w}px`)
      node.style.setProperty('--h', `${rect.height * fraction.h}px`)
    }
    at(LAMP)
    const lamp = {
      x: rect.x + rect.width * LAMP.x,
      y: rect.y + rect.height * LAMP.y,
      w: rect.width * LAMP.w,
      h: rect.height * LAMP.h,
    }
    node.style.setProperty('--lamp-x', `${lamp.x}px`)
    node.style.setProperty('--lamp-y', `${lamp.y}px`)
    node.style.setProperty('--lamp-w', `${lamp.w}px`)
    node.style.setProperty('--lamp-h', `${lamp.h}px`)
    const glass = {
      x: rect.x + rect.width * GLASS.x,
      y: rect.y + rect.height * GLASS.y,
      w: rect.width * GLASS.w,
      h: rect.height * GLASS.h,
    }
    node.style.setProperty('--glass-x', `${glass.x}px`)
    node.style.setProperty('--glass-y', `${glass.y}px`)
    node.style.setProperty('--glass-w', `${glass.w}px`)
    node.style.setProperty('--glass-h', `${glass.h}px`)
  }

  useLayoutEffect(() => {
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase('done')
      return
    }
    let cancelled = false
    let timer = 0

    const start = () => {
      if (cancelled || phase !== 'waiting') return
      measure()
      setPhase('running')
      setScrollLocked(true)
      timer = window.setTimeout(() => {
        if (cancelled) return
        setPhase('done')
        setScrollLocked(false)
      }, TOTAL)
    }

    // The shutter dispatches this the moment its last panel is off the page.
    const onReady = () => start()
    window.addEventListener('site:ready', onReady)
    // A shutter can finish before this effect runs; the flag covers that.
    if ((window as unknown as { __siteReady?: boolean }).__siteReady) start()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('site:ready', onReady)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null

  return (
    <div
      ref={overlay}
      className="cine"
      data-run={phase === 'running' ? '1' : '0'}
      aria-hidden="true"
    >
      {/* The room, still dark. Not flat black: a room has walls and a floor. */}
      <div className="cine-room" />

      {/* The camera. It starts a little closer than the frame — further on a
          phone, where the desk would otherwise be a postage stamp — and pulls
          back onto the real photograph exactly as the black lifts. */}
      <div className="cine-stage">
        {/* The light bar over the monitor, and the bloom it throws up the wall. */}
        <div className="cine-lamp" />
        <div className="cine-lamp-bloom" />

        {/* The panel: a white bring-up line, the raster that opens out of it,
            the green it settles into, and the band that rolls down it. */}
        <div className="cine-panel">
          <div className="cine-raster" />
          <div className="cine-tube" />
          <div className="cine-sweep" />
        </div>
      </div>

      {/* The glow it throws into the room while it is still too bright. */}
      <div className="cine-bloom" />

      {/* Grain, so nothing in the frame is mathematically clean. */}
      <div className="cine-grain" />
    </div>
  )
}
