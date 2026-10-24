import { about, achievements, credentials, experience, profile, projects } from '../lib/site'
import { allTools } from '../lib/stack'

/** Only the education rows: the certificates are listed on their own below. */
const education = experience.filter(item => item.id === 'nist' || item.id === 'dhss')

/**
 * The one-page CV. A4 sheet, plain print colours, every fact from src/lib/site.ts.
 * `No-print` controls sit outside the sheet, so printing or saving as PDF gives
 * exactly the one page.
 */
export default function Cv() {
  const contact = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'Phone', value: profile.phone, href: `tel:${profile.phoneHref}` },
    { label: 'GitHub', value: profile.github.replace('https://', ''), href: profile.github },
    { label: 'LinkedIn', value: 'linkedin.com/in/sambit-swain', href: profile.linkedin },
    { label: 'Portfolio', value: profile.site.replace('https://', ''), href: profile.site }
  ]

  return (
    <main className="cv-page">
      <div className="cv-toolbar no-print">
        <a href="../">← Back to the portfolio</a>
        <button type="button" onClick={() => window.print()}>Print or save as PDF</button>
      </div>

      <article className="cv-sheet" aria-labelledby="cv-name">
        <header className="cv-head">
          <div>
            <h1 id="cv-name">{profile.name}</h1>
            <p className="cv-role">{profile.role} developer · B.Tech Computer Science student</p>
          </div>
          <ul className="cv-contact">
            {contact.map(item => (
              <li key={item.label}>
                <a href={item.href}>{item.value}</a>
              </li>
            ))}
          </ul>
        </header>

        <section className="cv-block">
          <h2>Profile</h2>
          <p>{about.p1}</p>
        </section>

        <section className="cv-block">
          <h2>Education</h2>
          <div className="cv-grid">
          {education.map(item => (
            <div className="cv-row" key={item.id}>
              <h3>{item.org}</h3>
              <p className="cv-meta">{item.role}</p>
              <p>{item.detail}</p>
            </div>
          ))}
          </div>
        </section>

        <section className="cv-block">
          <h2>Projects</h2>
          <div className="cv-grid">
          {projects.map(project => (
            <div className="cv-row" key={project.id}>
              <h3>
                {project.title} <span className="cv-meta">{project.kind} · {project.year}</span>
              </h3>
              <p>{project.description}</p>
              <p className="cv-meta">{project.stack.join(' · ')}</p>
            </div>
          ))}
          </div>
        </section>

        <section className="cv-block cv-two">
          <div>
            <h2>Certifications</h2>
            <ul className="cv-list">
              {credentials.map(item => (
                <li key={item.id}>
                  <strong>{item.title}</strong> <span className="cv-meta">{item.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Achievements</h2>
            <ul className="cv-list">
              {achievements.map(item => (
                <li key={item.id}>
                  <strong>{item.title}</strong> <span className="cv-meta">{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="cv-block">
          <h2>Tools</h2>
          <p>{allTools().join(' · ')}</p>
        </section>
      </article>
    </main>
  )
}
