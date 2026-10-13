import { useEffect, useState, type CSSProperties } from 'react'

/**
 * The hero's on-screen readout.
 *
 * `hero-monitor.jpg` is a photograph of a dark desk, and the reference shot had
 * exactly one thing on the panel: a lock-screen clock sitting low-left — a huge
 * time over a small weekday line. That is reproduced here as real DOM instead of
 * pixels baked into the JPEG, so it stays selectable, stays crisp at any zoom,
 * and can animate on its own schedule instead of the image's.
 *
 * Position is in percentages of `.hero-frame`, which is locked to the photo's own
 * 1376×768 ratio, and the frame is a container, so the type sizes in
 * src/index.css are in `cqw`: the readout scales with the monitor rather than
 * the viewport. A phone gets the same lock screen, just smaller.
 *
 * By default the readout shows the still from the reference photo. Pass `live`
 * and it shows the visitor's own local time instead, formatted identically —
 * 24-hour, no seconds, so the panel reads as a clock and not a timestamp.
 */

const REFERENCE = { time: '12:27', date: 'Wednesday, December 7' }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n: number) => String(n).padStart(2, '0')
const timeText = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const dateText = (d: Date) => `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`

/**
 * Ticked every 15s — a minute-hand clock never needs a second hand.
 *
 * Only armed when `live`, and always empty on the first pass: the prerendered
 * HTML carries the reference still, so the client paints the same thing before
 * the effect swaps in the visitor's time. No timer, no flicker, no mismatch.
 */
function useLocal(active: boolean) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    if (!active) return
    const tick = () => setNow(new Date())
    tick()
    const id = setInterval(tick, 15_000)
    return () => clearInterval(id)
  }, [active])
  return now
}

export default function HeroClock({ live = false }: { live?: boolean }) {
  const local = useLocal(live)
  const time = local ? timeText(local) : REFERENCE.time
  const date = local ? dateText(local) : REFERENCE.date

  return (
    <div className="hero-clock">
      {/* the wake bloom — the panel lifting out of black, then settling */}
      <i className="hero-clock-bloom" aria-hidden="true" />
      {/* one wipe of the backlight as the glyphs land */}
      <i className="hero-clock-sweep" aria-hidden="true" />

      <time className="hero-clock-time" dateTime={time} aria-label={`${time}, ${date}`}>
        {Array.from(time).map((char, i) => (
          <span
            key={`${char}-${i}`}
            className={char === ':' ? 'hc-char hc-colon' : 'hc-char'}
            style={{ '--hc-i': i } as CSSProperties}
            aria-hidden="true"
          >
            {char}
          </span>
        ))}
      </time>

      <i className="hero-clock-rule" aria-hidden="true" />
      <p className="hero-clock-date" aria-hidden="true">{date}</p>
    </div>
  )
}
