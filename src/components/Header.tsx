import { profile } from '../lib/site'
import { useClock } from '../hooks/useClock'
import Mark from './Mark'

const nav = [
  { href: '#work', label: 'Work' },
  { href: '#systems', label: 'Systems' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' }
]

export default function Header() {
  const time = useClock(profile.timezone)

  return (
    <header className="fixed inset-x-0 top-0 z-[80] border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 text-ink">
          <Mark className="h-7 w-7" />
          <span className="t-kicker">{profile.name}</span>
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="t-kicker text-mute transition-colors hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <p className="t-kicker hidden text-mute sm:block">
          {profile.city.split(',')[0]} · {time}
        </p>
        <a href={`mailto:${profile.email}`} className="t-kicker text-ink md:hidden">
          Email
        </a>
      </div>
    </header>
  )
}
