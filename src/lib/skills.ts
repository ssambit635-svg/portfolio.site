/**
 * Every skill mentioned anywhere in this repo — project stacks, certifications
 * and the build toolchain — with its REAL brand mark.
 *
 * Marks come from Simple Icons (CC0 1.0, official brand vectors) and are
 * bundled into the build, so they also work offline / on GitHub Pages.
 * Amazon AWS was dropped from recent Simple Icons releases, so its official
 * vector is vendored at src/assets/logos/aws.svg (Simple Icons v11).
 * The few tools that ship no brand mark in any icon set (Recharts,
 * LocalStack, Open-Meteo) fall back to the real favicon served from the
 * project's own domain, and finally to a typographic wordmark.
 */
import awsRaw from '../assets/logos/aws.svg?raw'

import reactRaw from 'simple-icons/icons/react.svg?raw'
import typescriptRaw from 'simple-icons/icons/typescript.svg?raw'
import javascriptRaw from 'simple-icons/icons/javascript.svg?raw'
import pythonRaw from 'simple-icons/icons/python.svg?raw'
import cRaw from 'simple-icons/icons/c.svg?raw'
import cppRaw from 'simple-icons/icons/cplusplus.svg?raw'
import htmlRaw from 'simple-icons/icons/html5.svg?raw'
import cssRaw from 'simple-icons/icons/css.svg?raw'
import tailwindRaw from 'simple-icons/icons/tailwindcss.svg?raw'
import gsapRaw from 'simple-icons/icons/gsap.svg?raw'
import viteRaw from 'simple-icons/icons/vite.svg?raw'
import nodeRaw from 'simple-icons/icons/nodedotjs.svg?raw'
import gitRaw from 'simple-icons/icons/git.svg?raw'
import githubRaw from 'simple-icons/icons/github.svg?raw'
import dockerRaw from 'simple-icons/icons/docker.svg?raw'
import linuxRaw from 'simple-icons/icons/linux.svg?raw'
import fastapiRaw from 'simple-icons/icons/fastapi.svg?raw'
import streamlitRaw from 'simple-icons/icons/streamlit.svg?raw'
import leafletRaw from 'simple-icons/icons/leaflet.svg?raw'
import geminiRaw from 'simple-icons/icons/googlegemini.svg?raw'
import capacitorRaw from 'simple-icons/icons/capacitor.svg?raw'
import expressRaw from 'simple-icons/icons/express.svg?raw'
import mongodbRaw from 'simple-icons/icons/mongodb.svg?raw'
import sqliteRaw from 'simple-icons/icons/sqlite.svg?raw'
import androidRaw from 'simple-icons/icons/android.svg?raw'

/** Pull every <path d="..."> out of an official Simple Icons SVG. */
const pathsOf = (raw: string): string[] =>
  Array.from(raw.matchAll(/<path[^>]*?\sd="([^"]+)"/g)).map((m) => m[1])

export type Skill = {
  id: string
  label: string
  /** official brand hex — used on hover */
  hex: string
  /** real vector paths (24×24 grid) */
  paths?: string[]
  /** domain used for the real favicon when no icon set ships a mark */
  domain?: string
  /** true when the mark can only be typeset (no official icon exists) */
  wordmark?: boolean
}

export const skills: Skill[] = [
  { id: 'html5', label: 'HTML5', hex: '#E34F26', paths: pathsOf(htmlRaw) },
  { id: 'css3', label: 'CSS3', hex: '#663399', paths: pathsOf(cssRaw) },
  { id: 'javascript', label: 'JavaScript', hex: '#F7DF1E', paths: pathsOf(javascriptRaw) },
  { id: 'typescript', label: 'TypeScript', hex: '#3178C6', paths: pathsOf(typescriptRaw) },
  { id: 'python', label: 'Python', hex: '#3776AB', paths: pathsOf(pythonRaw) },
  { id: 'c', label: 'C', hex: '#A8B9CC', paths: pathsOf(cRaw) },
  { id: 'cpp', label: 'C++', hex: '#00599C', paths: pathsOf(cppRaw) },
  { id: 'react', label: 'React', hex: '#61DAFB', paths: pathsOf(reactRaw) },
  { id: 'tailwind', label: 'Tailwind CSS', hex: '#06B6D4', paths: pathsOf(tailwindRaw) },
  { id: 'gsap', label: 'GSAP', hex: '#0AE448', paths: pathsOf(gsapRaw) },
  { id: 'vite', label: 'Vite', hex: '#9135FF', paths: pathsOf(viteRaw) },
  { id: 'capacitor', label: 'Capacitor', hex: '#119EFF', paths: pathsOf(capacitorRaw) },
  { id: 'node', label: 'Node.js', hex: '#5FA04E', paths: pathsOf(nodeRaw) },
  { id: 'express', label: 'Express', hex: '#0A0A0A', paths: pathsOf(expressRaw) },
  { id: 'fastapi', label: 'FastAPI', hex: '#009688', paths: pathsOf(fastapiRaw) },
  { id: 'streamlit', label: 'Streamlit', hex: '#FF4B4B', paths: pathsOf(streamlitRaw) },
  { id: 'mongodb', label: 'MongoDB', hex: '#47A248', paths: pathsOf(mongodbRaw) },
  { id: 'sqlite', label: 'SQLite', hex: '#003B57', paths: pathsOf(sqliteRaw) },
  { id: 'recharts', label: 'Recharts', hex: '#8884D8', domain: 'recharts.org' },
  { id: 'leaflet', label: 'Leaflet', hex: '#199900', paths: pathsOf(leafletRaw) },
  { id: 'gemini', label: 'Gemini AI', hex: '#8E75B2', paths: pathsOf(geminiRaw) },
  { id: 'openmeteo', label: 'Open-Meteo', hex: '#1E88E5', domain: 'open-meteo.com' },
  { id: 'aws', label: 'AWS', hex: '#FF9900', paths: pathsOf(awsRaw) },
  { id: 'docker', label: 'Docker', hex: '#2496ED', paths: pathsOf(dockerRaw) },
  { id: 'localstack', label: 'LocalStack', hex: '#1F7BE5', domain: 'localstack.cloud' },
  { id: 'linux', label: 'Linux', hex: '#FCC624', paths: pathsOf(linuxRaw) },
  { id: 'android', label: 'Android', hex: '#3DDC84', paths: pathsOf(androidRaw) },
  { id: 'git', label: 'Git', hex: '#F03C2E', paths: pathsOf(gitRaw) },
  { id: 'github', label: 'GitHub', hex: '#181717', paths: pathsOf(githubRaw) },
  { id: 'cryptography', label: 'cryptography', hex: '#4B8BBE', wordmark: true }
]

export const skillCount = skills.length
