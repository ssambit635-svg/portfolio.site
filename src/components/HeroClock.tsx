import { useEffect, useState } from 'react'

/**
 * The desk clock.
 *
 * It sits exactly where the coffee mug used to be in hero-monitor.jpg — same
 * footprint on the wood, same contact shadow falling to the right — so the desk
 * keeps a prop instead of a hole, and the prop is the thing the reference shot
 * actually showed: a clock. Built in CSS rather than painted into the JPEG
 * because the readout has to tell the time.
 *
 * The enclosure is sized once, as a share of the frame, and is itself an inline
 * size container: every part of the face (digits, date strip, LED pitch, bevels,
 * bloom) is a share of *the clock's own width*. So the small-screen rule that
 * moves it only changes where it stands and how wide it is — the device stays in
 * proportion to itself at any size, and never turns into a screen-sized clock on
 * a phone.
 *
 * By default it shows the still from the reference photo. Pass `live` and it
 * shows the visitor's own time, formatted the same way.
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
 * Ticked every 15s — a minute-hand clock never needs a second hand. Armed only
 * when `live`, and empty on the first pass: the prerendered HTML carries the
 * reference still, so the client paints the same thing before the effect swaps
 * in the visitor's time. No timer, no flicker, no hydration mismatch.
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
    <div className="hero-deskclock">
      {/* The two things that pin it to the desk: the shadow it throws and the
          light its display pools on the wood. Both stay outside .dc-case on
          purpose — the case is the size container, and a container isolates
          blending, so the spill would stop being light and become a decal. */}
      <i className="dc-cast" aria-hidden="true" />
      <i className="dc-glow" aria-hidden="true" />

      <div className="dc-case">
        <i className="dc-top" aria-hidden="true" />
        <div className="dc-glass">
          <div className="dc-face">
            <time className="dc-time" dateTime={time} aria-label={`${time}, ${date}`}>
              {Array.from(time).map((char, i) => (
                <span key={`${char}-${i}`} className={char === ':' ? 'dc-d dc-colon' : 'dc-d'} aria-hidden="true">
                  {char}
                </span>
              ))}
            </time>
            <p className="dc-date" aria-hidden="true">{date}</p>
          </div>
          <i className="dc-matrix" aria-hidden="true" />
          <i className="dc-scan" aria-hidden="true" />
          <i className="dc-sheen" aria-hidden="true" />
        </div>
        <span className="dc-mark" aria-hidden="true">SS</span>
      </div>
    </div>
  )
}
