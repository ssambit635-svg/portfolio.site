// Checks every live project once and writes the result to src/generated/uptime.json.
//
// Runs before the type check, dev server and build, so the Works list shows the
// status from the last build. The scheduled deploy rebuilds the site every day, so
// the status stays current without a server.
//
//   node scripts/check-uptime.mjs              refresh the status now
//   node scripts/check-uptime.mjs --if-missing only when there is no file yet (dev, typecheck)
//
// The check never fails the build: if it cannot run, every project is "unknown".

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { loadModule } from './lib/load-module.mjs'
import { checkUrl } from './lib/uptime-status.mjs'

const OUT = 'src/generated/uptime.json'
const ifMissing = process.argv.includes('--if-missing')

async function exists(path) {
  try {
    await readFile(path)
    return true
  } catch {
    return false
  }
}

if (ifMissing && (await exists(OUT))) {
  console.log('uptime: using the existing status file.')
  process.exit(0)
}

let report
try {
  const { projects } = await loadModule('src/lib/site.ts')
  const live = projects.filter(p => p.status === 'live')
  const results = await Promise.all(
    live.map(async p => ({ id: p.id, title: p.title, ...(await checkUrl(p.href)) }))
  )
  report = { checkedAt: new Date().toISOString(), results }
  for (const r of results) console.log(`uptime: ${r.title.padEnd(16)} ${r.status.padEnd(12)} ${r.code ?? '—'} ${r.ms}ms`)
} catch (err) {
  console.warn(`uptime: could not check projects (${err?.message ?? err}). Marking them not checked.`)
  report = { checkedAt: new Date().toISOString(), results: [] }
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, `${JSON.stringify(report, null, 2)}\n`)
console.log(`uptime: wrote ${OUT} (${report.results.length} projects).`)
