import { useState } from 'react'
import { planes, projects, type Plane, type Project } from '../../lib/site'

const featured = projects.filter((p) => p.featured)

export default function Systems() {
  const [active, setActive] = useState<string>(featured[0]?.id ?? '')
  const current = featured.find((p) => p.id === active) ?? featured[0]

  return (
    <section id="systems" aria-labelledby="systems-heading" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div>
            <p className="t-kicker text-signal">Signature</p>
            <h2 id="systems-heading" className="t-display mt-3 text-[clamp(40px,6vw,72px)]">
              Control plane
            </h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-paper/55">
            One view of how the work is actually built. Hover a service. The path through client, API, data and infra lights up.
          </p>
        </div>

        <div className="mt-14 hidden md:block" data-reveal>
          <div className="grid grid-cols-[160px_repeat(4,1fr)] gap-px bg-paper/10">
            <div className="t-kicker bg-ink px-3 py-3 text-paper/40">Service</div>
            {planes.map((plane) => (
              <div key={plane} className="t-kicker bg-ink px-3 py-3 text-paper/40">
                {plane}
              </div>
            ))}
            {featured.map((p) => (
              <Row key={p.id} p={p} active={active} onEnter={setActive} />
            ))}
          </div>
        </div>

        <ul className="mt-10 space-y-px md:hidden">
          {featured.map((p) => (
            <li key={p.id} className="border-t border-paper/10 py-5">
              <p className="t-kicker text-signal">{p.kind}</p>
              <p className="mt-1 font-medium">{p.title}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px] text-paper/60">
                {planes.map((plane) => (
                  <div key={plane}>
                    <dt className="t-kicker text-paper/35">{plane}</dt>
                    <dd>{p.plane[plane]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        {current && (
          <p className="mt-10 max-w-2xl text-[15px] leading-relaxed text-paper/50 max-md:hidden">
            <span className="text-paper">{current.title}.</span> {current.description}
          </p>
        )}
      </div>
    </section>
  )
}

function Row({
  p,
  active,
  onEnter
}: {
  p: Project
  active: string
  onEnter: (id: string) => void
}) {
  const on = p.id === active
  return (
    <>
      <button
        type="button"
        onMouseEnter={() => onEnter(p.id)}
        onFocus={() => onEnter(p.id)}
        className={`flex items-center justify-between bg-ink px-3 py-4 text-left text-[14px] ${on ? 'text-paper' : 'text-paper/45'}`}
      >
        <span>{p.title}</span>
        <span className="t-kicker text-[10px] text-signal">{p.status}</span>
      </button>
      {planes.map((plane: Plane) => (
        <div
          key={plane}
          onMouseEnter={() => onEnter(p.id)}
          className={`bg-ink px-3 py-4 font-mono text-[12px] tracking-tight ${on ? 'text-signal' : 'text-paper/35'}`}
        >
          {p.plane[plane]}
        </div>
      ))}
    </>
  )
}
