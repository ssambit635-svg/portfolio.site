/**
 * Single source of truth for every piece of copy on the site.
 */
import certAws from '../assets/certs/aws-foundations.jpg'
import certC from '../assets/certs/c-programming.jpg'
import certCloud from '../assets/certs/cloud-computing.jpg'
import certCpp from '../assets/certs/cpp-essentials.jpg'
import certDocker from '../assets/certs/docker-basics.jpg'
import certLinux from '../assets/certs/linux-unhatched.jpg'
import certPython from '../assets/certs/python-essentials.jpg'

import shotArch from '../assets/projects/arch.jpg'
import shotKivo from '../assets/projects/kivo.jpg'
import shotShadow from '../assets/projects/shadow-quest.jpg'
import shotAnnadata from '../assets/projects/annadata-connect.jpg'
import shotCivic from '../assets/projects/civicreport.jpg'
import shotWeather from '../assets/projects/weather-sense.jpg'
import shotAws from '../assets/projects/aws-dashboard.jpg'
import shotPassword from '../assets/projects/password-manager.jpg'
import shotPortfolio from '../assets/projects/portfolio.jpg'

export const profile = {
  name: 'Sambit Swain',
  first: 'Sambit',
  last: 'Swain',
  role: 'Cloud & full-stack',
  classTag: "CSE '29",
  country: 'India',
  city: 'Berhampur, India',
  availability: 'Available now',
  coords: ["19°18'55.0\"N", "84°47'32.0\"E"],
  timezone: 'Asia/Kolkata',
  email: 'ssambit635@gmail.com',
  emailParts: ['ssambit635', '@gmail.com'],
  phone: '+91 9437729404',
  phoneParts: ['+91', '943', '772', '9404'],
  phoneHref: '+919437729404',
  github: 'https://github.com/ssambit635-svg',
  linkedin: 'https://www.linkedin.com/in/sambit-swain-7032a8378',
  x: 'https://x.com/swainsambit7i',
  hashnode: 'https://hashnode.com/@ssambit',
  discord: 'https://discord.com/users/1522612480831000733',
  avely: 'https://avely.me/sambit',
  site: 'https://ssambit635-svg.github.io/portfolio.site/',
  resume: '#'
} as const

export const headline =
  'I ship full-stack products and the infrastructure they run on — from the interface down to the box it deploys into.'

export const tagline = 'I ship full-stack products and the infrastructure they run on'

/** Contact-console keycaps — [label, href, colour-kind]. */
export const consoleKeys: [string, string, string][] = [
  ['Home', '#home', 'wide'],
  ['GH', profile.github, 'sky'],
  ['IN', profile.linkedin, 'insta'],
  ['@', `mailto:${profile.email}`, 'tan'],
  ['Hire me', `mailto:${profile.email}?subject=Let%27s%20work%20together`, 'wide'],
  ['X', profile.x, ''],
  ['Discord', profile.discord, 'wide'],
  ['HN', profile.hashnode, 'pink'],
  ['AV', profile.avely, 'blue'],
]

export const about = {
  p1: 'I’m Sambit Swain, a B.Tech Computer Science student at NIST University (2025–2029) in Berhampur, India. I work across the stack: React and TypeScript on the client, Node and FastAPI on the server, Docker and AWS underneath.',
  p2: 'Hackathons are how I force a brief into a working system — health records, farmer procurement, civic reporting. The interesting part is never the demo. It’s the path from a phone camera or a queue token to a database, an API, and something an operator can actually run.'
}

export const planes = ['Client', 'API', 'Data', 'Infra'] as const
export type Plane = (typeof planes)[number]

/**
 * Shown on cards whose demo runs on a free host that sleeps after inactivity
 * (Render's free web services spin down after ~15 minutes idle and take up to
 * a minute to wake), so a first click isn't mistaken for a dead link.
 */
const coldStartNote = 'Free-tier hosting — first load can take 30–60 s.'

export type Project = {
  id: string
  title: string
  kind: string
  description: string
  year: string
  stack: string[]
  image: string
  href: string
  action: string
  repo?: string
  status: 'live' | 'lab' | 'local'
  plane: Record<Plane, string>
  featured?: boolean
  /** Caveat rendered under the card actions — currently the cold-start note. */
  note?: string
}

export const projects: Project[] = [
  {
    id: 'arch',
    title: 'ARCH',
    kind: 'DevOps',
    description:
      'A self-hosted incident response workspace: alerts, context and decisions in one place, from first alert to postmortem. Human-reviewed assistance drafts triage and customer updates, and a public status page keeps customers informed — all on infrastructure you control.',
    year: '2026',
    stack: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Prisma'],
    image: shotArch,
    href: 'https://arch-qrh6.onrender.com/',
    action: 'Live demo',
    repo: 'https://github.com/ssambit635-svg/ARCH.git',
    status: 'live',
    featured: true,
    note: coldStartNote,
    plane: {
      Client: 'React 19',
      API: 'Next.js / Node',
      Data: 'PostgreSQL',
      Infra: 'Docker · Render'
    }
  },
  {
    id: 'kivo',
    title: 'Kivo',
    kind: 'HealthTech',
    description:
      'Photograph a paper lab report, verify each extracted value, and build a personal health timeline with trends, risk insights and a doctor-visit summary. Built for the iQOO Hackathon 2026.',
    year: '2026',
    stack: ['JavaScript', 'Node.js', 'Express', 'SQLite', 'Android'],
    image: shotKivo,
    href: 'https://kivo-api-qzqc.onrender.com/',
    action: 'Live demo',
    repo: 'https://github.com/ssambit635-svg/kivo.git',
    status: 'live',
    featured: true,
    note: coldStartNote,
    plane: {
      Client: 'Android capture',
      API: 'Express / Node',
      Data: 'SQLite',
      Infra: 'Render'
    }
  },
  {
    id: 'shadow-quest',
    title: 'Shadow Quest',
    kind: 'Productivity',
    description:
      'A samurai-inspired focus app with configurable work sessions, an ensō timer and goal streaks. Built for Tech Zypher 2026.',
    year: '2026',
    stack: ['React', 'TypeScript', 'MongoDB', 'Capacitor'],
    image: shotShadow,
    href: 'https://shadowquest.onrender.com/',
    action: 'Live app',
    repo: 'https://github.com/ssambit635-svg/Shadow-quest.git',
    status: 'live',
    featured: true,
    note: coldStartNote,
    plane: {
      Client: 'React / Capacitor',
      API: 'Node',
      Data: 'MongoDB',
      Infra: 'Render'
    }
  },
  {
    id: 'annadata-connect',
    title: 'Annadata Connect',
    kind: 'AgriTech',
    description:
      'Connects farmers to procurement centres with live queue tokens, MSP comparisons and above-MSP buyers, with queue tools for officers and an overview for state authorities. Built for Smart India Hackathon 2026.',
    year: '2026',
    stack: ['React', 'Node.js', 'Express', 'Capacitor', 'Docker'],
    image: shotAnnadata,
    href: 'https://ssambit635-svg-annadata-connect.onrender.com/',
    action: 'Live demo',
    repo: 'https://github.com/ssambit635-svg/ssambit635-svg-Annadata-Connect.git',
    status: 'live',
    featured: true,
    note: coldStartNote,
    plane: {
      Client: 'React / Capacitor',
      API: 'Express',
      Data: 'Application store',
      Infra: 'Docker · Render'
    }
  },
  {
    id: 'civicreport',
    title: 'CivicReport',
    kind: 'Civic',
    description:
      'Citizens photograph a local issue; Gemini classifies it, places it on a Leaflet map and helps track the report through resolution.',
    year: '2026',
    stack: ['HTML', 'CSS', 'JavaScript', 'Gemini AI', 'Leaflet'],
    image: shotCivic,
    href: 'https://ssambit635-svg.github.io/Civic-report/',
    action: 'Live site',
    repo: 'https://github.com/ssambit635-svg/Civic-report.git',
    status: 'live',
    featured: true,
    plane: {
      Client: 'Static web',
      API: 'Gemini',
      Data: 'Client + map',
      Infra: 'GitHub Pages'
    }
  },
  {
    id: 'weather-sense',
    title: 'Weather Sense',
    kind: 'Data',
    description:
      'Combines a seven-day forecast and air-quality index with practical lifestyle scores for plans like carrying an umbrella or going for a run.',
    year: '2025',
    stack: ['Python', 'Streamlit', 'Open-Meteo API'],
    image: shotWeather,
    href: 'https://weather-sense-kutb55y3djjhmcbymj6wjh.streamlit.app/',
    action: 'Live app',
    repo: 'https://github.com/ssambit635-svg/Weather-sense.git',
    status: 'live',
    featured: false,
    plane: {
      Client: 'Streamlit',
      API: 'Open-Meteo',
      Data: 'Forecast feed',
      Infra: 'Streamlit Cloud'
    }
  },
  {
    id: 'aws-dashboard',
    title: 'AWS Dashboard',
    kind: 'Cloud',
    description:
      'A cloud dashboard for viewing EC2 instances, S3 buckets and month-to-date AWS spend, with costs grouped by service.',
    year: '2025',
    stack: ['FastAPI', 'React', 'Recharts', 'LocalStack', 'Docker'],
    image: shotAws,
    href: 'https://aws-dashboard-frontend.vercel.app/',
    action: 'Live demo',
    repo: 'https://github.com/ssambit635-svg/Aws-dashboard-frontend',
    status: 'lab',
    featured: true,
    // The page is on Vercel, but its data comes from a free Render API that
    // sleeps, so the dashboard sits on "Loading" until that wakes.
    note: coldStartNote,
    plane: {
      Client: 'React / Recharts',
      API: 'FastAPI',
      Data: 'AWS APIs',
      Infra: 'LocalStack · Docker'
    }
  },
  {
    id: 'password-manager',
    title: 'Password Manager',
    kind: 'Security',
    description:
      'A local password manager for generating and retrieving credentials, using Fernet encryption and a SHA-256 hashed master password. No cloud accounts.',
    year: '2025',
    stack: ['Python', 'cryptography', 'Streamlit'],
    image: shotPassword,
    href: 'https://github.com/ssambit635-svg/password_manager_python.git',
    action: 'Source',
    status: 'local',
    featured: false,
    plane: {
      Client: 'Streamlit',
      API: 'Local process',
      Data: 'Fernet store',
      Infra: 'Offline'
    }
  },
  {
    id: 'portfolio',
    title: 'This site',
    kind: 'Site',
    description: 'Personal site: React, TypeScript, a paper editorial layout and a systems map of the work.',
    year: '2026',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind'],
    image: shotPortfolio,
    href: 'https://github.com/ssambit635-svg/portfolio.site.git',
    action: 'Source',
    status: 'live',
    featured: false,
    plane: {
      Client: 'React',
      API: '—',
      Data: 'Static',
      Infra: 'GitHub Pages'
    }
  }
]

export type Experience = {
  id: string
  org: string
  role: string
  detail: string
  image?: string
  /** Issuer's course or program page for the credential, linked from the timeline. */
  href?: string
  action?: string
}

export const experience: Experience[] = [
  {
    id: 'nist',
    org: 'NIST University',
    role: 'B.Tech CSE · 2025 — 2029',
    detail:
      'B.Tech Computer Science and Engineering. Core CS alongside web, backend and cloud work. CGPA 8.2.'
  },
  {
    id: 'aws',
    org: 'AWS Training',
    role: 'Cloud Essentials',
    detail: 'AWS Foundations: compute, storage, networking and billing.',
    image: certAws,
    href: 'https://skillbuilder.aws/learn/GTVN1YVH4J/aws-foundations-getting-started-with-the-aws-cloud-essentials/JE4XVHC56M',
    action: 'Course'
  },
  {
    id: 'cisco-py',
    org: 'Cisco NetAcad',
    role: 'Python Essentials 1',
    detail: 'Python fundamentals — Cisco Networking Academy.',
    image: certPython,
    href: 'https://www.netacad.com/courses/python-essentials-1',
    action: 'Course'
  },
  {
    id: 'cisco-cpp',
    org: 'Cisco NetAcad',
    role: 'C++ Essentials 1',
    detail: 'OOP, memory and the STL.',
    image: certCpp,
    href: 'https://www.netacad.com/courses/c-plus-plus-essentials-1',
    action: 'Course'
  },
  {
    id: 'cisco-linux',
    org: 'Cisco NetAcad',
    role: 'Linux Unhatched',
    detail: 'Shell, filesystem and permissions — the base layer for what I deploy.',
    image: certLinux,
    href: 'https://www.netacad.com/courses/linux-unhatched',
    action: 'Course'
  },
  {
    id: 'simplilearn',
    org: 'Simplilearn',
    role: 'Cloud Computing',
    detail: 'Service models, deployment models, architecture basics.',
    image: certCloud,
    href: 'https://www.simplilearn.com/introduction-to-cloud-computing-basics-skillup',
    action: 'Course'
  },
  {
    id: 'excelr',
    org: 'ExcelR',
    role: 'Programming in C',
    detail: '30-hour live training on C.',
    image: certC,
    href: 'https://edl.excelr.com/',
    action: 'Program'
  },
  {
    id: 'dhss',
    org: 'Dhenkanal HSS',
    role: 'Class XII · PCM + CS',
    detail: 'Where this started. 79.7%.'
  }
]

export type Credential = {
  id: string
  issuer: string
  title: string
  detail: string
  /** Certificate scan. Optional: cards without one fall back to a type-only tile. */
  image?: string
  /** Public page for the credential — the issuer's course page or program page. */
  href?: string
  action?: string
}

/**
 * Every certificate, shown as square tiles on /dashboard only — the landing
 * page keeps the short learning timeline in `experience`.
 *
 * Each tile links to the issuer's own page for that credential (skillup /
 * netacad course page, ExcelR's EDL program). Simplilearn's free SkillUp
 * certificates have no per-certificate public URL, so the course page plus the
 * printed certificate code is what a visitor can check against.
 */
export const credentials: Credential[] = [
  {
    id: 'docker-basics',
    issuer: 'Simplilearn',
    title: 'Docker Basics',
    detail:
      'Images, containers and the Dockerfile workflow — the SkillUp course “Getting Started with Docker”. Certificate code 10821711.',
    image: certDocker,
    href: 'https://www.simplilearn.com/learn-docker-basics-free-course-skillup',
    action: 'Course'
  },
  {
    id: 'aws-foundations',
    issuer: 'AWS Training',
    title: 'Cloud Essentials',
    detail: 'AWS Foundations: compute, storage, networking and billing.',
    image: certAws,
    href: 'https://skillbuilder.aws/learn/GTVN1YVH4J/aws-foundations-getting-started-with-the-aws-cloud-essentials/JE4XVHC56M',
    action: 'Course'
  },
  {
    id: 'python-essentials',
    issuer: 'Cisco NetAcad',
    title: 'Python Essentials 1',
    detail: 'Python fundamentals — Cisco Networking Academy.',
    image: certPython,
    href: 'https://www.netacad.com/courses/python-essentials-1',
    action: 'Course'
  },
  {
    id: 'cpp-essentials',
    issuer: 'Cisco NetAcad',
    title: 'C++ Essentials 1',
    detail: 'OOP, memory and the STL.',
    image: certCpp,
    href: 'https://www.netacad.com/courses/c-plus-plus-essentials-1',
    action: 'Course'
  },
  {
    id: 'linux-unhatched',
    issuer: 'Cisco NetAcad',
    title: 'Linux Unhatched',
    detail: 'Shell, filesystem and permissions — the base layer for what I deploy.',
    image: certLinux,
    href: 'https://www.netacad.com/courses/linux-unhatched',
    action: 'Course'
  },
  {
    id: 'cloud-computing',
    issuer: 'Simplilearn',
    title: 'Cloud Computing',
    detail: 'Service models, deployment models, architecture basics.',
    image: certCloud,
    href: 'https://www.simplilearn.com/introduction-to-cloud-computing-basics-skillup',
    action: 'Course'
  },
  {
    id: 'c-programming',
    issuer: 'ExcelR',
    title: 'Programming in C',
    detail: '30-hour live training on C.',
    image: certC,
    href: 'https://edl.excelr.com/',
    action: 'Program'
  }
]

export type Achievement = { id: string; title: string; detail: string }

export const achievements: Achievement[] = [
  {
    id: 'sih-2026',
    title: 'Smart India Hackathon 2026',
    detail: 'Annadata Connect — farmer procurement with live queue tokens and MSP comparison.'
  },
  {
    id: 'iqoo-2026',
    title: 'iQOO Hackathon 2026',
    detail: 'Kivo — paper lab reports turned into a verified health timeline.'
  },
  {
    id: 'tech-zypher-2026',
    title: 'Tech Zypher 2026',
    detail: 'Shadow Quest — a focus timer with work sessions and goal streaks.'
  },
  {
    id: 'nist-cgpa',
    title: 'NIST University · CGPA 8.2',
    detail: 'B.Tech Computer Science and Engineering, 2025 — 2029.'
  },
  {
    id: 'class-xii',
    title: 'Class XII · PCM + CS',
    detail: 'Dhenkanal Higher Secondary School — 79.7%.'
  }
]

export const stats = [
  { label: 'Shipped projects', value: projects.length, suffix: '' },
  { label: 'Years building', value: 3, suffix: '+' },
  { label: 'Certifications', value: experience.filter((item) => item.image).length, suffix: '' }
] as const

export const footerCols = [
  { title: 'Work', items: [{ label: 'GitHub', href: profile.github }, { label: 'Hashnode', href: profile.hashnode }] },
  { title: 'Social', items: [{ label: 'LinkedIn', href: profile.linkedin }, { label: 'X', href: profile.x }] },
  {
    title: 'Talk',
    items: [
      { label: 'Email', href: `mailto:${profile.email}` },
      { label: 'Discord', href: profile.discord }
    ]
  }
] as const
