/**
 * Tiny synthesized sound effects — no audio files needed.
 * Everything is generated with the Web Audio API and kept deliberately
 * quiet and short so the site feels responsive, not noisy.
 */

let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!sharedContext) sharedContext = new Ctor()
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
