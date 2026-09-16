import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { hasFinePointer } from '../../lib/utils'

/**
 * Cursor-following image preview. Wrap any block — while hovered, the image
 * floats beside the pointer with a buttery lerp and a tilt that follows the
 * mouse velocity. Ignores touch devices entirely.
 */
export function HoverPreview({
  src,
  alt = '',
  children
}: {
  src: string
  alt?: string
  children: ReactNode
}) {
  const enabled = hasFinePointer()
  const [visible, setVisible] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0, rot: 0 })
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
    const velocity = c.x - prevX
    const targetRot = Math.max(-10, Math.min(10, velocity * 0.55))
    c.rot += (targetRot - c.rot) * 0.1

    // Keep the preview on screen vertically.
    const flip = target.current.y > window.innerHeight - 260
    el.style.transform = `translate3d(${c.x + 28}px, ${c.y + (flip ? -240 : 28)}px, 0) rotate(${c.rot}deg)`
    rafRef.current = requestAnimationFrame(animate)
  }

  const onMove = (event: MouseEvent) => {
    target.current = { x: event.clientX, y: event.clientY }
  }

  const onEnter = (event: MouseEvent) => {
    if (!enabled) return
    current.current = { x: event.clientX + 28, y: event.clientY + 28, rot: 0 }
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
          className={`pointer-events-none fixed left-0 top-0 z-40 w-60 overflow-hidden rounded-lg border border-border bg-card shadow-2xl transition-opacity duration-300 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
        </div>
      )}
    </div>
  )
}
