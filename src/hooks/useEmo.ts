import { useEffect, useRef } from 'react'
import { createEmoVoice } from '../lib/emoVoice'

/**
 * Emo's senses.
 *
 * He lives inside the hero photograph, so everything he reacts to is a real
 * signal from the page or the device: the pointer, the hand stroking the top of
 * his head, the keyboard under his nose, the scroll fling, the clipboard, the
 * window being resized, the network dropping, the tab going away, the battery,
 * and (hold Space) the microphone.
 *
 * He speaks now instead of captioning, in a voice of his own: a small formant-babble
 * synthesiser on WebAudio (`src/lib/emoVoice.ts`) — no audio asset, and no dependence
 * on the operating system's speech engine, which was never him and is switched off
 * entirely in some embedded browsers. Every line is still written into a live region,
 * because a device with no WebAudio at all — or a visitor who has hushed him with
 * Escape, or a browser that has not unlocked sound behind a real gesture yet — is
 * a device that needs the words on screen instead. See `data-talk`.
 *
 * He never paints through React. One loop writes numbers as custom properties on
 * his root and flips a single `data-face` attribute, so a pointer move cannot
 * re-render the page. Look lives in emo.css, geometry in lib/emoFace.ts, and the
 * loop stops itself when the hero is off screen or he has nothing left to move.
 *
 * The rule inside: handlers only *record* what the user did; the loop decides
 * what his face does. A pupil that dilates from a pointer event never comes
 * back down.
 */

type Face =
  | 'idle' | 'curious' | 'focused' | 'worried' | 'happy' | 'surprised'
  | 'peek' | 'dizzy' | 'sleep' | 'wake' | 'offline' | 'lowbat' | 'listening' | 'pain'
  | 'purr' | 'grumpy'

type Reaction = { face: Face; ms: number; priority: number; say?: string }

/** A reaction is a face plus a line of copy. Only a louder one may interrupt. */
const TAPS_TO_HURT = 4
const TAP_WINDOW = 1_000
const REACTIONS: Record<string, Reaction> = {
  poke: { face: 'surprised', ms: 950, priority: 8, say: 'hi.' },
  poke2: { face: 'surprised', ms: 950, priority: 8, say: 'that tickles' },
  poke3: { face: 'worried', ms: 1500, priority: 8, say: 'ok ok i am awake' },
  /* Four taps in a second is not a poke any more. Highest priority next to the network
     outage, because a wince that gets interrupted by a joke is not a wince. */
  ouch: { face: 'pain', ms: 1900, priority: 9, say: 'that hurts' },
  name: { face: 'happy', ms: 1700, priority: 7, say: 'yes, that is me' },
  copy: { face: 'happy', ms: 1200, priority: 6, say: 'copied — send it' },
  cut: { face: 'worried', ms: 1200, priority: 6, say: 'you cut my snippet' },
  earthquake: { face: 'dizzy', ms: 750, priority: 6, say: 'easy with the walls' },
  typing: { face: 'worried', ms: 1200, priority: 4, say: 'rough one?' },
  devtools: { face: 'peek', ms: 2800, priority: 5, say: 'i saw nothing' },
  offline: { face: 'offline', ms: 0, priority: 9, say: 'network down — i kept your place' },
  online: { face: 'happy', ms: 1600, priority: 5, say: 'back — nothing dropped' },
  wake: { face: 'wake', ms: 1900, priority: 4, say: 'you came back' },
  fling: { face: 'dizzy', ms: 650, priority: 3 },
  micOn: { face: 'listening', ms: 0, priority: 2, say: 'i am listening' },
  micDenied: { face: 'worried', ms: 2000, priority: 7, say: 'no mic, no problem' },
  /* The head sensor, the way the desk pet he descends from ships it: strokes, not
     taps. Woken by a hand he is grumpy first and pettable again once the grump
     expires; petted past anybody's patience he is grumpy too, with a cooldown. */
  woken: { face: 'grumpy', ms: 2600, priority: 8, say: 'five more minutes…' },
  overpet: { face: 'grumpy', ms: 2400, priority: 7, say: 'ok ok that is enough' },
  afterglow: { face: 'happy', ms: 1500, priority: 5 },
  /* The two states the desk tells him about and he used only to show. */
  lowbat: { face: 'lowbat', ms: 2600, priority: 5, say: 'battery is low' },
  charging: { face: 'happy', ms: 1500, priority: 3, say: 'on the charger' },
}

/** Moods are not reactions: nobody did anything to him. So they get a line only when he
 *  settles into one, only while someone is still standing there, and never over the tail
 *  of a sentence he is already saying. */
const MOOD_LINES: Partial<Record<Face, string>> = {
  sleep: 'i am going to sleep',
  idle: 'still there?',
}
/** Being petted is a conversation, not an event: the first stroke gets a noise, the
 *  third an opinion. The list cycles; `speak` already refuses the same sentence twice
 *  in two minutes, so a long scratching session never becomes a loop. */
const PET_LINES = ['hehe', 'oh that is the spot', 'yes yes right there', 'prrr. yes. prrr']
const LINE_GAP = 120_000

type MicState = 'off' | 'ready' | 'hot' | 'blocked'
/** 'na' means this device has nothing to feel with, so his switch stops offering it. */
type MotionState = 'off' | 'on' | 'na'
type BatteryLike = {
  level: number
  charging: boolean
  addEventListener: (type: string, handler: () => void) => void
  removeEventListener: (type: string, handler: () => void) => void
}

const clamp = (v: number, lo = -1, hi = 1) => (v < lo ? lo : v > hi ? hi : v)
const ease = (cur: number, to: number, k: number, dt: number) => cur + (to - cur) * (1 - Math.exp(-k * dt))
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

export function useEmo() {
  const rootRef = useRef<HTMLDivElement>(null)
  const hitRef = useRef<HTMLButtonElement>(null)
  const lineRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const hit = hitRef.current
    const line = lineRef.current
    if (!root || !hit || !line) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const set = (name: string, value: number) => root.style.setProperty(name, value.toFixed(4))

    /* --- what the loop owns ------------------------------------------------ */
    let gx = 0, gy = 0, tx = 0, ty = 0            // gaze: smoothed, target
    let pop = 0, squint = 0, converge = 0, lean = 0, tilt = 0, drift = 0
    let shut = 0                                  // how far the lids are closed, eased
    let blink = -1, nextBlink = performance.now() + rand(1600, 4000), lidHold = 0
    let wobble = 0, shake = 0, voice = 0
    /* Petting, loop side: `petFor` is how long the current session has been going,
       `petCool` the sulk after being over-petted, `nuzzle` the lift into the hand. */
    let petFor = 0, petOn = 0, petEnd = 0, petCool = 0, petSessions = 0
    let nuzzle = 0, petWas = false, petSpoke = false
    let box = hit.getBoundingClientRect()
    let raf = 0, last = performance.now(), restFrames = 0
    let onScreen = true, hiddenAt = 0, lastInput = performance.now(), scrollY = window.scrollY
    let breath = 0
    let face: Face | '' = '', spoke: Face | '' = ''
    let active: { face: Face; until: number; priority: number } | null = null
    let mic: MicState = 'off'
    let motion: MotionState = 'off'
    let watching = false, tiltAsked = false, micHeld = 0

    /* --- what the handlers record ----------------------------------------- */
    let pointerDist = 3, pointerTilt = 0, orientX = 0, orientY = 0
    /* A hand over the top of his head: strokes accumulate as heat (the loop lets it
       cool), and `petX` is where on his head the hand is, -1 left to 1 right. */
    let handOnHead = false, handWas = false, petHeat = 0, petX = 0, petLastX = NaN
    const keys: number[] = []
    const backs: number[] = []
    let typed = ''
    let pokes = Number(sessionStorage.getItem('emo-pokes') ?? 0)

    const show = (next: Face | '') => {
      if (next === face) return
      face = next
      if (next === '') delete root.dataset.face
      else root.dataset.face = next
    }
    /* --- his voice, and the gates on it --------------------------------------
     * Nothing ships for this: every sound is oscillators and filters on WebAudio,
     * built in src/lib/emoVoice.ts. Three things gate it, and all three are the
     * reason robot voices get uninstalled:
     *   - no speech before the first real gesture (and no device allows it anyway);
     *   - never while the mic is under a finger, or he would interview himself;
     *   - never the same sentence twice in two minutes, or a stuck key becomes a loop.
     */
    let muted = sessionStorage.getItem('emo-muted') === '1'
    // He is mute until the page has a real interaction behind it, which is also the only
    // moment a browser would let him make a sound at all.
    let activated = false, talking = false, lastLine = '', lastLineAt = 0, talkTimer = 0
    /* One context for all of his sounds: the voice, the purr and the mic's analyser. He
     * cannot be given a context before a gesture, so it is made on demand, not on mount. */
    let ac: AudioContext | null = null
    const ensureAc = (): AudioContext | null => {
      if (!ac) {
        const Ctor = window.AudioContext
          ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!Ctor) return null
        try { ac = new Ctor() } catch { return null }
      }
      if (ac.state === 'suspended') void ac.resume()
      return ac.state === 'running' ? ac : null
    }
    /* --- his voice ----------------------------------------------------------
     * A voice of his own: a small formant-babble synthesiser on WebAudio
     * (src/lib/emoVoice.ts), not the operating system's speech engine. The OS
     * voice was never him — a calm adult reading sentences — and in embedded
     * previews and stripped-down browsers it is switched off entirely, which is
     * exactly how he once lost his voice mid-visit and had to caption himself.
     * `emoVoice` is null only on a device with no WebAudio at all; then, and only
     * then, his lines are read instead of heard. */
    const emoVoice = createEmoVoice(ensureAc)
    const canTalk = () => !!emoVoice && !muted && activated && !document.hidden && mic !== 'hot'
    /* Sound is a promise the browser keeps only after a real gesture — and in some
       embedded frames, not even then. So `soundOk` is not "has WebAudio", it is "a
       line has actually come out of the speaker": until then the words stay on
       screen, because a robot that is silent *and* wordless is a robot that looks
       broken, which is exactly the bug this fixes. The first spoken line flips the
       chip off for the rest of the visit. */
    let soundOk = false
    let soundHinted = false
    /** `voice` means the line is only for a screen reader; anything else shows it. */
    const paintTalk = () => { root.dataset.talk = muted ? 'off' : soundOk ? 'voice' : 'text' }
    paintTalk()
    const setMuted = (next: boolean) => {
      muted = next
      sessionStorage.setItem('emo-muted', next ? '1' : '0')
      if (next) { emoVoice?.stop(); stopPurr() }
      paintTalk()
      say(next ? 'i will write it down instead' : 'good — i can talk again', 2400)
    }
    /* --- his purr -----------------------------------------------------------
     * The one sound of his that is not a sentence: a sawtooth an octave under
     * conversation, low-passed into a rumble and chopped by a 21 Hz LFO — roughly
     * where a cat's purr sits, and close enough for a 9 cm robot. Same gates as
     * his voice: nothing before the first real gesture (a hover is not one, so a
     * visitor who has only petted him gets the face and the lean, and the rumble
     * joins the moment anything is clicked), nothing while muted, and nothing
     * while the mic is open or he would purr into his own ear. */
    let purr: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null
    const startPurr = () => {
      if (purr || !activated || muted || mic === 'hot') return
      const ctx = ensureAc()
      if (!ctx) return
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 44
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 150
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.3)
      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 21
      const depth = ctx.createGain()
      depth.gain.value = 0.02
      osc.connect(lp).connect(gain).connect(ctx.destination)
      lfo.connect(depth).connect(gain.gain)
      osc.start()
      lfo.start()
      purr = { osc, lfo, gain }
    }
    const stopPurr = () => {
      if (!purr) return
      const { osc, lfo, gain } = purr
      purr = null
      const t = ac?.currentTime ?? 0
      gain.gain.cancelScheduledValues(t)
      gain.gain.setTargetAtTime(0.0001, t, 0.12)
      osc.stop(t + 0.6)
      lfo.stop(t + 0.6)
    }

    const speak = (text: string) => {
      if (!emoVoice || !canTalk()) return
      const now = performance.now()
      if (text === lastLine && now - lastLineAt < LINE_GAP) return
      lastLine = text
      lastLineAt = now
      emoVoice.stop()                      // he says one thing at a time
      emoVoice.clear()                     // the two-note throat-clear first
      const ms = emoVoice.say(text, 0.19)  // ...and the sentence after it, not over it
      talking = ms > 0
      // The first line that actually reaches a speaker is the moment the caption
      // chip has earned its retirement; a context that stays suspended (an embed
      // that blocks audio entirely) keeps the words on screen instead.
      if ((ms > 0) !== soundOk) { soundOk = ms > 0; paintTalk() }
      window.clearTimeout(talkTimer)
      talkTimer = window.setTimeout(() => { talking = false }, ms + 120)
    }

    let hintTimer = 0
    const say = (text: string, ms = 2600) => {
      // The words always go in the live region: they are the accessible name of the
      // moment, whether or not anybody hears them.
      line.textContent = text
      root.dataset.said = '1'
      speak(text)
      // Timed on the clock, not on frames: the loop may well stop before the line is
      // due to leave, and a caption that outlives its own joke is worse than none.
      window.clearTimeout(hintTimer)
      hintTimer = window.setTimeout(() => { delete root.dataset.said; line.textContent = '' }, ms)
      start()
    }
    const look = (x: number, y: number) => { tx = clamp(x); ty = clamp(y) }
    /** Where he is when nothing is asking for his attention. */
    const mood = (): Face => {
      if (navigator.onLine === false) return 'offline'
      const quiet = performance.now() - lastInput
      const hour = new Date().getHours()
      // He keeps desk hours — but not in front of somebody who is standing right there.
      // A robot that dozes while you are poking him reads as broken eyes, not as charm,
      // so at night he only dozes once the desk has genuinely gone quiet; in the day he
      // owes four minutes of stillness before the same nap.
      const night = hour < 5 || hour >= 23
      if (quiet > 240_000 || (night && quiet > 30_000)) return 'sleep'
      if (quiet > 25_000) return 'idle'
      return 'curious'
    }
    const fire = (key: string) => {
      const reaction = REACTIONS[key]
      if (!reaction) return
      if (active && active.priority > reaction.priority && performance.now() < active.until) return
      active = {
        face: reaction.face,
        until: reaction.ms ? performance.now() + reaction.ms : Infinity,
        priority: reaction.priority,
      }
      if (key === 'earthquake') shake = 1
      if (key === 'fling') wobble = 1
      // A flinch from the shoulders, not a jump: the tremor decays in the loop.
      if (key === 'ouch') { wobble = 1.35; shake = 0.75; lidHold = performance.now() }
      if (reaction.say) say(reaction.say)
      start()
    }
    /* --- pointer: he watches what you watch -------------------------------- */
    // The frame measures him at most once per animation frame: a rect read inside a
    // scroll handler would force layout on every scroll event, on the main thread,
    // while the page is already busy painting the hero.
    let measuredY = NaN
    const measure = () => {
      box = hit.getBoundingClientRect()
      measuredY = window.scrollY
    }
    const onPointerMove = (event: PointerEvent) => {
      lastInput = performance.now()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height * 0.44
      const dx = event.clientX - cx
      const dy = event.clientY - cy
      const span = Math.max(box.width * 3.2, 260)
      look((dx / span) * 2.4, (dy / (span * 0.72)) * 2.4)
      pointerDist = Math.hypot(dx, dy) / (box.width || 1) - 0.5
      pointerTilt = clamp(dx / (window.innerWidth * 0.5))
      /* A hand that keeps moving over the top of his head is petting him — the web's
         version of the touch sensor the real desk robot ships. Only the top of the
         head counts, because his face is not a petting zone; a single pass through
         on the way to a link is one stroke's worth of heat, which cools again in the
         loop, so crossing him is not petting him. */
      const overHead =
        event.clientX > box.left && event.clientX < box.right &&
        event.clientY > box.top && event.clientY < box.top + box.height * 0.72
      handOnHead = overHead
      if (overHead && handWas && Number.isFinite(petLastX) && performance.now() > petCool) {
        petHeat = Math.min(1.6, petHeat + (Math.abs(event.clientX - petLastX) / (box.width || 1)) * 1.35)
        petX = clamp(((event.clientX - box.left) / (box.width || 1) - 0.5) * 2)
      }
      handWas = overHead
      petLastX = event.clientX
      start()
    }
    const onPointerOver = (event: Event) => {
      const node = (event.target as Element | null)?.closest?.('a,button,[data-emo-look]')
      if (!node || node.closest('.emo')) return
      const r = node.getBoundingClientRect()
      if (!r.width) return
      const cx = box.left + box.width / 2
      const cy = box.top + box.height * 0.44
      look(((r.left + r.width / 2 - cx) / box.width) * 2.2, ((r.top + r.height / 2 - cy) / box.height) * 1.5)
      lastInput = performance.now()
      pointerDist = 0.4 // leaning on a link counts as standing close
      start()
    }
    // The escalation is about *rate*, not about how many times he has ever been
    // touched: four taps inside a second is a different gesture from four taps spread
    // over a visit, and only the first one hurts.
    const taps: number[] = []
    const poke = () => {
      const now = performance.now()
      // A tap on a phone is a pointerdown with nothing before it — no hover, no move —
      // so this is the only place some visitors ever "arrive".
      lastInput = now
      pokes += 1
      sessionStorage.setItem('emo-pokes', String(pokes))
      taps.push(now)
      while (taps.length && now - (taps[0] ?? 0) > TAP_WINDOW) taps.shift()
      if (taps.length >= TAPS_TO_HURT) {
        taps.length = 0
        fire('ouch')
      } else {
        fire(pokes >= 4 ? 'poke3' : pokes === 2 ? 'poke2' : 'poke')
      }
      pointerTilt = -0.9
    }
    const onPointerDown = poke
    const onClick = (event: MouseEvent) => {
      // A press has already poked him; this is Enter or Space on the focused button.
      if (event.detail === 0) poke()
    }

    /* --- the keyboard under his nose -------------------------------------- */
    const inField = (target: EventTarget | null) => {
      const el = target as HTMLElement | null
      return /^(input|textarea|select)$/i.test(el?.tagName ?? '') || el?.isContentEditable === true
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const field = inField(event.target)
      if (event.key === 'Backspace') {
        backs.push(event.timeStamp)
        while (backs.length && event.timeStamp - (backs[0] ?? 0) > 1300) backs.shift()
        if (backs.length >= 4) fire('typing')
        return
      }
      if (event.key === ' ') {
        // Space is his only switch: nothing is visible, so nothing has to be clicked.
        if (!field && mic !== 'blocked') { event.preventDefault(); tapMic(true) }
        return
      }
      if (event.key === 'Escape') {
        if (!field && mic !== 'hot') { event.preventDefault(); setMuted(!muted) }
        return
      }
      if (event.key.length !== 1 || field) return
      lastInput = performance.now()
      keys.push(event.timeStamp)
      while (keys.length && event.timeStamp - (keys[0] ?? 0) > 1600) keys.shift()
      typed = (typed + event.key.toLowerCase()).slice(-6)
      if (typed.endsWith('emo')) fire('name')
      start()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ' && mic === 'hot') { event.preventDefault(); tapMic(false) }
    }

    /* --- the rest of the room -------------------------------------------- */
    const onCopy = (event: Event) => { lastInput = performance.now(); fire(event.type === 'cut' ? 'cut' : 'copy') }
    let width = window.innerWidth, height = window.innerHeight, resizeAt = 0
    const onResize = () => {
      if (window.innerWidth === width && window.innerHeight === height) return
      width = window.innerWidth; height = window.innerHeight
      measuredY = NaN
      window.clearTimeout(resizeAt)
      resizeAt = window.setTimeout(() => fire('earthquake'), 120)
    }
    const onVisibility = () => {
      if (document.hidden) { hiddenAt = performance.now(); onScreen = false; stop(); closeMic() }
      else {
        onScreen = true
        if (performance.now() - hiddenAt > 20_000) fire('wake')
        start()
      }
    }
    const onScroll = () => { lastInput = performance.now(); start() }
    const onNetwork = () => fire(navigator.onLine === false ? 'offline' : 'online')
    /** Devtools opening is his one rude joke. A heuristic, and deliberately only
     *  on the transition — a panel already open on load would accuse everyone. */
    let devTools = -1
    const devCheck = window.setInterval(() => {
      if (!onScreen || document.hidden) return
      const gap = Math.max(window.outerWidth - window.innerWidth, (window.outerHeight - window.innerHeight) * 0.55)
      const open = window.outerWidth > 0 && gap > 168
      if (devTools === -1) { devTools = open ? 1 : 0; return }
      if (open && devTools === 0) { devTools = 1; fire('devtools') }
      else if (!open && devTools === 1) devTools = 0
    }, 1500)

    /* --- device: battery, tilt, microphone -------------------------------- */
    let battery: BatteryLike | null = null
    let power = ''
    const paintPower = () => {
      if (!battery) return
      const next: 'charging' | 'low' | 'on' = battery.charging ? 'charging' : battery.level <= 0.2 ? 'low' : 'on'
      if (next === power) return
      // Only the transitions he can react to, and never the first one: arriving at a
      // dead battery should not buy you a comment about your battery.
      if (power && next === 'low') fire('lowbat')
      if (power && next === 'charging') fire('charging')
      power = next
      root.dataset.power = next
    }
    const onPower = () => { paintPower() }
    const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryLike> }).getBattery
    void getBattery?.call(navigator).then(found => {
      battery = found
      found.addEventListener('levelchange', onPower)
      found.addEventListener('chargingchange', onPower)
      paintPower()
    }).catch(() => { /* no Battery Status API: no charging bolt for him */ })

    /* --- the tilt of the device, when it has one --------------------------- */
    const stopTilt = () => {
      watching = false
      orientX = 0
      orientY = 0
      window.removeEventListener('deviceorientation', onTilt)
    }
    /** Most machines have no accelerometer, so this is the quiet path: saying "no tilt
     *  sensor" on somebody's first click is a stranger telling them they own a laptop. */
    const noSensor = () => {
      stopTilt()
      motion = 'na'
    }
    // A phone answers many times a second, so only a change on the desk is worth
    // waking him for; otherwise he would never settle into a blink.
    const onTilt = (event: DeviceOrientationEvent) => {
      if (!watching) return
      // Browsers with no sensor fire the event with nothing in it.
      if (event.alpha === null && event.beta === null && event.gamma === null) {
        noSensor()
        return
      }
      const x = clamp((event.gamma ?? 0) / 32)
      const y = clamp(((event.beta ?? 45) - 45) / 55)
      if (Math.abs(x - orientX) + Math.abs(y - orientY) < 0.02) return
      orientX = x
      orientY = y
      start()
    }
    const armTilt = () => {
      const sensor = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent
      const bind = () => {
        watching = true
        motion = 'on'
        window.addEventListener('deviceorientation', onTilt, { passive: true })
      }
      if (!sensor) {
        noSensor()
        return
      }
      // iOS asks first; everywhere else the listener is the ask.
      if (!sensor.requestPermission) {
        bind()
        return
      }
      void sensor
        .requestPermission()
        .then(state => (state === 'granted' ? bind() : noSensor()))
        .catch(noSensor)
    }

    let stream: MediaStream | null = null
    let analyser: AnalyserNode | null = null
    let samples = new Uint8Array(1024)
    const closeMic = () => {
      stream?.getTracks().forEach(track => track.stop())
      stream = null
      analyser = null
      if (mic === 'hot') {
        mic = 'ready'
        breathe()
        // The reassurance only needs saying once, and it is the line the whole
        // feature needs to exist for.
        if (micHeld === 1) say('done — none of that left this device', 3000)
      }
      if (active?.priority === REACTIONS.micOn.priority) active = null
    }
    /** Tracks are open only while Space is held — the OS record light goes off the
     *  moment you let go, and nothing is ever buffered, stored or sent. */
    const openMic = async () => {
      if (stream || mic === 'blocked' || !navigator.mediaDevices?.getUserMedia) {
        if (!navigator.mediaDevices?.getUserMedia) mic = 'blocked'
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        })
      } catch {
        mic = 'blocked'
        fire('micDenied')
        return
      }
      const ctx = ensureAc()
      if (!ctx) { mic = 'blocked'; return }
      analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.55
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      samples = new Uint8Array(analyser.fftSize)
      mic = 'hot'
      micHeld += 1
      stopPurr()                    // he will not purr into his own microphone
      emoVoice?.stop()              // ...or talk over it
      fire('micOn')
    }
    /* With no switch to press, holding Space is the entire feature: it asks, opens and
     * releases. A denied or absent mic is remembered for the visit, so he never nags. */
    const tapMic = (down: boolean) => {
      if (down) { void openMic(); return }
      if (mic === 'hot') { closeMic(); return }
      // A tap of Space with nothing held still means "i wanted the mic": say what is up.
      if (mic === 'ready') say('hold it down, do not tap', 2200)
    }

    /* --- the loop, mostly asleep ------------------------------------------ */
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 24)
      last = now
      if (Math.abs(window.scrollY - measuredY) > 2) measure()
      // On a narrow phone the full-bleed crop leaves him out of frame. Then there
      // is nothing to look at, and nothing to spend a frame on.
      const shownWidth = Math.min(box.right, window.innerWidth) - Math.max(box.left, 0)
      const shownHeight = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0)
      if (shownWidth * shownHeight < box.width * box.height * 0.35) {
        root.dataset.off = '1'
        closeMic()
        stop()
        return
      }
      if (root.dataset.off === '1') delete root.dataset.off
      const idle = now - lastInput
      if (!reduce && idle > 12_000) {
        // Nobody to look at: he turns to his own monitor, slowly, and wanders.
        const wander = Math.sin(now / 5200) * 0.35
        tx = ease(tx, 0.62 + wander * 0.3, 1.4, dt)
        ty = ease(ty, -0.18, 1.4, dt)
      }
      // Typing has to expire, or the last busy minute would live on his face.
      while (keys.length && now - (keys[0] ?? 0) > 1600) keys.shift()
      const scrollV = (window.scrollY - scrollY) / Math.max(dt, 0.001)
      scrollY = window.scrollY
      if (Math.abs(scrollV) > 2400) fire('fling')

      if (!reduce) {
        // A wince holds its eyes shut: a blink scheduled during it would un-squash the
        // squeeze halfway through, which reads as a wink, not as pain.
        if (blink < 0 && now > nextBlink && now > lidHold + 1900) blink = 0
        if (blink >= 0) {
          blink += dt / (face === 'sleep' ? 0.46 : 0.16)
          if (blink >= 1) { blink = -1; nextBlink = now + rand(2200, 6400) * (idle > 40_000 ? 0.35 : 1) }
        }
        wobble *= Math.exp(-5.4 * dt)
        shake *= Math.exp(-4.2 * dt)
        drift = ease(drift, Math.sin(now / 1700) * (idle > 25_000 ? 1 : 0.25), 2, dt)
      }
      if (analyser) {
        analyser.getByteTimeDomainData(samples)
        let sum = 0
        for (let i = 0; i < samples.length; i++) { const v = (samples[i] ?? 128) - 128; sum += v * v }
        voice = ease(voice, clamp(Math.sqrt(sum / samples.length) / 30), 13, dt)
      } else voice = ease(voice, 0, 7, dt)

      const asleep = face === 'sleep'
      const near = clamp(1 - pointerDist / 1.2, 0, 1)
      const fast = keys.length >= 11 ? 1 : keys.length >= 7 ? 0.5 : 0
      gx = ease(gx, clamp(tx + orientX * 0.5 + drift * 0.3), 11, dt)
      gy = ease(gy, clamp(ty + orientY * 0.4 + clamp(scrollV / 5200) * 0.25), 11, dt)
      pop = ease(pop, asleep ? 0.04 : 0.5 * near * near + voice * 0.4, 9, dt)
      converge = ease(converge, 0.35 * near * near, 9, dt)
      lean = ease(lean, near, 6, dt)
      // A hand on the head pulls the head with it: the lean toward the hand and the
      // little lift into it are the whole difference between being petted and being
      // watched. One frame of lag on `petWas` is one frame of ease on a 5 Hz target.
      tilt = ease(tilt, pointerTilt * 1.4 * near + (petWas ? petX * 0.8 : 0), 5, dt)
      nuzzle = ease(nuzzle, petWas ? 1 : 0, 6, dt)
      // Eyes that hold perfectly still are a screensaver. Real ones never stop
      // drifting by a pixel or two, so that jitter is added on the way out — it is
      // not part of the target, or he would never be able to settle and stop.
      const saccade = Math.sin(now / 780) * 0.62 + Math.sin(now / 337 + 1.7) * 0.38
      squint = ease(squint, fast, 9, dt)
      // Lids are a door, not a switch: dozing closes them over about a second and waking
      // opens them the same way, so the sleep face never snaps onto him — and a poke at
      // night gets a robot opening his eyes, not a screenshot flipping.
      shut = reduce ? (asleep ? 0.86 : 0) : ease(shut, asleep ? 0.86 : 0, asleep ? 2.2 : 3.2, dt)
      // Awake, a blink is a full close. Asleep it is only a flutter on top of the closed
      // lids: a sleeper whose eyes snap wide open every few seconds looks broken, not
      // tired, which is exactly the tell this face used to have.
      const flutter = blink >= 0 ? Math.sin(Math.PI * blink) : 0
      const lid = asleep ? Math.min(1, shut + flutter * 0.14) : Math.max(shut, flutter)

      if (active && now > active.until) active = null
      /* --- a hand on his head: petted, like the desk pet he descends from ---
       * Handlers only recorded strokes; here they become a face. Petting is a
       * rolling reaction — it lasts as long as the strokes keep landing — so it
       * assigns `active` itself every frame, but never over a poke, a wince or a
       * grump, which all outrank it. */
      petHeat = Math.max(0, petHeat - dt * 1.1)
      const petting = handOnHead && petHeat > 0.4 && now > petCool
      if (petting && !petWas) { petOn = now; petFor = 0 }
      if (petting) {
        petFor += dt
        if (asleep) { fire('woken'); petHeat = 0; petFor = 0 }
        else if (petFor > 7) { fire('overpet'); petCool = now + 6000; petHeat = 0; petFor = 0 }
        else {
          if (!active || active.priority < 7) active = { face: 'purr', until: now + 420, priority: 6 }
          if (!petSpoke) {
            petSpoke = true
            if (!activated && !soundHinted) {
              // A hover can never unlock a browser's audio — only a press or a key
              // can — so the first hand that pets him without one gets told, in the
              // one medium he still has before sound: the chip.
              soundHinted = true
              say('poke me once — my sound needs a click', 2600)
            } else say(PET_LINES[petSessions++ % PET_LINES.length], 2200)
          }
          startPurr()
        }
      } else {
        stopPurr()
        if (petWas) petEnd = now
        if (petWas && now - petOn > 1200 && now > petCool) fire('afterglow')
        // The next session earns a fresh line only once the hand has actually been
        // off him for a moment, or one long scratch with pauses reads as many pets.
        if (petSpoke && now - petEnd > 2600) petSpoke = false
      }
      petWas = petting

      const next = active ? active.face : mood()
      show(next)
      // A mood is not an event, so it gets one line only on the way in, only while
      // somebody is still standing at the keyboard, and never over his own sentence.
      if (next !== spoke) {
        spoke = next
        const moodLine = active ? undefined : MOOD_LINES[next]
        if (moodLine && !talking && idle < 60_000) say(moodLine, 2400)
      }

      set('--emo-gx', clamp(gx + saccade * 0.3)); set('--emo-gy', clamp(gy + saccade * 0.12))
      set('--emo-lid', lid); set('--emo-pop', pop)
      set('--emo-squint', squint); set('--emo-converge', converge)
      set('--emo-lean', reduce ? 0 : lean); set('--emo-tilt', reduce ? 0 : tilt)
      set('--emo-nuzzle', reduce ? 0 : nuzzle)
      // The rumble made visible: a slow brightness pulse on the lids while the hand
      // is on him, at nothing like the 21 Hz of the sound — light that fast would be
      // a strobe, and a strobe on somebody's desk is a seizure risk, not a purr.
      set('--emo-purr', reduce || !petting ? 0 : 0.5 + 0.5 * Math.sin(now / 150))
      set('--emo-voice', voice)
      set('--emo-wobble', reduce ? 0 : Math.sin(now / 44) * wobble)
      set('--emo-shake', reduce ? 0 : Math.sin(now / 19) * shake)

      const settled =
        Math.abs(gx - tx) + Math.abs(gy - ty) + Math.abs(pop - 0.5 * near * near) + lid + nuzzle +
        voice + wobble + shake < 0.014
      restFrames = settled && !active && !analyser ? restFrames + 1 : 0
      if (restFrames > 110) { restFrames = 0; stop(); breathe(); return }
      raf = onScreen && !document.hidden ? requestAnimationFrame(frame) : 0
    }
    function start() { if (!raf && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    /**
     * Settled means stopped, not dead. While nobody is at the keyboard he wakes for a
     * couple of seconds every so often — that is where the blinking, the wandering off
     * to his own monitor and the late-night sleep actually live, since the moment he
     * stops, the loop that would have shown them is gone.
     */
    const breathe = () => {
      window.clearTimeout(breath)
      if (performance.now() - lastInput < 10_000 || mic === 'hot') return
      breath = window.setTimeout(() => { restFrames = 0; start() }, 4200)
    }
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0 }

    /* --- only while he is on screen --------------------------------------- */
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
      if (onScreen) start()
      else { stop(); closeMic() }
    }, { threshold: 0 })
    seen.observe(root.closest('.hero') ?? root)

    /* Nothing he says or asks for happens before a real interaction, and the tilt sensor
     * on iOS can only be asked for inside one. `once` is not enough: a key that repeats
     * would re-ask, so it is disarmed here. */
    const onGesture = () => {
      if (activated) return
      activated = true
      window.removeEventListener('pointerdown', onGesture, true)
      window.removeEventListener('keydown', onGesture, true)
      if (!tiltAsked && motion !== 'on') { tiltAsked = true; armTilt() }
    }
    window.addEventListener('pointerdown', onGesture, { capture: true, passive: true })
    window.addEventListener('keydown', onGesture, { capture: true })

    hit.addEventListener('pointerdown', onPointerDown)
    hit.addEventListener('click', onClick)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('copy', onCopy)
    window.addEventListener('cut', onCopy)
    window.addEventListener('online', onNetwork)
    window.addEventListener('offline', onNetwork)
    document.addEventListener('visibilitychange', onVisibility)
    start()

    return () => {
      stop()
      window.clearTimeout(breath)
      window.clearTimeout(hintTimer)
      window.clearInterval(devCheck)
      window.clearTimeout(resizeAt)
      seen.disconnect()
      hit.removeEventListener('pointerdown', onPointerDown)
      hit.removeEventListener('click', onClick)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('copy', onCopy)
      window.removeEventListener('cut', onCopy)
      window.removeEventListener('online', onNetwork)
      window.removeEventListener('offline', onNetwork)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('deviceorientation', onTilt)
      window.removeEventListener('pointerdown', onGesture, true)
      window.removeEventListener('keydown', onGesture, true)
      battery?.removeEventListener('levelchange', onPower)
      battery?.removeEventListener('chargingchange', onPower)
      stopTilt()
      stream?.getTracks().forEach(track => track.stop())
      // A queued sentence outliving the component is a voice with no body, and a
      // purr outliving it is a rumble with no robot.
      stopPurr()
      emoVoice?.stop()
      window.clearTimeout(talkTimer)
      void ac?.close()
    }
  }, [])

  /* No state, no re-render: he is a photo with numbers on it, and every one of those
   * numbers is written straight to the DOM by the loop. */
  return { rootRef, hitRef, lineRef }
}
