/**
 * Single source of truth for every piece of copy on the site.
 * Editing this file is enough to keep the whole portfolio in sync.
 */

import certAws from '../assets/certs/aws-foundations.jpg'
import certC from '../assets/certs/c-programming.jpg'
import certCloud from '../assets/certs/cloud-computing.jpg'
import certCpp from '../assets/certs/cpp-essentials.jpg'
import certLinux from '../assets/certs/linux-unhatched.jpg'
import certPython from '../assets/certs/python-essentials.jpg'

export const profile = {
  name: 'Sambit Swain',
  first: 'Sambit',
  last: 'Swain',
  role: 'Software Developer & Interface Designer',
  rotating: ['software developer', 'interface designer', 'systems tinkerer', 'cloud builder'],
  location: 'Berhampur, Odisha, India',
  timezone: 'Asia/Kolkata',
  email: 'ssambit635@gmail.com',
  phone: '+91 9437729404',
  phoneHref: '+919437729404',
  github: 'https://github.com/ssambit635-svg',
  linkedin: 'https://www.linkedin.com/in/sambit-swain-7032a8378',
  x: 'https://x.com/swainsambit7i',
  hashnode: 'https://hashnode.com/@ssambit',
  discord: 'https://discord.com/users/1522612480831000733',
  avely: 'https://avely.me/sambit',
  site: 'https://ssambit635-svg.github.io/portfolio.site/'
} as const

/** Everything the monochrome home screen needs, in one place. */
export const home = {
  kicker: 'SOFTWARE DEVELOPER — ODISHA, INDIA',
  headline: ['React • FastAPI • Cloud', 'Full-stack products & calm interfaces'],
  lede: [
    'full-stack products',
    'cloud tooling',
    'interactive experiments'
  ],
  ledeBefore: 'a computer science student from Odisha who ships',
  ledeAfter: 'Design-led on the surface, engineering-led underneath — available for internships & freelance.',
  status: 'Open to internships & freelance',
  currently: {
    title: 'B.Tech, Computer Science & Engineering',
    org: '@ NIST University, Berhampur',
    period: '2025 — 2029 · 8.2 CGPA'
  },
  focusSkills: [
    'React',
    'TypeScript',
    'Python',
    'FastAPI',
    'AWS',
    'Docker',
    'Tailwind',
    'GSAP',
    'three.js',
    'PostgreSQL'
  ],
  connectBlurb:
    'Always interested in ambitious projects, internships, and conversations about products, cloud, design and the odd interface experiment.'
} as const

export const heroCopy = {
  kicker: 'Portfolio — 2026',
  available: 'Open to internships & freelance',
  headline: ['Building calm', 'interfaces for', 'loud problems.'],
  lede: 'I am Sambit — a computer science student from Odisha who ships full-stack products, cloud tooling and the odd interactive experiment. Design-led on the surface, engineering-led underneath.',
  ctas: [
    { label: 'See the work', href: '#work' },
    { label: 'Start a conversation', href: '#contact' }
  ]
} as const

export const tickerWords = [
  'Full-stack product',
  'Interface design',
  'Cloud & DevOps',
  'Interaction experiments',
  'Available for work',
  'Odisha, India'
] as const

export type Project = {
  id: string
  index: string
  title: string
  tagline: string
  description: string
  year: string
  role: string
  stack: string[]
  links: { label: string; href: string; kind: 'repo' | 'live' | 'case' }[]
  accent: string
  glyph: string
}

export const projects: Project[] = [
  {
    id: 'civicreport',
    index: '01',
    title: 'CivicReport',
    tagline: 'AI-assisted civic reporting for a real city',
    description:
      'Citizens photograph a problem — a broken streetlight, an overflowing drain — and Gemini classifies it, drops it on a live map and tracks it until it closes. A dashboard rolls every report into a city health score.',
    year: '2026',
    role: 'Concept, design & front-end',
    stack: ['HTML', 'CSS', 'JavaScript', 'Gemini AI', 'Leaflet', 'Chart.js'],
    links: [
      {
        label: 'Live site',
        href: 'https://ssambit635-svg.github.io/Civic-report/',
        kind: 'live'
      },
      {
        label: 'Source',
        href: 'https://github.com/ssambit635-svg/Civic-report.git',
        kind: 'repo'
      }
    ],
    accent: '#C0592C',
    glyph: 'map'
  },
  {
    id: 'weather-sense',
    index: '02',
    title: 'Weather Sense',
    tagline: 'Weather that explains what today should feel like',
    description:
      'A seven-day forecast, air-quality index and lifestyle scores that tell you whether to carry an umbrella or skip the evening run. Built so the data reads like advice instead of a spreadsheet.',
    year: '2025',
    role: 'Design & engineering',
    stack: ['Python', 'Streamlit', 'Open-Meteo API', 'Custom CSS'],
    links: [
      {
        label: 'Live app',
        href: 'https://weather-sense-pbwmsehcq8etxhy7vufp6i.streamlit.app/',
        kind: 'live'
      },
      {
        label: 'Source',
        href: 'https://github.com/ssambit635-svg/Weather-sense.git',
        kind: 'repo'
      }
    ],
    accent: '#5B6749',
    glyph: 'weather'
  },
  {
    id: 'aws-dashboard',
    index: '03',
    title: 'AWS Cost & Resource Dashboard',
    tagline: 'Where first cloud projects stop being free',
    description:
      'A dashboard that lists live EC2 instances, S3 buckets and month-to-date billing, then breaks the spend down by service. Built by debugging Docker, CORS and deployment configs until it stayed up.',
    year: '2025',
    role: 'Full-stack & infra',
    stack: ['FastAPI', 'React', 'Recharts', 'LocalStack', 'Docker'],
    links: [
      { label: 'Live', href: 'https://lnkd.in/dgA4fPCR', kind: 'live' },
      { label: 'Backend', href: 'https://lnkd.in/dvXT6S-J', kind: 'case' }
    ],
    accent: '#B98A2C',
    glyph: 'cloud'
  },
  {
    id: 'password-manager',
    index: '04',
    title: 'Password Manager',
    tagline: 'Encryption explained in one honest screen',
    description:
      'Generate, store and retrieve credentials with AES Fernet encryption and a SHA-256 hashed master password. No cloud, no accounts — the vault never leaves the machine it runs on.',
    year: '2025',
    role: 'Engineering',
    stack: ['Python', 'cryptography', 'hashlib', 'Streamlit'],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/ssambit635-svg/password_manager_python.git',
        kind: 'repo'
      }
    ],
    accent: '#3A332A',
    glyph: 'lock'
  },
  {
    id: 'portfolio',
    index: '05',
    title: 'This Portfolio',
    tagline: 'The site you are reading, rebuilt from zero',
    description:
      'Creamy, motion-first, and fully automated: GSAP ScrollTrigger drives the scroll narrative, three.js renders the clay models, and every push to main deploys through GitHub Actions.',
    year: '2026',
    role: 'Design, motion & build',
    stack: ['React', 'TypeScript', 'GSAP', 'three.js', 'Tailwind', 'GitHub Actions'],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/ssambit635-svg/portfolio.site.git',
        kind: 'repo'
      },
      {
        label: 'Live',
        href: 'https://ssambit635-svg.github.io/portfolio.site/',
        kind: 'live'
      }
    ],
    accent: '#6E7A5E',
    glyph: 'spark'
  }
]

export const stats = [
  { value: 5, suffix: '', label: 'Products shipped & live' },
  { value: 6, suffix: '', label: 'Verified certifications' },
  { value: 8.2, suffix: '', label: 'CGPA, first year', decimals: 1 },
  { value: 3, suffix: '+', label: 'Years writing code' }
] as const

export const skillGroups = [
  {
    title: 'Languages',
    note: 'What I reach for first',
    items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'SQL']
  },
  {
    title: 'Front-end & design',
    note: 'Interfaces that hold up',
    items: ['React', 'Vite', 'Tailwind CSS', 'GSAP', 'three.js', 'Figma']
  },
  {
    title: 'Back-end & data',
    note: 'The parts users never see',
    items: ['FastAPI', 'Node.js', 'PostgreSQL', 'SQLite', 'REST APIs', 'Auth flows']
  },
  {
    title: 'Cloud & tooling',
    note: 'Keeping it shipped',
    items: ['AWS', 'Docker', 'Nginx', 'GitHub Actions', 'Linux', 'Git']
  }
] as const

export const timeline = [
  {
    period: '2025 — 2029',
    title: 'B.Tech, Computer Science & Engineering',
    org: 'NIST University, Berhampur',
    detail:
      'Core computer science by day — data structures, operating systems, DBMS, networks — and shipping real products on the side. Currently going deep on cloud architecture and DevOps practice.',
    metric: '8.2 CGPA',
    tags: ['DSA', 'Operating Systems', 'DBMS', 'Computer Networks', 'OOP with Java', 'Web Technologies']
  },
  {
    period: '2022 — 2024',
    title: 'Class XII, PCM + Computer Science',
    org: 'Dhenkanal Higher Secondary School',
    detail:
      'The computer science paper is where this started: writing my first loops, then wondering what happens behind the browser tab.',
    metric: '79.7%',
    tags: ['Programming fundamentals', 'Mathematics', 'Physics']
  }
] as const

export type Certificate = {
  id: string
  title: string
  issuer: string
  date: string
  image: string
  href: string
}

export const certificates: Certificate[] = [
  {
    id: 'aws',
    title: 'AWS Foundations: AWS Cloud Essentials',
    issuer: 'AWS Training & Certification',
    date: 'Jun 2026',
    image: certAws,
    href: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials'
  },
  {
    id: 'python',
    title: 'Python Essentials 1',
    issuer: 'Cisco Networking Academy',
    date: 'Jun 2026',
    image: certPython,
    href: 'https://www.credly.com/badges/2855d561-607d-40a9-ac8f-b9005421c6b3/public_url'
  },
  {
    id: 'cpp',
    title: 'C++ Essentials 1',
    issuer: 'Cisco Networking Academy',
    date: 'Jun 2026',
    image: certCpp,
    href: 'https://www.credly.com/badges/66f3216f-c6ed-415e-bc46-3fb831c05ed9/public_url'
  },
  {
    id: 'linux',
    title: 'Linux Unhatched',
    issuer: 'Cisco Networking Academy',
    date: 'Jul 2026',
    image: certLinux,
    href: 'https://www.credly.com/badges/a9f5dddc-e2fb-42bb-8899-decdfd71775a/public_url'
  },
  {
    id: 'cloud',
    title: 'Introduction to Cloud Computing',
    issuer: 'Simplilearn SkillUp',
    date: 'Jun 2026',
    image: certCloud,
    href: 'https://www.simplilearn.com/skillup-certificate-landing?token=eyJjb3Vyc2VfaWQiOiIxNTExIiwiY2VydGlmaWNhdGVfdXJsIjoiaHR0cHM6XC9cL2NlcnRpZmljYXRlcy5zaW1wbGljZG4ubmV0XC9zaGFyZVwvMTAzMDk4ODdfMTA1OTczODJfMTc4MDY0MjMzNDA2MC5wbmciLCJ1c2VybmFtZSI6IlNhbWJpdCBzd2FpbiAifQ&utm_source=shared-certificate&utm_medium=app_lms&utm_campaign=shared-certificate-promotion'
  },
  {
    id: 'c',
    title: 'Foundations of Programming using C',
    issuer: 'ExcelR EdTech — 30 hr live training',
    date: 'Nov 2025',
    image: certC,
    href: 'https://www.linkedin.com/posts/sambit-swain-7032a8378_completed-foundation-of-programming-using-share-7408601134715719681-E70T/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAF1Nu_MBCbMtHi0NdnxBEWERM9kOccSHudE'
  }
]

export const processSteps = [
  {
    index: '01',
    title: 'Understand the problem properly',
    body: 'Before a single line: who is this for, what does success look like, what breaks if it is wrong. Most bad software is a well-solved wrong problem.',
    detail: 'Discovery notes · constraints · success criteria'
  },
  {
    index: '02',
    title: 'Design and build together',
    body: 'I sketch in the browser. Structure, hierarchy and motion get decided in code where I can feel the timing, not in a static mockup that flatters itself.',
    detail: 'Wireframes · design tokens · motion passes'
  },
  {
    index: '03',
    title: 'Break it, fix it, ship it',
    body: 'Deploy early to a real URL, watch real people use it, then tighten the rough edges. The version strangers use teaches more than any local preview.',
    detail: 'CI/CD · Docker · monitoring · iteration'
  }
] as const

export const contactChannels = [
  {
    label: 'Email',
    value: profile.email,
    href: `mailto:${profile.email}`,
    kind: 'primary' as const
  },
  {
    label: 'GitHub',
    value: 'ssambit635-svg',
    href: profile.github,
    kind: 'link' as const
  },
  {
    label: 'LinkedIn',
    value: 'sambit-swain',
    href: profile.linkedin,
    kind: 'link' as const
  },
  {
    label: 'Phone',
    value: profile.phone,
    href: `tel:${profile.phoneHref}`,
    kind: 'link' as const
  },
  {
    label: 'Book a call',
    value: 'avely.me/sambit',
    href: profile.avely,
    kind: 'link' as const
  },
  {
    label: 'X',
    value: '@swainsambit7i',
    href: profile.x,
    kind: 'link' as const
  },
  {
    label: 'Hashnode',
    value: 'Writing on code',
    href: profile.hashnode,
    kind: 'link' as const
  },
  {
    label: 'Discord',
    value: 'Say hello',
    href: profile.discord,
    kind: 'link' as const
  }
]

export const navLinks = [
  { label: 'Work', href: '#work', index: '01' },
  { label: 'About', href: '#about', index: '02' },
  { label: 'Skills', href: '#skills', index: '03' },
  { label: 'Certificates', href: '#certificates', index: '04' },
  { label: 'Contact', href: '#contact', index: '05' }
] as const
