/**
 * Single source of truth for every piece of copy on the site.
 */
import certAws from '../assets/certs/aws-foundations.jpg'
import certC from '../assets/certs/c-programming.jpg'
import certCloud from '../assets/certs/cloud-computing.jpg'
import certCpp from '../assets/certs/cpp-essentials.jpg'
import certLinux from '../assets/certs/linux-unhatched.jpg'
import certPython from '../assets/certs/python-essentials.jpg'

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
  role: 'Software Developer',
  tagline: 'a computer science student',
  taglineSub: 'who ships products & experiments',
  birthYear: "06'",
  country: 'IN',
  city: 'Berhampur, IN',
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

export const intro = {
  before: "I'm a regular guy passionate about ",
  art: 'Code',
  mid: ' and ',
  tech: '<design/>',
  after:
    ' Nothing excites me more than building in those spaces. If I ever got rich, I’d fund open-source tools for students.'
} as const

export const manifesto = {
  lines: ['I believe great', 'work isn’t made', 'by talent alone.', 'It’s forged through', 'late nights,', 'bad drafts,', '& one too many'],
  quote: ['“Just one', 'more', 'tweak”']
} as const

export const stats = [
  { label: 'Products Shipped', value: 8, suffix: '+' },
  { label: 'Years Coding', value: 3, suffix: '+' },
  { label: 'Certifications', value: 6, suffix: '+' }
] as const

export type Project = {
  id: string
  title: string
  kind: string
  description: string
  year: string
  stack: string[]
  image: string
  href: string
  repo?: string
}

export const projects: Project[] = [
  {
    id: 'kivo',
    title: 'kivo',
    kind: 'HealthTech',
    description:
      'Point your camera at a paper lab report — kivo reads it, you verify every value, and it grows into a digital health twin with trends, risk awareness and a summary for your next doctor visit. Built for the iQOO Hackathon 2026.',
    year: '2026',
    stack: ['JavaScript', 'Node.js', 'Express', 'SQLite', 'Android'],
    image: shotKivo,
    href: 'https://kivo-api-qzqc.onrender.com/',
    repo: 'https://github.com/ssambit635-svg/kivo.git'
  },
  {
    id: 'shadow-quest',
    title: 'Shadow Quest',
    kind: 'Productivity',
    description:
      'A samurai-themed deep-work OS — pick a focus technique, watch an ensō ring fill while you focus and drain while you rest, and turn sealed goals into streaks. Built for Tech Zypher 2026.',
    year: '2026',
    stack: ['React', 'TypeScript', 'GSAP', 'MongoDB', 'Capacitor'],
    image: shotShadow,
    href: 'https://shadowquest.onrender.com/',
    repo: 'https://github.com/ssambit635-svg/Shadow-quest.git'
  },
  {
    id: 'annadata-connect',
    title: 'Annadata Connect',
    kind: 'AgriTech',
    description:
      'A farmer procurement platform: farmers get a live queue token at the best procurement centre and compare MSP centres with above-MSP buyers before they sell — officers run the queue, authorities watch the whole state. Built for Smart India Hackathon 2026.',
    year: '2026',
    stack: ['React', 'Node.js', 'Express', 'Capacitor', 'Docker'],
    image: shotAnnadata,
    href: 'https://ssambit635-svg-annadata-connect.onrender.com/',
    repo: 'https://github.com/ssambit635-svg/ssambit635-svg-Annadata-Connect.git'
  },
  {
    id: 'civicreport',
    title: 'CivicReport',
    kind: 'Web App',
    description:
      'Citizens photograph a problem — a broken streetlight, an overflowing drain — and Gemini classifies it, drops it on a live map and tracks it until it closes.',
    year: '2026',
    stack: ['HTML', 'CSS', 'JavaScript', 'Gemini AI', 'Leaflet'],
    image: shotCivic,
    href: 'https://ssambit635-svg.github.io/Civic-report/',
    repo: 'https://github.com/ssambit635-svg/Civic-report.git'
  },
  {
    id: 'weather-sense',
    title: 'Weather Sense',
    kind: 'Data App',
    description:
      'A seven-day forecast, air-quality index and lifestyle scores that tell you whether to carry an umbrella or skip the evening run.',
    year: '2025',
    stack: ['Python', 'Streamlit', 'Open-Meteo API'],
    image: shotWeather,
    href: 'https://weather-sense-pbwmsehcq8etxhy7vufp6i.streamlit.app/',
    repo: 'https://github.com/ssambit635-svg/Weather-sense.git'
  },
  {
    id: 'aws-dashboard',
    title: 'AWS Dashboard',
    kind: 'Cloud Tool',
    description:
      'Lists live EC2 instances, S3 buckets and month-to-date billing, then breaks the spend down by service.',
    year: '2025',
    stack: ['FastAPI', 'React', 'Recharts', 'LocalStack', 'Docker'],
    image: shotAws,
    href: 'https://lnkd.in/dgA4fPCR'
  },
  {
    id: 'password-manager',
    title: 'Password Manager',
    kind: 'Security',
    description:
      'Generate, store and retrieve credentials with AES Fernet encryption and a SHA-256 hashed master password. No cloud, no accounts.',
    year: '2025',
    stack: ['Python', 'cryptography', 'Streamlit'],
    image: shotPassword,
    href: 'https://github.com/ssambit635-svg/password_manager_python.git'
  },
  {
    id: 'portfolio',
    title: 'This Portfolio',
    kind: 'Web Design',
    description: 'The site you are reading, rebuilt from zero.',
    year: '2026',
    stack: ['React', 'TypeScript', 'GSAP', 'Tailwind'],
    image: shotPortfolio,
    href: 'https://github.com/ssambit635-svg/portfolio.site.git'
  }
]

export type Experience = {
  id: string
  org: string
  role: string
  detail: string
  image?: string
}

export const experience: Experience[] = [
  {
    id: 'nist',
    org: 'NIST University',
    role: 'B.Tech CSE · 2025 — 2029',
    detail:
      'Core computer science by day — data structures, operating systems, DBMS, networks — and shipping real products on the side. 8.2 CGPA.'
  },
  {
    id: 'aws',
    org: 'AWS Training',
    role: 'Cloud Essentials',
    detail: 'AWS Foundations: Cloud Essentials — compute, storage, networking and billing fundamentals.',
    image: certAws
  },
  {
    id: 'cisco-py',
    org: 'Cisco NetAcad',
    role: 'Python Essentials 1',
    detail: 'Python fundamentals, data types, control flow and functions — Cisco Networking Academy.',
    image: certPython
  },
  {
    id: 'cisco-cpp',
    org: 'Cisco NetAcad',
    role: 'C++ Essentials',
    detail: 'Object-oriented programming, memory and the STL in C++.',
    image: certCpp
  },
  {
    id: 'cisco-linux',
    org: 'Cisco NetAcad',
    role: 'Linux Unhatched',
    detail: 'Shell, filesystem and permissions — the base layer for everything I deploy.',
    image: certLinux
  },
  {
    id: 'simplilearn',
    org: 'Simplilearn',
    role: 'Cloud Computing',
    detail: 'Cloud service models, deployment models and architecture basics.',
    image: certCloud
  },
  {
    id: 'excelr',
    org: 'ExcelR',
    role: 'Programming in C',
    detail: '30-hour live training on the foundations of programming using C.',
    image: certC
  },
  {
    id: 'dhss',
    org: 'Dhenkanal HSS',
    role: 'Class XII · PCM + CS',
    detail: 'The computer science paper is where this started: first loops, then wondering what happens behind the browser tab. 79.7%.'
  }
]

export const connect = [
  { n: '01', label: 'LinkedIn', href: profile.linkedin },
  { n: '02', label: 'GitHub', href: profile.github },
  { n: '03', label: 'X', href: profile.x },
  { n: '04', label: 'Hashnode', href: profile.hashnode },
  { n: '05', label: 'Discord', href: profile.discord },
  { n: '06', label: 'Avely', href: profile.avely }
] as const

export const footerCols = [
  { title: 'Portfolio', items: [{ label: 'GitHub', href: profile.github }, { label: 'Hashnode', href: profile.hashnode }] },
  { title: 'Social', items: [{ label: 'LinkedIn', href: profile.linkedin }, { label: 'X', href: profile.x }] },
  { title: 'Talk', items: [{ label: 'Discord', href: profile.discord }, { label: 'Avely', href: profile.avely }] }
] as const
