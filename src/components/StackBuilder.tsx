import { useMemo, useState, type CSSProperties } from 'react'
import { allTools, matchStack } from '../lib/stack'
import { projects } from '../lib/site'
import boardSteel from '../assets/stack-board.jpg'
import '../features.css'

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/**
 * Stack builder as a case board. Every technology is an evidence card pinned to the
 * steel board. Hover or focus a card to see which projects it is evidence for, pin
 * a few cards to narrow the case, and the case note and the matching project photos
 * are pinned to the same board.
 */
export default function StackBuilder() {
  const tools = useMemo(() => allTools(), [])
  const [selected, setSelected] = useState<string[]>([])
  const result = useMemo(() => matchStack(selected), [selected])

  // Which projects each technology is evidence for, computed once.
  const usedIn = useMemo(
    () => new Map(tools.map(tool => [tool, projects.filter(p => p.stack.some(t => same(t, tool)))])),
    [tools]
  )

  const toggle = (tool: string) =>
    setSelected(current => (current.includes(tool) ? current.filter(t => t !== tool) : [...current, tool]))

  const names = selected.join(', ')
  const photos = (result.exact.length ? result.exact : result.closest ? [result.closest.project] : []).slice(0, 3)

  return (
    <section id="stack" className="section stack" aria-labelledby="stack-heading">
      <div className="section-head">
        <p>Pin the evidence · see what the case says</p>
        <h2 id="stack-heading">Stack builder</h2>
      </div>

      <div className="stack-board" style={{ '--board': `url(${boardSteel})` } as CSSProperties}>
        <div className="case-label">
          <strong>Case file: stack</strong>
          <span>Hover a card to see its evidence. Pin the tools in question.</span>
        </div>

        <ul className="stack-cards">
          {tools.map((tool, i) => {
            const on = selected.includes(tool)
            const projectsUsing = usedIn.get(tool) ?? []
            // A fixed, varied tilt per card, so the board looks hand-pinned and stays the same on every visit.
            const tilt = ((i * 37) % 7 - 3) * 0.45
            return (
              <li key={tool}>
                <button
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
                  {projectsUsing.length > 0
                    ? <>Evidence for: {projectsUsing.map(p => p.title).join(', ')}</>
                    : <>No project uses {tool} yet.</>}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="evidence">
          <div className="case-note" aria-live="polite">
            <span className="case-pin" aria-hidden="true" />
            <div className="case-note-head">
              <p>{selected.length === 0 ? 'Nothing pinned yet' : `${selected.length} pinned`}</p>
              {selected.length > 0 && (
                <button type="button" className="stack-clear" onClick={() => setSelected([])}>
                  Clear
                </button>
              )}
            </div>

            {selected.length === 0 && (
              <p className="case-text">Pin a few technologies. The projects that use them all appear here.</p>
            )}

            {selected.length > 0 && result.exact.length > 0 && (
              <p className="case-text">
                {result.exact.length === 1 ? '1 project uses' : `${result.exact.length} projects use`} {names}:{' '}
                {result.exact.map(p => p.title).join(', ')}.
              </p>
            )}

            {selected.length > 0 && result.exact.length === 0 && result.closest && (
              <p className="case-text">
                No project uses all of {names} together. Closest: {result.closest.project.title}, which uses{' '}
                {result.closest.count} of them.
              </p>
            )}

            {selected.length > 0 && result.exact.length === 0 && !result.closest && (
              <p className="case-text">None of the projects use {names}. Try a different mix.</p>
            )}
          </div>

          {photos.map((p, i) => (
            <figure className="polaroid" key={p.id} style={{ '--tilt': `${i % 2 ? 2.2 : -1.6}deg` } as CSSProperties}>
              <span className="pin-head" aria-hidden="true" />
              <img src={p.image} alt="" loading="lazy" />
              <figcaption>
                <a href={`#project-${p.id}`}>{p.title}</a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
