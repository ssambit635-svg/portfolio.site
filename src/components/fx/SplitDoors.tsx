import { useEffect, useState, type ReactNode } from 'react'

/**
 * Horizontal gate doors. Two solid panels cover the screen; when `open`
 * flips, they slide apart to the sides like stage doors, revealing what is
 * underneath. Optional `children` are rendered in both halves (each clipped
 * to its own side) so the content itself appears to split open.
 */
export function SplitDoors({
  open,
  children,
  bg = '#0a0a0a',
  zIndex = 100,
  durationMs = 1150,
  onDone
}: {
  open: boolean
  children?: ReactNode
  bg?: string
  zIndex?: number
  durationMs?: number
  onDone?: () => void
}) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      setGone(true)
      onDone?.()
    }, durationMs + 80)
    return () => window.clearTimeout(timer)
  }, [open, durationMs, onDone])

  if (gone) return null

  const panelStyle = (dir: 1 | -1): React.CSSProperties => ({
    background: bg,
    transform: open ? `translateX(${dir * 101}%)` : 'translateX(0)',
    transition: `transform ${durationMs}ms cubic-bezier(0.83, 0, 0.17, 1)`
  })

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex, pointerEvents: open ? 'none' : 'auto' }}
      aria-hidden={open}
    >
      {/* Left panel — clips the left half of the shared content */}
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden" style={panelStyle(-1)}>
        {children && (
          <div className="absolute left-0 top-0 flex h-full w-screen items-center justify-center">
            {children}
          </div>
        )}
        <div className="absolute right-0 top-0 h-full w-px bg-white/15 shadow-[0_0_24px_rgba(255,255,255,0.35)]" />
      </div>

      {/* Right panel — clipped to the right half */}
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden" style={panelStyle(1)}>
        {children && (
          <div className="absolute right-0 top-0 flex h-full w-screen items-center justify-center">
            {children}
          </div>
        )}
        <div className="absolute left-0 top-0 h-full w-px bg-white/15 shadow-[0_0_24px_rgba(255,255,255,0.35)]" />
      </div>
    </div>
  )
}
