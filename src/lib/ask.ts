/**
 * Ask Emo: answers questions about the portfolio from the portfolio's own data.
 *
 * There is no model and no server. Every question is tokenised, every fact on
 * the site (projects, experience, certifications, achievements, the about text,
 * contact details) is indexed once, and the best matching facts are stitched into
 * an answer. Anything it cannot match says so and offers questions it can answer.
 */
import { about, achievements, credentials, experience, profile, projects } from './site'
import { allTools, matchStack } from './stack'

export type AskLink = { label: string; href: string }
export type Answer = { text: string; links: AskLink[]; matched: boolean }

type Fact = {
  id: string
  kind: 'project' | 'experience' | 'credential' | 'achievement' | 'about' | 'contact'
  /** The sentence the answer is built from. */
  say: string
  /** Words the question has to hit to reach this fact. */
  keys: string[]
  links: AskLink[]
  /** Extra weight for a question that names this fact directly (e.g. a project title). */
  name?: string
}

const STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'do', 'does', 'did', 'you', 'your', 'he', 'his',
  'she', 'her', 'it', 'its', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'with', 'by', 'what',
  'which', 'whom', 'whose', 'how', 'where', 'when', 'why', 'can', 'could', 'would', 'should',
  'tell', 'me', 'about', 'i', 'my', 'we', 'our', 'that', 'this', 'there', 'have', 'has', 'any', 'some',
  'please', 'hi', 'hello', 'emo', 'sambit', 'swain', 'does', 'so', 'if', 'like', 'just', 'know'
])

/** Normalise a word to a stem good enough for matching: lowercase, plural and -ing trimmed. */
export function stem(word: string): string {
  let w = word.toLowerCase().replace(/[^a-z0-9+#.]/g, '')
  if (w.length > 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}y`
  else if (w.length > 4 && w.endsWith('ing')) w = w.slice(0, -3)
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1)
  return w
}

export function tokens(text: string): string[] {
  return text
    .split(/[\s,?!;:()"'“”‘’/]+/)
    .map(stem)
    .filter(t => t.length > 1 && !STOP.has(t))
}

const sentence = (text: string) => {
  const trimmed = text.trim()
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function buildFacts(): Fact[] {
  const facts: Fact[] = []

  for (const p of projects) {
    const links: AskLink[] = [{ label: p.action, href: p.href }]
    if (p.repo) links.push({ label: 'Source', href: p.repo })
    facts.push({
      id: `project-${p.id}`,
      kind: 'project',
      name: p.title,
      say: `${p.title} is a ${p.kind.toLowerCase()} project from ${p.year}. ${p.description}`,
      keys: [...tokens(p.kind), ...p.stack.flatMap(tokens), ...tokens(p.description), 'project', 'built', 'build', 'made', 'app'],
      links
    })
  }

  for (const e of experience) {
    facts.push({
      id: `experience-${e.id}`,
      kind: 'experience',
      say: `${e.role} at ${e.org}. ${e.detail}`,
      keys: [...tokens(e.org), ...tokens(e.role), ...tokens(e.detail), 'education', 'study', 'university', 'college', 'course'],
      links: e.href ? [{ label: e.action ?? 'View', href: e.href }] : []
    })
  }

  for (const c of credentials) {
    const detailText = c.detail.replace(/\.$/, '')
    facts.push({
      id: `credential-${c.id}`,
      kind: 'credential',
      name: c.title,
      say: `${c.title}, issued by ${c.issuer}. ${detailText}.`,
      keys: [...tokens(c.issuer), ...tokens(c.title), ...tokens(c.detail), 'certificate', 'certified', 'certification', 'credential', 'course'],
      links: c.href ? [{ label: c.action ?? 'View', href: c.href }] : []
    })
  }

  for (const a of achievements) {
    facts.push({
      id: `achievement-${a.id}`,
      kind: 'achievement',
      name: a.title,
      say: `${a.title}: ${a.detail}`,
      keys: [...tokens(a.title), ...tokens(a.detail), 'achievement', 'hackathon', 'win', 'won', 'award', 'competition'],
      links: []
    })
  }

  facts.push({
    id: 'about',
    kind: 'about',
    say: `${about.p1} ${about.p2}`,
    keys: ['who', 'background', 'student', 'developer', 'story', 'yourself', 'intro', 'introduce', 'bio', 'nist', 'berhampur', 'india', 'college'],
    links: []
  })

  facts.push({
    id: 'contact',
    kind: 'contact',
    say: `You can reach Sambit at ${profile.email}, or find him on GitHub and LinkedIn.`,
    keys: ['contact', 'email', 'reach', 'hire', 'mail', 'linkedin', 'github', 'phone', 'message', 'connect', 'available', 'work', 'job', 'internship', 'resume', 'cv'],
    links: [
      { label: 'Email', href: `mailto:${profile.email}` },
      { label: 'GitHub', href: profile.github },
      { label: 'LinkedIn', href: profile.linkedin }
    ]
  })

  return facts
}

let index: { fact: Fact; keys: Set<string>; nameTokens: string[] }[] | null = null
function getIndex() {
  if (!index) {
    index = buildFacts().map(fact => ({
      fact,
      keys: new Set(fact.keys.map(stem)),
      nameTokens: fact.name ? tokens(fact.name) : []
    }))
  }
  return index
}

/**
 * A question that names a technology ("which projects use Python?", "do you know
 * Docker?") is answered with the projects that use it, not with the closest prose.
 * Several technologies in one question ask for projects that use all of them.
 */
/** Short names people type for a technology whose listed name is longer. */
const ALIASES: Record<string, string[]> = { 'node.js': ['node', 'nodejs'] }

const hasWord = (text: string, word: string) =>
  new RegExp(`(^|[^a-z0-9+#.])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9+#.])`).test(text)

function answerTechnology(question: string): Answer | null {
  const text = question.toLowerCase()
  const named = allTools().filter(tool => {
    const name = tool.toLowerCase()
    return hasWord(text, name) || (ALIASES[name] ?? []).some(alias => hasWord(text, alias))
  })
  if (named.length === 0) return null

  const result = matchStack(named)
  const label = named.join(' and ')
  const certs = credentials.filter(c =>
    named.some(tool => `${c.title} ${c.detail}`.toLowerCase().includes(tool.toLowerCase().replace(/\.js$/i, '')))
  )

  const parts: string[] = []
  const links: AskLink[] = []
  if (result.exact.length > 0) {
    const names = result.exact.map(p => p.title)
    parts.push(`Projects built with ${label}: ${listNames(names)}.`)
    for (const p of result.exact.slice(0, 3)) links.push({ label: p.title, href: p.href })
  } else if (result.closest) {
    parts.push(
      `No project uses all of ${label} together. The closest is ${result.closest.project.title}, ` +
        `which uses ${result.closest.count} of them.`
    )
    links.push({ label: result.closest.project.title, href: result.closest.project.href })
  }
  if (certs.length > 0) {
    parts.push(`Certificate: ${listNames(certs.map(c => c.title))}.`)
    for (const c of certs.slice(0, 1)) if (c.href) links.push({ label: c.action ?? 'Course', href: c.href })
  }
  if (parts.length === 0) return null
  return { text: parts.join(' '), links, matched: true }
}

const listNames = (names: string[]) =>
  names.length <= 2 ? names.join(' and ') : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`

/** The questions offered when Emo cannot answer, and as quick starts. */
export const suggestions = [
  'What did you build with AWS?',
  'Which projects use Python?',
  'What certificates do you have?',
  'Tell me about your hackathon wins',
  'How can I contact you?'
]

const FALLBACK = 'I don’t have that in my notes. Try one of these:'

/**
 * The answer to a question. Scores each fact by how many of the question's words it
 * hits, adds a large bonus when the question names the fact (a project or certificate
 * title), and answers with the best two facts that scored at all.
 */
export function answer(question: string): Answer {
  const asked = [...new Set(tokens(question))]
  if (asked.length === 0) return { text: FALLBACK, links: [], matched: false }

  const technology = answerTechnology(question)
  if (technology) return technology

  const scored = getIndex()
    .map(entry => {
      let score = 0
      for (const t of asked) {
        if (entry.keys.has(t)) score += 2
        else if (t.length >= 4 && [...entry.keys].some(k => k.length >= 4 && (k.startsWith(t) || t.startsWith(k)))) score += 1
      }
      if (entry.nameTokens.length && entry.nameTokens.every(t => asked.includes(t))) score += 6
      return { entry, score }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0 || scored[0].score < 2) {
    return { text: FALLBACK, links: [], matched: false }
  }

  // Two facts at most, and the second only when it is nearly as relevant.
  const top = scored[0]
  const picks = [top, ...scored.slice(1, 3).filter(s => s.score >= Math.max(2, top.score - 1))].slice(0, 2)
  const text = picks.map(p => sentence(p.entry.fact.say)).join(' ')
  const seen = new Set<string>()
  const links = picks
    .flatMap(p => p.entry.fact.links)
    .filter(l => (seen.has(l.href) ? false : (seen.add(l.href), true)))
    .slice(0, 4)
  return { text, links, matched: true }
}
