import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * Horizontal gate doors. Two panels cover the screen; when `open` flips they
 * slide apart like stage doors, revealing what is underneath. Optional
 * `children` are rendered in both halves (each clipped to its own side) so the
 * content itself appears to split open.
 *
 * The panels are lit: a deep ink gradient, a hairline of gold on the meeting
 * edge and a faint bloom that dies away as the doors travel. Mounting the
 * component with `open` already true still animates — it paints one closed
 * frame first, so it can be used as a self-contained reveal.
 */

const EASE = 'cubic-bezier(0.72, 0, 0.16, 1)'

export function SplitDoors({
  open,
  children,
  bg = '#05050c',
  zIndex = 100,
  durationMs = 1250,
  seam = 'rgb(226 183 106 / 0.55)',
  onDone
}: {
  open: boolean
  children?: ReactNode
  bg?: string
  zIndex?: number
  durationMs?: number
  seam?: string
  onDone?: () => void
}) {
  const [gone, setGone] = useState(false)
  // A door with content inside must paint one closed frame before it swings
  // (so the shared content is visible before it splits); an empty overlay can
  // start swinging immediately.
  const [swing, setSwing] = useState(open && !children)

  useEffect(() => {
    if (!open) return
    // One closed frame before the swing, even when mounted already-open.
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setSwing(true)))
    const timer = window.setTimeout(() => {
      setGone(true)
      onDone?.()
    }, durationMs + 120)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [open, durationMs, onDone])

  if (gone) return null

  const panelStyle = (dir: 1 | -1): CSSProperties => ({
    background: `linear-gradient(${dir === -1 ? '100deg' : '260deg'}, ${bg} 0%, color-mix(in srgb, ${bg} 86%, #1b1730) 52%, color-mix(in srgb, ${bg} 94%, #0b0d18) 100%)`,
    transform: swing ? `translateX(${dir * 101}%)` : 'translateX(0)',
    transition: `transform ${durationMs}ms ${EASE}`
  })

  return (
    <div className="fixed inset-0" style={{ zIndex, pointerEvents: swing ? 'none' : 'auto' }} aria-hidden={swing}>
      {/* Left panel — clips the left half of the shared content */}
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden" style={panelStyle(-1)}>
        {children && (
          <div className="absolute left-0 top-0 flex h-full w-screen items-center justify-center">{children}</div>
        )}
        <div
          className="absolute right-0 top-0 h-full w-px"
          style={{
            background: `linear-gradient(180deg, transparent, ${seam} 18%, rgb(255 246 226 / 0.9) 50%, ${seam} 82%, transparent)`,
            boxShadow: `0 0 26px ${seam}, 8px 0 40px rgb(0 0 0 / 0.5)`,
            opacity: swing ? 0.35 : 1,
            transition: `opacity ${durationMs}ms ${EASE}`
          }}
        />
      </div>

      {/* Right panel — clipped to the right half */}
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden" style={panelStyle(1)}>
        {children && (
          <div className="absolute right-0 top-0 flex h-full w-screen items-center justify-center">{children}</div>
        )}
        <div
          className="absolute left-0 top-0 h-full w-px"
          style={{
            background: `linear-gradient(180deg, transparent, ${seam} 18%, rgb(255 246 226 / 0.9) 50%, ${seam} 82%, transparent)`,
            boxShadow: `0 0 26px ${seam}, -8px 0 40px rgb(0 0 0 / 0.5)`,
            opacity: swing ? 0.35 : 1,
            transition: `opacity ${durationMs}ms ${EASE}`
          }}
        />
      </div>
    </div>
  )
}
