import Mark from '../components/Mark'
import { pages } from '../lib/seo'
import { achievements, credentials, profile, type Credential } from '../lib/site'

/** Relative link back to the homepage — this page ships as dashboard/index.html. */
const homeHref = pages.dashboard.prefix

function CertCard({ credential }: { credential: Credential }) {
  return (
    <article className="group relative flex aspect-square flex-col overflow-hidden border border-line bg-paper transition-colors duration-300 hover:border-mute/60">
      <div className="relative min-h-0 flex-1 bg-paper-2">
        {credential.image ? (
          <img
            src={credential.image}
            alt={`${credential.issuer} — ${credential.title} certificate`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center">
            <div>
              <p className="t-display text-[clamp(20px,2.4vw,30px)] text-ink/75">{credential.issuer}</p>
              <p className="t-kicker mt-2 text-mute">Scan not added yet</p>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line p-4">
        <p className="t-kicker text-mute">{credential.issuer}</p>
        <h3 className="mt-1.5 text-[15px] font-medium leading-snug">{credential.title}</h3>
        {credential.href && (
          <a
            href={credential.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${credential.title} — ${credential.action ?? 'View'} on ${credential.issuer}`}
            className="t-kicker mt-2.5 inline-flex items-center gap-1 text-ink after:absolute after:inset-0 hover:text-rust"
          >
            {credential.action ?? 'View'} <span aria-hidden>↗</span>
          </a>
        )}
      </div>
    </article>
  )
}

export default function Dashboard() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">
          <a href={homeHref} className="flex items-center gap-2.5 text-ink">
            <Mark className="h-7 w-7" />
            <span className="t-kicker">{profile.name}</span>
          </a>
          <a href={homeHref} className="t-kicker text-mute transition-colors hover:text-ink">
            ← Back to portfolio
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className="bg-paper">
          <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
            <p className="t-kicker text-mute">Dashboard</p>
            <h1 className="t-display mt-4 text-[clamp(40px,7vw,80px)]">
              Certificates &amp; achievements
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink/75">
              Every course credential and the hackathon builds that came out of them. Each tile opens the
              issuer&rsquo;s own page for that credential.
            </p>
          </div>
        </section>

        <section aria-labelledby="certificates-heading" className="border-t border-line bg-paper">
          <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="certificates-heading" className="t-display text-[clamp(28px,4vw,44px)]">
                Certificates
              </h2>
              <p className="t-kicker text-mute">{credentials.length} credentials</p>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {credentials.map((credential) => (
                <li key={credential.id}>
                  <CertCard credential={credential} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="achievements-heading" className="border-t border-line bg-paper-2">
          <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
            <h2 id="achievements-heading" className="t-display text-[clamp(28px,4vw,44px)]">
              Achievements
            </h2>
            <ol className="mt-8 border-t border-line">
              {achievements.map((achievement, i) => (
                <li
                  key={achievement.id}
                  className="grid gap-1 border-b border-line py-5 md:grid-cols-[56px_1fr_1.6fr] md:items-baseline md:gap-8"
                >
                  <span className="t-kicker text-mute">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-[14px] leading-relaxed text-ink/70">{achievement.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-5 py-10 md:px-8">
          <p className="flex items-center gap-3 text-mute">
            <Mark className="h-8 w-8" />
            <span className="t-kicker">
              © {new Date().getFullYear()} {profile.name}
            </span>
          </p>
          <a href={`mailto:${profile.email}`} className="t-kicker text-ink hover:text-rust">
            {profile.email}
          </a>
        </div>
      </footer>
    </>
  )
}
