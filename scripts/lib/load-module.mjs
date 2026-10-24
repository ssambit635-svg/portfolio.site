// Loads a TypeScript module from src/ for the Node scripts (tests and the uptime
// check), so they read the same data the site renders instead of a copy of it.
// esbuild bundles the module; images and other assets become their path strings.

import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const assetLoaders = Object.fromEntries(
  ['.jpg', '.jpeg', '.png', '.webp', '.svg'].map((ext) => [ext, 'text'])
)

export async function loadModule(entry) {
  const dir = await mkdtemp(join(tmpdir(), 'site-module-'))
  const outfile = join(dir, 'bundle.mjs')
  try {
    await build({
      entryPoints: [entry],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile,
      loader: assetLoaders,
      logLevel: 'silent'
    })
    return await import(`${pathToFileURL(outfile).href}?v=${Date.now()}`)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
