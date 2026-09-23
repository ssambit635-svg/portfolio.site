import { useEffect } from 'react'

/**
 * Sections declare data-theme="dark|lime". Whichever section crosses the
 * header line sets <html data-theme> so the fixed chrome recolours itself.
 */
export function useSectionTheme() {
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>('[data-theme]'))
    const update = () => {
      const y = 40
      let cur = 'dark'
      for (const s of secs) {
        const r = s.getBoundingClientRect()
        if (r.top <= y && r.bottom > y) cur = s.dataset.theme ?? 'dark'
      }
      document.documentElement.dataset.theme = cur
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
}
