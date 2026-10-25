/**
 * Emo's own voice.
 *
 * Real speech where the browser can give it, a formant babble where it cannot: a
 * 9 cm desk robot should talk, and when it cannot, he chirps. Every word becomes
 * syllables, every syllable becomes one voiced blip:
 * a sawtooth at a pentatonic note of his base pitch, shaped by three band-pass
 * "formants" picked from a vowel table so the blips go wa-we-oo instead of
 * beep-beep, with a noise burst at the start of most words for a consonant-ish
 * attack, a glide down into each note and a 6.5 Hz vibrato so no syllable sits
 * perfectly still. Questions climb at the end; statements fall.
 *
 * Real speech comes first: the browser's own speech engine reads each line, with
 * the pitch lifted so it still sounds like him. The babble above is the fallback for
 * a device with no speech engine, or one that refuses to speak. Speech is not an
 * audio file, so nothing ships with it.
 *
 * Nothing here is an asset and nothing is random per boot: the vowel and the note
 * of a syllable come from a hash of its word, so the same sentence always sounds
 * like the same sentence — a voice, not a slot machine.
 *
 * Two things about the plumbing matter more than they look:
 *
 *   - The context is handed out the instant it exists, even while it is still
 *     suspended. `resume()` is asynchronous, so a context asked for inside a
 *     gesture is still `suspended` for a tick — and a voice that refuses to speak
 *     until the clock is running throws away the first line of every visit. A
 *     suspended context still has a clock, and anything scheduled against it
 *     fires the moment it wakes, so a line queued during a gesture is never lost.
 *   - The master bus is metered. `output()` reports the loudest sample actually
 *     leaving the bus, which is the only honest way to answer "did a line come
 *     out of a speaker?" — a context that is running is not the same thing as
 *     sound a person can hear.
 */

/** [F1, F2, F3] in Hz, the classic vowel table, lifted ~12% for a small head. */
const VOWELS: ReadonlyArray<readonly [number, number, number]> = [
  [740, 1930, 2750], // a — "wa"
  [600, 2060, 3000], // e — "we"
  [300, 2560, 3300], // i — "wi"
  [500, 900, 2600], // o — "wo"
  [340, 980, 2500], // u — "woo"
]
/** A pentatonic ladder over his base pitch: robot babble that still sounds tuned. */
const STEPS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]
const BASE = 496

export interface EmoVoice {
  /** Speak a sentence as babble. Returns how long it will take, in ms (0 = silent). */
  say: (text: string, delaySec?: number) => number
  /** The two-note throat-clear he opens with. */
  clear: () => void
  /** Cut him off mid-syllable. */
  stop: () => void
  /** The loudest sample leaving the master bus, 0…1. Zero when he is not speaking. */
  output: () => number
}

const hash = (word: string) => {
  let h = 7
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) & 0xffff
  return h
}
const syllables = (word: string) => {
  const groups = (word.match(/[aeiouy]+/g) ?? []).length
  return Math.max(1, Math.min(4, groups || Math.ceil(word.length / 3)))
}

/**
 * The one audio context he uses, and the rules for handing it out.
 *
 * The browser will not let a context run before a real gesture, and `resume()` is
 * asynchronous — a context created inside a gesture is still `suspended` for a
 * tick. So the context is handed out the moment it exists, and the browser is
 * asked to wake it on every call. A suspended context still has a clock, and
 * anything scheduled against it fires the moment it wakes.
 *
 * Withholding the context until the clock is running is what cost him the first
 * line of every visit: the context was created, the resume was requested, the
 * state was read one tick too early, and the sentence was dropped on the floor.
 */
export interface EmoAudio {
  /** The context, created on demand. Suspended is fine: the clock still holds. */
  context: () => AudioContext | null
  /** The context, but only once it is genuinely running. */
  running: () => AudioContext | null
  /** Ask the browser to wake it. Safe to call at any time. */
  wake: () => void
  /** Close it for good. */
  close: () => void
}

export function createEmoAudio(): EmoAudio {
  let ac: AudioContext | null = null
  const Ctor =
    typeof window !== 'undefined'
      ? (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      : null

  const context = (): AudioContext | null => {
    if (!Ctor) return null
    if (!ac) {
      try {
        ac = new Ctor()
      } catch {
        return null
      }
    }
    if (ac.state === 'suspended') {
      // Older engines return nothing from resume(); a promise that never arrives
      // must not become an unhandled rejection either.
      try {
        void ac.resume()?.catch(() => undefined)
      } catch {
        /* no resume to make */
      }
    }
    return ac.state === 'closed' ? null : ac
  }

  return {
    context,
    running: () => {
      const ctx = context()
      return ctx && ctx.state === 'running' ? ctx : null
    },
    wake: () => {
      void context()
    },
    close: () => {
      const ctx = ac
      ac = null
      try {
        void ctx?.close()
      } catch {
        /* already closed */
      }
    },
  }
}

/**
 * `ac` is a provider, not a context: the browser only allows one after a real
 * gesture, so the voice is built first and wakes up whenever the context does.
 * It may hand back a context that is still suspended — see the note at the top of
 * this file — and it may hand back null, when the device has no WebAudio at all.
 * Then, and only then, his lines have to be read instead of heard.
 */
export function createEmoVoice(ac: () => AudioContext | null): EmoVoice | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  const synth: SpeechSynthesis | null = 'speechSynthesis' in window ? window.speechSynthesis : null
  if (!Ctor && !synth) return null

  /* Real speech first: the browser's own voice reads the line, with his pitch raised
     a little so it still sounds like a small robot. The babble below is only the
     fallback for a device with no speech engine, or one that refuses to speak. */
  let speaking = 0 // id of the utterance that is currently audible, 0 = none
  let utteranceId = 0
  // Hold references so the engine cannot drop a line mid-sentence.
  const queued: SpeechSynthesisUtterance[] = []
  const release = (u: SpeechSynthesisUtterance) => {
    const at = queued.indexOf(u)
    if (at >= 0) queued.splice(at, 1)
  }
  const pickVoice = (): SpeechSynthesisVoice | null => {
    const list = synth?.getVoices() ?? []
    const english = list.filter((v) => /^en/i.test(v.lang))
    return (
      english.find((v) =>
        /female|samantha|zira|aria|jenny|google uk english female/i.test(v.name),
      ) ??
      english[0] ??
      null
    )
  }
  const speakAloud = (text: string, onFail: () => void): number => {
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return 0
    const id = ++utteranceId
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.lang = v?.lang ?? 'en-US'
    u.rate = 1.02
    u.pitch = 1.35
    u.volume = 1
    let started = false
    u.onstart = () => {
      started = true
      speaking = id
    }
    u.onend = () => {
      if (speaking === id) speaking = 0
      release(u)
    }
    u.onerror = (e) => {
      if (speaking === id) speaking = 0
      release(u)
      // A line cut short on purpose is not a failure; anything else before it started is.
      if (!started && e.error !== 'interrupted' && e.error !== 'canceled') onFail()
    }
    queued.push(u)
    try {
      synth.speak(u)
    } catch {
      release(u)
      onFail()
      return 0
    }
    const words = text.split(/\s+/).filter(Boolean).length
    return 300 + words * 390
  }

  let master: GainNode | null = null
  let utter: GainNode | null = null
  let noise: AudioBuffer | null = null
  let meter: AnalyserNode | null = null
  let meterData = new Uint8Array(128)

  const bus = (): GainNode | null => {
    const ctx = ac()
    if (!ctx || ctx.state === 'closed') return null
    if (!master || master.context !== ctx) {
      master = ctx.createGain()
      master.gain.value = 0.15
      /* One bus for everything he says, with a limiter on the end. Three formant
         bands plus a body voice can add up on a long syllable, and a voice that
         clips is a voice that sounds broken rather than loud. */
      let tail: AudioNode = master
      if (typeof ctx.createDynamicsCompressor === 'function') {
        try {
          const comp = ctx.createDynamicsCompressor()
          comp.threshold.value = -14
          comp.knee.value = 10
          comp.ratio.value = 4
          comp.attack.value = 0.004
          comp.release.value = 0.14
          master.connect(comp)
          tail = comp
        } catch {
          /* no compressor: the bus still works, just louder on peaks */
        }
      }
      if (typeof ctx.createAnalyser === 'function') {
        try {
          meter = ctx.createAnalyser()
          meter.fftSize = 256
          meter.smoothingTimeConstant = 0
          meterData = new Uint8Array(meter.fftSize)
          tail.connect(meter)
          tail = meter
        } catch {
          /* no meter: `output()` simply reports silence */
        }
      }
      tail.connect(ctx.destination)
    }
    return master
  }
  const noiseBuf = (ctx: AudioContext) => {
    if (!noise || noise.sampleRate !== ctx.sampleRate) {
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate)
      const ch = noise.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1
    }
    return noise
  }

  const clear = () => {
    if (synth) return // real speech: no throat-clear beep before the words
    const ctx = ac()
    const out = bus()
    if (!ctx || !out) return
    const t = ctx.currentTime
    ;[880, 1320].forEach((hz, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = hz
      const at = t + i * 0.075
      gain.gain.setValueAtTime(0.0002, at)
      gain.gain.exponentialRampToValueAtTime(0.16, at + 0.014)
      gain.gain.exponentialRampToValueAtTime(0.0002, at + 0.062)
      osc.connect(gain).connect(out)
      osc.start(at)
      osc.stop(at + 0.075)
    })
  }

  /** One voiced syllable: pitch glide + vibrato through three formants. */
  const blip = (
    ctx: AudioContext,
    out: GainNode,
    t: number,
    dur: number,
    f0: number,
    v: readonly number[],
  ) => {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(f0 * 1.08, t)
    osc.frequency.exponentialRampToValueAtTime(f0, t + dur * 0.55)
    const vib = ctx.createOscillator()
    vib.frequency.value = 6.5
    const vibDepth = ctx.createGain()
    vibDepth.gain.value = f0 * 0.013
    vib.connect(vibDepth).connect(osc.frequency)

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(0.9, t + 0.014)
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    env.connect(out)

    // Three formants in parallel, louder toward the first: that is the difference
    // between a vowel and a beep.
    const amps = [1, 0.5, 0.18]
    const qs = [7, 10, 11]
    for (let i = 0; i < 3; i++) {
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = v[i] ?? 2000
      bp.Q.value = qs[i] ?? 9
      const fg = ctx.createGain()
      fg.gain.value = amps[i] ?? 0.2
      osc.connect(bp).connect(fg).connect(env)
    }
    /* The body of the voice. A sawtooth's harmonics only line up with a vowel
       table by luck, so on the low notes the three formants can pass almost
       nothing and the syllable comes out as a whisper. This path is the note
       itself — rolled off above 2.2 kHz so it stays a voice and not a hiss —
       and it is what guarantees every syllable has a floor under it. */
    const body = ctx.createBiquadFilter()
    body.type = 'lowpass'
    body.frequency.value = 2200
    body.Q.value = 0.7
    const bodyGain = ctx.createGain()
    bodyGain.gain.value = 0.6
    osc.connect(body).connect(bodyGain).connect(env)
    // A whisper of unfiltered saw, so the blip keeps a robotic edge under the vowel.
    const edge = ctx.createGain()
    edge.gain.value = 0.07
    osc.connect(edge).connect(env)

    osc.start(t)
    osc.stop(t + dur + 0.03)
    vib.start(t)
    vib.stop(t + dur + 0.03)
  }

  /** A consonant-ish attack: a short noise burst through a high band. */
  const tick = (ctx: AudioContext, out: GainNode, t: number, h: number) => {
    const src = ctx.createBufferSource()
    src.buffer = noiseBuf(ctx)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1400 + (h % 5) * 520
    bp.Q.value = 1.1
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(0.22, t + 0.006)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.032)
    src.connect(bp).connect(env).connect(out)
    src.start(t)
    src.stop(t + 0.05)
  }

  const babble = (text: string, delaySec = 0.04) => {
    const ctx = ac()
    const out = bus()
    if (!ctx || !out || ctx.state === 'closed') return 0
    const g = ctx.createGain()
    g.gain.value = 1
    g.connect(out)
    utter = g

    const words = (text.toLowerCase().match(/[a-z0-9']+/g) ?? ['hm']) as string[]
    const question = /\?\s*$/.test(text)
    let t = ctx.currentTime + delaySec
    words.forEach((word, wi) => {
      const h = hash(word)
      const syls = syllables(word)
      for (let s = 0; s < syls; s++) {
        const lastSyl = wi === words.length - 1 && s === syls - 1
        // The tune: a word's syllables walk the ladder from its own hash, and the
        // final syllable carries the sentence — up for a question, home otherwise.
        const step = lastSyl ? (question ? STEPS.length - 1 : 0) : (h + s * 2) % (STEPS.length - 1)
        const f0 = BASE * (STEPS[step] ?? 1) * (1 + ((h % 7) - 3) * 0.004)
        const dur = 0.082 + Math.min(word.length, 7) * 0.006 + (lastSyl ? 0.055 : 0)
        const attack = s === 0 && h % 4 !== 0
        if (attack) tick(ctx, g, t, h)
        blip(
          ctx,
          g,
          t + (attack ? 0.022 : 0),
          dur,
          f0,
          VOWELS[(h + s) % VOWELS.length] ?? VOWELS[0]!,
        )
        t += dur + 0.03
      }
      t += 0.055
    })
    return Math.max(0, (t - ctx.currentTime) * 1000)
  }

  const say = (text: string, delaySec = 0.04) => {
    if (synth) {
      const ms = speakAloud(text, () => {
        babble(text, delaySec)
      })
      if (ms > 0) return ms
    }
    return babble(text, delaySec)
  }

  const stop = () => {
    if (synth) {
      speaking = 0
      queued.length = 0
      try {
        synth.cancel()
      } catch {
        /* nothing to cancel */
      }
    }
    if (!utter) return
    const ctx = utter.context
    const u = utter
    utter = null
    u.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04)
  }

  /** The loudest sample on the bus. The only honest "did he make a sound?" test. */
  const output = () => {
    if (speaking) return 0.4
    if (!meter) return 0
    try {
      meter.getByteTimeDomainData(meterData)
      let peak = 0
      for (let i = 0; i < meterData.length; i++) {
        const v = Math.abs((meterData[i] ?? 128) - 128)
        if (v > peak) peak = v
      }
      return peak / 128
    } catch {
      return 0
    }
  }

  return { say, clear, stop, output }
}
