import type { CSSProperties } from 'react'
import keyboard from '../assets/skills/keyboard.jpg'
import reactLogo from '../assets/skills/logos/react.svg?url'
import tsLogo from '../assets/skills/logos/typescript.svg?url'
import nodeLogo from '../assets/skills/logos/nodedotjs.svg?url'
import pythonLogo from '../assets/skills/logos/python.svg?url'
import dockerLogo from '../assets/skills/logos/docker.svg?url'
import fastapiLogo from '../assets/skills/logos/fastapi.svg?url'
import pgLogo from '../assets/skills/logos/postgresql.svg?url'
import expressLogo from '../assets/skills/logos/express.svg?url'
import '../skills.css'

/**
 * Keycaps on the keyboard photo. Each logo is a real brand mark (Simple Icons, CC0).
 * `x` and `y` are the keycap centre as a percentage of the photo; `tilt` follows the
 * keyboard's top row, which runs up to the right.
 */
const keys = [
  { name: 'React', hex: '#61DAFB', logo: reactLogo, x: 22.1, y: 39 },
  { name: 'TypeScript', hex: '#3178C6', logo: tsLogo, x: 26.8, y: 37.2 },
  { name: 'Node.js', hex: '#5FA04E', logo: nodeLogo, x: 31.3, y: 35.4 },
  { name: 'Python', hex: '#3776AB', logo: pythonLogo, x: 35.7, y: 33.6 },
  { name: 'Docker', hex: '#2496ED', logo: dockerLogo, x: 39.7, y: 31.8 },
  { name: 'FastAPI', hex: '#009688', logo: fastapiLogo, x: 43.8, y: 30 },
  { name: 'PostgreSQL', hex: '#4169E1', logo: pgLogo, x: 47.8, y: 28.2 },
  { name: 'Express', hex: '#0A0A0A', logo: expressLogo, x: 51.8, y: 26.4 },
]

/** Dark brand colours get a light mark, so the logo never vanishes into a dark keycap. */
function inkFor(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum < 0.2 ? '#f4f2ed' : hex
}

export default function SkillsKeyboard() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-heading">
      <div className="section-head">
        <p>What I build with</p>
        <h2 id="skills-heading">Skills</h2>
      </div>
      <figure className="keyboard">
        <img src={keyboard} alt="" width={1360} height={768} loading="lazy" decoding="async" />
        <div className="keycaps" aria-hidden="true">
          {keys.map((k) => (
            <span
              key={k.name}
              className="keycap"
              style={
                {
                  left: `${k.x}%`,
                  top: `${k.y}%`,
                  '--ink': inkFor(k.hex),
                  '--logo': `url("${k.logo}")`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </figure>
      <ul className="skills-list">
        {keys.map((k) => (
          <li key={k.name}>{k.name}</li>
        ))}
      </ul>
    </section>
  )
}
