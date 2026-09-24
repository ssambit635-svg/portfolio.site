import { profile } from '../lib/site'
import { useClock } from '../hooks/useClock'
import { useSound } from '../hooks/useSound'
import { cn } from '../lib/utils'

function Toggle({
  label,
  short,
  on,
  onClick
}: {
  label: string
  short: string
  on: boolean
  onClick: () => void
}) {
  const { tick, click } = useSound()
  return (
    <button
      onClick={() => {
        click()
        onClick()
      }}
      onMouseEnter={tick}
      aria-pressed={on}
      className="t-label flex items-center gap-2 whitespace-nowrap [color:var(--hd-mute)] transition-opacity hover:opacity-70"
    >
      <span className="max-md:hidden">{label}</span>
      <span className="md:hidden">{short}</span>
      <span className={cn('font-semibold', on ? '[color:var(--hd-accent)]' : '[color:var(--hd-fg)]')}>
        {on ? 'On' : 'Off'}
      </span>
    </button>
  )
}

export default function Header({ onMenu }: { onMenu: () => void }) {
  const time = useClock(profile.timezone)
  const { sfx, music, toggleSfx, toggleMusic, tick, click } = useSound()

  return (
    <header className="fixed inset-x-0 top-0 z-[80] grid h-[76px] grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 [color:var(--hd-fg)] transition-colors duration-500 md:grid-cols-[1fr_auto_auto_1fr_1fr_auto] md:gap-6 md:px-8">
      <a href="#top" className="t-label flex items-center gap-2 font-semibold" onMouseEnter={tick}>
        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" className="[color:var(--hd-accent)]">
          <path d="M6 0 L12 11 H0 Z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 4 L8.5 9 H3.5 Z" fill="currentColor" />
        </svg>
        {profile.name}
      </a>

      <Toggle label="Sound" short="SFX" on={sfx} onClick={toggleSfx} />
      <Toggle label="Music" short="♪" on={music} onClick={toggleMusic} />

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
        onClick={() => {
          click()
          onMenu()
        }}
        onMouseEnter={tick}
        className="t-label border px-6 py-3 font-semibold transition-colors duration-500 [background:var(--hd-btn-bg)] [border-color:var(--hd-btn-bd)] [color:var(--hd-btn-fg)] max-md:px-4"
      >
        Menu
      </button>
    </header>
  )
}
