import { footerCols, profile } from '../../lib/site'
import Button from '../ui/Button'
import Scramble from '../fx/Scramble'
import { useSound } from '../../hooks/useSound'

export default function Footer() {
  const { tick } = useSound()
  return (
    <footer data-theme="lime" className="relative overflow-hidden bg-lime px-8 pt-10 text-ink max-md:px-4">
      <div className="flex items-start justify-between gap-8 max-md:flex-col">
        <div>
          <h2 className="font-label text-[clamp(26px,2.4vw,32px)] leading-[1.05] font-semibold uppercase">
            <Scramble text="Let’s create" speed={30} />
            <br />
            <Scramble text="good stuff" speed={30} delay={200} />
            <br />
            <Scramble text="together" speed={30} delay={400} />
          </h2>
          <div className="mt-8 flex gap-5 max-md:flex-wrap">
            <Button href={`mailto:${profile.email}`} className="[border-color:var(--color-purple)] [color:var(--color-purple)] hover:[background:var(--color-purple)] hover:[color:var(--color-lime)]">
              Shoot a message
            </Button>
            <Button href={profile.resume} className="[border-color:var(--color-purple)] [color:var(--color-purple)] hover:[background:var(--color-purple)] hover:[color:var(--color-lime)]">
              Download CV <span>↓</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-12 gap-y-4 pr-14 max-md:pr-0">
          {footerCols.map((c) => (
            <div key={c.title} className="contents">
              <p className="t-label text-purple">{c.title}</p>
            </div>
          ))}
          {[0, 1].map((row) =>
            footerCols.map((c) => {
              const it = c.items[row]
              return (
                <a key={c.title + row} href={it.href} target="_blank" rel="noreferrer" onMouseEnter={tick} className="t-label flex items-center gap-1 font-semibold text-ink hover:text-purple">
                  {it.label} <span className="text-[9px]">↗</span>
                </a>
              )
            })
          )}
        </div>
      </div>

      {/* giant dotted marquee */}
      <div className="mt-10 -mx-8 overflow-hidden whitespace-nowrap select-none max-md:-mx-4">
        <div className="marquee inline-flex">
          {[0, 1].map((k) => (
            <span key={k} className="dotted-text t-display inline-block pr-[0.3em] text-[clamp(96px,17vw,250px)] font-semibold leading-[0.82]">
              Portfolio/{profile.first}&nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
