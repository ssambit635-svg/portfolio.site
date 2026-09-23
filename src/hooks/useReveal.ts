import { useEffect } from 'react'

/** Adds .is-in to any [data-reveal] element when it enters the viewport. */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const d = Number((e.target as HTMLElement).dataset.reveal || 0)
            setTimeout(() => e.target.classList.add('is-in'), d)
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
