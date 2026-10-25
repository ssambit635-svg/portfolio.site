import type { CSSProperties } from 'react'
import lid from '../assets/skills/laptop-lid.jpg'
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
 * Stickers on the back of a laptop lid. Each one is a real brand mark (Simple Icons, CC0),
 * placed on the lid face in percentages of the photo. `tilt` follows the lid's top edge,
 * which slopes down to the right, so the stickers sit on the surface.
 */
const stickers = [
  { name: 'React', hex: '#61DAFB', logo: reactLogo, x: 27, y: 26, size: 12, tilt: 4 },
  { name: 'TypeScript', hex: '#3178C6', logo: tsLogo, x: 57, y: 25, size: 11, tilt: -3 },
  { name: 'Express', hex: '#0A0A0A', logo: expressLogo, x: 43, y: 30, size: 10, tilt: -2 },
  { name: 'Node.js', hex: '#5FA04E', logo: nodeLogo, x: 41, y: 47, size: 12, tilt: 2 },
  { name: 'Python', hex: '#3776AB', logo: pythonLogo, x: 63, y: 44, size: 11, tilt: -5 },
  { name: 'Docker', hex: '#2496ED', logo: dockerLogo, x: 30, y: 65, size: 12, tilt: -2 },
  { name: 'FastAPI', hex: '#009688', logo: fastapiLogo, x: 50, y: 64, size: 10, tilt: 3 },
  { name: 'PostgreSQL', hex: '#4169E1', logo: pgLogo, x: 66, y: 63, size: 10, tilt: -4 },
]

/** Light brand colours get a dark mark, so the logo never disappears into its tile. */
function inkFor(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#0b0b0b' : '#ffffff'
}

export default function SkillsLid() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-heading">
      <div className="section-head">
        <p>What I build with</p>
        <h2 id="skills-heading">Skills</h2>
      </div>
      <figure className="lid">
        <img src={lid} alt="" width={1536} height={1024} loading="lazy" decoding="async" />
        <div className="lid-stickers" aria-hidden="true">
          {stickers.map((s) => (
            <span
              key={s.name}
              className="sticker"
              style={
                {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.size}%`,
                  transform: `rotate(${s.tilt}deg)`,
                  '--tile': s.hex,
                  '--ink': inkFor(s.hex),
                  '--logo': `url("${s.logo}")`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </figure>
      <ul className="skills-list">
        {stickers.map((s) => (
          <li key={s.name}>{s.name}</li>
        ))}
      </ul>
    </section>
  )
}
