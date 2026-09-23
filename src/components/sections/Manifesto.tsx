import { manifesto } from '../../lib/site'
import Scramble from '../fx/Scramble'

export default function Manifesto() {
  return (
    <section data-theme="dark" className="relative overflow-hidden bg-ink px-8 pt-[10vh] pb-[24vh] text-cream max-md:px-5">
      <div className="grid-lines" style={{ '--cols': 5 } as React.CSSProperties}>
        <i /><i /><i /><i /><i />
      </div>
      <div className="relative grid grid-cols-5 max-md:grid-cols-1">
        <p className="t-display col-span-2 text-justify text-[clamp(30px,3.6vw,52px)] font-normal leading-[1.02] [text-align-last:justify] max-md:col-span-1">
          {manifesto.lines.map((l, i) => (
            <span key={l} className="block">
              <Scramble text={l} speed={22} delay={i * 90} />
            </span>
          ))}
        </p>
        <p className="t-display col-span-2 col-start-3 mt-[46vh] self-end text-[clamp(34px,4vw,60px)] font-normal leading-[1] max-md:col-start-1 max-md:mt-14">
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
