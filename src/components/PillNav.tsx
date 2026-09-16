/**
 * Slim vertical section-tracker pinned to the left edge (desktop only).
 * Each pill smooth-glides to its section; the active one lights up.
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
  return (
    <nav className="fixed left-8 top-1/2 z-10 hidden -translate-y-1/2 lg:block" aria-label="Section navigation">
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => onNavigate(section)}
            className={`h-8 w-2 cursor-target rounded-full transition-all duration-500 ${
              active === section
                ? 'bg-foreground'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
            }`}
            aria-label={`Go to ${section}`}
            aria-current={active === section ? 'true' : undefined}
          />
        ))}
      </div>
    </nav>
  )
}
