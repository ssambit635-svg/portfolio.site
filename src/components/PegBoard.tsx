import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { profile } from '../lib/site'
import { ledLogos } from '../lib/ledLogos'
import { CABLE, PLUG } from '../lib/ribbon'
import board from '../assets/pegboard-esp32-warm.png'
import esp32Detail from '../assets/esp32-detail.png'
import '../pegboard.css'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`

/** LED dot-matrix brand marks — X, GitHub, LinkedIn, Mail. */
const LEDS: [string, string, string[]][] = [
  ['X', profile.x, ledLogos.x],
  ['GitHub', profile.github, ledLogos.github],
  ['LinkedIn', profile.linkedin, ledLogos.linkedin],
  ['Email', `mailto:${profile.email}`, ledLogos.mail],
]

/** Plug body, in its own (rotated) frame. */
const PLUG_RECT = {
  x: PLUG.cx - PLUG.width / 2,
  y: PLUG.cy - PLUG.height / 2,
  width: PLUG.width,
  height: PLUG.height,
}

export default function PegBoard() {
  const [pointerOnDevice, setPointerOnDevice] = useState(false)
  const [pinned, setPinned] = useState(false)
  const deviceAwake = pointerOnDevice || pinned
  const boardRef = useRef<HTMLDivElement>(null)

  /** A degree or so of parallax: the board is a thing on a wall, not a texture.
   *  Written straight to the node so a pointer move never re-renders the LEDs. */
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    const node = boardRef.current
    if (!node) return
    const box = node.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    node.style.setProperty('--tilt-y', (x * 1.8).toFixed(3))
    node.style.setProperty('--tilt-x', (y * -1.8).toFixed(3))
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

        <svg
          className="esp32-cable"
          viewBox="0 0 928 1152"
          aria-hidden="true"
          focusable="false"
          style={{ '--cable-run': CABLE.length } as CSSProperties}
        >
          <defs>
            {/* Key light sits top-left of the frame, so the ribbon's upper edge
                catches it and the underside falls into the board's own shadow. */}
            <linearGradient id="cable-face" gradientUnits="userSpaceOnUse" x1="0" y1="298" x2="0" y2="448">
              <stop offset="0" stopColor="#9a8d78" />
              <stop offset="0.4" stopColor="#82765f" />
              <stop offset="0.75" stopColor="#655c4c" />
              <stop offset="1" stopColor="#4a4235" />
            </linearGradient>
            <linearGradient id="plug-face" x1="0" y1="0" x2="0.45" y2="1">
              <stop offset="0" stopColor="#5c5445" />
              <stop offset="0.42" stopColor="#332e25" />
              <stop offset="1" stopColor="#171410" />
            </linearGradient>
            <linearGradient id="cable-pulse" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffca86" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff3de" stopOpacity="0.95" />
              <stop offset="1" stopColor="#ffca86" stopOpacity="0" />
            </linearGradient>
            {/* The dot-matrix module spills a little of its green onto anything
                lying next to it — including the near end of the ribbon. */}
            <radialGradient id="cable-green" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#8affbc" stopOpacity="0.42" />
              <stop offset="0.55" stopColor="#8affbc" stopOpacity="0.14" />
              <stop offset="1" stopColor="#8affbc" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cable-warm" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffb765" stopOpacity="0.4" />
              <stop offset="1" stopColor="#ffb765" stopOpacity="0" />
            </radialGradient>

            {/* A contact shadow: tight, dark and barely offset. Anything looser
                makes the cable read as hovering in front of the board. */}
            <filter id="cable-contact" x="-8%" y="-70%" width="120%" height="260%">
              <feDropShadow dx="2.2" dy="3" stdDeviation="1.7" floodColor="#000" floodOpacity="0.62" />
            </filter>
            <filter id="cable-ao" x="-8%" y="-90%" width="120%" height="300%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id="cable-soft" x="-30%" y="-160%" width="160%" height="420%">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
            <filter id="plug-shadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="2.5" dy="3.2" stdDeviation="1.9" floodColor="#000" floodOpacity="0.6" />
            </filter>

            <clipPath id="cable-clip">
              <path d={CABLE.outline} />
            </clipPath>
          </defs>

          {/* Occlusion pooling under the slack, then the ribbon itself. */}
          <path className="cable-ao" d={CABLE.outline} filter="url(#cable-ao)" />
          <path d={CABLE.outline} fill="url(#cable-face)" filter="url(#cable-contact)" />

          <g clipPath="url(#cable-clip)">
            {CABLE.stripes.map((d, index) => (
              <path
                key={`stripe-${index}`}
                d={d}
                fill="none"
                stroke={index % 2 ? '#3b352a' : '#cdc1a8'}
                strokeOpacity={index % 2 ? 0.3 : 0.2}
                strokeWidth="0.7"
              />
            ))}
            <path d={CABLE.shade} fill="none" stroke="#15120e" strokeOpacity="0.55" strokeWidth="3.4" filter="url(#cable-soft)" />
            <path d={CABLE.sheen} fill="none" stroke="#ffeacb" strokeOpacity="0.17" strokeWidth="2.6" filter="url(#cable-soft)" />
            <path d={CABLE.edge} fill="none" stroke="#fff4de" strokeOpacity="0.2" strokeWidth="0.9" />
            <ellipse cx="300" cy="398" rx="134" ry="104" fill="url(#cable-green)" style={{ mixBlendMode: 'screen' }} />
            <ellipse cx="702" cy="328" rx="86" ry="70" fill="url(#cable-warm)" style={{ mixBlendMode: 'screen' }} />
            <path className="cable-pulse" d={CABLE.centre} fill="none" stroke="url(#cable-pulse)" strokeWidth="12" strokeLinecap="round" />
            <path className="cable-pulse cable-pulse-late" d={CABLE.centre} fill="none" stroke="url(#cable-pulse)" strokeWidth="12" strokeLinecap="round" />
          </g>

          {/* IDC plug clamped onto the header, drawn last so the ribbon feeds
              out from underneath it. */}
          <g filter="url(#plug-shadow)">
            <g transform={`rotate(${PLUG.angle} ${PLUG.cx} ${PLUG.cy})`}>
              <rect {...PLUG_RECT} rx="2.6" fill="url(#plug-face)" stroke="#0a0908" strokeWidth="1" />
              {/* Lit chamfer along the top face. */}
              <path
                d={`M${PLUG_RECT.x + 4} ${PLUG_RECT.y + 1.6}H${PLUG_RECT.x + PLUG_RECT.width - 4}`}
                fill="none"
                stroke="#9c8f78"
                strokeOpacity="0.32"
                strokeWidth="1"
              />
              {/* Moulded ribs: lit on the side facing the key light, shadowed
                  on the other. */}
              {[7, 11, 15].map((offset) => (
                <path
                  key={`plug-rib-lit-${offset}`}
                  d={`M${PLUG_RECT.x + offset} ${PLUG_RECT.y + 3}V${PLUG_RECT.y + PLUG_RECT.height - 3}`}
                  fill="none"
                  stroke="#a4957c"
                  strokeOpacity="0.35"
                  strokeWidth="0.7"
                />
              ))}
              {[7, 11, 15].map((offset) => (
                <path
                  key={`plug-rib-${offset}`}
                  d={`M${PLUG_RECT.x + offset + 1} ${PLUG_RECT.y + 3}V${PLUG_RECT.y + PLUG_RECT.height - 3}`}
                  fill="none"
                  stroke="#000"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
              ))}
              {/* Gold contacts where the plug bites onto the header pins. */}
              {[5, 8.5, 12, 15.5].map((offset) => (
                <path
                  key={`plug-contact-${offset}`}
                  d={`M${PLUG_RECT.x + PLUG_RECT.width - 9} ${PLUG_RECT.y + offset}H${PLUG_RECT.x + PLUG_RECT.width - 3}`}
                  fill="none"
                  stroke="#c8a668"
                  strokeOpacity="0.5"
                  strokeWidth="0.9"
                />
              ))}
            </g>
          </g>
        </svg>

        <i className="esp32-led-halo" aria-hidden="true" />
        <i className="esp32-led" aria-hidden="true" />
        <div className="esp32-sheen" aria-hidden="true">
          <i />
        </div>

        <button
          className="esp32-hotspot"
          type="button"
          aria-label="Inspect the ESP32 DevKit close-up; hover or focus to zoom, activate to pin the detail"
          aria-pressed={pinned}
          data-awake={deviceAwake ? '1' : '0'}
          onPointerEnter={() => setPointerOnDevice(true)}
          onPointerLeave={() => setPointerOnDevice(false)}
          onFocus={() => setPointerOnDevice(true)}
          onBlur={() => setPointerOnDevice(false)}
          onClick={() => setPinned((value) => !value)}
        >
          <span className="esp32-glow" aria-hidden="true" />
          <span className="esp32-hint" aria-hidden="true">
            {deviceAwake ? (pinned ? 'DETAIL PINNED · CLICK TO CLOSE' : 'DETAIL VIEW · CLICK TO PIN') : 'HOVER TO INSPECT'}
          </span>
        </button>

        <div className="esp32-zoom" data-awake={deviceAwake ? '1' : '0'} aria-hidden="true">
          <div className="esp32-zoom-frame">
            <img src={esp32Detail} alt="" />
            <span className="esp32-zoom-scan" />
            <span className="esp32-zoom-glass" />
            <span className="esp32-zoom-target" />
          </div>
          <span className="esp32-zoom-label">
            <i />
            ESP32 DEVKIT · CLOSE-UP
          </span>
        </div>

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
