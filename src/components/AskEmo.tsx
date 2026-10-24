import { useState, type FormEvent } from 'react'
import { answer, suggestions, type Answer } from '../lib/ask'
import '../features.css'

/**
 * Ask Emo: a text panel that answers questions about the work from the site's own
 * data. It runs entirely in the browser; no question leaves the page.
 */
export default function AskEmo() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<{ asked: string; answer: Answer } | null>(null)

  const ask = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setQuestion(trimmed)
    setResult({ asked: trimmed, answer: answer(trimmed) })
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    ask(question)
  }

  return (
    <section id="ask" className="section ask" aria-labelledby="ask-heading">
      <div className="section-head">
        <p>Ask about the work · answered offline</p>
        <h2 id="ask-heading">Ask Emo</h2>
      </div>

      <div className="ask-grid">
        <div className="ask-panel">
          <form className="ask-form" role="search" onSubmit={submit}>
            <label htmlFor="ask-input" className="ask-label">
              Ask a question about projects, skills, certificates or contact
            </label>
            <div className="ask-field">
              <input
                id="ask-input"
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="e.g. Which projects use Docker?"
                autoComplete="off"
                maxLength={160}
              />
              <button type="submit" className="ask-submit">Ask</button>
            </div>
          </form>

          <ul className="ask-suggestions" aria-label="Example questions">
            {suggestions.map(s => (
              <li key={s}>
                <button type="button" onClick={() => ask(s)}>{s}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="ask-answer" role="status" aria-live="polite" aria-atomic="true">
          {result ? (
            <>
              <p className="ask-asked">You asked: “{result.asked}”</p>
              <p className="ask-text">{result.answer.text}</p>
              {result.answer.links.length > 0 && (
                <ul className="ask-links">
                  {result.answer.links.map(link => (
                    <li key={`${link.label}-${link.href}`}>
                      <a href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="ask-text ask-idle">
              Emo answers from the notes on this site: the projects, the stack, certificates, hackathons and
              contact details. Nothing is sent anywhere.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
