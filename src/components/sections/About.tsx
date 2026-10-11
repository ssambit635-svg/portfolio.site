import { about, profile } from '../../lib/site'
import InfraDiagram from '../InfraDiagram'

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-4" data-reveal>
          <p className="t-kicker text-mute">About</p>
          <h2 id="about-heading" className="t-display mt-3 text-[clamp(36px,5vw,56px)]">
            Product and the box it runs in.
          </h2>
        </div>
        <div className="md:col-span-4" data-reveal>
          <p className="text-[16px] leading-[1.7] text-ink/80">{about.p1}</p>
          <p className="mt-5 text-[16px] leading-[1.7] text-ink/80">{about.p2}</p>
          <p className="t-kicker mt-8 text-mute">
            {profile.city} · {profile.classTag}
          </p>
        </div>
        <div className="md:col-span-4" data-reveal>
          <InfraDiagram />
        </div>
      </div>
    </section>
  )
}
