import { experience } from '../../lib/site'

export default function Path() {
  return (
    <section id="path" aria-labelledby="path-heading" className="border-t border-line bg-paper">
      <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-24">
        <div data-reveal>
          <p className="t-kicker text-mute">Path</p>
          <h2 id="path-heading" className="t-display mt-3 text-[clamp(36px,5vw,56px)]">
            Learning, not a résumé wall
          </h2>
        </div>
        <ol className="mt-12">
          {experience.map((e, i) => (
            <li
              key={e.id}
              data-reveal={i * 30}
              className="grid gap-2 border-t border-line py-5 md:grid-cols-[200px_1fr_1.4fr] md:gap-8"
            >
              <p className="t-kicker text-mute">{e.role}</p>
              <p className="font-medium">{e.org}</p>
              <p className="text-[14px] leading-relaxed text-ink/70">{e.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
