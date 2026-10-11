import { footerCols, profile } from '../../lib/site'
import Button from '../ui/Button'
import Mark from '../Mark'

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-line bg-paper">
      <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-28">
        <p className="t-kicker text-mute">Contact</p>
        <h2 className="t-display mt-4 max-w-3xl text-[clamp(40px,7vw,88px)]">
          If you hire people who can own a product and its infra — write.
        </h2>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={`mailto:${profile.email}`}>{profile.email}</Button>
          {profile.resume !== '#' && (
            <Button href={profile.resume} tone="ghost">
              CV
            </Button>
          )}
        </div>
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3">
          {footerCols.map((c) => (
            <div key={c.title}>
              <p className="t-kicker text-mute">{c.title}</p>
              <ul className="mt-3 space-y-2">
                {c.items.map((it) => (
                  <li key={it.label}>
                    <a href={it.href} className="text-[15px] hover:text-rust" target={it.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-16 flex items-center gap-3 text-mute">
          <Mark className="h-8 w-8" />
          <span className="t-kicker">© {new Date().getFullYear()} {profile.name}</span>
        </p>
      </div>
    </footer>
  )
}
