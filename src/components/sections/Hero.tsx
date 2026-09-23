import { intro, profile } from '../../lib/site'
import Scramble from '../fx/Scramble'
import Halftone from '../fx/Halftone'
import Tag from '../ui/Tag'

/** Drop your cut-out portrait at public/portrait.png (dark/transparent bg). */
const PORTRAIT = `${import.meta.env.BASE_URL}portrait.png`

export default function Hero() {
  return (
    <section id="top" data-theme="dark" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-cream">
      <div className="grid-lines" style={{ '--cols': 5 } as React.CSSProperties}>
        <i /><i /><i /><i /><i />
      </div>

      {/* contact block */}
      <div className="absolute top-[100px] left-8 border-l-2 border-lime pl-4 max-md:hidden">
        <p className="t-label flex gap-8 text-mute">
          {profile.phoneParts.map((p) => (
            <Scramble key={p} text={p} trigger="mount" delay={600} />
          ))}
        </p>
        <p className="t-label flex gap-12 text-mute">
          {profile.emailParts.map((p) => (
            <Scramble key={p} text={p} trigger="mount" delay={800} />
          ))}
        </p>
      </div>

      {/* intro paragraph */}
      <p className="absolute top-[31%] left-8 max-w-[540px] font-body text-[15px] leading-[1.55] text-[#9a9e96] max-md:top-[22%] max-md:right-8 max-md:text-[14px]">
        <span className="inline-block w-[50%] max-md:w-0" />
        {intro.before}
        <em className="italic text-red">{intro.art}</em>
        {intro.mid}
        <b className="font-semibold text-lime">{intro.tech}</b>
        {intro.after}
      </p>

      {/* portrait */}
      <div data-cursor className="absolute top-[12%] left-[53%] h-[92%] w-[26%] max-md:top-[28%] max-md:left-[30%] max-md:h-[60%] max-md:w-[46%]">
        <Halftone src={PORTRAIT} />
      </div>

      {/* name */}
      <div className="absolute bottom-[3%] left-8 max-md:left-5">
        <div className="mb-2 flex items-center gap-4">
          <Tag>{profile.role}</Tag>
        </div>
        <h1 className="t-display text-[clamp(72px,11.5vw,168px)]">
          <span className="mb-[-0.06em] block pl-[0.32em] max-md:pl-0">
            <Scramble text={profile.first} trigger="mount" speed={70} />
          </span>
          <span className="block">
            <Scramble text={profile.last} trigger="mount" speed={70} delay={200} />
          </span>
        </h1>
      </div>
      <p className="t-label absolute bottom-[19%] left-8 text-mute max-md:hidden">{profile.tagline}</p>
      <p className="t-label absolute bottom-[6%] left-[34%] text-mute max-md:hidden">{profile.taglineSub}</p>

      {/* right column */}
      <p className="t-label absolute top-[105px] left-[76%] text-mute max-md:hidden">From</p>
      <p className="t-display absolute top-[100px] right-8 text-[60px] max-md:top-[90px] max-md:text-[40px]">
        <Scramble text={profile.country} trigger="mount" speed={120} delay={300} />
      </p>
      <p className="absolute bottom-[6%] left-[60%] font-display text-[24px] font-medium tracking-wide max-md:left-auto max-md:right-6">
        <Scramble text={profile.birthYear} trigger="mount" speed={120} delay={500} />
      </p>
      <p className="t-label vertical-rl absolute right-8 bottom-[6%] text-mute max-md:hidden">
        Scroll down <span className="blink ml-2">›››</span>
      </p>
    </section>
  )
}
