import { Fragment, useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/utils'

/**
 * Scroll-scrubbed text reveal: every letter starts dim and brightens as the
 * paragraph travels through the viewport. Base markup stays fully bright, so
 * no-JS, SSR and reduced-motion readers get plain readable text.
 */
export default function RevealText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const chars = el.querySelectorAll('[data-ch]')
    const tween = gsap.fromTo(
      chars,
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  const words = text.split(' ')
  return (
    <p ref={ref}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="rw">
            {Array.from(word).map((ch, ci) => (
              <span key={ci} data-ch>
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </p>
  )
}
