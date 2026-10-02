import { intro, profile } from '../../lib/site'
import Scramble from '../fx/Scramble'
import Halftone from '../fx/Halftone'
import Tag from '../ui/Tag'
import Button from '../ui/Button'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="home-heading"
      data-theme="dark"
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-cream"
    >
      <div className="grid-lines" style={{ '--cols': 5 } as React.CSSProperties}>
        <i /><i /><i /><i /><i />
      </div>

      {/* Contact details are useful context on wide screens; the footer is the
          compact-screen contact point. */}
      <div className="absolute top-[100px] left-8 z-10 border-l-2 border-lime pl-4 max-md:hidden">
        <p className="t-label flex gap-8 text-mute">
          {profile.phoneParts.map((part) => (
            <Scramble key={part} text={part} trigger="mount" delay={600} />
          ))}
        </p>
        <p className="t-label flex gap-12 text-mute">
          {profile.emailParts.map((part) => (
            <Scramble key={part} text={part} trigger="mount" delay={800} />
          ))}
        </p>
      </div>

      {/* A more specific introduction: what I study, build and where. */}
      <p className="absolute top-[31%] left-8 z-10 w-[min(38vw,500px)] font-body text-[15px] leading-[1.7] text-[#b4b7b0] max-md:top-[21%] max-md:right-5 max-md:left-5 max-md:w-auto max-md:text-[14px]">
        {intro.before}
        <em className="font-medium italic text-red">{intro.art}</em>
        {intro.mid}
        <b className="font-semibold text-lime">{intro.tech}</b>
        {intro.after}
      </p>

      {/* The real portrait is halftoned until the pointer, a tap or keyboard
          focus reveals the original photo. */}
      <div className="absolute top-[12%] right-[6%] z-0 aspect-[3/4] w-[clamp(280px,42vw,560px)] max-lg:top-[12%] max-lg:right-[4%] max-lg:w-[38vw] max-md:top-[40%] max-md:right-[5%] max-md:w-[50vw]">
        <div
          data-cursor
          className="notch-item relative h-full w-full overflow-hidden border border-white/10 bg-ink-2 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
        >
          <Halftone src={PORTRAIT} />
          <span className="t-label pointer-events-none absolute right-2 bottom-2 bg-ink/75 px-2 py-1 text-lime backdrop-blur-sm max-md:text-[8px]">
            Hover / tap to reveal
          </span>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(180,140,255,0.12),transparent_68%)] blur-2xl"
        />
      </div>

      {/* Name and first action anchor the bottom edge. */}
      <div className="absolute bottom-[4%] left-8 z-20 max-md:left-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Tag>{profile.role}</Tag>
          <Button href="#work" className="border-cream/40 px-3 py-[7px] text-cream hover:bg-cream hover:text-ink">
            Explore selected work <span aria-hidden>↘</span>
          </Button>
        </div>
        <h1 id="home-heading" className="t-display text-[clamp(64px,11.5vw,168px)]">
          <span className="mb-[-0.06em] block pl-[0.32em] max-md:pl-0">
            <Scramble text={profile.first} trigger="mount" speed={70} />
          </span>{' '}
          <span className="block">
            <Scramble text={profile.last} trigger="mount" speed={70} delay={200} />
          </span>
        </h1>
      </div>

      <p className="t-label absolute top-[105px] left-[70%] z-10 bg-ink/70 px-2 py-1 text-mute backdrop-blur-sm max-md:hidden">Based in</p>
      <p className="t-display absolute top-[100px] right-8 z-10 bg-ink/70 px-2 py-1 text-[60px] text-cream backdrop-blur-sm max-md:top-[88px] max-md:right-5 max-md:text-[36px]">
        <Scramble text={profile.country} trigger="mount" speed={120} delay={300} />
      </p>
      <p className="t-label vertical-rl absolute right-8 bottom-[6%] z-10 text-mute max-md:hidden">
        Scroll to explore <span className="blink ml-2">›››</span>
      </p>
    </section>
  )
}
