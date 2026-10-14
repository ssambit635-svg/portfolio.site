import { headline, profile } from '../../lib/site'
import Button from '../ui/Button'

const PORTRAIT = `${import.meta.env.BASE_URL}sambit-swain.jpg`

export default function Hero() {
  return (
    <section id="top" aria-labelledby="home-heading" className="relative bg-paper pt-14">
      <div className="mx-auto grid max-w-[1280px] min-h-[calc(100svh-56px)] grid-cols-1 items-end gap-10 px-5 py-12 md:grid-cols-[1.4fr_0.8fr] md:px-8 md:py-16">
        <div>
          <p className="t-kicker text-mute">Cloud · Full-stack · CSE ’29</p>
          <h1 id="home-heading" className="t-display mt-6 text-[clamp(64px,12vw,148px)] text-ink">
            {profile.first}
            <br />
            {profile.last}
          </h1>
          <p className="mt-8 max-w-[36rem] text-[17px] leading-[1.6] text-ink/80 md:text-[18px]">{headline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#work">Selected work</Button>
            <Button href={`mailto:${profile.email}`} tone="ghost">
              {profile.email}
            </Button>
          </div>
        </div>

        <aside className="flex flex-col justify-end gap-6 md:items-end md:pb-2">
          <figure className="w-[min(240px,58vw)]">
            <img
              src={PORTRAIT}
              alt={`${profile.name}, cloud and full-stack developer`}
              width={480}
              height={600}
              className="aspect-[4/5] w-full object-cover object-top grayscale contrast-[1.05]"
            />
            <figcaption className="t-kicker mt-3 flex justify-between text-mute">
              <span>{profile.city}</span>
              <span>NIST University</span>
            </figcaption>
          </figure>
        </aside>
      </div>
      <hr className="rule mx-auto max-w-[1280px]" />
    </section>
  )
}
