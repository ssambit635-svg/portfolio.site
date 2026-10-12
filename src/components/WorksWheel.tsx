import * as React from 'react'
import { getLenis } from '../hooks/useLenis'
import '../works-wheel.css'

// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep turning and the drum carries the next piece round to the front.
//
// The whole thing is one number - `turn` - read by a single rAF pass that writes
// transforms straight to the DOM. 0 is the ring, 1 is the drum with item 0 at
// the front, and every whole number after that is one more item turned past.
//
// Two ways to turn it, because there are two kinds of pointer. A mouse turns it
// itself: the wheel and vertical drags are swallowed while the drum still has
// somewhere to go, and handed back to the page at either end. A finger has no
// wheel to swallow and trapping a swipe inside a section is a bug, not a
// feature - so on a coarse pointer the section is made scroll-tall and the
// frame sticks while the page's own scroll turns the drum.

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string
  /** Cover art. Any src an <img> takes. */
  image: string
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<'section'>,
  'children'
> {
  items: WorksWheelItem[]
  /** Sits in the middle of the ring, and names the wheel. @default "Works" */
  label?: string
  /** Label on the card's hover affordance. Omit to drop it. @default "View" */
  action?: string
  /** Micro line in the top-left corner of the frame. @default undefined */
  kicker?: string
  /**
   * Details for whichever item is at the front. The wheel fades them in with
   * the title, a beat later, and keeps their links out of the way until then.
   */
  renderFront?: (item: WorksWheelItem, index: number) => React.ReactNode
  /** Wheel travel, in pixels, that turns one item past the front. */
  wheelUnits?: number
  /** Vertical drag, in pixels, that turns one item past the front. */
  dragUnits?: number
  /** Page scroll per item, in viewport heights, on a coarse pointer. */
  scrollPerItem?: number
}

/* Geometry. The card is measured against the stage; everything else is measured
   against the card, so a narrow stage - where the card is capped by width, not
   height - scales the whole wheel down with it instead of leaving a small card
   swinging on a huge drum. The three that matter are tuned together: STEP
   against DRUM sets how hard the neighbours rotate away, and DRUM against LENS
   decides whether they land inside the frame or run off it. */
const CARD_H = 0.38 // front card height, of the stage
const CARD_MAX_W = 0.34 // ... but never wider than this much of the stage
/* A portrait stage is capped by width long before it is capped by height, and
   at 0.34 the cards come out postage-stamp sized. Let them run wider there. */
const CARD_MAX_W_TALL = 0.62
const CARD_RATIO = 1.45 // card width / height
const STEP = 40 // degrees between cards on the drum
const DRUM = 2.22 // drum radius, in card heights - and everything below likewise
const LENS = 2.7 // perspective distance
const RING_R = 1.14 // ring radius
/* The drum alone hangs the work on a plumb line. It isn't one: the strip curves
   away round an arc whose centre sits off to the LEFT, so the piece at the front
   is at the arc's near point - dead centre - and its neighbours have already
   swung back left as well as up and down. BOW is that arc's radius; nothing else
   makes the difference between a stack of cards and a wheel seen side on. */
const BOW = 1.82
const TITLE = 0.124 // ring label and front-card title
const INDEX = 0.04 // the index down the right-hand side
/** Items either side of the front still worth drawing. Past this a card is
    edge-on, and further round it would stack up on the vanishing point. */
const CULL = 1.6

/** How much of a wheel-notch or a dragged pixel counts as one item. */
const WHEEL_UNITS = 900
const DRAG_UNITS = 420
/** Page scroll per item, in viewport heights, when the page turns the wheel. */
const SCROLL_PER_ITEM = 0.55
/** Quiet time after the last wheel event before the wheel settles on an item. */
const SETTLE = 140
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12
/** Travel that still counts as a tap rather than a drag. */
const TAP = 6

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

type Stage = { w: number; h: number }

const rad = (deg: number) => (deg * Math.PI) / 180

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)))

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. The bow is applied
    first, in the wheel's own plane, so it slides the card sideways rather than
    turning with it - and perspective still shrinks it with distance. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  )
}

export function WorksWheel({
  items,
  label = 'Works',
  action = 'View',
  kicker,
  renderFront,
  wheelUnits = WHEEL_UNITS,
  dragUnits = DRAG_UNITS,
  scrollPerItem = SCROLL_PER_ITEM,
  className,
  style,
  ...props
}: WorksWheelProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const frameRef = React.useRef<HTMLDivElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const wheelRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<(HTMLElement | null)[]>([])
  const labelRef = React.useRef<HTMLDivElement>(null)
  const frontRef = React.useRef<HTMLDivElement>(null)
  const metaRef = React.useRef<HTMLDivElement>(null)

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
  const turn = React.useRef(0)
  const target = React.useRef(0)
  const settling = React.useRef(0)
  const aligning = React.useRef(0)
  const dragging = React.useRef<number | null>(null)
  const travel = React.useRef(0)
  const [active, setActive] = React.useState(0)
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 })

  const count = items.length
  const last = Math.max(count - 1, 0)
  const units = last + 1

  // Read after mount, not during render: the server has no matchMedia, and
  // branching on it inline is a hydration mismatch. Reduced motion drops the
  // easing, so the wheel lands where it is put instead of gliding there.
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => setReduced(query.matches)
    read()
    query.addEventListener('change', read)
    return () => query.removeEventListener('change', read)
  }, [])

  // Which pointer is turning the wheel. Kept in step with the media query in
  // works-wheel.css that decides whether the section is scroll-tall, so the
  // two can never disagree about who is driving.
  const [scrubbed, setScrubbed] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia('(hover: none) and (pointer: coarse)')
    const read = () => setScrubbed(query.matches)
    read()
    query.addEventListener('change', read)
    return () => query.removeEventListener('change', read)
  }, [])

  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const metrics = React.useMemo(() => {
    const { w, h } = stage
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * (w < h ? CARD_MAX_W_TALL : CARD_MAX_W))
    const cardH = cardW / CARD_RATIO
    const drumR = cardH * DRUM
    const ringR = cardH * RING_R
    // Shrink the ring's cards until the circle reads as a closed loop rather
    // than beads on a wire, however many pieces the wheel is given.
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: clamp(cardH * TITLE, 20, 76),
      index: clamp(cardH * INDEX, 9, 15),
    }
  }, [stage, count])

  // One pass per frame: decide where the wheel is, then write every transform.
  React.useEffect(() => {
    if (!stage.h) return
    let frame = 0
    const { ringR, ringScale, drumR, bow } = metrics

    const draw = () => {
      frame = requestAnimationFrame(draw)

      const root = rootRef.current
      const span = root ? root.getBoundingClientRect().height - window.innerHeight : 0
      if (scrubbed && span > 0) {
        // Scrubbed by the page: read the scroll, write the drum. The page's own
        // smoothing is the easing, and a second one on top would leave the work
        // trailing the finger.
        const top = root!.getBoundingClientRect().top
        target.current = clamp(-top / span, 0, 1) * units
        turn.current = target.current
      } else {
        const gap = target.current - turn.current
        if (Math.abs(gap) < 0.0005) turn.current = target.current
        else turn.current += gap * (reduced ? 1 : EASE)
      }

      const t = turn.current
      const m = clamp(t, 0, 1)
      const pos = Math.max(0, t - 1)

      // The drum is pulled back so its front face lands on the picture plane.
      // That set-back has to arrive with the drum, or the ring would sit at the
      // far side of the perspective and render at half its size.
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          // Culled by distance, not by angle: at a full turn the far side comes
          // back round to face us, and everything past the neighbours lands on
          // the vanishing point in a heap.
          const away = Math.abs(d) > CULL;
          card.style.opacity = m > 0.5 && away ? '0' : '1';
          card.style.pointerEvents = m > 0.5 && away ? 'none' : '';
          // Everything but the piece at the front sits back in its own shadow.
          card.style.setProperty('--ww-veil', String(m * clamp(Math.abs(d) * 0.5, 0, 0.52)));
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (frontRef.current) {
        frontRef.current.style.opacity = String(m);
        // Hidden, not merely transparent: an invisible line of type would still
        // be a click target and a tab stop over the ring.
        frontRef.current.style.visibility = m > 0.5 ? 'visible' : 'hidden';
      }
      if (metaRef.current) {
        const veil = clamp((m - 0.55) / 0.45, 0, 1);
        metaRef.current.style.opacity = String(veil);
        metaRef.current.style.pointerEvents = veil > 0.9 ? 'auto' : 'none';
      }

      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced, scrubbed, units]);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
    },
    [last],
  );

  /** The gesture can arrive a little before the section has lined up. Rather
      than hold a drum's turn of scroll with a sliver of the hero still showing,
      finish the approach while the drum opens. */
  const alignTop = React.useCallback((top: number) => {
    if (aligning.current || Math.abs(top) < 6) return;
    const y = window.scrollY + top;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 0.45 });
    else window.scrollTo({ top: y, behavior: "smooth" });
    aligning.current = window.setTimeout(() => {
      aligning.current = 0;
    }, 700);
  }, []);

  /** Send the wheel to an item - by turning it, or by scrolling to it when the
      page is the thing doing the turning. */
  const jump = React.useCallback(
    (index: number) => {
      const root = rootRef.current
      const rect = root?.getBoundingClientRect()
      const span = rect ? rect.height - window.innerHeight : 0
      if (scrubbed && root && rect && span > 0) {
        const y = window.scrollY + rect.top + ((index + 1) / units) * span
        const lenis = getLenis()
        if (lenis) lenis.scrollTo(y)
        else window.scrollTo({ top: y, behavior: 'smooth' })
        return
      }
      if (rect) alignTop(rect.top)
      to(index + 1)
    },
    [alignTop, scrubbed, to, units],
  );

  // Native listener, because the wheel has to be cancellable - and it only
  // cancels while the section is really on screen and the drum still has
  // somewhere to go, so the page keeps the gesture everywhere else instead of
  // trapping the reader.
  React.useEffect(() => {
    // On the frame, not the stage: the index and the front card's type sit over
    // the stage, and a wheel over any of them is still a wheel over the wheel.
    const el = frameRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      const root = rootRef.current
      if (!root || scrubbed) return
      const rect = root.getBoundingClientRect()
      const view = window.innerHeight
      // Only the section that is covering the page turns the wheel: at three
      // quarters on screen it is the thing being read, and less than that is
      // still the page moving.
      if (rect.top > view * 0.25 || rect.bottom < view * 0.75) return
      const next = target.current + event.deltaY / wheelUnits
      // Tell the page's smooth scroller to keep its hands off, since it listens
      // for the same wheel events further up the tree.
      const turning = next > 0 && next < last + 1
      el.toggleAttribute('data-lenis-prevent', turning)
      if (!turning) return
      event.preventDefault()
      alignTop(rect.top)
      to(next)
      // A wheel gesture arrives as a burst of events with no end of its own, so
      // the rest position is whatever notch it happened to stop on. Left there
      // the drum sits between two cards - nothing at the front, and the pair
      // either side of the gap both turned half away. Settle onto an item.
      window.clearTimeout(settling.current)
      settling.current = window.setTimeout(
        () => to(Math.round(target.current)),
        SETTLE,
      )
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.clearTimeout(settling.current)
      window.clearTimeout(aligning.current)
      el.removeAttribute('data-lenis-prevent')
    }
  }, [alignTop, to, last, scrubbed, wheelUnits])

  // Out of frame, the wheel goes back to rest, so the next visit to the section
  // opens on the ring instead of dropping the reader into the middle of the drum.
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return
      turn.current = 0
      target.current = 0
      window.clearTimeout(settling.current)
      window.clearTimeout(aligning.current)
      aligning.current = 0
      frameRef.current?.removeAttribute('data-lenis-prevent')
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Drag to turn. The move and up listeners live on the window for the length
  // of the gesture so the drum keeps up with a pointer that has left the frame,
  // and the cards keep their own clicks.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const rect = rootRef.current?.getBoundingClientRect()
    const view = window.innerHeight
    // Dragging a drum that is not the thing on screen would just spoil the page.
    if (!rect || rect.top > view * 0.25 || rect.bottom < view * 0.75) return
    // On a finger the page owns vertical gestures; it is what turns the wheel.
    if (scrubbed && rect.height > view) return
    dragging.current = event.clientY
    travel.current = 0
    const move = (e: PointerEvent) => {
      if (dragging.current === null) return
      const dy = dragging.current - e.clientY
      dragging.current = e.clientY
      travel.current += Math.abs(dy)
      to(target.current + dy / dragUnits)
    }
    const up = () => {
      dragging.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      // Land on an item rather than between two.
      if (target.current > 1) to(Math.round(target.current))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  /** A drag that ended on a card is not a click on that card. */
  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (travel.current <= TAP) return
    travel.current = 0
    event.preventDefault()
    event.stopPropagation()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (scrubbed) return
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    const next = Math.round(target.current) + step
    // At either end the arrow belongs to the page, not to the wheel.
    if (next < 0 || next > units) return
    to(next)
    event.preventDefault()
  }

  return (
    <section
      ref={rootRef}
      aria-label={label}
      className={className ? `ww ${className}` : 'ww'}
      style={
        {
          ...style,
          '--ww-span': `${(1 + units * scrollPerItem) * 100}svh`,
          '--ww-cardw': `${metrics.cardW}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      <div ref={frameRef} className="ww-frame">
        <div
          ref={stageRef}
          tabIndex={0}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`works-wheel-${active}`}
          className="ww-stage"
          style={{ perspective: `${metrics.depth}px` }}
          onPointerDown={onPointerDown}
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          <div ref={wheelRef} className="ww-wheel">
            {items.map((item, i) => {
              const Tag = (item.href ? 'a' : 'div') as 'a'
              return (
                <Tag
                  key={item.title}
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={item.href}
                  target={item.href?.startsWith('http') ? '_blank' : undefined}
                  rel={item.href?.startsWith('http') ? 'noreferrer' : undefined}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node
                  }}
                  className="ww-card"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className="ww-face">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      className="ww-shot"
                    />
                    {action && item.href ? (
                      <span className="ww-cta">
                        {action}
                        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                          <path
                            d="M3 9 9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </span>
                </Tag>
              )
            })}
          </div>
        </div>

        {kicker ? <p className="ww-kicker">{kicker}</p> : null}

        {/* Ring title and front-card title trade places across the transition.
            Type is sized off the measured stage, not vh, so the wheel keeps its
            proportions inside a card as well as at full bleed. */}
        <div
          ref={labelRef}
          className="ww-label"
          style={{ '--ww-title': `${metrics.title}px` } as React.CSSProperties}
        >
          {label}
        </div>
        <div
          ref={frontRef}
          className="ww-front"
          style={{ '--ww-title': `${metrics.title}px` } as React.CSSProperties}
        >
          <p className="ww-front-title">{items[active]?.title}</p>
          {renderFront ? (
            <div ref={metaRef} className="ww-meta">
              {renderFront(items[active], active)}
            </div>
          ) : null}
        </div>

        <ol
          className="ww-index"
          aria-label="Jump to a project"
          style={{ fontSize: `${metrics.index}px` }}
        >
          {items.map((item, i) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => jump(i)}
                aria-current={i === active ? 'true' : undefined}
                className={i === active ? 'is-active' : undefined}
              >
                <span className="ww-index-no">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.title}
              </button>
            </li>
          ))}
        </ol>

        <p className="ww-hint" aria-hidden="true">
          <span className="ww-hint-count">
            {String(active + 1).padStart(2, '0')}
            <i>/{String(count).padStart(2, '0')}</i>
          </span>
          <span className="ww-hint-word">Scroll to turn</span>
        </p>
      </div>
    </section>
  )
}

export default WorksWheel
