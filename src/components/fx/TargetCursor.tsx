import { useEffect, useRef } from 'react'
import { hasFinePointer } from '../../lib/utils'

/**
 * Custom cursor: a dot plus four corner brackets that rest around the
 * pointer and expand to frame any hovered `.cursor-target` element.
 * Renders nothing on touch devices.
 */
export function TargetCursor() {
  const enabled = hasFinePointer()
  const dotRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!enabled) return

    document.body.classList.add('target-cursor')

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let curX = mouseX
    let curY = mouseY
    let raf = 0

    let target: HTMLElement | null = null
    let pad = 6

    const applyFrame = (
      x: number,
      y: number,
      w: number,
      h: number,
      active: boolean
    ) => {
      const [tl, tr, bl, br] = frameRefs.current
      if (!tl || !tr || !bl || !br) return
      const size = active ? 14 : 5
      const set = (
        el: HTMLSpanElement,
        left: number,
        top: number,
        rotate: string
      ) => {
        el.style.transform = `translate(${left}px, ${top}px) ${rotate}`
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.opacity = active ? '1' : '0.85'
      }
      set(tl, x, y, 'translate(-50%, -50%)')
      set(tr, x + w, y, 'translate(-50%, -50%)')
      set(bl, x, y + h, 'translate(-50%, -50%)')
      set(br, x + w, y + h, 'translate(-50%, -50%)')
    }

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      const hit = (event.target as HTMLElement | null)?.closest?.(
        '.cursor-target'
      ) as HTMLElement | null
      target = hit ?? null
    }

    const onDown = () => {
      pad = 2
    }
    const onUp = () => {
      pad = 6
    }

    const loop = () => {
      curX += (mouseX - curX) * 0.2
      curY += (mouseY - curY) * 0.2

      const dot = dotRef.current
      if (dot) {
        dot.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%) scale(${
          target ? 0.6 : 1
        })`
      }

      if (target) {
        const rect = target.getBoundingClientRect()
        applyFrame(rect.left - pad, rect.top - pad, rect.width + pad * 2, rect.height + pad * 2, true)
      } else {
        applyFrame(curX - 10, curY - 10, 20, 20, false)
      }

      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    raf = requestAnimationFrame(loop)

    return () => {
      document.body.classList.remove('target-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  const bracket =
    'pointer-events-none fixed left-0 top-0 z-[999] transition-none border-foreground will-change-transform'

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[999] h-1.5 w-1.5 rounded-full bg-foreground will-change-transform"
        aria-hidden="true"
      />
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          ref={(el) => {
            frameRefs.current[i] = el
          }}
          className={`${bracket} ${
            i === 0
              ? 'border-l-2 border-t-2'
              : i === 1
                ? 'border-r-2 border-t-2'
                : i === 2
                  ? 'border-b-2 border-l-2'
                  : 'border-b-2 border-r-2'
          }`}
          aria-hidden="true"
        />
      ))}
    </>
  )
}
