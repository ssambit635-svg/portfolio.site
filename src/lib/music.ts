/**
 * Generative lo-fi background track — synthesised live with WebAudio.
 *
 * No mp3, no licensing, no network: a 68bpm minor-key loop of warm detuned
 * pads, an eighth-note arpeggio through a feedback delay, a soft kick, brushed
 * hats, sub bass and a vinyl-noise bed. The whole thing is scheduled ahead of
 * the audio clock so it never drifts, and it runs on one AudioContext shared
 * with the UI blips.
 */

const BPM = 68
const STEP = 60 / BPM / 2 // eighth notes
const LOOKAHEAD = 0.4 // seconds scheduled ahead
const TICK = 60 // ms scheduler interval

/** midi → Hz */
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

/** Am7 · Fmaj7 · Cmaj7 · G6 — one bar each */
const CHORDS = [
  { notes: [57, 60, 64, 67], bass: 33 },
  { notes: [53, 57, 60, 64], bass: 29 },
  { notes: [55, 59, 64, 67], bass: 36 },
  { notes: [55, 59, 62, 64], bass: 31 }
]

export type Track = {
  start: () => void
  stop: () => void
  dispose: () => void
  running: () => boolean
}

export function createAmbientTrack(ctx: AudioContext, destination: AudioNode, volume = 0.13): Track {
  // ── graph ────────────────────────────────────────────────────────────────
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(destination)

  // gentle bus compression so the pads never spike
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -22
  comp.knee.value = 22
  comp.ratio.value = 3.5
  comp.attack.value = 0.02
  comp.release.value = 0.32
  comp.connect(master)

  // lo-fi colour: everything melodic runs through a soft lowpass that breathes
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 2400
  tone.Q.value = 0.6
  tone.connect(comp)

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.045
  const lfoAmt = ctx.createGain()
  lfoAmt.gain.value = 700
  lfo.connect(lfoAmt).connect(tone.frequency)
  lfo.start()

  // stereo-ish feedback delay for space
  const delay = ctx.createDelay(1.5)
  delay.delayTime.value = STEP * 1.5 // dotted eighth
  const fb = ctx.createGain()
  fb.gain.value = 0.34
  const damp = ctx.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 1800
  delay.connect(damp).connect(fb).connect(delay)
  const wet = ctx.createGain()
  wet.gain.value = 0.4
  delay.connect(wet).connect(tone)

  // noise buffer reused by hats + vinyl
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1

  // vinyl bed (re-created on every start — a BufferSource plays only once)
  let vinyl: AudioBufferSourceNode | null = null
  const vinylFilt = ctx.createBiquadFilter()
  vinylFilt.type = 'bandpass'
  vinylFilt.frequency.value = 1400
  vinylFilt.Q.value = 0.5
  const vinylGain = ctx.createGain()
  vinylGain.gain.value = 0.014
  vinylFilt.connect(vinylGain).connect(comp)
  const startVinyl = () => {
    if (vinyl) return
    vinyl = ctx.createBufferSource()
    vinyl.buffer = noiseBuf
    vinyl.loop = true
    vinyl.connect(vinylFilt)
    vinyl.start(0, Math.random() * 1.5)
  }
  const stopVinyl = () => {
    if (!vinyl) return
    try {
      vinyl.stop()
    } catch {
      /* already stopped */
    }
    vinyl.disconnect()
    vinyl = null
  }

  // ── voices ───────────────────────────────────────────────────────────────
  const pad = (midi: number, at: number, dur: number, gain: number) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, at)
    g.gain.linearRampToValueAtTime(gain, at + 1.1) // slow swell
    g.gain.setValueAtTime(gain, at + dur - 1.2)
    g.gain.linearRampToValueAtTime(0, at + dur)
    g.connect(tone)
    for (const detune of [-7, 7]) {
      for (const type of ['sawtooth', 'triangle'] as const) {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.value = hz(midi)
        o.detune.value = detune + (Math.random() * 6 - 3)
        const og = ctx.createGain()
        og.gain.value = type === 'sawtooth' ? 0.35 : 0.55
        o.connect(og).connect(g)
        o.start(at)
        o.stop(at + dur + 0.1)
      }
    }
  }

  const pluck = (midi: number, at: number, gain: number) => {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = hz(midi)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, at)
    g.gain.linearRampToValueAtTime(gain, at + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.55)
    o.connect(g)
    g.connect(tone)
    g.connect(delay)
    o.start(at)
    o.stop(at + 0.6)
  }

  const kick = (at: number) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(128, at)
    o.frequency.exponentialRampToValueAtTime(46, at + 0.13)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.linearRampToValueAtTime(0.55, at + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28)
    o.connect(g).connect(comp)
    o.start(at)
    o.stop(at + 0.3)
  }

  const hat = (at: number, gain: number) => {
    const s = ctx.createBufferSource()
    s.buffer = noiseBuf
    s.playbackRate.value = 1.6
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 7200
    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.045)
    s.connect(f).connect(g).connect(comp)
    s.start(at, Math.random() * 1.5)
    s.stop(at + 0.06)
  }

  const bass = (midi: number, at: number, dur: number) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = hz(midi)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, at)
    g.gain.linearRampToValueAtTime(0.32, at + 0.05)
    g.gain.setValueAtTime(0.32, at + dur * 0.6)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    o.connect(g).connect(comp)
    o.start(at)
    o.stop(at + dur + 0.05)
  }

  const crackle = (at: number) => {
    const s = ctx.createBufferSource()
    s.buffer = noiseBuf
    s.playbackRate.value = 0.35
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 2200 + Math.random() * 2600
    f.Q.value = 8
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.05 + Math.random() * 0.05, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03)
    s.connect(f).connect(g).connect(comp)
    s.start(at, Math.random() * 1.5)
    s.stop(at + 0.04)
  }

  // ── scheduler ────────────────────────────────────────────────────────────
  let step = 0
  let nextTime = 0
  let timer: number | null = null
  let started = false

  const scheduleStep = (s: number, at: number) => {
    const bar = Math.floor(s / 8) % CHORDS.length
    const inBar = s % 8
    const chord = CHORDS[bar]

    if (inBar === 0) {
      const dur = STEP * 8
      chord.notes.forEach((n, i) => pad(n + 12, at, dur + 0.4, 0.026 - i * 0.003))
      bass(chord.bass, at, STEP * 5.5)
    }
    if (inBar === 0 || inBar === 6) kick(at)
    if (inBar === 4) bass(chord.bass + 7, at, STEP * 2.5)

    // eighth-note arpeggio, loose and human
    if (Math.random() < 0.72) {
      const n = chord.notes[(s * 3 + (Math.random() < 0.25 ? 1 : 0)) % chord.notes.length]
      const oct = Math.random() < 0.28 ? 24 : 12
      pluck(n + oct, at + (Math.random() - 0.5) * 0.02, 0.05 + Math.random() * 0.03)
    }

    // brushed offbeat hats
    if (inBar % 2 === 1) hat(at, 0.02 + Math.random() * 0.02)
    if (Math.random() < 0.09) crackle(at)
  }

  const pump = () => {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(step, nextTime)
      step = (step + 1) % (8 * CHORDS.length)
      nextTime += STEP
    }
  }

  return {
    running: () => started,
    start() {
      if (started) return
      started = true
      if (ctx.state === 'suspended') void ctx.resume()
      step = 0
      nextTime = ctx.currentTime + 0.12
      startVinyl()
      pump()
      timer = window.setInterval(pump, TICK)
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.4)
    },
    stop() {
      if (!started) return
      started = false
      if (timer !== null) window.clearInterval(timer)
      timer = null
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9)
      window.setTimeout(() => {
        if (!started) stopVinyl()
      }, 1000)
    },
    dispose() {
      if (timer !== null) window.clearInterval(timer)
      timer = null
      started = false
      stopVinyl()
      lfo.stop()
      master.disconnect()
    }
  }
}
