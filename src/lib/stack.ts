/**
 * Technology matching: which projects use a given set of technologies. Used by Ask Emo and the CV.
 * Pure functions over the project data, so the rules are tested and not just drawn.
 */
import { projects, type Project } from './site'

/** Every technology used across the projects, alphabetised, each listed once. */
export function allTools(): string[] {
  const seen = new Map<string, string>()
  for (const p of projects) {
    for (const tool of p.stack) {
      const key = tool.toLowerCase()
      if (!seen.has(key)) seen.set(key, tool)
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}

export type StackResult = {
  /** Projects that use every selected tool. */
  exact: Project[]
  /** When nothing matches all of them: the project that uses the most, and how many. */
  closest: { project: Project; count: number } | null
}

const has = (project: Project, tool: string) =>
  project.stack.some(t => t.toLowerCase() === tool.toLowerCase())

export function matchStack(selected: string[]): StackResult {
  if (selected.length === 0) return { exact: [], closest: null }
  const exact = projects.filter(p => selected.every(tool => has(p, tool)))
  if (exact.length > 0) return { exact, closest: null }

  let best: { project: Project; count: number } | null = null
  for (const project of projects) {
    const count = selected.filter(tool => has(project, tool)).length
    if (count > 0 && (!best || count > best.count)) best = { project, count }
  }
  return { exact: [], closest: best }
}
