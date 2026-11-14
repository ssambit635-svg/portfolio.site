/**
 * Skill City: the skills section as a miniature city.
 *
 * A technology is a building. How deep the experience is sets how tall it is.
 * A technology still being learned is a building under construction. The city
 * is split into six districts, laid out on a plate that the 3D scene draws.
 *
 * Everything here is data and pure layout maths: no three.js, no React. The
 * scene builds its geometry from these numbers and the panel reads the same
 * skills, so a tower's height and the level bars in its dossier can never
 * disagree.
 */
import { credentials, projects, type Credential, type Project } from './site'

export type DistrictId =
  | 'programming'
  | 'web'
  | 'data'
  | 'devops'
  | 'cloud'
  | 'infrastructure'

export type Level = 1 | 2 | 3 | 4 | 5

export type District = {
  id: DistrictId
  /** Printed on the HUD and the district plate: 01–06. */
  code: string
  name: string
  /** The long name used on dossiers and the index; the HUD keeps the short one. */
  label?: string
  blurb: string
  /** Position in the 3 × 2 block grid. */
  plot: { col: 0 | 1 | 2; row: 0 | 1 }
}

export const districts: District[] = [
  {
    id: 'programming',
    code: '01',
    name: 'Programming',
    blurb: 'Languages, and the services they run. The west tower block.',
    plot: { col: 0, row: 0 }
  },
  {
    id: 'web',
    code: '02',
    name: 'Web',
    label: 'Web District',
    blurb: 'Everything a visitor touches. The busiest district on the plate.',
    plot: { col: 0, row: 1 }
  },
  {
    id: 'data',
    code: '03',
    name: 'Data',
    label: 'Data Center',
    blurb: 'Where the state lives: stores, schemas and the feeds behind them.',
    plot: { col: 1, row: 1 }
  },
  {
    id: 'devops',
    code: '04',
    name: 'DevOps',
    blurb: 'The road from a commit to a container that is running.',
    plot: { col: 2, row: 0 }
  },
  {
    id: 'cloud',
    code: '05',
    name: 'Cloud',
    label: 'Cloud City',
    blurb: 'Machines someone else runs, wired from this side of the screen.',
    plot: { col: 1, row: 0 }
  },
  {
    id: 'infrastructure',
    code: '06',
    name: 'Infrastructure',
    blurb: 'The base layer under every deployment: the box, the shell, the meter.',
    plot: { col: 2, row: 1 }
  }
]

export const districtById = new Map(districts.map(d => [d.id, d]))

type SkillInput = {
  name: string
  district: DistrictId
  level: Level
  /** One sentence for the dossier. Facts come from site.ts and the certificates. */
  note: string
  /** A tower that is still being built — the crane is the honest bit. */
  learning?: boolean
  /** Project-stack spellings that should count as this technology. */
  aliases?: string[]
  /** Projects to list even when no project stack names the technology. */
  alsoIn?: string[]
  /** Certificate that proves it, keyed by credentials[].id. */
  cert?: string
}

export type Skill = SkillInput & { id: string; districtName: string; code: string }

/** "C++" → "c", "GitHub Actions" → "github-actions". Stable, unique, URL-safe. */
export const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const inputs: SkillInput[] = [
  /* 01 — Programming */
  {
    name: 'Python',
    district: 'programming',
    level: 4,
    note: 'Cisco Python Essentials 1. Weather Sense, Password Manager, and most of the scripting behind the projects.',
    cert: 'python-essentials'
  },
  {
    name: 'C++',
    district: 'programming',
    level: 3,
    note: 'C++ Essentials 1 through Cisco NetAcad: objects, memory and the STL.',
    cert: 'cpp-essentials'
  },
  {
    name: 'C',
    district: 'programming',
    level: 3,
    note: 'Thirty hours of C through ExcelR. Pointers, arrays and data structures from first principles.',
    cert: 'c-programming'
  },
  {
    name: 'Express',
    district: 'programming',
    level: 3,
    note: 'The API layer under Kivo and Annadata Connect.',
    aliases: ['Node.js']
  },
  {
    name: 'FastAPI',
    district: 'programming',
    level: 3,
    note: 'Typed Python endpoints for the AWS Dashboard.'
  },
  {
    name: 'Streamlit',
    district: 'programming',
    level: 3,
    note: 'Weather Sense and Password Manager: a real interface without a front-end build.'
  },
  {
    name: 'Cryptography',
    district: 'programming',
    level: 2,
    note: 'Fernet encryption and a SHA-256 hashed master password in the local password manager.'
  },

  /* 02 — Web */
  {
    name: 'TypeScript',
    district: 'web',
    level: 5,
    note: 'Strict types across this site and every React build here. The default now.'
  },
  {
    name: 'React',
    district: 'web',
    level: 5,
    note: 'Nine shipped builds. ARCH, Shadow Quest, Annadata Connect and this page.'
  },
  {
    name: 'JavaScript',
    district: 'web',
    level: 4,
    note: 'The layer under React, and the whole of CivicReport.'
  },
  {
    name: 'HTML',
    district: 'web',
    level: 4,
    note: 'Semantic, crawlable markup: this page is pre-rendered HTML, not an empty shell.'
  },
  {
    name: 'CSS',
    district: 'web',
    level: 4,
    note: 'Hand-written layout: the hero monitor, the works drum, this city.'
  },
  {
    name: 'Tailwind',
    district: 'web',
    level: 4,
    note: 'The utility layer in ARCH and this portfolio.'
  },
  {
    name: 'Vite',
    district: 'web',
    level: 3,
    note: 'Dev server, build and asset pipeline for this site.'
  },
  {
    name: 'Capacitor',
    district: 'web',
    level: 2,
    note: 'Wraps Shadow Quest and Annadata Connect for Android.'
  },
  {
    name: 'Leaflet',
    district: 'web',
    level: 2,
    note: 'The issue map in CivicReport.'
  },

  /* 03 — Data */
  {
    name: 'PostgreSQL',
    district: 'data',
    level: 4,
    note: 'The incident store under ARCH, with Prisma managing the schema.'
  },
  {
    name: 'Prisma',
    district: 'data',
    level: 3,
    note: 'Typed models and migrations over PostgreSQL in ARCH.'
  },
  {
    name: 'MongoDB',
    district: 'data',
    level: 3,
    note: 'Shadow Quest’s sessions, goals and streaks.'
  },
  {
    name: 'SQLite',
    district: 'data',
    level: 3,
    note: 'Kivo’s health timeline, shipped as a single file.'
  },
  {
    name: 'Gemini AI',
    district: 'data',
    level: 2,
    note: 'Classifies photographed civic issues in CivicReport.'
  },
  {
    name: 'Open-Meteo API',
    district: 'data',
    level: 2,
    note: 'The forecast and air-quality feed behind Weather Sense.'
  },

  /* 04 — DevOps */
  {
    name: 'Git',
    district: 'devops',
    level: 4,
    note: 'Every line on this plate is versioned. Branches, merges, and a readable log.',
    alsoIn: ['arch', 'kivo', 'portfolio']
  },
  {
    name: 'GitHub',
    district: 'devops',
    level: 4,
    note: 'Source, issues, pull requests and Pages for everything here.',
    alsoIn: ['arch', 'shadow-quest', 'civicreport']
  },
  {
    name: 'Docker',
    district: 'devops',
    level: 4,
    note: 'Annadata Connect and the AWS Dashboard run containerised. Docker Basics, Simplilearn.',
    cert: 'docker-basics'
  },
  {
    name: 'GitHub Actions',
    district: 'devops',
    level: 3,
    note: 'The daily uptime check and the deploy that publishes this site.'
  },

  /* 05 — Cloud */
  {
    name: 'AWS',
    district: 'cloud',
    level: 3,
    note: 'AWS Foundations: compute, storage, networking and billing. EC2 and S3 in the dashboard.',
    aliases: ['LocalStack'],
    cert: 'aws-foundations'
  },
  {
    name: 'LocalStack',
    district: 'cloud',
    level: 3,
    note: 'A local AWS for the dashboard, so a demo never costs anything.'
  },
  {
    name: 'Terraform',
    district: 'cloud',
    level: 2,
    note: 'Infrastructure as code, written against LocalStack first. Still going up.',
    learning: true
  },
  {
    name: 'Kubernetes',
    district: 'cloud',
    level: 2,
    note: 'Pods, deployments and services — learned by running them, not by reading about them.',
    learning: true
  },
  {
    name: 'Nginx',
    district: 'cloud',
    level: 2,
    note: 'Reverse proxy and static serving for the things hosted on my own box.'
  },

  /* 06 — Infrastructure */
  {
    name: 'Linux',
    district: 'infrastructure',
    level: 4,
    note: 'Shell, filesystem and permissions — the base layer for everything deployed here.',
    cert: 'linux-unhatched'
  },
  {
    name: 'Prometheus',
    district: 'infrastructure',
    level: 2,
    note: 'Metrics scraped from the services running on my own machines.'
  },
  {
    name: 'Grafana',
    district: 'infrastructure',
    level: 2,
    note: 'The dashboards that read those metrics back.'
  },
  {
    name: 'Networking',
    district: 'infrastructure',
    level: 2,
    note: 'Ports, DNS, reverse proxies and why a container cannot see the host.',
    cert: 'cloud-computing'
  }
]

export const skills: Skill[] = inputs.map(input => ({
  ...input,
  id: slug(input.name),
  districtName: districtById.get(input.district)?.name ?? input.district,
  code: districtById.get(input.district)?.code ?? '00'
}))

export const skillById = new Map(skills.map(s => [s.id, s]))

export function skillsInDistrict(id: DistrictId): Skill[] {
  return skills
    .filter(skill => skill.district === id)
    .slice()
    .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name, 'en'))
}

export const LEVEL_LABELS = ['Starting', 'Learning', 'Working', 'Fluent', 'Core'] as const

export function levelLabel(skill: Pick<Skill, 'level' | 'learning'>): string {
  if (skill.learning) return 'Under construction'
  return LEVEL_LABELS[skill.level - 1]
}

/** The projects that actually use a technology, newest and featured first. */
export function projectsFor(skill: Skill): Project[] {
  const names = [skill.name, ...(skill.aliases ?? [])].map(n => n.toLowerCase())
  const found = projects.filter(p =>
    p.stack.some(tool => names.includes(tool.toLowerCase()))
  )
  for (const id of skill.alsoIn ?? []) {
    const project = projects.find(p => p.id === id)
    if (project && !found.includes(project)) found.push(project)
  }
  return found
    .slice()
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.year.localeCompare(a.year))
    .slice(0, 4)
}

export function certificateFor(skill: Skill): Credential | undefined {
  return skill.cert ? credentials.find(c => c.id === skill.cert) : undefined
}

export const cityStats = {
  towers: skills.length,
  districts: districts.length,
  learning: skills.filter(s => s.learning).length
}

/* ——— the plate —————————————————————————————————————————————————————————— */

/** A block is PLOT units square; ROAD units of dark road sit between blocks. */
export const PLOT = 10
export const ROAD = 3.6
export const PLOT_HEIGHT = 0.18
export const PLATE = { width: 44, depth: 30, thickness: 1.1, radius: 1.5 }

export const columnX = [0, 1, 2].map(col => (col - 1) * (PLOT + ROAD))
export const rowZ = [0, 1].map(row => (row - 0.5) * (PLOT + ROAD))

export function plotCenter(district: District): { x: number; z: number } {
  return { x: columnX[district.plot.col], z: rowZ[district.plot.row] }
}

export type Rect = { x: number; z: number; w: number; d: number }

export type CityShape =
  | 'tower'
  | 'setback'
  | 'block'
  | 'slab'
  | 'antenna'
  | 'construction'

export type CityBuilding = {
  id: string
  skill: Skill
  district: District
  /** Centre of the footprint on the plate, in world units. */
  x: number
  z: number
  w: number
  d: number
  /** Total height above the plot surface. */
  h: number
  shape: CityShape
}

export type CityFabric = {
  x: number
  z: number
  w: number
  d: number
  h: number
}

/** Deterministic hash → 0..1, so the skyline is identical on every render. */
function noise(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

const LEVEL_HEIGHT: Record<Level, number> = { 1: 2.0, 2: 3.0, 3: 4.2, 4: 6.0, 5: 8.2 }

/** Slots inside a block, centre first, so the tallest tower stands downtown. */
const SLOTS: [number, number][] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1]
]
const PITCH = 3.15

function shapeFor(skill: Skill, index: number): CityShape {
  if (skill.learning) return 'construction'
  if (skill.level >= 5) return 'setback'
  if (skill.district === 'data') return 'slab'
  if (skill.district === 'cloud') return 'antenna'
  if (skill.district === 'devops') return index % 2 === 0 ? 'tower' : 'block'
  if (skill.district === 'infrastructure') return 'block'
  if (skill.district === 'programming') return index % 3 === 0 ? 'setback' : 'tower'
  return index % 2 === 0 ? 'tower' : 'block'
}

function footprint(skill: Skill, shape: CityShape): { w: number; d: number } {
  if (shape === 'construction') return { w: 2.05, d: 2.05 }
  const base = 1.3 + skill.level * 0.15
  const w = base + (noise(`${skill.id}:w`) - 0.5) * 0.24
  const d = base + (noise(`${skill.id}:d`) - 0.5) * 0.24
  if (shape === 'slab') return { w: Math.max(2.5, w), d: Math.max(1.65, d * 0.74) }
  return { w, d }
}

export const cityBuildings: CityBuilding[] = (() => {
  const out: CityBuilding[] = []
  for (const district of districts) {
    const center = plotCenter(district)
    const list = skillsInDistrict(district.id)
    list.forEach((skill, index) => {
      const slot = SLOTS[index] ?? [0, 0]
      const jitter = 0.16
      const x = center.x + slot[0] * PITCH + (noise(`${skill.id}:x`) - 0.5) * jitter * 2
      const z = center.z + slot[1] * PITCH + (noise(`${skill.id}:z`) - 0.5) * jitter * 2
      const shape = shapeFor(skill, index)
      const { w, d } = footprint(skill, shape)
      const base = LEVEL_HEIGHT[skill.level] + (noise(`${skill.id}:h`) - 0.5) * 0.9
      const h = shape === 'construction' ? 2.5 : shape === 'slab' ? Math.max(1.9, base * 0.62) : base
      out.push({ id: skill.id, skill, district, x, z, w, d, h, shape })
    })
  }
  return out
})()

export const cityBuildingById = new Map(cityBuildings.map(b => [b.id, b]))

/** One box of a building, in the building's own space: y is its base. */
export type PartKind = 'facade' | 'roof' | 'detail' | 'green' | 'side'
export type BuildingPart = {
  kind: PartKind
  w: number
  h: number
  d: number
  x: number
  y: number
  z: number
}

/**
 * The geometry of a tower, as boxes. The scene turns these into meshes; the
 * preview renderer reads the same list, so what is checked is what is drawn.
 */
export function buildingParts(b: CityBuilding): BuildingPart[] {
  const parts: BuildingPart[] = []
  const add = (
    kind: PartKind,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number
  ) => {
    parts.push({ kind, w, h, d, x, y, z })
  }
  const { w, d, h, shape } = b

  const roofUnit = (x = 0, z = 0, size = 0.36) => {
    add('roof', size, 0.18, size * 0.8, x, h, z)
  }

  if (shape === 'construction') {
    // An unfinished frame: base, columns, two poured floors and a half floor
    // on top, with the crane still standing over it. No glass, no neon tarp —
    // the open floors and the crane are what say "still being built".
    add('side', w, 0.32, d, 0, 0, 0)
    const colH = 2.35
    const offX = w / 2 - 0.14
    const offZ = d / 2 - 0.14
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        add('detail', 0.15, colH, 0.15, sx * offX, 0.32, sz * offZ)
      }
    }
    for (const level of [0.9, 1.55]) {
      add('roof', w * 0.98, 0.1, d * 0.98, 0, level, 0)
    }
    // The top slab is poured only half way across.
    add('roof', w * 0.56, 0.1, d * 0.98, -w * 0.21, 2.2, 0)
    add('detail', 0.26, 0.26, 0.26, w * 0.24, 1.65, 0.18)
    add('detail', 0.2, 0.2, 0.2, w * 0.02, 1.65, -0.24)
    // A low safety rail around the site, in the same green as the roads.
    const rail = 0.095
    const railH = 0.26
    const inset = 0.2
    add('green', w + inset * 2, railH, rail, 0, 0.34, d / 2 + inset)
    add('green', w + inset * 2, railH, rail, 0, 0.34, -d / 2 - inset)
    add('green', rail, railH, d + inset * 2, w / 2 + inset, 0.34, 0)
    add('green', rail, railH, d + inset * 2, -w / 2 - inset, 0.34, 0)
    const craneX = w / 2 + 0.34
    const craneZ = -d / 2 + 0.3
    add('detail', 0.12, 4.4, 0.12, craneX, 0, craneZ)
    add('detail', 2.5, 0.1, 0.12, craneX - 0.9, 4.4, craneZ)
    add('roof', 0.9, 0.1, 0.14, craneX + 1.25, 4.4, craneZ)
    add('detail', 0.03, 1.1, 0.03, craneX - 1.55, 3.3, craneZ)
    add('roof', 0.2, 0.16, 0.2, craneX - 1.55, 3.1, craneZ)
    return parts
  }

  if (shape === 'setback') {
    const podiumH = h * 0.26
    const shaftH = h * 0.52
    const crownH = h - podiumH - shaftH
    add('facade', w + 0.34, podiumH, d + 0.34, 0, 0, 0)
    add('facade', w, shaftH, d, 0, podiumH, 0)
    add('facade', w * 0.66, crownH, d * 0.66, 0, podiumH + shaftH, 0)
    add('detail', 0.22, 0.7, 0.22, 0, h, 0)
    add('detail', w * 0.66 + 0.06, 0.1, d * 0.66 + 0.06, 0, h - 0.42, 0)
    return parts
  }

  if (shape === 'block') {
    const lowerH = h * 0.62
    const upperH = h - lowerH
    add('facade', w, lowerH, d, 0, 0, 0)
    add('facade', w * 0.82, upperH, d * 0.82, 0.04, lowerH, -0.03)
    roofUnit(w * 0.12, -d * 0.1, 0.3)
    return parts
  }

  if (shape === 'slab') {
    add('facade', w, h, d, 0, 0, 0)
    add('roof', w + 0.1, 0.09, d + 0.1, 0, h, 0)
    const vents = Math.min(4, Math.round(w / 0.7))
    for (let i = 0; i < vents; i += 1) {
      const vx = -w / 2 + 0.42 + (i * (w - 0.8)) / Math.max(1, vents - 1)
      add('detail', 0.28, 0.2, 0.32, vx, h + 0.09, 0)
    }
    return parts
  }

  if (shape === 'antenna') {
    const shaftH = h * 0.88
    add('facade', w, shaftH, d, 0, 0, 0)
    add('facade', w * 0.84, h - shaftH, d * 0.84, 0, shaftH, 0)
    const mastH = h * 0.34
    add('detail', 0.045, mastH, 0.045, 0, h, 0)
    add('detail', 0.7, 0.025, 0.025, 0, h + mastH * 0.62, 0)
    add('detail', 0.36, 0.025, 0.025, 0, h + mastH * 0.85, 0)
    return parts
  }

  add('facade', w, h, d, 0, 0, 0)
  if (b.skill.level >= 4) add('detail', w + 0.06, 0.1, d + 0.06, 0, h - 0.5, 0)
  roofUnit(0, 0, 0.44)
  return parts
}

/** Low, unnamed blocks that fill the rest of a block. They are neighbourhood, not a skill. */
export const cityFabric: CityFabric[] = (() => {
  const out: CityFabric[] = []
  for (const district of districts) {
    const center = plotCenter(district)
    const used = cityBuildings.filter(b => b.district.id === district.id).length
    const chosen = SLOTS.slice(used)
    chosen.forEach((slot, index) => {
      const seed = `${district.id}:fabric:${index}`
      out.push({
        x: center.x + slot[0] * PITCH + (noise(`${seed}:x`) - 0.5) * 0.3,
        z: center.z + slot[1] * PITCH + (noise(`${seed}:z`) - 0.5) * 0.3,
        w: 1.35 + noise(`${seed}:w`) * 0.65,
        d: 1.35 + noise(`${seed}:d`) * 0.65,
        h: 0.85 + noise(`${seed}:h`) * 1.25
      })
    })
  }
  return out
})()

export function plotRect(district: District): Rect {
  const { x, z } = plotCenter(district)
  return { x, z, w: PLOT, d: PLOT }
}

/**
 * The road grid: two avenues running north-south, one running east-west,
 * painted the same green as the site's signal colour. Broad bands, like the
 * lit roads of a model city, not thin outlines around each block.
 */
export const greenRoads: Rect[] = [
  { x: -6.8, z: 0, w: ROAD, d: PLATE.depth - 1.6 },
  { x: 6.8, z: 0, w: ROAD, d: PLATE.depth - 1.6 },
  { x: 0, z: 0, w: PLATE.width - 1.4, d: ROAD }
]

/** A handful of tiny vehicles, so the blocks have a sense of scale. */
export type CityVehicle = {
  x: number
  z: number
  /** 0 drives east-west, 1 drives north-south. */
  turned: boolean
  tone: 'cream' | 'dark'
}

export const cityVehicles: CityVehicle[] = [
  { x: -15.2, z: 0.58, turned: false, tone: 'cream' },
  { x: -10.6, z: -0.58, turned: false, tone: 'dark' },
  { x: 9.8, z: 0.58, turned: false, tone: 'cream' },
  { x: 15.4, z: -0.58, turned: false, tone: 'cream' },
  { x: -7.42, z: -8.8, turned: true, tone: 'cream' },
  { x: -6.18, z: -3.6, turned: true, tone: 'dark' },
  { x: 6.18, z: 4.4, turned: true, tone: 'cream' },
  { x: 7.42, z: 9.2, turned: true, tone: 'dark' }
]

/** Cream dashes down the middle of the four road corridors. */
export const roadDashes: Rect[] = (() => {
  const out: Rect[] = []
  const step = 2.6
  const length = 1.1
  const crossing = (value: number, at: number) => Math.abs(value - at) < 2.2

  for (let x = -18.2; x <= 18.2; x += step) {
    if (crossing(x, -6.8) || crossing(x, 6.8)) continue
    out.push({ x, z: 0, w: length, d: 0.1 })
  }
  for (let z = -11.6; z <= 11.6; z += step) {
    if (crossing(z, -6.8) || crossing(z, 6.8)) continue
    out.push({ x: -6.8, z, w: 0.1, d: length })
    out.push({ x: 6.8, z, w: 0.1, d: length })
  }
  return out
})()

/** A thin cream rule around the edge of the diorama plate. */
export const plateRim: Rect[] = (() => {
  const inset = 0.42
  const w = PLATE.width
  const d = PLATE.depth
  return [
    { x: 0, z: -d / 2 + inset, w: w - inset * 2, d: 0.12 },
    { x: 0, z: d / 2 - inset, w: w - inset * 2, d: 0.12 },
    { x: -w / 2 + inset, z: 0, w: 0.12, d: d - inset * 2 },
    { x: w / 2 - inset, z: 0, w: 0.12, d: d - inset * 2 }
  ]
})()
