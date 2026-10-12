import { useState } from 'react'
import { profile } from '../lib/site'
import { ledLogos } from '../lib/ledLogos'
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

export default function PegBoard() {
  const [pointerOnDevice, setPointerOnDevice] = useState(false)
  const [pinned, setPinned] = useState(false)
  const deviceAwake = pointerOnDevice || pinned

  return (
    <div className="board-wrap">
      <div className="board">
        <img src={board} alt="" loading="lazy" decoding="async" />
        <div className="board-underlight" aria-hidden="true" />
        <svg className="esp32-cable" viewBox="0 0 928 1152" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="ribbon-surface" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8cfc0" />
              <stop offset="0.45" stopColor="#aaa193" />
              <stop offset="1" stopColor="#6f685d" />
            </linearGradient>
            <filter id="ribbon-shadow" x="-15%" y="-25%" width="130%" height="150%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset in="blur" dy="4" result="offset-blur" />
              <feComponentTransfer in="offset-blur" result="shadow">
                <feFuncA type="linear" slope="0.6" />
              </feComponentTransfer>
              <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g filter="url(#ribbon-shadow)">
            <path d="M 680 321 C 680 354 681 391 681 418 C 681 435 670 447 653 447 H 310 C 294 447 282 435 282 419 V 363" fill="none" stroke="#332e26" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 680 321 C 680 354 681 391 681 418 C 681 435 670 447 653 447 H 310 C 294 447 282 435 282 419 V 363" fill="none" stroke="url(#ribbon-surface)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
            {[-10, -7, -4, -1, 2, 5, 8, 11].map((offset, index) => (
              <path key={`ribbon-horizontal-${offset}`} d={`M 313 ${447 + offset} H 650`} fill="none" stroke={index % 2 ? '#6f675b' : '#e6decf'} strokeWidth="0.8" opacity="0.72" />
            ))}
            {[-10, -7, -4, -1, 2, 5, 8, 11].map((offset, index) => (
              <path key={`ribbon-right-${offset}`} d={`M ${681 + offset} 328 V 414`} fill="none" stroke={index % 2 ? '#6f675b' : '#e6decf'} strokeWidth="0.8" opacity="0.72" />
            ))}
            {[-10, -7, -4, -1, 2, 5, 8, 11].map((offset, index) => (
              <path key={`ribbon-left-${offset}`} d={`M ${282 + offset} 369 V 415`} fill="none" stroke={index % 2 ? '#6f675b' : '#e6decf'} strokeWidth="0.8" opacity="0.72" />
            ))}
            <rect x="671" y="307" width="20" height="28" rx="2" fill="#211e18" stroke="#070706" strokeWidth="2" />
            {[311, 315, 319, 323, 327, 331].map((y) => (
              <path key={`esp-contact-${y}`} d={`M 674 ${y} H 688`} stroke="#c3a979" strokeWidth="0.8" opacity="0.88" />
            ))}
          </g>
        </svg>

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
          <span className="esp32-hint" aria-hidden="true">
            {deviceAwake ? (pinned ? 'DETAIL PINNED · CLICK TO CLOSE' : 'DETAIL VIEW · CLICK TO PIN') : 'HOVER TO INSPECT'}
          </span>
        </button>

        <div className="esp32-zoom" data-awake={deviceAwake ? '1' : '0'} aria-hidden="true">
          <img src={esp32Detail} alt="" />
          <span>ESP32 DEVKIT · CLOSE-UP</span>
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
