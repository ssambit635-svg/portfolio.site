import type { CSSProperties, PointerEvent } from 'react'
import '../skills.css'

/** Real brand logos (Simple Icons, CC0), keyed by file name. */
const logos = import.meta.glob('../assets/skills/logos/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** The logo file and brand colour for each skill. No file means a text-only button. */
const brand: Record<string, { file?: string; hex: string; motion?: string }> = {
  AWS: { hex: '9B9B9B' },
  Capacitor: { file: 'capacitor', hex: '119EFF', motion: 'fly' },
  CSS: { file: 'css', hex: '663399', motion: 'wiggle' },
  Docker: { file: 'docker', hex: '2496ED', motion: 'bob' },
  Express: { file: 'express', hex: '0A0A0A', motion: 'shake' },
  FastAPI: { file: 'fastapi', hex: '009688', motion: 'fly' },
  Git: { file: 'git', hex: 'F03C2E', motion: 'wiggle' },
  GitHub: { file: 'github', hex: '181717', motion: 'flip' },
  'GitHub Actions': { file: 'githubactions', hex: '2088FF', motion: 'spin' },
  'Gemini AI': { file: 'googlegemini', hex: '8E75B2', motion: 'spin' },
  Grafana: { file: 'grafana', hex: 'F46800', motion: 'pulse' },
  HTML: { file: 'html5', hex: 'E34F26', motion: 'bob' },
  JavaScript: { file: 'javascript', hex: 'F7DF1E', motion: 'pulse' },
  Kubernetes: { file: 'kubernetes', hex: '326CE5', motion: 'spin' },
  Leaflet: { file: 'leaflet', hex: '199900', motion: 'swing' },
  Linux: { file: 'linux', hex: 'FCC624', motion: 'bob' },
  LocalStack: { hex: '9B9B9B' },
  MongoDB: { file: 'mongodb', hex: '47A248', motion: 'fly' },
  Nginx: { file: 'nginx', hex: '009639', motion: 'shake' },
  'Open-Meteo API': { hex: '9B9B9B' },
  PostgreSQL: { file: 'postgresql', hex: '4169E1', motion: 'flip' },
  Prisma: { file: 'prisma', hex: '2D3748', motion: 'wiggle' },
  Prometheus: { file: 'prometheus', hex: 'E6522C', motion: 'pulse' },
  Python: { file: 'python', hex: '3776AB', motion: 'swing' },
  React: { file: 'react', hex: '61DAFB', motion: 'spin' },
  SQLite: { file: 'sqlite', hex: '003B57', motion: 'wiggle' },
  Streamlit: { file: 'streamlit', hex: 'FF4B4B', motion: 'bob' },
  Tailwind: { file: 'tailwindcss', hex: '06B6D4', motion: 'swing' },
  Terraform: { file: 'terraform', hex: '844FBA', motion: 'flip' },
  TypeScript: { file: 'typescript', hex: '3178C6', motion: 'pulse' },
  Vite: { file: 'vite', hex: '9135FF', motion: 'fly' },
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

  /** Turns the button toward the pointer and moves the light across its face. */
  const tilt = (event: PointerEvent<HTMLButtonElement>) => {
    const el = event.currentTarget
    const r = el.getBoundingClientRect()
    const x = (event.clientX - r.left) / r.width
    const y = (event.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${((x - 0.5) * 16).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 12).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
  }
  const untilt = (event: PointerEvent<HTMLButtonElement>) => {
    const el = event.currentTarget
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
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
                    onPointerMove={tilt}
                    onPointerLeave={untilt}
                    style={
                      {
                        '--ink': inkFor(b.hex),
                        '--glow': inkFor(b.hex),
                        '--logo': url ? `url("${url}")` : 'none',
                      } as CSSProperties
                    }
                  >
                    {url && (
                      <span
                        className={`skill-logo motion-${b.motion ?? 'bob'}`}
                        aria-hidden="true"
                      />
                    )}
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
