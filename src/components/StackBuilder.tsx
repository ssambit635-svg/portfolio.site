import { useMemo, useState } from 'react'
import { allTools, matchStack } from '../lib/stack'
import '../features.css'

/**
 * Stack builder: each technology is a peg on a board. Hang the ones you care about
 * and the projects that use all of them are listed. If none use them all, the
 * closest project is named instead. Keyboard and screen readers get the same toggles.
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
        <p>Pick the pegs · see what they hold</p>
        <h2 id="stack-heading">Stack builder</h2>
      </div>

      <div className="stack-grid">
        <div className="stack-board" role="group" aria-label="Technologies">
          <ul className="stack-pegs">
            {tools.map(tool => {
              const on = selected.includes(tool)
              return (
                <li key={tool}>
                  <button
                    type="button"
                    className={`peg${on ? ' peg-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggle(tool)}
                  >
                    <span className="peg-hook" aria-hidden="true" />
                    <span className="peg-name">{tool}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="stack-result" aria-live="polite">
          <div className="stack-result-head">
            <p>{selected.length === 0 ? 'Nothing hung yet' : `${selected.length} on the board`}</p>
            {selected.length > 0 && (
              <button type="button" className="stack-clear" onClick={() => setSelected([])}>
                Clear
              </button>
            )}
          </div>

          {selected.length === 0 && (
            <p className="stack-msg">Choose a few technologies. The projects that use them all appear here.</p>
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
