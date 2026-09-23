import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { cn } from '../../lib/utils'

type Props = {
  /** colour of the incoming blocks */
  color: string
  /** where on the page: 'top' overlays the top edge of parent, 'bottom' the bottom */
  edge?: 'top' | 'bottom'
  className?: string
}

/**
 * Curtis-style block dissolve: a grid of square cells randomly flips to the
 * next section's colour as you scroll through the boundary.
 */
export default function PixelTransition({ color, edge = 'top', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current!
    const cell = 96
    const cols = Math.ceil(window.innerWidth / cell)
    const rows = Math.ceil(el.offsetHeight / cell)
    el.style.setProperty('--cols', String(cols))
    el.innerHTML = ''
    const frag = document.createDocumentFragment()
    for (let i = 0; i < cols * rows; i++) {
      const b = document.createElement('i')
      b.style.background = color
      frag.appendChild(b)
    }
    el.appendChild(frag)
    const cells = Array.from(el.children) as HTMLElement[]

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        end: 'bottom 5%',
        scrub: 0.4
      }
    })
    // order: for top edge, blocks appear bottom→top (incoming colour grows upward)
    const order = cells
      .map((c, i) => ({ c, r: Math.floor(i / cols) }))
      .sort((a, b) => (edge === 'top' ? b.r - a.r : a.r - b.r) + (Math.random() - 0.5) * 3)
      .map((o) => o.c)
    tl.fromTo(order, { opacity: 0 }, { opacity: 1, duration: 1, stagger: { each: 0.6 / order.length, from: 'random' } })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [color, edge])

  useEffect(() => {
    const r = () => ScrollTrigger.refresh()
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'pointer-events-none absolute left-0 z-10 grid w-full grid-cols-[repeat(var(--cols),1fr)] grid-rows-[repeat(auto-fill,96px)]',
        edge === 'top' ? 'top-0 -translate-y-full' : 'bottom-0 translate-y-full',
        className
      )}
      style={{ height: 288 }}
    />
  )
}
