import { useRef, type PointerEvent } from 'react'
import { profile } from '../lib/site'
import { ledLogos } from '../lib/ledLogos'
import board from '../assets/pegboard.jpg'
import '../pegboard.css'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`

/** LED dot-matrix brand marks — X, GitHub, LinkedIn, Mail. */
const LEDS: [string, string, string[]][] = [
  ['X', profile.x, ledLogos.x],
  ['GitHub', profile.github, ledLogos.github],
  ['LinkedIn', profile.linkedin, ledLogos.linkedin],
  ['Email', `mailto:${profile.email}`, ledLogos.mail],
]

/**
 * The board is the real pegboard photograph: pegboard holes, the real headphone
 * hook, the real IDC plug stub already in the frame. Nothing else is painted onto
 * it — no can, no zoom card, no ribbon drawn over the top. The only overlays are
 * the contact module (a physical module bolted to the board, with its own screws
 * and port) and the polaroid, both positioned as a percentage of the artwork so
 * they stay glued to the holes.
 */
export default function PegBoard() {
  const boardRef = useRef<HTMLDivElement>(null)

  /** A degree of parallax: the board hangs on a wall, so it answers the pointer
   *  by a fraction of a degree. Written straight to the node so a pointer move
   *  never re-renders the LEDs. */
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    const node = boardRef.current
    if (!node) return
    const box = node.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    node.style.setProperty('--tilt-y', (x * 1.4).toFixed(3))
    node.style.setProperty('--tilt-x', (y * -1.4).toFixed(3))
  }
  const settle = () => {
    const node = boardRef.current
    if (!node) return
    node.style.setProperty('--tilt-y', '0')
    node.style.setProperty('--tilt-x', '0')
  }

  return (
    <div className="board-wrap">
      <div
        className="board"
        ref={boardRef}
        onPointerMove={tilt}
        onPointerLeave={settle}
      >
        <img src={board} alt="" loading="lazy" decoding="async" />
        <div className="board-underlight" aria-hidden="true" />
        <div className="board-ledspill" aria-hidden="true" />

        <nav className="led-module" aria-label="Contact links">
          <i className="lm-screw t" aria-hidden="true" />
          <i className="lm-screw b" aria-hidden="true" />
          <b className="lm-tab t1" aria-hidden="true" />
          <b className="lm-tab t2" aria-hidden="true" />
          <b className="lm-tab t3" aria-hidden="true" />
          <b className="lm-port" aria-hidden="true" />
          {LEDS.map(([label, href, rows]) => (
            <a
              key={label}
              className="led-ico"
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              aria-label={label}
            >
              <span
                className="led-grid"
                style={{ gridTemplateColumns: `repeat(${rows[0].length}, 1fr)` }}
                aria-hidden="true"
              >
                {rows.flatMap((row, r) =>
                  Array.from(row).map((ch, i) => <i key={`${r}-${i}`} className={ch === '1' ? 'on' : ''} />),
                )}
              </span>
            </a>
          ))}
        </nav>

        <figure className="polaroid">
          <span className="pin" aria-hidden="true" />
          <img src={PORTRAIT} alt="Portrait of Sambit Swain" />
          <figcaption>might ship later idk</figcaption>
        </figure>
      </div>
    </div>
  )
}
