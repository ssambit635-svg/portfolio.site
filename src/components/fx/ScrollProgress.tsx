import { useEffect, useRef } from 'react'

/**
 * Reading-progress hairline pinned to the top of the viewport.
 * A single scroll listener writes `transform: scaleX()` on one node — no
 * state, no re-render, and it coexists happily with Lenis.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const update = () => {
      rafRef.current = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 4 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
      bar.style.transform = `scaleX(${progress.toFixed(4)})`
      bar.style.opacity = progress > 0.004 ? '1' : '0'
    }

    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 opacity-0 transition-opacity duration-300"
        style={{
          background:
            'linear-gradient(90deg, rgb(122 176 165 / 0.9), rgb(226 183 106) 45%, rgb(255 246 226) 62%, rgb(214 152 132) 88%)',
          boxShadow: '0 0 14px rgb(226 183 106 / 0.55)'
        }}
      />
    </div>
  )
}
