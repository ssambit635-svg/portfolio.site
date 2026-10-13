/**
 * What the monitor is showing.
 *
 * The panel in hero-monitor.jpg was a black rectangle, which wasted the largest
 * piece of real estate above the fold. This is the copy on it — a trade line over
 * the one-sentence pitch — drawn into the panel's own box instead of floated over
 * the photo, plus the layers that make a lit display look like a lit display:
 *
 *   .hs-halo    the green bias light bleeding onto the wall behind the set
 *   .hs-tint    the panel's own phosphor floor, raised from black to deep green
 *   .hs-copy    the type
 *   .hs-matrix  the LED pitch — dark rows and columns multiplied over the type, so
 *               the glyphs are built out of lit cells and break at the seams the
 *               way real subpixels do
 *   .hs-scan    one slow refresh band, screen-blended
 *   .hs-edge    falloff into the bezel, so the copy sits inside a lit area
 *   .hs-sheen   the glass over the panel
 *
 * .hero-screen is a rectangle of the *screen interior*, in percentages of the
 * frame, and it is itself an inline-size container — every type size inside is a
 * share of the panel. That is what keeps the copy from ever outgrowing the glass,
 * at any viewport, before the small-screen rules even run.
 */

export default function HeroScreen() {
  return (
    <>
      {/* the bias light is a sibling of the panel, not a child of it: a size
          container isolates blending, and this has to add light to the photo */}
      <i className="hs-halo" aria-hidden="true" />
      <div className="hero-screen">
        <i className="hs-tint" aria-hidden="true" />

        <div className="hs-copy">
          <p className="hs-kicker">DevOps Engineer · Cloud · Design</p>
          <h1 className="hs-head">
            <span>From code to cloud.</span>
            <span>From pixels to production.</span>
          </h1>
        </div>

        <i className="hs-matrix" aria-hidden="true" />
        <i className="hs-scan" aria-hidden="true" />
        <i className="hs-edge" aria-hidden="true" />
        <i className="hs-sheen" aria-hidden="true" />
      </div>
    </>
  )
}
