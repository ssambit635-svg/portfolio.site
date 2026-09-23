import { profile } from '../lib/site'
import { useClock } from '../hooks/useClock'
import { useSound } from '../hooks/useSound'

export default function Header({ onMenu }: { onMenu: () => void }) {
  const time = useClock(profile.timezone)
  const { on, toggle, tick, click } = useSound()

  return (
    <header className="fixed inset-x-0 top-0 z-[80] grid h-[76px] grid-cols-[1fr_1fr_1fr_1fr_auto] items-center px-8 [color:var(--hd-fg)] transition-colors duration-500 max-md:grid-cols-[1fr_auto]">
      <a href="#top" className="t-label flex items-center gap-2 font-semibold" onMouseEnter={tick}>
        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" className="[color:var(--hd-accent)]">
          <path d="M6 0 L12 11 H0 Z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 4 L8.5 9 H3.5 Z" fill="currentColor" />
        </svg>
        {profile.name}
      </a>

      <button
        onClick={() => { click(); toggle() }}
        onMouseEnter={tick}
        className="t-label justify-self-start max-md:hidden [color:var(--hd-mute)]"
      >
        Sound <span className="ml-1 [color:var(--hd-fg)]">{on ? 'On' : 'Off'}</span>
      </button>

      <div className="t-label max-md:hidden [color:var(--hd-mute)]">
        {profile.city}
        <br />
        {time}
      </div>

      <div className="t-label max-md:hidden [color:var(--hd-mute)]">
        {profile.coords[0]}
        <br />
        {profile.coords[1]}
      </div>

      <button
        onClick={() => { click(); onMenu() }}
        onMouseEnter={tick}
        className="t-label border px-6 py-3 font-semibold transition-colors duration-500 [background:var(--hd-btn-bg)] [border-color:var(--hd-btn-bd)] [color:var(--hd-btn-fg)]"
      >
        Menu
      </button>
    </header>
  )
}
