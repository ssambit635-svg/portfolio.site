import { useSound } from '../context/SoundContext'

/**
 * Slim vertical section-tracker pinned to the left edge (desktop only).
 * Each pill smooth-glides to its section; the active one lights up in gold
 * and every pill reveals its label on hover.
 */
export function PillNav({
  sections,
  active,
  onNavigate
}: {
  sections: string[]
  active: string
  onNavigate: (id: string) => void
}) {
  const { hover } = useSound()

  return (
    <nav className="fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 xl:block" aria-label="Section navigation">
      <div className="flex flex-col items-start gap-4">
        {sections.map((section, i) => {
          const isActive = active === section
          return (
            <button
              key={section}
              type="button"
              onClick={() => onNavigate(section)}
              onMouseEnter={hover}
              className="cursor-target group flex items-center gap-3"
              aria-label={`Go to ${section}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.24em] transition-all duration-500 ${
                  isActive
                    ? 'translate-x-0 text-foreground opacity-100'
                    : '-translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-70'
                }`}
              >
                {String(i + 1).padStart(2, '0')} {section}
              </span>

              <span className="relative flex h-8 w-2 items-center">
                <span
                  className="absolute inset-0 rounded-full transition-colors duration-500"
                  style={{
                    background: isActive
                      ? 'linear-gradient(180deg, rgb(255 246 226), rgb(226 183 106) 55%, rgb(214 152 132))'
                      : 'color-mix(in oklch, var(--muted-foreground) 26%, transparent)',
                    boxShadow: isActive ? '0 0 16px rgb(226 183 106 / 0.55)' : 'none'
                  }}
                />
                <span
                  className="absolute inset-0 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100"
                  style={{
                    background: 'color-mix(in oklch, var(--muted-foreground) 55%, transparent)',
                    transform: isActive ? 'none' : 'scaleY(0.6)'
                  }}
                />
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
