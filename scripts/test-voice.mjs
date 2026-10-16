/**
 * The voice, tested against a browser that behaves like a browser.
 *
 * The mock is not a toy: it reproduces the two things that actually broke him.
 *
 *   1. Autoplay policy. A fresh AudioContext starts `suspended`, and `resume()`
 *      resolves a tick later — so a context read in the same task as the gesture
 *      that created it is *still* suspended. Any gate that insists on `running`
 *      before it hands the context over throws away the first line of every
 *      visit. That is the bug this file exists to prevent.
 *   2. Silence is silent. A context that is running is not the same thing as
 *      sound a person can hear, so the bus is metered and the meter is the only
 *      thing allowed to retire the caption chip.
 *
 * Run: npm run test:voice
 */
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/* ------------------------------------------------------------- the mock */
class Param {
  #value
  #peak
  constructor(value = 0) { this.#value = value; this.#peak = value }
  get value() { return this.#value }
  set value(v) { this.#value = v; if (v > this.#peak) this.#peak = v }
  /** The loudest this parameter ever asked for — an envelope's peak. */
  get peak() { return this.#peak }
  setValueAtTime(v) { this.value = v; return this }
  exponentialRampToValueAtTime(v) { this.value = v; return this }
  linearRampToValueAtTime(v) { this.value = v; return this }
  setTargetAtTime(v) { this.value = v; return this }
  cancelScheduledValues() { return this }
}

class Node {
  constructor(ctx) {
    this.context = ctx
    this.gain = new Param(1)
    this.frequency = new Param(0)
    this.Q = new Param(1)
    this.type = ''
    this.buffer = null
    this.outputs = []
  }
  connect(target) { this.outputs.push(target); return target }
  disconnect() { this.outputs = [] }
  start(t) { this.startTime = t ?? this.context.currentTime; this.started = true }
  stop(t) { this.stopTime = t ?? this.context.currentTime; this.stopped = true }
}

class Osc extends Node {
  constructor(ctx) { super(ctx); this.started = false; this.stopTime = Infinity }
}

class Ctx {
  constructor() {
    this.state = 'suspended'
    this.sampleRate = 48000
    this.currentTime = 0
    this.destination = new Node(this)
    this.oscillators = []
    this.resumeCalls = 0
    this.timer = setInterval(() => { if (this.state === 'running') this.currentTime += 0.05 }, 50)
  }
  resume() {
    this.resumeCalls++
    // Browsers resolve resume() asynchronously: the state flips on a later task.
    return new Promise(resolve => setTimeout(() => { this.state = 'running'; resolve() }, 0))
  }
  suspend() { this.state = 'suspended' }
  close() { clearInterval(this.timer); this.state = 'closed' }
  createGain() { return new Node(this) }
  createOscillator() { const o = new Osc(this); this.oscillators.push(o); return o }
  createBiquadFilter() { return new Node(this) }
  createBufferSource() { return new Node(this) }
  createBuffer(ch, len) {
    return { getChannelData: () => new Float32Array(len), length: len, sampleRate: this.sampleRate }
  }
  createMediaStreamSource() { return { connect() {} } }
  createDynamicsCompressor() {
    const n = new Node(this)
    n.threshold = new Param(0); n.knee = new Param(0); n.ratio = new Param(1)
    n.attack = new Param(0); n.release = new Param(0)
    return n
  }
  createAnalyser() {
    const ctx = this
    const n = new Node(this)
    n.fftSize = 2048
    n.smoothingTimeConstant = 0
    /* The meter: the loudest gain of anything that is sounding right now and can
       actually reach the speakers. A suspended context renders nothing, so it
       reads as silence — which is the whole point of measuring. */
    n.getByteTimeDomainData = out => {
      out.fill(128)
      if (ctx.state !== 'running') return
      let peak = 0
      for (const osc of ctx.oscillators) {
        if (!osc.started) continue
        const from = osc.startTime ?? 0
        const to = osc.stopTime ?? Infinity
        if (ctx.currentTime < from || ctx.currentTime > to) continue
        const gain = reach(osc, ctx.destination)
        if (gain > peak) peak = gain
      }
      const value = Math.min(127, Math.round(peak * 127))
      out[0] = 128 + value
    }
    return n
  }
}

/** The product of every gain between a source and the speakers, or 0. */
function reach(source, destination, seen = new Set()) {
  if (source === destination) return 1
  if (seen.has(source)) return 0
  seen.add(source)
  for (const out of source.outputs ?? []) {
    const gain = reach(out, destination, seen)
    if (gain > 0) return gain * (out.gain?.peak ?? 1)
  }
  return 0
}

globalThis.window = { AudioContext: Ctx }
globalThis.AudioContext = Ctx

/* ------------------------------------------------- build the real module */
const dir = mkdtempSync(join(tmpdir(), 'emo-voice-'))
const out = join(dir, 'emoVoice.mjs')
await build({
  entryPoints: [new URL('../src/lib/emoVoice.ts', import.meta.url).pathname],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
})

const { createEmoAudio, createEmoVoice } = await import(out)

/* ---------------------------------------------------------------- tests */
let failed = 0
const check = async (name, fn) => {
  try { await fn(); console.log(`  ok   ${name}`) } catch (error) { failed++; console.log(`  FAIL ${name}\n       ${error.message}`) }
}

console.log('Emo voice')

await check('the provider hands out a context that is still suspended', () => {
  const audio = createEmoAudio()
  const ctx = audio.context()
  assert.ok(ctx, 'a context should exist after the first call')
  assert.equal(ctx.state, 'suspended', 'a fresh context starts suspended, like a real one')
  assert.equal(ctx.resumeCalls, 1, 'the browser should have been asked to wake it')
  audio.close()
})

await check('the first line of a visit is not swallowed', () => {
  const audio = createEmoAudio()
  const voice = createEmoVoice(() => audio.context())
  assert.ok(voice, 'a device with WebAudio gets a voice')
  const ms = voice.say('hi.', 0.19)
  assert.ok(ms > 0, `the first line should be scheduled, got ${ms}ms`)
  assert.ok(audio.context().oscillators.length > 0, 'the sentence should have scheduled notes')
  audio.close()
})

await check('the throat clear is queued behind the same clock', () => {
  const audio = createEmoAudio()
  const voice = createEmoVoice(() => audio.context())
  voice.clear()
  voice.say('yes, that is me', 0.19)
  assert.ok(audio.context().oscillators.length >= 3, 'clear plus sentence should be queued')
  audio.close()
})

await check('a device with no WebAudio gets no voice at all', () => {
  const saved = globalThis.window.AudioContext
  globalThis.window.AudioContext = undefined
  const voice = createEmoVoice(() => null)
  assert.equal(voice, null, 'no WebAudio means no voice — the caption has to carry it')
  globalThis.window.AudioContext = saved
})

await check('the meter reads the voice once the context wakes', async () => {
  const audio = createEmoAudio()
  const voice = createEmoVoice(() => audio.context())
  assert.equal(voice.output(), 0, 'silence before the first line')
  voice.say('hello.', 0.19)
  // The context wakes on a later task and the first syllable is scheduled a
  // little way into its clock, so the meter is polled rather than read once.
  let level = 0
  for (let i = 0; i < 40 && level <= 0.01; i++) {
    await new Promise(r => setTimeout(r, 50))
    level = voice.output()
  }
  assert.ok(level > 0.01, `the meter should see the voice, got ${level}`)
  audio.close()
})

await check('a context that never wakes is still silent', async () => {
  const audio = createEmoAudio()
  const voice = createEmoVoice(() => audio.context())
  voice.say('hello.', 0.19)
  const ctx = audio.context()
  // Model an embed that refuses audio outright: the context never runs.
  ctx.state = 'suspended'
  ctx.resume = () => new Promise(() => {})
  await new Promise(r => setTimeout(r, 120))
  assert.equal(voice.output(), 0, 'a refused context must read as silence')
  audio.close()
})

rmSync(dir, { recursive: true, force: true })

if (failed) {
  console.error(`\n${failed} voice check(s) failed.`)
  process.exit(1)
}
console.log('\nEmo voice: all checks passed.')
