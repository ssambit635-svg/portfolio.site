import { profile } from '../lib/site'
import { useClock } from '../hooks/useClock'
import Mark from './Mark'

const nav = [
  { href: '#work', label: 'Work' },
  { href: '#systems', label: 'Systems' },
  { href: '#toolbox', label: 'Toolbox' },
  { href: '#about', label: 'About' },
  { href: '#learning', label: 'Learning' },
  { href: '#contact', label: 'Contact' }
]

export default function Header() {
  const time = useClock(profile.timezone)

  return (
    <header className="fixed inset-x-0 top-0 z-[80] border-b bg-[var(--hd-bg)] [border-color:var(--hd-line)] [color:var(--hd-fg)] backdrop-blur-md transition-colors duration-500">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 [color:var(--hd-fg)]">
          <Mark className="h-7 w-7" />
          <span className="t-kicker">{profile.name}</span>
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="t-kicker [color:var(--hd-mute)] transition-colors hover:[color:var(--hd-hover)]"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <p className="t-kicker hidden [color:var(--hd-mute)] sm:block">
          {profile.city.split(',')[0]} · {time}
        </p>
        <a href={`mailto:${profile.email}`} className="t-kicker [color:var(--hd-fg)] md:hidden">
          Email
        </a>
      </div>
    </header>
  )
}
