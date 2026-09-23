import { stats, tools } from '../../lib/site'
import Counter from '../fx/Counter'
import PixelTransition from '../fx/PixelTransition'
import { useSound } from '../../hooks/useSound'
import { cn } from '../../lib/utils'

/* Dotted tool glyphs (halftone look) */
const Glyph = ({ id }: { id: string }) => {
  const common = 'h-[70px] w-[70px] [background:radial-gradient(circle,#1b1d17_36%,transparent_40%)] [background-size:5px_5px] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]'
  const masks: Record<string, string> = {
    react:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='black' stroke-width='5'%3E%3Cellipse cx='32' cy='32' rx='28' ry='11'/%3E%3Cellipse cx='32' cy='32' rx='28' ry='11' transform='rotate(60 32 32)'/%3E%3Cellipse cx='32' cy='32' rx='28' ry='11' transform='rotate(120 32 32)'/%3E%3C/g%3E%3Ccircle cx='32' cy='32' r='6' fill='black'/%3E%3C/svg%3E\")",
    python:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='black' d='M31 4c-13 0-12 6-12 6v6h12v2H14s-9-1-9 12 8 13 8 13h5v-6s0-8 8-8h12s8 0 8-8V10s1-6-15-6zm-7 4a2 2 0 110 4 2 2 0 010-4z'/%3E%3Cpath fill='black' d='M33 60c13 0 12-6 12-6v-6H33v-2h17s9 1 9-12-8-13-8-13h-5v6s0 8-8 8H26s-8 0-8 8v11s-1 6 15 6zm7-4a2 2 0 110-4 2 2 0 010 4z'/%3E%3C/svg%3E\")",
    aws: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='6' y='6' width='52' height='52' rx='10' fill='black'/%3E%3Ctext x='32' y='42' font-family='Arial Black,Arial' font-size='24' font-weight='900' text-anchor='middle' fill='white'%3Eaws%3C/text%3E%3C/svg%3E\")",
    docker:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='6' y='6' width='52' height='52' rx='10' fill='black'/%3E%3Cg fill='white'%3E%3Crect x='16' y='30' width='8' height='8'/%3E%3Crect x='26' y='30' width='8' height='8'/%3E%3Crect x='36' y='30' width='8' height='8'/%3E%3Crect x='26' y='20' width='8' height='8'/%3E%3Crect x='36' y='20' width='8' height='8'/%3E%3Crect x='36' y='10' width='8' height='8'/%3E%3Cpath d='M12 42h40c0 6-6 12-20 12S12 48 12 42z'/%3E%3C/g%3E%3C/svg%3E\")"
  }
  return <span aria-hidden className={common} style={{ maskImage: masks[id], WebkitMaskImage: masks[id] }} />
}

function Card({
  title,
  children,
  className,
  hover
}: {
  title: string
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  const { tick } = useSound()
  return (
    <div
      onMouseEnter={tick}
      data-cursor
      className={cn(
        'notch-card group relative flex h-[180px] flex-col justify-between bg-lime-deep px-6 py-4 pl-9 transition-colors duration-200',
        hover && 'hover:bg-purple hover:text-lime',
        className
      )}
    >
      <p className="t-label self-end text-right font-semibold text-ink group-hover:text-lime">{title}</p>
      {children}
    </div>
  )
}

export default function Stats() {
  return (
    <section data-theme="lime" className="relative bg-lime px-8 pt-[110px] pb-[90px] text-ink max-md:px-4">
      <PixelTransition color="#b6ff3b" edge="top" />
      <div className="mx-auto grid max-w-[1400px] grid-cols-[repeat(10,1fr)] gap-y-0 max-md:grid-cols-2 max-md:gap-3">
        {/* row 1 */}
        <Card title={stats[0].label} className="col-span-2 max-md:col-span-1">
          <Counter to={stats[0].value} suffix={stats[0].suffix} className="font-display text-[84px] leading-none font-normal" />
        </Card>
        <div className="col-span-2 max-md:hidden" />
        <Card title={tools[0].label} className="col-span-2 max-md:col-span-1" hover>
          <Glyph id={tools[0].id} />
        </Card>
        <div className="col-span-2 max-md:hidden" />
        <Card title={tools[1].label} className="col-span-2 max-md:col-span-1" hover>
          <Glyph id={tools[1].id} />
        </Card>
        {/* row 2 */}
        <div className="col-span-2 max-md:hidden" />
        <Card title={stats[1].label} className="col-span-2 max-md:col-span-1">
          <Counter to={stats[1].value} suffix={stats[1].suffix} className="font-display text-[84px] leading-none font-normal" />
        </Card>
        <div className="col-span-2 max-md:hidden" />
        <Card title={tools[2].label} className="col-span-2 max-md:col-span-1" hover>
          <Glyph id={tools[2].id} />
        </Card>
        <div className="col-span-2 max-md:hidden" />
        {/* row 3 */}
        <div className="col-span-2 flex items-end pb-2 max-md:hidden">
          <Pixelmon />
        </div>
        <div className="col-span-2 max-md:hidden" />
        <Card title={stats[2].label} className="col-span-2 max-md:col-span-1">
          <Counter to={stats[2].value} suffix={stats[2].suffix} className="font-display text-[84px] leading-none font-normal" />
        </Card>
        <div className="col-span-2 max-md:hidden" />
        <Card title={tools[3].label} className="col-span-2 max-md:col-span-1" hover>
          <Glyph id={tools[3].id} />
        </Card>
      </div>
    </section>
  )
}

/* little purple pixel sprite in the corner */
function Pixelmon() {
  const rows = ['....#....', '...###...', '..#.#.#..', '.#..#..#.', '....#....', '...#.#...', '..#...#..', '.#.....#.']
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(9, 9px)' }} aria-hidden>
      {rows.flatMap((r, y) => r.split('').map((c, x) => <i key={`${x}${y}`} className={cn('h-[9px] w-[9px]', c === '#' && 'bg-purple')} />))}
    </div>
  )
}
