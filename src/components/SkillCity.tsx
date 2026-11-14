import { useEffect, useRef, useState } from 'react'
import {
  certificateFor,
  cityStats,
  districtById,
  districts,
  levelLabel,
  projectsFor,
  skillById,
  skillsInDistrict,
  type DistrictId,
  type Skill
} from '../lib/skillCity'
import { prefersReducedMotion } from '../lib/utils'
import type { SkillCityController } from './skillCityScene'
import '../city.css'

type Selection =
  | { kind: 'skill'; id: string }
  | { kind: 'district'; id: DistrictId }
  | null

type Hover = { id: string; x: number; y: number } | null

/** Only real controls deserve focus back when a dossier closes. */
function isFocusTarget(element: Element | null): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element !== document.body &&
    element.matches('button, a[href], summary, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  )
}

/** Pressing the button asks Ask Emo the same question the old skill buttons did. */
function askEmo(name: string) {
  window.dispatchEvent(new CustomEvent('ask-emo', { detail: `Which projects use ${name}?` }))
  document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** A drawn arrow: the mono font has no ↗, and tofu in a dossier is unforgivable. */
function ArrowUpRight() {
  return (
    <svg className="city-arrow" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
      <path
        d="M2.5 7.5 7.5 2.5M3.4 2.5h4.1v4.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
    </svg>
  )
}

/** Five hard blocks. A learning tower gets a striped last block, not a glow. */
function LevelBlocks({ skill }: { skill: Skill }) {
  return (
    <span className="city-level-blocks" aria-hidden="true">
      {[1, 2, 3, 4, 5].map(n => (
        <i
          key={n}
          data-on={n <= skill.level ? 'true' : 'false'}
          data-learning={skill.learning && n === skill.level ? 'true' : undefined}
        />
      ))}
    </span>
  )
}

function SkillDossier({ skill }: { skill: Skill }) {
  const used = projectsFor(skill)
  const certificate = certificateFor(skill)
  return (
    <div className="city-panel-inner">
      <header className="city-panel-head">
        <span className="city-panel-code">
          {skill.code} / {skill.districtName}
        </span>
      </header>
      <h3 className="city-panel-title" id="city-panel-title">
        {skill.name}
      </h3>
      <div className="city-level">
        <span>{levelLabel(skill)}</span>
        <LevelBlocks skill={skill} />
      </div>
      <p className="city-panel-note">{skill.note}</p>
      {skill.learning ? (
        <p className="city-panel-flag">Under construction — this one is being learned in public.</p>
      ) : null}
      <div className="city-panel-section">
        <h4>Shipped with</h4>
        {used.length > 0 ? (
          <ul className="city-panel-projects">
            {used.map(project => (
              <li className="city-project" key={project.id}>
                <a
                  className="city-project-main"
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="city-project-title">
                    {project.title} <ArrowUpRight />
                  </span>
                  <span className="city-project-kind">
                    {project.kind} · {project.year}
                  </span>
                </a>
                {project.repo ? (
                  <a
                    className="city-project-repo"
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.title} source on GitHub`}
                  >
                    GH
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="city-panel-empty">
            {skill.district === 'infrastructure' ||
            skill.district === 'devops' ||
            skill.district === 'cloud'
              ? 'Infrastructure rather than a feature: it sits under the work instead of inside one.'
              : 'No public build uses this yet — it lives in coursework and exercises.'}
          </p>
        )}
      </div>
      {certificate ? (
        <a
          className="city-panel-cert"
          href={certificate.href ?? '#'}
          target="_blank"
          rel="noreferrer"
        >
          Certificate · {certificate.title} <ArrowUpRight />
        </a>
      ) : null}
      <button type="button" className="city-panel-ask" onClick={() => askEmo(skill.name)}>
        Ask Emo about {skill.name} <ArrowUpRight />
      </button>
    </div>
  )
}

function DistrictDossier({
  id,
  onPick
}: {
  id: DistrictId
  onPick: (skill: Skill) => void
}) {
  const district = districtById.get(id)
  if (!district) return null
  const list = skillsInDistrict(id)
  return (
    <div className="city-panel-inner">
      <header className="city-panel-head">
        <span className="city-panel-code">
          District {district.code} / {String(cityStats.districts).padStart(2, '0')}
        </span>
      </header>
      <h3 className="city-panel-title" id="city-panel-title">
        {district.name}
      </h3>
      <p className="city-panel-note city-panel-blurb">{district.blurb}</p>
      <div className="city-panel-section">
        <h4>
          {list.length} towers — tallest first
        </h4>
        <ul className="city-panel-towers">
          {list.map(skill => (
            <li key={skill.id}>
              <button type="button" onClick={() => onPick(skill)}>
                <span>{skill.name}</span>
                <em>{levelLabel(skill)}</em>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="city-panel-empty">Pick a tower to open its dossier, or drag the city around it.</p>
    </div>
  )
}

export default function SkillCity() {
  const hostRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const controllerRef = useRef<SkillCityController | null>(null)
  const [selection, setSelection] = useState<Selection>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const [hover, setHover] = useState<Hover>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const selectionRef = useRef<Selection>(null)
  selectionRef.current = selection

  // The scene is only fetched and built when the screen approaches the viewport.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    if (typeof IntersectionObserver === 'undefined') {
      setFailed(true)
      return
    }

    let cancelled = false
    let controller: SkillCityController | null = null
    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        observer.disconnect()
        void import('./skillCityScene')
          .then(({ createSkillCity }) => {
            if (cancelled) return
            try {
              controller = createSkillCity(host, {
                reducedMotion: prefersReducedMotion(),
                onHover: (id, at) => setHover(id && at ? { id, x: at.x, y: at.y } : null),
                onSelect: id => setSelection(id ? { kind: 'skill', id } : null),
                onDistrict: id => {
                  if (id) setSelection({ kind: 'district', id })
                }
              })
              controllerRef.current = controller
              // A district or tower may have been picked from the index before
              // the scene finished loading. Put the camera where it should be.
              const current = selectionRef.current
              if (current?.kind === 'skill') controller.focusSkill(current.id)
              else if (current?.kind === 'district') controller.focusDistrict(current.id)
              setReady(true)
            } catch {
              setFailed(true)
            }
          })
          .catch(() => {
            if (!cancelled) setFailed(true)
          })
      },
      { rootMargin: '360px' }
    )
    observer.observe(host)

    return () => {
      cancelled = true
      observer.disconnect()
      controller?.dispose()
      controllerRef.current = null
    }
  }, [])

  // Selection drives the camera; it can be set before the scene is ready.
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller || !ready) return
    if (!selection) controller.clearFocus()
    else if (selection.kind === 'skill') controller.focusSkill(selection.id)
    else controller.focusDistrict(selection.id)
  }, [selection, ready])

  // Escape closes the dossier, and opening one moves focus into it.
  useEffect(() => {
    if (!selection) {
      // Closing should put the keyboard back where the visitor left it.
      const previous = lastFocus.current
      if (previous && document.contains(previous) && isFocusTarget(previous)) {
        previous.focus({ preventScroll: true })
      }
      lastFocus.current = null
      return
    }
    // Remember the control that opened the dossier, but not the panel itself.
    const active = document.activeElement
    if (isFocusTarget(active) && !panelRef.current?.contains(active)) {
      lastFocus.current = active
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelection(null)
    }
    window.addEventListener('keydown', onKey)
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('.city-panel-close')?.focus({
        preventScroll: true
      })
    })
    return () => {
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(frame)
    }
  }, [selection])

  const selectedSkill = selection?.kind === 'skill' ? skillById.get(selection.id) ?? null : null
  const selectedDistrict =
    selection?.kind === 'district' ? districtById.get(selection.id) ?? null : null
  const hovered = hover ? skillById.get(hover.id) ?? null : null
  const open = Boolean(selectedSkill || selectedDistrict)
  // A selected tower also lights its district chip, so the HUD keeps the context.
  const activeDistrict =
    selectedSkill?.district ?? (selectedDistrict ? selectedDistrict.id : null)

  /** The index sits under the monitor; keep the dossier where the visitor can see it. */
  const revealScreen = () => {
    const screen = hostRef.current?.closest<HTMLElement>('.city-screen')
    if (!screen) return
    const rect = screen.getBoundingClientRect()
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) return
    screen.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'center'
    })
  }

  const pickDistrict = (id: DistrictId) => {
    setSelection(current =>
      current?.kind === 'district' && current.id === id ? null : { kind: 'district', id }
    )
  }

  return (
    <section id="skills" className="section skill-city" aria-labelledby="skills-heading">
      <div className="section-head">
        <p>{cityStats.districts} districts · one plate · open a tower</p>
        <h2 id="skills-heading">Skills</h2>
      </div>

      <figure className="city-figure">
        <div className="city-monitor">
          <div className="city-case">
            <div className="city-case-top" aria-hidden="true">
              <span className="city-brand">
                <i />
                SWAIN <b>/</b> SYSTEMS
              </span>
              <span className="city-case-model">SC-29 · SKILL CITY · 2026</span>
            </div>

            <div className="city-screen-frame">
              <div className="city-screen">
                <div ref={hostRef} className="city-canvas" aria-hidden="true" />

                {!ready && !failed ? (
                  <div className="city-boot" aria-hidden="true">
                    <span className="city-boot-label">Plotting the city</span>
                    <span className="city-boot-bar">
                      <i />
                    </span>
                    <span className="city-boot-meta">
                      {cityStats.towers} towers · {cityStats.districts} districts
                    </span>
                  </div>
                ) : null}
                {failed ? (
                  <p className="city-boot city-boot-failed">
                    This screen needs WebGL. The tower index below has every building.
                  </p>
                ) : null}

                <div className="city-hud">
                  <div className="city-hud-top">
                    <div className="city-hud-block">
                      <span className="city-hud-live">
                        <i />
                        Live model
                      </span>
                      <span className="city-hud-name">Skill City / SC-29</span>
                    </div>
                    <div className="city-hud-block city-hud-right">
                      <span>
                        {cityStats.towers} towers · {cityStats.districts} districts
                      </span>
                      <span className="city-hud-dim">Height = depth</span>
                    </div>
                  </div>

                  <div className="city-hud-bottom">
                    <div className="city-districts">
                      {districts.map(district => {
                        const active = activeDistrict === district.id
                        return (
                          <button
                            key={district.id}
                            type="button"
                            className="city-district"
                            aria-pressed={active}
                            onClick={() => pickDistrict(district.id)}
                          >
                            <b>{district.code}</b>
                            {district.name}
                          </button>
                        )
                      })}
                    </div>
                    <div className="city-hud-bottom-right">
                      <span className="city-hint">Drag to orbit · scroll to zoom</span>
                      <div className="city-controls">
                        <button
                          type="button"
                          className="city-control"
                          aria-label="Zoom out of the city"
                          onClick={() => controllerRef.current?.zoomBy(0.8)}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="city-control"
                          aria-label="Zoom into the city"
                          onClick={() => controllerRef.current?.zoomBy(1.25)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="city-control city-control-reset"
                          onClick={() => setSelection(null)}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {hovered && !open ? (
                  <div
                    className="city-tag"
                    style={{ left: `${hover!.x * 100}%`, top: `${hover!.y * 100}%` }}
                    aria-hidden="true"
                  >
                    {hovered.name}
                    <em>{levelLabel(hovered)}</em>
                  </div>
                ) : null}

                <aside
                  ref={panelRef}
                  className="city-panel"
                  data-open={open ? 'true' : 'false'}
                  data-lenis-prevent=""
                  aria-labelledby={open ? 'city-panel-title' : undefined}
                  aria-hidden={open ? undefined : 'true'}
                >
                  {open ? (
                    <>
                      <button
                        type="button"
                        className="city-panel-close"
                        aria-label="Close the dossier"
                        onClick={() => setSelection(null)}
                      >
                        ×
                      </button>
                      {selectedSkill ? <SkillDossier skill={selectedSkill} /> : null}
                      {selectedDistrict ? (
                        <DistrictDossier
                          id={selectedDistrict.id}
                          onPick={skill => setSelection({ kind: 'skill', id: skill.id })}
                        />
                      ) : null}
                      <div className="city-panel-foot" aria-hidden="true">
                        <span>SC-29 · City OS</span>
                        <span className="city-panel-foot-esc">Esc to close</span>
                        <span className="city-panel-foot-tap">Tap × to close</span>
                      </div>
                    </>
                  ) : null}
                </aside>

                <noscript>
                  {/* Without JS the model and its controls are dead weight; the index below works. */}
                  <style>{'.city-boot,.city-hud{display:none}'}</style>
                  <p className="city-boot city-boot-failed">
                    The city needs JavaScript. The tower index below lists every building.
                  </p>
                </noscript>

                <div className="city-glass" aria-hidden="true" />
                <div className="city-scanlines" aria-hidden="true" />
              </div>
            </div>

            <div className="city-case-bottom" aria-hidden="true">
              <span className="city-chin-left">
                <i className="city-led" />
                Power
              </span>
              <span>City OS 4.0 · {cityStats.towers} towers</span>
              <span className="city-chin-grille">
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
            </div>
          </div>
          <div className="city-stand" aria-hidden="true">
            <span className="city-stand-neck" />
            <span className="city-stand-foot" />
          </div>
        </div>

        <figcaption className="city-caption">
          <span className="city-caption-index" aria-hidden="true">
            SS / CITY PLAN 01
          </span>
          <p>
            Every tower is a technology, and its height is how deep the work goes. The cranes are
            technologies still being built — <b>{cityStats.learning} of {cityStats.towers}</b> are
            under construction, on purpose. Drag the city, scroll to zoom, and open any tower for
            the projects behind it.
          </p>
        </figcaption>
      </figure>

      <details className="city-index">
        <summary>
          <span>Tower index</span>
          <span>
            {cityStats.towers} buildings · {cityStats.districts} districts
            <i aria-hidden="true">+</i>
          </span>
        </summary>
        <div className="city-index-body">
          {districts.map(district => (
            <section className="city-index-group" key={district.id}>
              <h3>
                <span>{district.code}</span>
                {district.label ?? district.name}
              </h3>
              <ul>
                {skillsInDistrict(district.id).map(skill => (
                  <li key={skill.id}>
                    <button
                      type="button"
                      aria-current={
                        selection?.kind === 'skill' && selection.id === skill.id
                          ? 'true'
                          : undefined
                      }
                      onClick={() => {
                        setSelection({ kind: 'skill', id: skill.id })
                        revealScreen()
                      }}
                    >
                      {skill.name}
                      <span className="city-index-level">{levelLabel(skill)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>
    </section>
  )
}
