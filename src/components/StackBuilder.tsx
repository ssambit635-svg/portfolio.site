import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { allTools, matchStack } from '../lib/stack'
import { projects } from '../lib/site'
import '../features.css'

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

type Point = { x: number; y: number }

/** Where a pin sits on an element, relative to the board. */
function pinOf(el: HTMLElement, board: DOMRect): Point {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2 - board.left, y: r.top + 10 - board.top }
}

/** A slack string between two pins: it hangs, so it sags toward the floor of the board. */
function stringPath(a: Point, b: Point): string {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const sag = 28 + Math.hypot(b.x - a.x, b.y - a.y) * 0.12
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${(my + sag).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

/**
 * Stack builder as a case board, after a real detective's cork board. Each
 * technology is an index card pinned to the cork. Pin a few, and red string runs
 * from each to the case note, and the printed photos of the matching projects are
 * pinned up. Hover a card and its evidence is written on a sticky note.
 */
export default function StackBuilder() {
  const tools = useMemo(() => allTools(), [])
  const [selected, setSelected] = useState<string[]>([])
  const result = useMemo(() => matchStack(selected), [selected])

  const usedIn = useMemo(
    () =>
      new Map(
        tools.map((tool) => [tool, projects.filter((p) => p.stack.some((t) => same(t, tool)))]),
      ),
    [tools],
  )

  // Stable between renders, so the string effect below only runs when the case changes.
  const photos = useMemo(
    () =>
      (result.exact.length ? result.exact : result.closest ? [result.closest.project] : []).slice(
        0,
        3,
      ),
    [result],
  )

  const boardRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())
  const photoRefs = useRef(new Map<string, HTMLElement>())
  const [strings, setStrings] = useState<string[]>([])

  // The string follows the pins. Recomputed on every change to the case and on resize.
  useLayoutEffect(() => {
    const board = boardRef.current
    const note = noteRef.current
    if (!board || !note) return
    const draw = () => {
      const frame = board.getBoundingClientRect()
      const target = pinOf(note, frame)
      const ends: Point[] = [
        ...selected
          .map((t) => cardRefs.current.get(t))
          .filter((el): el is HTMLButtonElement => !!el)
          .map((el) => pinOf(el, frame)),
        ...photos
          .map((p) => photoRefs.current.get(p.id))
          .filter((el): el is HTMLElement => !!el)
          .map((el) => pinOf(el, frame)),
      ]
      setStrings(ends.map((end) => stringPath(end, target)))
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(board)
    window.addEventListener('resize', draw)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [selected, photos])

  const toggle = (tool: string) =>
    setSelected((current) =>
      current.includes(tool) ? current.filter((t) => t !== tool) : [...current, tool],
    )

  const names = selected.join(', ')

  return (
    <section id="stack" className="section stack" aria-labelledby="stack-heading">
      <div className="section-head">
        <p>Pin the evidence · see what the case says</p>
        <h2 id="stack-heading">Stack builder</h2>
      </div>

      <div className="wall">
        <div className="board" ref={boardRef}>
          <div className="cork">
            <svg className="strings" aria-hidden="true" focusable="false">
              {strings.map((d, i) => (
                <g key={i}>
                  <path d={d} className="string-shadow" />
                  <path d={d} className="string" />
                </g>
              ))}
            </svg>

            <div className="case-label">
              <strong>Case file: stack</strong>
              <span>Hover a card to see its evidence. Pin the tools in question.</span>
            </div>

            <ul className="stack-cards">
              {tools.map((tool, i) => {
                const on = selected.includes(tool)
                const projectsUsing = usedIn.get(tool) ?? []
                // A fixed, varied tilt per card, so the board looks hand-pinned and stays the same on every visit.
                const tilt = (((i * 37) % 7) - 3) * 0.45
                return (
                  <li key={tool}>
                    <button
                      ref={(el) => {
                        if (el) cardRefs.current.set(tool, el)
                        else cardRefs.current.delete(tool)
                      }}
                      type="button"
                      className={`pin-card${on ? ' pin-card-on' : ''}`}
                      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
                      aria-pressed={on}
                      onClick={() => toggle(tool)}
                    >
                      <span className="pin-head" aria-hidden="true" />
                      <span className="ev-no">EV-{String(i + 1).padStart(2, '0')}</span>
                      <span className="pin-text">{tool}</span>
                    </button>
                    <span className="pin-note" aria-hidden="true">
                      {projectsUsing.length > 0 ? (
                        <>Evidence for: {projectsUsing.map((p) => p.title).join(', ')}</>
                      ) : (
                        <>No project uses {tool} yet.</>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="evidence">
              <div className="sticky" ref={noteRef} aria-live="polite">
                <span className="tack" aria-hidden="true" />
                <div className="sticky-head">
                  <p>
                    {selected.length === 0 ? 'Nothing pinned yet' : `${selected.length} pinned`}
                  </p>
                  {selected.length > 0 && (
                    <button type="button" className="stack-clear" onClick={() => setSelected([])}>
                      Clear
                    </button>
                  )}
                </div>

                {selected.length === 0 && (
                  <p className="case-text">
                    Pin a few technologies. The projects that use them all appear here.
                  </p>
                )}

                {selected.length > 0 && result.exact.length > 0 && (
                  <p className="case-text">
                    {result.exact.length === 1
                      ? '1 project uses'
                      : `${result.exact.length} projects use`}{' '}
                    {names}: {result.exact.map((p) => p.title).join(', ')}.
                  </p>
                )}

                {selected.length > 0 && result.exact.length === 0 && result.closest && (
                  <p className="case-text">
                    No project uses all of {names} together. Closest: {result.closest.project.title}
                    , which uses {result.closest.count} of them.
                  </p>
                )}

                {selected.length > 0 && result.exact.length === 0 && !result.closest && (
                  <p className="case-text">
                    None of the projects use {names}. Try a different mix.
                  </p>
                )}
              </div>

              {photos.map((p, i) => (
                <figure
                  className="print"
                  key={p.id}
                  ref={(el) => {
                    if (el) photoRefs.current.set(p.id, el)
                    else photoRefs.current.delete(p.id)
                  }}
                  style={{ '--tilt': `${i % 2 ? 2.2 : -1.6}deg` } as CSSProperties}
                >
                  <span className="tack" aria-hidden="true" />
                  <img src={p.image} alt="" loading="lazy" />
                  <figcaption>
                    <a href={`#project-${p.id}`}>{p.title}</a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
