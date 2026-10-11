import { profile } from '../lib/site'
import { ledLogos } from '../lib/ledLogos'
import board from '../assets/pegboard.jpg'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`

/** LED dot-matrix brand marks — X, GitHub, LinkedIn, Mail (four of the footer contacts). */
const LEDS: [string, string, string[]][] = [
  ['X', profile.x, ledLogos.x],
  ['GitHub', profile.github, ledLogos.github],
  ['LinkedIn', profile.linkedin, ledLogos.linkedin],
  ['Email', `mailto:${profile.email}`, ledLogos.mail],
]

export default function PegBoard() {
  return (
    <div className="board-wrap">
      <div className="board">
        <img src={board} alt="" />
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
