import { useEffect, useState, type CSSProperties } from 'react'
import { setScrollLocked } from '../hooks/useLenis'
import { prefersReducedMotion } from '../lib/utils'
import '../preloader.css'

/**
 * The shutter.
 *
 * A black screen, a grid of hairline seams, a line of type that arrives one
 * blurred letter at a time, and then four vertical panels that lift off the
 * page from the bottom up, one after another, until the site is standing there
 * in the open. It is the loading sequence in `Recording 2026-10-16 194802.mp4`,
 * rebuilt rather than filmed.
 *
 * Rebuilt, because a screen recording of a preloader is a terrible preloader:
 * it is 1180 × 606 of h264 with the window chrome baked in, it is soft on a
 * retina screen and blocky on a 4K one, and the type inside it is a photograph
 * of type — you cannot select it, it cannot be read by a screen reader, and it
 * cannot be translated. Here every edge is a real edge: the seams are one
 * device pixel, the letters are the site's own Inter at the site's own weights,
 * and the panels are the page itself, revealed rather than replayed. The result
 * is the same picture, at whatever resolution the visitor happens to have.
 *
 * The page behind is the real page. The panels are shutters over it, not a
 * video of it, so what slides away at the end is exactly what was underneath —
 * there is no cut, no second hero, and nothing to download.
 *
 * Nothing starts until the hero photograph and the fonts are in, because a
 * shutter that lifts onto an empty hero is worse than no shutter at all. A
 * safety timer releases it anyway, so a font that never arrives cannot hold
 * the page hostage.
 *
 * The recording runs its cycle the other way round — the panels lift, the page
 * is shown, and the caption arrives afterwards — because in the recording the
 * caption labels content that is already on screen. A loader has to be the
 * other way round: the caption comes first, and the panels then uncover what
 * it was talking about. Everything else is the recording's own: the black, the
 * grid of seams, the letter at a time, the panels lifting from the bottom up
 * with half a second between them.
 */

/** The video's grid: four columns, three seams between them. */
const COLUMNS = 4

/** The line that arrives one blurred letter at a time. */
const CAPTION = 'Waking the desk'

/** Per-letter cadence, taken off the recording: a letter every ~42ms, each one
 *  coming into focus over ~110ms, so two or three are always in flight. */
const CHAR_MS = 42
const CHAR_FADE = 110
/** The pause before the first letter, while the seams are still fading in. */
const CAPTION_IN = 260
/** The gap between one panel lifting and the next — the recording's 0.6s. */
const STAGGER = 500
/** How long one panel takes to lift. */
const LIFT = 300
/** How long the last thing hangs around before the page takes over. */
const TAIL = 220
/** The cap on waiting for assets. */
const SAFETY = 1200
/** The shortest the whole thing may last, so it never flashes. */
const MINIMUM = 380

export default function Preloader() {
  const [done, setDone] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true)
      return
    }

    let cancelled = false
    let released = false
    let safetyTimer = 0
    let minimumTimer = 0
    let finishTimer = 0
    let fadeTimer = 0
    const startedAt = performance.now()
    setScrollLocked(true)

    const heroImage = document.querySelector<HTMLImageElement>('.hero-monitor')
    const imageReady = heroImage ? heroImage.decode().catch(() => undefined) : Promise.resolve()
    const fontsReady = document.fonts?.ready ? document.fonts.ready.catch(() => undefined) : Promise.resolve()

    const release = () => {
      if (cancelled || released) return
      released = true
      const wait = Math.max(0, MINIMUM - (performance.now() - startedAt))
      minimumTimer = window.setTimeout(() => {
        if (cancelled) return
        setReady(true)
        // The whole sequence is timed from here: the letters, then the panels.
        const captionEnd = CAPTION_IN + CAPTION.length * CHAR_MS + CHAR_FADE
        const last = Math.max(0, captionEnd - 260) + (COLUMNS - 1) * STAGGER + LIFT
        finishTimer = window.setTimeout(() => {
          if (cancelled) return
          setLeaving(true)
          fadeTimer = window.setTimeout(() => {
            if (cancelled) return
            setScrollLocked(false)
            setDone(true)
          }, 280)
        }, last + TAIL)
      }, wait)
    }

    const safety = new Promise<void>(resolve => { safetyTimer = window.setTimeout(resolve, SAFETY) })
    void Promise.race([Promise.all([imageReady, fontsReady]), safety]).then(release)

    return () => {
      cancelled = true
      window.clearTimeout(safetyTimer)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(finishTimer)
      window.clearTimeout(fadeTimer)
      setScrollLocked(false)
    }
  }, [])

  if (done || reduced) return null

  const letters = Array.from(CAPTION)
  const captionEnd = CAPTION_IN + letters.length * CHAR_MS + CHAR_FADE
  const style = {
    '--pl-caption-in': `${CAPTION_IN}ms`,
    '--pl-char': `${CHAR_MS}ms`,
    '--pl-char-fade': `${CHAR_FADE}ms`,
    '--pl-caption-out': `${captionEnd}ms`,
    '--pl-lift-delay': `${Math.max(0, captionEnd - 260)}ms`,
    '--pl-stagger': `${STAGGER}ms`,
    '--pl-lift': `${LIFT}ms`,
  } as CSSProperties

  return (
    <div
      className={`preloader${ready ? ' is-ready' : ''}${leaving ? ' is-leaving' : ''}`}
      style={style}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{CAPTION}</span>

      {/* The shutters. Four columns of black, each one lifted off the page from
          the bottom up, one after the next. */}
      <div className="preloader-shutters" aria-hidden="true">
        {Array.from({ length: COLUMNS }, (_, i) => (
          <i key={i} className="preloader-shutter" style={{ '--pl-i': i } as CSSProperties} />
        ))}
      </div>

      {/* The seams: the grid the panels are cut on, and the only thing on screen
          while the letters are still arriving. */}
      <div className="preloader-seams" aria-hidden="true">
        {Array.from({ length: COLUMNS - 1 }, (_, i) => (
          <i key={i} className="preloader-seam" style={{ '--pl-i': i + 1 } as CSSProperties} />
        ))}
      </div>

      {/* The line, one blurred letter at a time. */}
      <p className="preloader-caption" aria-hidden="true">
        {letters.map((letter, i) => (
          <span key={`${letter}-${i}`} style={{ '--pl-i': i } as CSSProperties}>
            {letter === ' ' ? ' ' : letter}
          </span>
        ))}
      </p>
    </div>
  )
}
