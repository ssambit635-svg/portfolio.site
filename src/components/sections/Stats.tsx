import { skills, skillCount } from '../../lib/skills'
import Counter from '../fx/Counter'
import PixelTransition from '../fx/PixelTransition'
import SkillLogo from '../fx/SkillLogo'
import Scramble from '../fx/Scramble'
import Tag from '../ui/Tag'
import { useSound } from '../../hooks/useSound'
import { readableOnDark, cn } from '../../lib/utils'
import { stats } from '../../lib/site'

function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  const { tick } = useSound()
  return (
    <div
      onMouseEnter={tick}
      data-cursor
      data-reveal
      className={cn(
        'notch-card group relative flex h-[180px] flex-col justify-between bg-lime-deep px-6 py-4 pl-9 transition-colors duration-200',
        className
      )}
    >
      {title && <p className="t-label self-end text-right font-semibold text-ink group-hover:text-lime">{title}</p>}
      {children}
    </div>
  )
}

/** One tile per skill — real brand mark, official colour on hover. */
function Skill({ skill, i }: { skill: (typeof skills)[number]; i: number }) {
  const { tick } = useSound()
  return (
    <div
      onMouseEnter={tick}
      data-cursor
      data-reveal={(i % 5) * 45}
      title={skill.label}
      style={{ '--brand': readableOnDark(skill.hex) } as React.CSSProperties}
      className="skill-tile notch-card group relative flex h-[132px] flex-col justify-between bg-lime-deep px-5 py-4 pl-8 transition-colors duration-200 hover:bg-purple hover:text-lime max-md:h-[118px]"
    >
      <p className="t-label self-end text-right font-semibold text-ink group-hover:text-lime">{skill.label}</p>
      <SkillLogo
        skill={skill}
        className={cn(
          'sk-mark h-8 w-8 shrink-0 self-start text-ink',
          skill.wordmark ? 'h-auto w-auto font-display text-[17px] leading-none tracking-[0.06em]' : ''
        )}
      />
    </div>
  )
}

export default function Stats() {
  return (
    <section data-theme="lime" className="relative bg-lime px-8 pt-[110px] pb-[90px] text-ink max-md:px-4">
      <PixelTransition color="#b48cff" edge="top" />

      <div className="mx-auto max-w-[1400px]">
        {/* heading */}
        <div className="flex items-end justify-between gap-8 max-md:flex-col max-md:items-start" data-reveal>
          <div>
            <Tag tone="ink">Toolbox</Tag>
            <h2 className="t-display mt-3 text-[clamp(40px,5.4vw,80px)] font-normal">
              <Scramble text="Everything" speed={40} />
              <br />
              <Scramble text="I ship with" speed={40} delay={220} />
            </h2>
          </div>
          <p className="t-label max-w-[300px] text-right text-ink/55 leading-[1.9] max-md:text-left">
            Every language, framework and service in this repo — all {skillCount} of them, no filler.
          </p>
        </div>

        {/* counters */}
        <div className="mt-12 grid grid-cols-[repeat(10,1fr)] gap-3 max-md:grid-cols-2">
          {stats.map((s, i) => (
            <Card
              key={s.label}
              title={s.label}
              className={cn('col-span-3 max-md:col-span-1', i === 2 && 'max-md:col-span-2')}
            >
              <Counter to={s.value} suffix={s.suffix} className="font-display text-[84px] leading-none font-normal" />
            </Card>
          ))}
          <div className="col-span-1 flex items-end pb-2 max-md:hidden">
            <Pixelmon />
          </div>
        </div>

        {/* the full stack */}
        <div className="mt-3 grid grid-cols-[repeat(10,1fr)] gap-3 max-md:grid-cols-2">
          {skills.map((skill, i) => (
            <div key={skill.id} className="col-span-2 max-md:col-span-1">
              <Skill skill={skill} i={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* little purple pixel sprite in the corner */
function Pixelmon() {
  const rows = ['....#....', '...###...', '..#.#.#..', '.#..#..#.', '....#....', '...#.#...', '..#...#..', '.#.....#.']
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(9, 9px)' }} aria-hidden>
      {rows.flatMap((r, y) =>
        r.split('').map((c, x) => <i key={`${x}${y}`} className={cn('h-[9px] w-[9px]', c === '#' && 'bg-purple')} />)
      )}
    </div>
  )
}
