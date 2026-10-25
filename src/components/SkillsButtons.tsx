import type { CSSProperties } from 'react'
import { allTools } from '../lib/stack'
import '../skills.css'

/** Real brand logos (Simple Icons, CC0), keyed by file name. */
const logos = import.meta.glob('../assets/skills/logos/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** The logo file and brand colour for each technology the projects use. */
const brand: Record<string, { file?: string; hex: string }> = {
  Android: { file: 'android', hex: '3DDC84' },
  Capacitor: { file: 'capacitor', hex: '119EFF' },
  CSS: { file: 'css', hex: '663399' },
  Docker: { file: 'docker', hex: '2496ED' },
  Express: { file: 'express', hex: '0A0A0A' },
  FastAPI: { file: 'fastapi', hex: '009688' },
  'Gemini AI': { file: 'googlegemini', hex: '8E75B2' },
  HTML: { file: 'html5', hex: 'E34F26' },
  JavaScript: { file: 'javascript', hex: 'F7DF1E' },
  Leaflet: { file: 'leaflet', hex: '199900' },
  LocalStack: { hex: '9B9B9B' },
  MongoDB: { file: 'mongodb', hex: '47A248' },
  'Next.js': { file: 'nextdotjs', hex: '000000' },
  'Node.js': { file: 'nodedotjs', hex: '5FA04E' },
  'Open-Meteo API': { hex: '9B9B9B' },
  PostgreSQL: { file: 'postgresql', hex: '4169E1' },
  Prisma: { file: 'prisma', hex: '2D3748' },
  Python: { file: 'python', hex: '3776AB' },
  React: { file: 'react', hex: '61DAFB' },
  Recharts: { hex: '9B9B9B' },
  SQLite: { file: 'sqlite', hex: '003B57' },
  Streamlit: { file: 'streamlit', hex: 'FF4B4B' },
  Tailwind: { file: 'tailwindcss', hex: '06B6D4' },
  TypeScript: { file: 'typescript', hex: '3178C6' },
  Vite: { file: 'vite', hex: '9135FF' },
  cryptography: { hex: '9B9B9B' },
}

/** Dark brand colours get a light mark, so the logo never vanishes into a dark button. */
function inkFor(hex: string): string {
  const n = parseInt(hex, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum < 0.3 ? '#f4f2ed' : `#${hex}`
}

const logoUrl = (file?: string) => (file ? logos[`../assets/skills/logos/${file}.svg`] : undefined)

export default function SkillsButtons() {
  const tools = allTools()

  const ask = (name: string) => {
    window.dispatchEvent(new CustomEvent('ask-emo', { detail: `Which projects use ${name}?` }))
    document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-heading">
      <div className="section-head">
        <p>What I build with</p>
        <h2 id="skills-heading">Skills</h2>
      </div>
      <p className="skills-note">Press a tool to ask Emo which projects use it.</p>
      <ul className="skill-grid">
        {tools.map((name) => {
          const b = brand[name] ?? { hex: '9B9B9B' }
          const url = logoUrl(b.file)
          return (
            <li key={name}>
              <button
                type="button"
                className="skill-btn"
                aria-label={`Ask Emo which projects use ${name}`}
                onClick={() => ask(name)}
                style={
                  {
                    '--ink': inkFor(b.hex),
                    '--logo': url ? `url("${url}")` : 'none',
                  } as CSSProperties
                }
              >
                {url && <span className="skill-logo" aria-hidden="true" />}
                <span className="skill-name">{name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
