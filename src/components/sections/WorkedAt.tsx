import { useState } from 'react'
import { experience } from '../../lib/site'
import Tag from '../ui/Tag'
import Scramble from '../fx/Scramble'
import PixelTransition from '../fx/PixelTransition'
import { useSound } from '../../hooks/useSound'
import { cn } from '../../lib/utils'

export default function WorkedAt() {
  const [active, setActive] = useState(0)
  const { tick } = useSound()
  const cur = experience[active]
  const left = experience.slice(0, 4)
  const right = experience.slice(4, 8)

  const Item = ({ e, i }: { e: (typeof experience)[number]; i: number }) => {
    const on = i === active
    return (
      <button
        onMouseEnter={() => { setActive(i); tick() }}
        onClick={() => setActive(i)}
        data-scramble-hover
        className={cn(
          'notch-list flex w-full items-center gap-6 px-5 py-3 text-left transition-colors duration-200',
          on ? 'bg-cream text-ink' : 'bg-ink-2 text-cream'
        )}
      >
        <span className={cn('t-label', on ? 'text-mute' : 'text-mute-2')}>0{i + 1}</span>
        <span>
          <span className="block font-label text-[16px] font-medium uppercase">
            <Scramble text={e.org} trigger="hover" speed={30} />
          </span>
          <span className={cn('t-label block', on ? 'text-mute' : 'text-mute')}>{e.role}</span>
        </span>
      </button>
    )
  }

  return (
    <section data-theme="dark" className="relative bg-ink px-8 pt-[110px] pb-[80px] text-cream max-md:px-4">
      <PixelTransition color="#060606" edge="top" />
      <div className="text-center" data-reveal>
        <Tag>I’ve been</Tag>
        <h2 className="t-display mt-3 text-[clamp(52px,6vw,88px)] font-normal">
          <Scramble text="Learning at" speed={40} />
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1300px] grid-cols-[260px_1fr_260px] gap-8 max-md:grid-cols-1">
        <ul className="flex flex-col gap-2">
          {left.map((e, i) => (
            <li key={e.id}><Item e={e} i={i} /></li>
          ))}
        </ul>

        <div className="relative max-md:order-first">
          <div className="relative mx-auto aspect-[16/10] w-full max-w-[460px] border border-mute-2/60">
            {/* corner ticks */}
            {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((c) => (
              <i key={c} className={cn('absolute h-[7px] w-[7px] bg-mute-2', c)} />
            ))}
            {cur.image ? (
              <img key={cur.id} src={cur.image} alt={`${cur.org} — ${cur.role} certificate`} loading="lazy" decoding="async" width={460} height={288} className="h-full w-full object-cover opacity-90" />
            ) : (
              <div className="grid h-full place-items-center">
                <span className="font-display text-[clamp(28px,4vw,52px)] font-medium tracking-wide text-[#b48cff] uppercase">
                  <Scramble key={cur.id} text={cur.org} trigger="mount" speed={35} color="#b48cff" />
                </span>
              </div>
            )}
          </div>
          <p key={cur.id + 'd'} className="mx-auto mt-6 max-w-[520px] text-center font-body text-[15px] leading-[1.55] text-[#9a9e96]">
            <Scramble text={cur.detail} trigger="mount" speed={6} />
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {right.map((e, i) => (
            <li key={e.id}><Item e={e} i={i + 4} /></li>
          ))}
        </ul>
      </div>
    </section>
  )
}
