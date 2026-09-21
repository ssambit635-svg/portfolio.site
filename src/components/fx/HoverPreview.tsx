import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { hasFinePointer } from '../../lib/utils'

/**
 * Cursor-following image preview. Wrap any block — while hovered, the image
 * floats beside the pointer with a buttery lerp, a tilt that follows mouse
 * velocity and a gold hairline frame. Ignores touch devices entirely.
 */
export function HoverPreview({
  src,
  alt = '',
  caption,
  children
}: {
  src: string
  alt?: string
  caption?: string
  children: ReactNode
}) {
  const enabled = hasFinePointer()
  const [visible, setVisible] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0, rot: 0, scale: 0.9 })
  const rafRef = useRef(0)

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const animate = () => {
    const el = imgRef.current
    if (!el) return
    const c = current.current
    const prevX = c.x
    c.x += (target.current.x - c.x) * 0.14
    c.y += (target.current.y - c.y) * 0.14
    c.scale += ((visible ? 1 : 0.92) - c.scale) * 0.16
    const velocity = c.x - prevX
    const targetRot = Math.max(-9, Math.min(9, velocity * 0.5))
    c.rot += (targetRot - c.rot) * 0.1

    // Keep the preview on screen vertically.
    const flip = target.current.y > window.innerHeight - 280
    el.style.transform = `translate3d(${(c.x + 30).toFixed(2)}px, ${(c.y + (flip ? -250 : 30)).toFixed(
      2
    )}px, 0) rotate(${c.rot.toFixed(2)}deg) scale(${c.scale.toFixed(3)})`
    rafRef.current = requestAnimationFrame(animate)
  }

  const onMove = (event: MouseEvent) => {
    target.current = { x: event.clientX, y: event.clientY }
  }

  const onEnter = (event: MouseEvent) => {
    if (!enabled) return
    current.current = { x: event.clientX + 30, y: event.clientY + 30, rot: 0, scale: 0.92 }
    target.current = { x: event.clientX, y: event.clientY }
    setVisible(true)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
  }

  const onLeave = () => {
    setVisible(false)
    cancelAnimationFrame(rafRef.current)
  }

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {enabled && (
        <div
          ref={imgRef}
          className={`pointer-events-none fixed left-0 top-0 z-40 w-60 overflow-hidden rounded-xl p-[1px] transition-opacity duration-300 sm:w-72 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'linear-gradient(140deg, rgb(226 183 106 / 0.6), rgb(255 246 226 / 0.25) 38%, rgb(214 152 132 / 0.45) 72%, rgb(122 176 165 / 0.35))',
            boxShadow: '0 28px 70px rgb(0 0 0 / 0.55), 0 0 40px rgb(226 183 106 / 0.12)'
          }}
          aria-hidden="true"
        >
          <div className="overflow-hidden rounded-[11px] bg-card">
            <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            {caption && (
              <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>{caption}</span>
                <span style={{ color: 'rgb(226 183 106)' }}>hover</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
