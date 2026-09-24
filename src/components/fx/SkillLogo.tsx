import { useState } from 'react'
import type { Skill } from '../../lib/skills'
import { readableOnDark } from '../../lib/utils'

/** Real favicon endpoints, tried in order, for tools with no official icon set entry. */
const faviconSources = (domain: string) => [
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  `https://icons.duckduckgo.com/ip3/${domain}.ico`
]

type Props = {
  skill: Skill
  className?: string
  /** force the official brand colour (otherwise ink → brand on hover) */
  branded?: boolean
}

/**
 * Renders a skill's real brand mark:
 * 1. official Simple Icons vector (inline, recolourable)
 * 2. the project's real favicon, fetched from its own domain
 * 3. typographic wordmark (only when no official mark exists at all)
 */
export default function SkillLogo({ skill, className, branded = false }: Props) {
  const [i, setI] = useState(0)
  const srcs = skill.domain ? faviconSources(skill.domain) : []
  const style = branded ? { color: readableOnDark(skill.hex) } : undefined

  if (skill.paths?.length) {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={skill.label}
        className={className}
        style={style}
        fill="currentColor"
      >
        {skill.paths.map((d, n) => (
          <path key={n} d={d} />
        ))}
      </svg>
    )
  }

  if (srcs.length && i < srcs.length) {
    return (
      <img
        src={srcs[i]}
        alt={skill.label}
        loading="lazy"
        decoding="async"
        className={className}
        onError={() => setI((n) => n + 1)}
      />
    )
  }

  return (
    <span aria-label={skill.label} className={className} style={style}>
      {skill.label}
    </span>
  )
}
