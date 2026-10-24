import { useMemo, useState, type CSSProperties } from 'react'
import { allTools, matchStack } from '../lib/stack'
import boardSteel from '../assets/stack-board.jpg'
import '../features.css'

/**
 * Stack builder: each technology is an index card pinned to a steel board. Pin
 * the ones you care about (a red pin means pinned) and the projects that use all
 * of them are listed. If none use them all, the closest project is named instead.
 * Keyboard and screen readers get the same toggles.
 */
export default function StackBuilder() {
  const tools = useMemo(() => allTools(), [])
  const [selected, setSelected] = useState<string[]>([])
  const result = useMemo(() => matchStack(selected), [selected])

  const toggle = (tool: string) =>
    setSelected(current => (current.includes(tool) ? current.filter(t => t !== tool) : [...current, tool]))

  const names = selected.join(', ')

  return (
    <section id="stack" className="section stack" aria-labelledby="stack-heading">
      <div className="section-head">
        <p>Pin the cards · see what they hold</p>
        <h2 id="stack-heading">Stack builder</h2>
      </div>

      <div className="stack-grid">
        <div className="stack-board" role="group" aria-label="Technologies" style={{ '--board': `url(${boardSteel})` } as CSSProperties}>
          <ul className="stack-cards">
            {tools.map((tool, i) => {
              const on = selected.includes(tool)
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
                    <span className="pin-text">{tool}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="stack-result" aria-live="polite">
          <div className="stack-result-head">
            <p>{selected.length === 0 ? 'Nothing pinned yet' : `${selected.length} pinned`}</p>
            {selected.length > 0 && (
              <button type="button" className="stack-clear" onClick={() => setSelected([])}>
                Clear
              </button>
            )}
          </div>

          {selected.length === 0 && (
            <p className="stack-msg">Pin a few technologies. The projects that use them all appear here.</p>
          )}

          {selected.length > 0 && result.exact.length > 0 && (
            <>
              <p className="stack-msg">
                {result.exact.length === 1 ? '1 project uses' : `${result.exact.length} projects use`} {names}:
              </p>
              <ul className="stack-hits">
                {result.exact.map(p => (
                  <li key={p.id}>
                    <a href={`#project-${p.id}`}>{p.title}</a>
                    <span>{p.kind} · {p.year}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {selected.length > 0 && result.exact.length === 0 && result.closest && (
            <p className="stack-msg">
              No project uses all of {names} together. The closest is{' '}
              <a href={`#project-${result.closest.project.id}`}>{result.closest.project.title}</a>, which uses{' '}
              {result.closest.count} of them.
            </p>
          )}

          {selected.length > 0 && result.exact.length === 0 && !result.closest && (
            <p className="stack-msg">None of the projects use {names}. Try a different mix.</p>
          )}
        </div>
      </div>
    </section>
  )
}
