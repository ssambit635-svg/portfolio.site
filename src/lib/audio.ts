/**
 * Tiny synthesized sound effects — no audio files needed.
 * Everything is generated with the Web Audio API and kept deliberately
 * quiet and short so the site feels responsive, not noisy.
 */

let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    if (!sharedContext) sharedContext = new Ctor()
  } catch {
    return null
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume().catch(() => {})
  }
  return sharedContext
}

/** Short UI click — a filtered square blip that decays in ~45ms. */
export function playClick() {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  osc.type = 'square'
  osc.frequency.setValueAtTime(1900, now)
  osc.frequency.exponentialRampToValueAtTime(640, now + 0.045)

  filter.type = 'lowpass'
  filter.frequency.value = 3200

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)

  osc.connect(filter).connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.06)
}

/**
 * Hover tick — a whisper-quiet triangle ping, pitched a little higher than
 * the click so hovering and pressing feel like two different materials.
 */
export function playHover(pitch = 2600) {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(pitch, now)
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.72, now + 0.05)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.016, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)

  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.08)
}

/**
 * Digital "glitch" burst — a slice of shaped noise swept by a bandpass
 * filter. Used on the entry screen and when sound is enabled.
 */
export function playGlitch(duration = 0.32, volume = 0.32) {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < length; i++) {
    const t = i / length
    const envelope = Math.pow(1 - t, 1.6)
    // Square-ish stepped noise reads more "digital" than pure white noise.
    const step = i % 96 < 48 ? 1 : -1
    data[i] = (Math.random() * 2 - 1) * envelope * step
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.Q.value = 1.4
  bandpass.frequency.setValueAtTime(2800, now)
  bandpass.frequency.exponentialRampToValueAtTime(320, now + duration)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  source.connect(bandpass).connect(gain).connect(ctx.destination)
  source.start(now)
}

/**
 * Soft "whoosh" — filtered noise that swells and drops. Played as the
 * signature doors part and when a section change is scrolled into place.
 */
export function playWhoosh(duration = 0.55, volume = 0.14) {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 0.9
  band.frequency.setValueAtTime(180, now)
  band.frequency.exponentialRampToValueAtTime(1500, now + duration * 0.45)
  band.frequency.exponentialRampToValueAtTime(240, now + duration)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + duration * 0.35)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  source.connect(band).connect(gain).connect(ctx.destination)
  source.start(now)
}

/**
 * Wax-seal stamp — a low thud plus a bright transient, the sound of
 * something being pressed into place.
 */
export function playStamp(volume = 0.2) {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime

  const body = ctx.createOscillator()
  const bodyGain = ctx.createGain()
  body.type = 'sine'
  body.frequency.setValueAtTime(180, now)
  body.frequency.exponentialRampToValueAtTime(52, now + 0.22)
  bodyGain.gain.setValueAtTime(0.0001, now)
  bodyGain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
  body.connect(bodyGain).connect(ctx.destination)
  body.start(now)
  body.stop(now + 0.32)

  const clicker = ctx.createOscillator()
  const clickGain = ctx.createGain()
  clicker.type = 'square'
  clicker.frequency.setValueAtTime(3200, now)
  clicker.frequency.exponentialRampToValueAtTime(900, now + 0.03)
  clickGain.gain.setValueAtTime(volume * 0.35, now)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
  clicker.connect(clickGain).connect(ctx.destination)
  clicker.start(now)
  clicker.stop(now + 0.06)
}

/** Two-note confirmation chime — copy-to-clipboard, form success, unlocks. */
export function playChime() {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [880, 1318.5]

  notes.forEach((freq, i) => {
    const start = now + i * 0.09
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.075, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

/**
 * Pen-on-paper scratch that tracks the signature being written.
 * A short loop of filtered noise whose brightness follows pen speed.
 */
export function createPenScratch() {
  const ctx = getContext()
  if (!ctx) return null

  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * 2)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.6

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 2.2
  band.frequency.value = 2400

  const gain = ctx.createGain()
  gain.gain.value = 0.0001

  source.connect(band).connect(gain).connect(ctx.destination)
  source.start()

  return {
    /** intensity 0..1, speed 0..1 */
    update(intensity: number, speed: number) {
      const now = ctx.currentTime
      gain.gain.setTargetAtTime(0.0001 + intensity * 0.035, now, 0.05)
      band.frequency.setTargetAtTime(1500 + speed * 3200, now, 0.08)
    },
    stop() {
      try {
        gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06)
        window.setTimeout(() => source.stop(), 320)
      } catch {
        /* already stopped */
      }
    }
  }
}
