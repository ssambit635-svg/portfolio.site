import type { CSSProperties } from 'react'
import '../skills.css'

/** Real brand logos (Simple Icons, CC0), keyed by file name. */
const logos = import.meta.glob('../assets/skills/logos/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** The logo file and brand colour for each skill. No file means a text-only button. */
const brand: Record<string, { file?: string; hex: string }> = {
  AWS: { hex: '9B9B9B' },
  Capacitor: { file: 'capacitor', hex: '119EFF' },
  CSS: { file: 'css', hex: '663399' },
  Docker: { file: 'docker', hex: '2496ED' },
  Express: { file: 'express', hex: '0A0A0A' },
  FastAPI: { file: 'fastapi', hex: '009688' },
  Git: { file: 'git', hex: 'F03C2E' },
  GitHub: { file: 'github', hex: '181717' },
  'GitHub Actions': { file: 'githubactions', hex: '2088FF' },
  'Gemini AI': { file: 'googlegemini', hex: '8E75B2' },
  Grafana: { file: 'grafana', hex: 'F46800' },
  HTML: { file: 'html5', hex: 'E34F26' },
  JavaScript: { file: 'javascript', hex: 'F7DF1E' },
  Kubernetes: { file: 'kubernetes', hex: '326CE5' },
  Leaflet: { file: 'leaflet', hex: '199900' },
  Linux: { file: 'linux', hex: 'FCC624' },
  LocalStack: { hex: '9B9B9B' },
  MongoDB: { file: 'mongodb', hex: '47A248' },
  Nginx: { file: 'nginx', hex: '009639' },
  'Open-Meteo API': { hex: '9B9B9B' },
  PostgreSQL: { file: 'postgresql', hex: '4169E1' },
  Prisma: { file: 'prisma', hex: '2D3748' },
  Prometheus: { file: 'prometheus', hex: 'E6522C' },
  Python: { file: 'python', hex: '3776AB' },
  React: { file: 'react', hex: '61DAFB' },
  SQLite: { file: 'sqlite', hex: '003B57' },
  Streamlit: { file: 'streamlit', hex: 'FF4B4B' },
  Tailwind: { file: 'tailwindcss', hex: '06B6D4' },
  Terraform: { file: 'terraform', hex: '844FBA' },
  TypeScript: { file: 'typescript', hex: '3178C6' },
  Vite: { file: 'vite', hex: '9135FF' },
  cryptography: { hex: '9B9B9B' },
}

/** What I build with, and the cloud and DevOps tools I work with. */
const groups: { label: string; items: string[] }[] = [
  {
    label: 'Build',
    items: [
      'React',
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
      'Tailwind',
      'Vite',
      'Express',
      'FastAPI',
      'Python',
      'Streamlit',
      'Prisma',
      'PostgreSQL',
      'MongoDB',
      'SQLite',
      'Capacitor',
      'Leaflet',
      'Gemini AI',
      'Open-Meteo API',
      'cryptography',
    ],
  },
  {
    label: 'Cloud & DevOps',
    items: [
      'AWS',
      'Docker',
      'Kubernetes',
      'Terraform',
      'GitHub Actions',
      'Linux',
      'Nginx',
      'Git',
      'GitHub',
      'Prometheus',
      'Grafana',
      'LocalStack',
    ],
  },
]

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
      {groups.map((group) => (
        <div className="skill-group" key={group.label}>
          <h3 className="skill-label">{group.label}</h3>
          <ul className="skill-grid">
            {group.items.map((name) => {
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
        </div>
      ))}
    </section>
  )
}
