import { manifesto } from '../../lib/site'
import Scramble from '../fx/Scramble'

export default function Manifesto() {
  return (
    <section id="about" aria-labelledby="about-heading" data-theme="dark" className="relative overflow-hidden bg-ink px-8 pt-[10vh] pb-[24vh] text-cream max-md:px-5">
      <div className="grid-lines" style={{ '--cols': 5 } as React.CSSProperties}>
        <i /><i /><i /><i /><i />
      </div>
      <div className="relative mb-12 max-w-2xl" data-plx="-60">
        <h2 id="about-heading" className="t-label mb-4 text-lime">About Sambit Swain</h2>
        <p className="text-[16px] leading-relaxed text-cream/75">I’m Sambit Swain, a B.Tech Computer Science and Engineering student at NIST University (2025–2029), based in Berhampur, India. I build full-stack web apps and cloud/backend experiments, using hackathons to take real problem briefs from idea to working prototype. Recent projects explore health, productivity, agriculture and civic tools.</p>
      </div>
      <div className="relative grid grid-cols-5 max-md:grid-cols-1">
        <p data-plx="-120" className="t-display col-span-2 text-justify text-[clamp(30px,3.6vw,52px)] font-normal leading-[1.02] [text-align-last:justify] max-md:col-span-1">
          {manifesto.lines.map((l, i) => (
            <span key={l} className="block">
              <Scramble text={l} speed={22} delay={i * 90} />
            </span>
          ))}
        </p>
        <p data-plx="95" className="t-display col-span-2 col-start-3 mt-[46vh] self-end text-[clamp(34px,4vw,60px)] font-normal leading-[1] max-md:col-start-1 max-md:mt-14">
          <span className="block">
            <Scramble text={manifesto.quote[0]} speed={40} />{' '}
            <span className="ml-3 inline-block text-lime">⁘</span>
          </span>
          <span className="block pl-[36%]">
            <Scramble text={manifesto.quote[1]} speed={60} delay={300} />
          </span>
          <span className="block pl-[62%]">
            <Scramble text={manifesto.quote[2]} speed={40} delay={500} />
          </span>
        </p>
      </div>
    </section>
  )
}
