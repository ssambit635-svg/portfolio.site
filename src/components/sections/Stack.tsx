import { stackGroups } from '../../lib/site'

export default function Stack() {
  return (
    <section id="stack" aria-labelledby="stack-heading" className="border-t border-line bg-paper">
      <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-24">
        <div data-reveal>
          <p className="t-kicker text-mute">Toolbox</p>
          <h2 id="stack-heading" className="t-display mt-3 text-[clamp(36px,5vw,56px)]">
            What I actually ship with
          </h2>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stackGroups.map((g) => (
            <div key={g.title} data-reveal>
              <h3 className="t-kicker border-b border-line pb-3 text-ink">{g.title}</h3>
              <ul className="mt-4 space-y-2">
                {g.items.map((item) => (
                  <li key={item} className="text-[15px] text-ink/80">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
