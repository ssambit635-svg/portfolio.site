import { projects, profile } from '../../lib/site'
import Button from '../ui/Button'

export default function Work() {
  const list = projects.filter((p) => p.id !== 'portfolio')

  return (
    <section id="work" aria-labelledby="work-heading" className="bg-paper">
      <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div>
            <p className="t-kicker text-mute">Selected</p>
            <h2 id="work-heading" className="t-display mt-3 text-[clamp(40px,6vw,72px)]">
              Work
            </h2>
          </div>
          <Button href={profile.github} target="_blank" rel="noopener noreferrer" tone="ghost">
            All repositories
          </Button>
        </div>

        <ol className="mt-16">
          {list.map((p, i) => (
            <li key={p.id} data-reveal={i * 40} className="border-t border-line py-10 md:py-12">
              <article className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
                <div>
                  <p className="t-kicker text-mute">
                    {String(i + 1).padStart(2, '0')} · {p.kind} · {p.year}
                  </p>
                  <h3 className="t-display mt-3 text-[clamp(32px,4vw,48px)]">{p.title}</h3>
                  <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/75">{p.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
                    {p.stack.map((t) => (
                      <li key={t} className="t-kicker text-mute">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href={p.href} target="_blank" rel="noopener noreferrer">
                      {p.action}
                    </Button>
                    {p.repo && (
                      <Button href={p.repo} target="_blank" rel="noopener noreferrer" tone="ghost">
                        Source
                      </Button>
                    )}
                  </div>
                </div>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="block overflow-hidden bg-paper-2">
                  <img
                    src={p.image}
                    alt=""
                    width={1200}
                    height={880}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/11] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                </a>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
